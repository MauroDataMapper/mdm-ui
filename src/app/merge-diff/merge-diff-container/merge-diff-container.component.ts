/*
Copyright 2020-2026 University of Oxford and NHS England

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import {
  Uuid,
  MergeDiff,
  MergeDiffItem,
  MergeConflictResolution,
  CommitMergePayload,
  MergeDiffType,
  MergableMultiFacetAwareDomainType,
  MergableCatalogueItem,
  MainBranchResponse
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import {
  CheckinModelConfiguration,
  CheckinModelResult
} from '@mdm/modals/check-in-modal/check-in-modal-payload';
import { CheckInModalComponent } from '@mdm/modals/check-in-modal/check-in-modal.component';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/angular';
import { EMPTY, of } from 'rxjs';
import { catchError, filter, finalize, switchMap } from 'rxjs/operators';
import { MergeDiffAdapterService } from '../merge-diff-adapter/merge-diff-adapter.service';
import {
  branchNameField,
  MergeDiffItemModel,
  MergeItemSelectionChange
} from '../types/merge-item-type';
import { MergeComparisonComponent } from '../merge-comparsion/merge-comparsion.component';
import { MergeItemSelectorComponent } from '../merge-item-selector/merge-item-selector.component';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { BranchSelectorComponent } from '../../shared/branch-selector/branch-selector.component';
import { MatTooltip } from '@angular/material/tooltip';
import { ModelIconComponent } from '../../shared/model-icon/model-icon.component';
import { NgIf } from '@angular/common';

/**
 * Top-level view component for the Merge/Diff user interface.
 *
 * Controls the top-level data to fetch/render, controls for the overall merge operations and
 * child components for rendering the different sections of data.
 */
@Component({
    selector: 'mdm-merge-diff-container',
    templateUrl: './merge-diff-container.component.html',
    styleUrls: ['./merge-diff-container.component.scss'],
    standalone: true,
  imports: [NgIf, ModelIconComponent, MatTooltip, BranchSelectorComponent, MatProgressBar, MatButton, MergeItemSelectorComponent, MergeComparisonComponent]
})
export class MergeDiffContainerComponent implements OnInit {
  // Input properties for modal usage
  @Input() sourceId?: Uuid;
  @Input() targetId?: Uuid;
  @Input() catalogueDomainType?: MergableMultiFacetAwareDomainType;

  // Output properties
  @Output() mergeComplete = new EventEmitter<void>();

  loaded = false;
  loadingContent = false;
  targetLoaded = false;
  comparingBranches = false;
  committingDiffs = false;
  domainType: MergableMultiFacetAwareDomainType;
  source: MergableCatalogueItem;
  target: MergableCatalogueItem;
  diff: MergeDiff;
  selectedItem: MergeDiffItemModel | null = null;
  mergeItems: MergeDiffItemModel[] = [];

  constructor(
    private stateHandler: StateHandlerService,
    private uiRouterGlobals: UIRouterGlobals,
    private mergeDiff: MergeDiffAdapterService,
    private messageHandler: MessageHandlerService,
    private dialog: MatDialog,
    private title: Title
  ) {}

  public get MergeUsed() {
    return MergeConflictResolution;
  }

  get selectedChangesCount(): number {
    return this.mergeItems.filter(item => this.isItemSelected(item)).length;
  }

  get conflictCount(): number {
    return this.mergeItems.filter(item => item.isMergeConflict).length;
  }

  ngOnInit(): void {
    this.title.setTitle('Merge Changes');
    // Use input properties if provided (modal mode), otherwise use route parameters
    const sourceId: Uuid = this.sourceId ?? this.uiRouterGlobals.params.sourceId;
    const targetId: Uuid = this.targetId ?? this.uiRouterGlobals.params.targetId;
    this.domainType = this.catalogueDomainType ?? this.uiRouterGlobals.params.catalogueDomainType;
    this.mergeDiff
      .getCatalogueItemDetails(this.domainType, sourceId)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem loading the source item.',
            error
          );
          return EMPTY;
        }),
        switchMap((response) => {
          this.source = response.body;
          if (!targetId) {
            return this.mergeDiff.getMainBranch(
              this.domainType,
              this.source.id
            );
          }
          return of(targetId);
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem finding the main branch.',
            error
          );
          return EMPTY;
        }),
        switchMap((response: MainBranchResponse | Uuid) => {
          const possibleMainBranchId = (response as MainBranchResponse)?.body
            ?.id;
          if (possibleMainBranchId && possibleMainBranchId === sourceId) {
            return of(null);
          }
          const actualTargetId: Uuid
            = (response as MainBranchResponse)?.body?.id ?? (response as Uuid);
          return this.loadTarget(actualTargetId);
        }),
        finalize(() => (this.loaded = true))
      )
      .subscribe((response) => {
        this.target = response?.body;
        if (this.target) {
          this.runDiff();
        }
      });
  }

  setTarget(id: Uuid) {
    this.loadTarget(id).subscribe((response) => {
      this.target = response.body;
      this.runDiff();
    });
  }

  onCommitChanges(): void {
    const selectedChanges = this.getSelectedMergeItems();

    this.dialog
      .open<
        CheckInModalComponent,
        CheckinModelConfiguration,
        CheckinModelResult
      >(CheckInModalComponent, {
        data: {
          deleteSourceBranch: false,
          items: selectedChanges,
          label: this.source.label,
          domainType: this.domainType,
          isDataAsset: this.source?.type === 'Data Asset',
          source: this.source,
          target: this.target
        }
      })
      .afterClosed()
      .pipe(
        filter(result => result.status === ModalDialogStatus.Ok),
        switchMap((result) => {
          const patches = selectedChanges.filter(
            item => item.branchSelected !== MergeConflictResolution.Target
          );

          const data: CommitMergePayload = {
            changeNotice: result.commitComment,
            deleteBranch: result.deleteSourceBranch,
            patch: {
              sourceId: this.source.id,
              targetId: this.target.id,
              label: this.target.label,
              count: patches.length,
              patches
            }
          };

          this.committingDiffs = true;

          return this.mergeDiff.commitMergePatches(
            this.domainType,
            this.source.id,
            this.target.id,
            data
          );
        }),
        finalize(() => (this.committingDiffs = false))
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          `Your changes were successfully committed to ${this.target.label} ${this.target.branchName}.`
        );

        // Emit event for modal usage or navigate for standalone usage
        if (this.sourceId && this.catalogueDomainType) {
          // Modal mode - emit completion event
          this.mergeComplete.emit();
        } else {
          // Standalone mode - navigate to target
          this.stateHandler.Go(this.target.domainType, {
            id: this.target.id,
            reload: true,
            location: true
          });
        }
      });
  }

  onCancelChanges(): void {
    // In modal mode, emit completion (essentially cancel)
    if (this.sourceId && this.catalogueDomainType) {
      this.mergeComplete.emit();
    } else {
      // Standalone mode - go to previous page
      this.stateHandler.GoPrevious();
    }
  }

  runDiff() {
    this.resetItems();
    this.comparingBranches = true;
    this.mergeDiff
      .getMergeDiff(this.domainType, this.source.id, this.target.id)
      .pipe(finalize(() => (this.comparingBranches = false)))
      .subscribe((data) => {
        this.diff = data;
        data.diffs.forEach((item: MergeDiffItemModel) => {
          if (item.fieldName === branchNameField) {
            // A merge diff item with the field name "branchName" should not be considered for the user
            // to manage, this is a built-in field that Mauro manages
            return;
          }

          this.initialiseMergeItem(item);
          this.mergeItems.push(item);
        });

        this.selectedItem = this.mergeItems[0] ?? null;
      });
  }

  setSelectedMergeItem(item: MergeDiffItemModel) {
    this.selectedItem = item;
  }

  resetItems() {
    this.mergeItems = [];
    this.selectedItem = null;
  }

  selectAll(branchUsed: MergeConflictResolution) {
    this.mergeItems.forEach(item => this.setItemBranchSelection(item, branchUsed));
    this.refreshItems();
  }

  cancelAll() {
    this.dialog
      .openConfirmation({
        data: {
          message: 'Are you sure? This will remove all pending commits',
          title: 'Cancel All Commits'
        }
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.mergeItems.forEach(item => {
            this.setItemBranchSelection(item, MergeConflictResolution.Target);
          });
          this.refreshItems();
        }
      });
  }

  cancelCommit(item: MergeDiffItemModel) {
    this.setItemBranchSelection(item, MergeConflictResolution.Target);
    this.selectedItem = item;
    this.refreshItems();
  }

  acceptCommit(item: MergeDiffItemModel) {
    this.setItemBranchSelection(item, item.branchSelected ?? MergeConflictResolution.Source);
    this.selectedItem = item;
    this.refreshItems();
  }

  onMergeItemSelectionChanged(change: MergeItemSelectionChange) {
    this.setItemBranchSelection(
      change.mergeItem,
      change.selected
        ? this.getDefaultSelectedResolution(change.mergeItem)
        : MergeConflictResolution.Target
    );
    this.refreshItems();
  }

  private loadTarget(id: Uuid) {
    this.targetLoaded = false;
    return this.mergeDiff.getCatalogueItemDetails(this.domainType, id).pipe(
      catchError((error) => {
        this.messageHandler.showError(
          'There was a problem loading the target item.',
          error
        );
        return EMPTY;
      }),
      finalize(() => (this.targetLoaded = true))
    );
  }

  private initialiseMergeItem(item: MergeDiffItemModel) {
    this.setItemBranchSelection(
      item,
      item.isMergeConflict
        ? MergeConflictResolution.Target
        : MergeConflictResolution.Source
    );
  }

  private setItemBranchSelection(
    item: MergeDiffItemModel,
    branchUsed: MergeConflictResolution
  ) {
    item.branchSelected = branchUsed;

    switch (branchUsed) {
      case MergeConflictResolution.Source:
        item.branchNameSelected = this.source?.branchName;
        break;
      case MergeConflictResolution.Target:
        item.branchNameSelected = this.target?.branchName;
        break;
      case MergeConflictResolution.Mixed:
        item.branchNameSelected = 'MIXED';
        break;
      default:
        item.branchNameSelected = null;
        break;
    }
  }

  private getDefaultSelectedResolution(item: MergeDiffItemModel): MergeConflictResolution {
    return item.branchSelected === MergeConflictResolution.Mixed
      ? MergeConflictResolution.Mixed
      : MergeConflictResolution.Source;
  }

  private refreshItems() {
    this.mergeItems = [...this.mergeItems];
  }

  private getSelectedMergeItems(): MergeDiffItemModel[] {
    return this.mergeItems.filter(item => this.isItemSelected(item));
  }

  private isItemSelected(item: MergeDiffItemModel): boolean {
    return !!item && item.branchSelected !== null && item.branchSelected !== MergeConflictResolution.Target;
  }
}

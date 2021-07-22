/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
import { Component, OnInit } from '@angular/core';
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
  MdmResponse,
  MainBranchResponse
} from '@maurodatamapper/mdm-resources';
import { CheckinModelPayload } from '@mdm/modals/check-in-modal/check-in-modal-payload';
import { CheckInModalComponent } from '@mdm/modals/check-in-modal/check-in-modal.component';
import { ModelDomainRequestType } from '@mdm/model/model-domain-type';
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  MessageHandlerService,
  SharedService,
  StateHandlerService
} from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/angular';
import { EMPTY, of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { MergeDiffAdapterService } from '../merge-diff-adapter/merge-diff-adapter.service';
import { FullMergeItem, MergeItemSelection } from '../types/merge-item-type';

/**
 * Top-level view component for the Merge/Diff user interface.
 *
 * Controls the top-level data to fetch/render, controls for the overall merge operations and
 * child components for rendering the different sections of data.
 */
@Component({
  selector: 'mdm-merge-diff-container',
  templateUrl: './merge-diff-container.component.html',
  styleUrls: ['./merge-diff-container.component.scss']
})
export class MergeDiffContainerComponent implements OnInit {
  loaded = false;
  loadingContent = false;
  targetLoaded = false;
  domainType: MergableMultiFacetAwareDomainType;
  source: MergableCatalogueItem;
  target: MergableCatalogueItem;
  diff: MergeDiff;
  selectedItem: MergeItemSelection;
  changesList: FullMergeItem[];
  committingList: FullMergeItem[];
  activeTab: number;

  constructor(
    private shared: SharedService,
    private stateHandler: StateHandlerService,
    private uiRouterGlobals: UIRouterGlobals,
    private mergeDiff: MergeDiffAdapterService,
    private messageHandler: MessageHandlerService,
    private dialog: MatDialog,
    private title: Title,
    private resources: MdmResourcesService) { }

  ngOnInit(): void {
    if (!this.shared.features.useMergeUiV2) {
      // Feature toggle guard
      this.stateHandler.Go('alldatamodel');
      return;
    }

    this.title.setTitle('Merge Changes');

    const sourceId: Uuid = this.uiRouterGlobals.params.sourceId;
    const targetId: Uuid = this.uiRouterGlobals.params.targetId;
    this.domainType = this.uiRouterGlobals.params.catalogueDomainType;

    this.mergeDiff
      .getCatalogueItemDetails(this.domainType, sourceId)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem loading the source item.', error);
          return EMPTY;
        }),
        switchMap(response => {
          this.source = response.body;
          if (!targetId) {
            return this.mergeDiff.getMainBranch(this.domainType, this.source.id);
          }

          return of(targetId);
        }),
        catchError(error => {
          this.messageHandler.showError('There was a problem finding the main branch.', error);
          return EMPTY;
        }),
        switchMap((response: MainBranchResponse | Uuid) => {
          const actualTargetId: Uuid = (response as MainBranchResponse)?.body?.id ?? (response as Uuid);
          return this.loadTarget(actualTargetId);
        }),
        finalize(() => this.loaded = true)
      )
      .subscribe(response => {
        this.target = response.body;
        this.runDiff();
      });
  }

  setTarget(id: Uuid) {
    this.loadTarget(id)
      .subscribe(response => {
        this.target = response.body;
        this.runDiff();
      });
  }

  onCommitChanges(): void {
    this.dialog
      .open<CheckInModalComponent, CheckinModelPayload>(CheckInModalComponent, {
        data: {
          deleteSourceBranch: false,
          mergeItems: this.committingList
        }
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          const data: CommitMergePayload = {
            patch: {
              sourceId: this.source.id,
              targetId: this.target.id,
              patches: this.committingList.filter(
                (x) => x.branchSelected !== MergeConflictResolution.Target
              )
            }
          };

          this.resources.merge
            .mergeInto(this.domainType, this.source.id, this.target.id, data)
            .pipe(
              catchError((error) => {
                this.messageHandler.showError(
                  'There was an error committing the changes',
                  error
                );
                return EMPTY;
              })
            )
            .subscribe(() => {
              this.messageHandler.showSuccess('Commit Successful');
              this.stateHandler.Go(
                ModelDomainRequestType[this.domainType],
                { id: this.target.id, reload: true, location: true },
                null
              );
            });
        }
      });
    // TODO
  }

  onCancelChanges(): void {
    this.stateHandler.GoPrevious();
  }

  runDiff() {
    this.resetLists();
    this.mergeDiff
      .getMergeDiff()
      .subscribe((data) => {
        data.diffs.forEach((mergeItem: FullMergeItem) => {
          if (mergeItem.isMergeConflict) {
            this.changesList.push(mergeItem);
          } else {
            mergeItem.branchSelected = MergeConflictResolution.Source;
            mergeItem.branchNameSelected = this.source.branchName;
            this.committingList.push(mergeItem);
          }
        });
      });
  }

  setSelectedMergeItem(item: MergeDiffItem, isCommitting: boolean) {
    this.loadingContent = true;
    this.selectedItem = { mergeItem: item, isCommitting };
    this.loadingContent = false;
  }

  resetLists() {
    this.changesList = Array<FullMergeItem>();
    this.committingList = Array<FullMergeItem>();
  }

  public get MergeUsed() {
    return MergeConflictResolution;
  }

  selectAll(branchUsed: MergeConflictResolution) {
    this.selectedItem = null;
    const tempArray: FullMergeItem[] = [];
    this.changesList.forEach((item) => {
      if (item.type === MergeDiffType.Modification) {
        item.branchSelected = branchUsed;
        item.branchNameSelected =
          branchUsed === MergeConflictResolution.Source
            ? this.source.branchName
            : this.target.branchName;
        this.committingList.push(item);
        return;
      }
      if (branchUsed === MergeConflictResolution.Source) {
        item.branchSelected = branchUsed;
        item.branchNameSelected = this.source.branchName;
        this.committingList.push(item);
      } else {
        tempArray.push(item);
      }
    });
    this.changesList = new Array<FullMergeItem>();
    this.changesList = Object.assign([], tempArray);
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
          this.selectedItem = null;
          this.committingList.forEach((item) => {
            item.branchSelected = null;
            this.changesList.push(item);
          });
          this.committingList = new Array<FullMergeItem>();
        }
      });
  }

  cancelCommit(item: FullMergeItem) {
    const index = this.committingList.findIndex((x) => x === item);
    if (index >= 0) {
      this.selectedItem = null;
      this.committingList.splice(index, 1);
      item.branchSelected = null;
      item.branchNameSelected = null;
      this.changesList.push(item);
      this.activeTab = 0;
      this.setSelectedMergeItem(item, false);
    }
  }

  acceptCommit(item: FullMergeItem) {
    const index = this.changesList.findIndex((x) => x === item);
    if (index >= 0) {
      this.changesList.splice(index, 1);

      switch (item.branchSelected) {
        case MergeConflictResolution.Source:
          item.branchNameSelected = this.source.branchName;
          break;
        case MergeConflictResolution.Target:
          item.branchNameSelected = this.target.branchName;
          break;
        case MergeConflictResolution.Mixed:
          item.branchNameSelected = 'MIXED';
          break;

        default:
          break;
      }

      this.committingList.push(item);
      this.selectedItem = null;
    }
  }

  tabSelected(index: number) {
    this.activeTab = index;
  }

  private loadTarget(id: Uuid) {
    this.targetLoaded = false;
    return this.mergeDiff
      .getCatalogueItemDetails(this.domainType, id)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem loading the target item.', error);
          return EMPTY;
        }),
        finalize(() => this.targetLoaded = true)
      );
  }
}

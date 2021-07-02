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
  ModelDomainType,
  Uuid,
  Merge,
  MergeItem,
  MergeUsed
} from '@maurodatamapper/mdm-resources';
import { CheckinModelPayload } from '@mdm/modals/check-in-modal/check-in-modal-payload';
import { CheckInModalComponent } from '@mdm/modals/check-in-modal/check-in-modal.component';
import { ModelDomainRequestType } from '@mdm/model/model-domain-type';
import {
  MessageHandlerService,
  SharedService,
  StateHandlerService
} from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/angular';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
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
  domainType: ModelDomainType;
  source: any;
  target: any;
  diff: Merge;
  selectedItem: MergeItemSelection;
  changesList: Array<FullMergeItem>;
  committingList: Array<FullMergeItem>;
  activeTab: any;

  constructor(
    private shared: SharedService,
    private stateHandler: StateHandlerService,
    private uiRouterGlobals: UIRouterGlobals,
    private mergeService: MergeDiffAdapterService,
    private messageHandler: MessageHandlerService,
    private dialog: MatDialog,
    private title: Title
  ) {}

  ngOnInit(): void {
    if (!this.shared.features.useMergeUiV2) {
      // Feature toggle guard
      this.stateHandler.Go('alldatamodel');
      return;
    }

    this.title.setTitle('Merge Changes');

    const sourceId = this.uiRouterGlobals.params.sourceId;
    const targetId = this.uiRouterGlobals.params.targetId;
    this.domainType = this.uiRouterGlobals.params.catalogueDomainType;

    this.mergeService
      .loadCatalogueItemDetails(sourceId, this.domainType)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem restoring the Data Model.',
            error
          );
          return EMPTY;
        }),
        finalize(() => {
          this.loaded = true;
        })
      )
      .subscribe((result) => {
        this.source = result.body;
        if (targetId) {
          this.setTarget(targetId);
        } else {
          this.loadMainAndSetTarget();
        }
      });
  }

  loadMainAndSetTarget() {
    this.mergeService
      .retrieveMainBranch(this.domainType, this.source.id)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem loading main',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((result) => {
        this.setTarget(result.body.id);
      });
  }

  setTarget(id: Uuid) {
    this.targetLoaded = false;
    this.mergeService
      .loadCatalogueItemDetails(id, this.domainType)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem loading Target',
            error
          );
          return EMPTY;
        }),
        finalize(() => {
          this.targetLoaded = true;
        })
      )
      .subscribe((result) => {
        this.target = result.body;
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
          this.messageHandler.showSuccess('Commit Successful');
          this.stateHandler.Go(
            ModelDomainRequestType[this.domainType],
            { id: this.target.id, reload: true, location: true },
            null
          );
        }
      });
    // TODO
  }

  onCancelChanges(): void {
    this.stateHandler.GoPrevious();
  }

  runDiff() {
    this.resetLists();
    this.mergeService.getMergeDiff().subscribe((data) => {
      data.diffs.forEach((mergeItem: FullMergeItem) => {
        if (mergeItem.isMergeConflict) {
          this.changesList.push(mergeItem);
        } else {
          mergeItem.branchSelected = MergeUsed.Source;
          this.committingList.push(mergeItem);
        }
      });
    });
  }

  setSelectedMergeItem(item: MergeItem, isCommitting: boolean) {
    this.loadingContent = true;
    this.selectedItem = { mergeItem: item, isCommitting };
    this.loadingContent = false;
  }

  resetLists() {
    this.changesList = Array<FullMergeItem>();
    this.committingList = Array<FullMergeItem>();
  }

  public get MergeUsed() {
    return MergeUsed;
  }

  selectAll(branchUsed: MergeUsed) {
    this.selectedItem = null;
    this.changesList.forEach((item) => {
      item.branchSelected = branchUsed;
      this.committingList.push(item);
    });
    this.changesList = new Array<FullMergeItem>();
  }

  cancelCommit(item: FullMergeItem) {
    const index = this.committingList.findIndex((x) => x === item);
    if (index >= 0) {
      this.selectedItem = null;
      this.committingList.splice(index, 1);
      item.branchSelected = null;
      this.changesList.push(item);
      this.activeTab = 0;
      this.setSelectedMergeItem(item, false);
    }
  }

  acceptCommit(item: FullMergeItem) {
    const index = this.changesList.findIndex((x) => x === item);
    if (index >= 0) {
      this.changesList.splice(index, 1);
      this.committingList.push(item);
      this.selectedItem = null;
    }
  }

  tabSelected(index: number) {
    this.activeTab = index;
  }
}

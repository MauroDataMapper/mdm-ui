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
import { CatalogueItem, CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { CheckinModelPayload } from '@mdm/modals/check-in-modal/check-in-modal-payload';
import { CheckInModalComponent } from '@mdm/modals/check-in-modal/check-in-modal.component';
import { MessageHandlerService, SharedService, StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/angular';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MergeDiffAdapterService } from '../merge-diff-adapter/merge-diff-adapter.service';

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
  domainType: CatalogueItemDomainType;
  source: any;
  target: any;

  constructor(
    private shared: SharedService,
    private stateHandler: StateHandlerService,
    private uiRouterGlobals: UIRouterGlobals,
    private mergeService: MergeDiffAdapterService,
    private messageHandler: MessageHandlerService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    if (!this.shared.features.useMergeUiV2) {
      // Feature toggle guard
      this.stateHandler.Go('alldatamodel');
      return;
    }

     const sourceId = this.uiRouterGlobals.params.sourceId;
   //  const targetId = this.uiRouterGlobals.params.targetId;
    this.domainType = this.uiRouterGlobals.params.catalogueDomainType;

    this.mergeService.loadCatalogueItemDetails(sourceId,this.domainType)
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
    ).subscribe((result) => {
        this.source = result.body;
        this.target = result.body;
    });
  }

  setTarget(item : CatalogueItem)
  {
    this.loaded = false;
    this.mergeService.loadCatalogueItemDetails(item.id,item.domainType)
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
    ).subscribe((result) => {
        this.target = result.body;
    });
  }

  onCommitChanges(): void{
    this.dialog.open<CheckInModalComponent,CheckinModelPayload>(CheckInModalComponent, {
      data: {
        deleteSourceBranch: false
      }
    }).afterClosed().subscribe(() => {});
    // TODO
  }

}

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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FederatedDataModel } from '@mdm/model/federated-data-model';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MatDialog } from '@angular/material/dialog';
import { catchError, filter, finalize, switchMap } from 'rxjs/operators';
import { MessageHandlerService } from '@mdm/services';
import { NewFederatedSubscriptionModalComponent, NewFederatedSubscriptionModalConfig, NewFederatedSubscriptionModalResponse } from '../new-federated-subscription-modal/new-federated-subscription-modal.component';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { FolderDetailResponse } from '@maurodatamapper/mdm-resources';
import { getCatalogueItemDomainTypeIcon } from '@mdm/folders-tree/flat-node';

@Component({
  selector: 'mdm-federated-data-model-detail',
  templateUrl: './federated-data-model-detail.component.html',
  styleUrls: ['./federated-data-model-detail.component.scss']
})
export class FederatedDataModelDetailComponent implements OnInit {

  @Input() dataModel: FederatedDataModel;
  @Output() reloading = new EventEmitter();

  processing = false;

  constructor(
    private resources: MdmResourcesService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle(`Federated Data Model - ${this.dataModel.label}`);
    this.setFolderLabelToForm();
  }

  getModelTypeIcon() {
    return getCatalogueItemDomainTypeIcon(this.dataModel.modelType);
  }

  subscribeToModel() {
    this.dialog
      .open<NewFederatedSubscriptionModalComponent, NewFederatedSubscriptionModalConfig, NewFederatedSubscriptionModalResponse>(
        NewFederatedSubscriptionModalComponent,
        {
          data: {
            modalTitle: 'Subscribe to Data Model',
            btnType: 'primary',
            inputLabel: 'Folder name',
            message: 'Please select the folder to subscribe this data model to.'
          }
        }
      )
      .afterClosed()
      .pipe(
        filter(response => response?.status === ModalDialogStatus.Ok),
        switchMap(response => {
          this.processing = true;
          return this.resources.subscribedCatalogues.saveSubscribedModel(
            this.dataModel.catalogueId,
            {
              subscribedModelId: this.dataModel.modelId,
              subscribedModelType: this.dataModel.modelType,
              folderId: response.folder.id
            });
        }),
        catchError(error => {
          this.messageHandler.showError('There was a problem subscribing to the data model.', error);
          return [];
        }),
        finalize(() => {
          this.processing = false;
          this.reloading.emit();
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('Successfully subscribed to data model.');
      });
  }

  unsubscribeFromModel() {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Confirm unsubscribe',
          okBtnTitle: 'Yes, unsubscribe',
          btnType: 'warn',
          message: 'Are you sure you want to unsubscribe from this data model?'
        }
      })
      .pipe(
        switchMap(() => {
          this.processing = true;
          return this.resources.subscribedCatalogues.removeSubscribedModel(
            this.dataModel.catalogueId,
            this.dataModel.subscriptionId);
        }),
        finalize(() => {
          this.processing = false;
          this.reloading.emit();
        })
      )
      .subscribe(
        () => this.messageHandler.showSuccess('Successfully unsubscribed from data model.'),
        error => this.messageHandler.showError('There was a problem unsubscribing from the data model.', error));
  }

   setFolderLabelToForm() {
    if (!this.dataModel.folderId) {
      return;
    }

    this.resources.folder
      .get(this.dataModel.folderId, {}, {handleGetErrors : false})
      .subscribe((response: FolderDetailResponse) => this.dataModel.folderLabel = response.body.label);

}
}
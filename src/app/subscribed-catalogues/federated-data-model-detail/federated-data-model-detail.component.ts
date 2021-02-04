/*
Copyright 2021 University of Oxford

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
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FederatedDataModel, FederatedDataModelForm, SubscribedDataModelResponse } from '@mdm/model/federated-data-model';
import { Editable } from '@mdm/model/editable-forms';
import { getDomainTypeIcon } from '@mdm/folders-tree/flat-node';
import { MdmResourcesService } from '@mdm/modules/resources';
import { FolderResultResponse } from '@mdm/model/folderModel';
import { MatDialog } from '@angular/material/dialog';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { MessageHandlerService } from '@mdm/services';
import { NewFederatedSubscriptionModalComponent, NewFederatedSubscriptionModalConfig, NewFederatedSubscriptionModalResponse } from '../new-federated-subscription-modal/new-federated-subscription-modal.component';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

@Component({
  selector: 'mdm-federated-data-model-detail',
  templateUrl: './federated-data-model-detail.component.html',
  styleUrls: ['./federated-data-model-detail.component.scss']
})
export class FederatedDataModelDetailComponent implements OnInit, OnChanges {

  @Input() dataModel: FederatedDataModel;
  @Output() reloading = new EventEmitter();

  editable: Editable<FederatedDataModel, FederatedDataModelForm>;
  processing = false;

  constructor(
    private resources: MdmResourcesService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle(`Federated Data Model - ${this.dataModel.label}`);

    this.editable = new Editable(
      this.dataModel,
      new FederatedDataModelForm());

    this.editable.onReset.subscribe(original => this.setFolderLabelToForm(original));

    // After subscribing to the "onReset" observable, trigger a reset to get all required details
    this.editable.reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataModel && changes.dataModel.previousValue && changes.dataModel.currentValue) {
      // Refresh computed properties after changes
      this.editable.reset(this.dataModel);
    }
  }

  private setFolderLabelToForm(data: FederatedDataModel) {
    if (!data.folderId) {
      return;
    }

    this.resources.folder
      .get(data.folderId)
      .subscribe((response: FolderResultResponse) => this.editable.form.folderLabel = response.body.label);
  }

  getModelTypeIcon() {
    return getDomainTypeIcon(this.dataModel.modelType);
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
        filter(response => response.status === ModalDialogStatus.Ok),
        switchMap(response => {
          this.processing = true;
          return this.resources.subscribedCatalogues.saveSubscribedModel(
            this.dataModel.catalogueId,
            {
              subscribedModelId: this.dataModel.modelId,
              folderId: response.folder.id,
              subscribedModelType: this.dataModel.modelType
            });
        }),
        catchError(error => {
          this.processing = false;
          this.messageHandler.showError('There was a problem subscribing to the data model.', error);
          return [];
        }),
        switchMap((response: SubscribedDataModelResponse) => {
          return this.resources.subscribedCatalogues.federate(response.body.id);
        }),
        catchError(error => {
          this.processing = false;
          this.messageHandler.showError('There was a problem synchronising a data model.', error);
          return [];
        })
      )
      .subscribe(() => {
        this.processing = false;
        this.messageHandler.showSuccess('Successfully subscribed to data model.');
        this.reloading.emit();
      });

    // After subscribing to the "onReset" observable, trigger a reset to get all required details
    this.editable.reset();
  }

  private setFolderLabelToForm(data: FederatedDataModel) {
    if (!data.folderId) {
      return;
    }

    this.resources.folder
      .get(data.folderId)
      .subscribe((response: FolderResultResponse) => this.editable.form.folderLabel = response.body.label);
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
        })
      )
      .subscribe(
        () => {
          this.processing = false;
          this.messageHandler.showSuccess('Successfully unsubscribed from data model.');
          this.reloading.emit();
        },
        error => {
          this.processing = false;
          return this.messageHandler.showError('There was a problem unsubscribing from the data model.', error);
        });
  }
  getModelTypeIcon() {
    return getDomainTypeIcon(this.dataModel.modelType);
  }

  formBeforeSave() {

  federate() {
    this.processing = true;
    this.resources.subscribedCatalogues
      .federate(this.dataModel.subscriptionId)
      .subscribe(
        () => {
          this.processing = false;
          this.messageHandler.showSuccess(`Synchronised the data model '${this.dataModel.label}' successfully.`);
          this.reloading.emit();
        },
        errors => {
          this.processing = false;
          this.messageHandler.showError('There was a problem synchronising a data model.', errors);
        });
  }
}

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
import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FederatedDataModel, FederatedDataModelForm } from '@mdm/model/federated-data-model';
import { EditingService } from '@mdm/services/editing.service';
import { Editable } from '@mdm/model/editable-forms';
import { getDomainTypeIcon } from '@mdm/folders-tree/flat-node';
import { MdmResourcesService } from '@mdm/modules/resources';
import { FolderResultResponse } from '@mdm/model/folderModel';
import { MatDialog } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import { BroadcastService, MessageHandlerService, StateHandlerService } from '@mdm/services';

@Component({
  selector: 'mdm-federated-data-model-detail',
  templateUrl: './federated-data-model-detail.component.html',
  styleUrls: ['./federated-data-model-detail.component.scss']
})
export class FederatedDataModelDetailComponent implements OnInit {

  @Input() dataModel: FederatedDataModel;

  editable: Editable<FederatedDataModel, FederatedDataModelForm>;

  constructor(
    private resources: MdmResourcesService,
    private editingService: EditingService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private broadcastSvc: BroadcastService,
    private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle(`Federated Data Model - ${this.dataModel.label}`);

    this.editable = new Editable(
      this.dataModel, 
      new FederatedDataModelForm());

    this.editable.onReset.subscribe(original => this.setFolderLabelToForm(original));

    this.editable.onCancel.subscribe(() => {
      this.editingService.stop();      
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

  getModelTypeIcon() {
    return getDomainTypeIcon(this.dataModel.modelType);
  }

  formBeforeSave() {

  }

  subscribeToModel() {

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
        switchMap(() => this.resources.subscribedCatalogues.removeSubscribedModel(
          this.dataModel.catalogueId, 
          this.dataModel.subscriptionId))
      )
      .subscribe(
        () => {
          this.messageHandler.showSuccess('Successfully unsubscribed from data model.');
          this.stateHandler.reload();
          this.broadcastSvc.broadcast('$reloadFoldersTree');
        },
        error => this.messageHandler.showError('There was a problem unsubscribing from the data model.', error));
  }
}

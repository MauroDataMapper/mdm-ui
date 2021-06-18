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
import { Component, OnInit, EventEmitter } from '@angular/core';
import { DataModelStep1Component } from '../data-model-step1/data-model-step1.component';
import { DataModelStep2Component } from '../data-model-step2/data-model-step2.component';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { UIRouterGlobals } from '@uirouter/core';
import { Title } from '@angular/platform-browser';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { CatalogueItemDomainType, Container, DataModelCreatePayload, DataModelDetailResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { FolderService } from '@mdm/folders-tree/folder.service';
import { WizardStep } from '@mdm/wizards/wizards.model';

@Component({
  selector: 'mdm-data-model-main',
  templateUrl: './data-model-main.component.html',
  styleUrls: ['./data-model-main.component.sass']
})
export class DataModelMainComponent implements OnInit {
  isLinear = false;
  steps: WizardStep<DataModelMainComponent>[] = [];
  doneEvent = new EventEmitter<any>();
  parentFolderId: Uuid;
  parentDomainType: CatalogueItemDomainType;
  parentFolder: Container;

  constructor(
    private stateHandler: StateHandlerService,
    private uiRouterGlobals: UIRouterGlobals,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private folders: FolderService,
    private title: Title) { }

  ngOnInit() {
    this.title.setTitle('New Data Model');

    this.parentFolderId = this.uiRouterGlobals.params.parentFolderId;
    this.parentDomainType = this.uiRouterGlobals.params.parentDomainType;

    this.folders
      .getFolder(this.parentFolderId, this.parentDomainType)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem loading the Folder.', error);
          return EMPTY;
        })
      )
      .subscribe(response => {
        this.parentFolder = response.body;

        this.steps = [
          {
            title: 'Data Model Details',
            component: DataModelStep1Component,
            scope: this,
            hasForm: true,
            invalid: true
          },
          {
            title: 'Default Data Types',
            component: DataModelStep2Component,
            scope: this
          }
        ];
      });
  }

  cancelWizard = () => {
    this.stateHandler.GoPrevious();
  };

  save() {
    const details = this.steps[0].compRef.instance as DataModelStep1Component;
    const types = this.steps[1].compRef.instance as DataModelStep2Component;

    const resource: DataModelCreatePayload = {
      folder: this.parentFolderId,
      label: details.label.value,
      description: details.description.value,
      author: details.author.value,
      organisation: details.organisation.value,
      type: details.dataModelType.value,
      classifiers: details.classifiers.value.map(cls => { return { id: cls.id }; })
    };

    let queryStringParams = {};
    if (types.selectedDataTypeProvider) {
      queryStringParams = {
        defaultDataTypeProvider: types.selectedDataTypeProvider.name
      };
    }

    this.resources.dataModel
      .addToFolder(this.parentFolderId, resource, queryStringParams)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem saving the Data Model.', error);
          return EMPTY;
        }))
      .subscribe((response: DataModelDetailResponse) => {
        this.messageHandler.showSuccess('Data Model saved successfully.');
        this.stateHandler.Go('datamodel', { id: response.body.id }, { reload: true, location: true });
      });
  }
}
/*
Copyright 2020 University of Oxford

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
import { Step } from '@mdm/model/stepModel';
import { Title } from '@angular/platform-browser';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { DataModelCreatePayload, DataModelDetailResponse, FolderDetailResponse } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-data-model-main',
  templateUrl: './data-model-main.component.html',
  styleUrls: ['./data-model-main.component.sass']
})
export class DataModelMainComponent implements OnInit {
  isLinear = false;
  steps: Step[] = [];
  doneEvent = new EventEmitter<any>();
  parentFolderId: string;
  parentFolder: any;
  model : {
    metadata: Array<any>;
    classifiers: Array<any>;
    label:string | undefined;
    description: string | undefined;
    author:string | undefined;
    organisation :string| undefined;
    dataModelType: any;
    dialect:string| undefined;
    selectedDataTypeProvider:any;
  };
  constructor(
    private stateHandler: StateHandlerService,
    private uiRouterGlobals: UIRouterGlobals,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private title: Title
  ) { }

  ngOnInit() {
    this.title.setTitle('New Data Model');
    this.model = { metadata :[], classifiers : [], label:undefined, description:undefined, author:undefined, organisation: undefined, dataModelType:undefined,dialect:undefined, selectedDataTypeProvider:undefined};
    this.parentFolderId = this.uiRouterGlobals.params.parentFolderId;
    this.resources.folder.get(this.parentFolderId).toPromise().then((result: FolderDetailResponse) => {

      this.parentFolder = result.body;

      const step1 = new Step();
      step1.title = 'Data Model Details';
      step1.component = DataModelStep1Component;
      step1.scope = this;
      step1.hasForm = true;
      step1.invalid = true;

      const step2 = new Step();
      step2.title = 'Default Data Types';
      step2.component = DataModelStep2Component;
      step2.scope = this;
      step1.invalid = true;

      this.steps.push(step1);
      this.steps.push(step2);
    })
      .catch(error => {
        this.messageHandler.showError('There was a problem loading the Folder.', error);
      });
  }

  cancelWizard = () => {
    this.stateHandler.GoPrevious();
  };

  save() {
    const resource: DataModelCreatePayload = {
      folder: this.parentFolderId,
      label: this.model.label,
      description: this.model.description,
      author: this.model.author,
      organisation: this.model.organisation,
      type: this.model.dataModelType,
      dialect: '',
      classifiers: this.model.classifiers.map(cls => {
        return { id: cls.id };
      }),
      metadata: this.model.metadata.map(m => {
        return {
          key: m.key,
          value: m.value,
          namespace: m.namespace
        };
      })
    };
    // if (resource.type === 'Database') {
    //   resource.dialect = this.model.dialect;
    // }

    let queryStringParams = {};
    if (this.model.selectedDataTypeProvider) {
      queryStringParams = {
        defaultDataTypeProvider: this.model.selectedDataTypeProvider.name
      };
    }

    this.resources.dataModel.addToFolder(this.parentFolderId, resource, queryStringParams).pipe(catchError(error => {
      this.messageHandler.showError('There was a problem saving the Data Model.', error);
      return EMPTY;
    })).subscribe((response: DataModelDetailResponse) => {
      this.messageHandler.showSuccess('Data Model saved successfully.');
      this.stateHandler.Go('datamodel', { id: response.body.id }, { reload: true, location: true });
    });
  }

}
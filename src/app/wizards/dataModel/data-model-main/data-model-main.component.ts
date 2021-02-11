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
import { StateService } from '@uirouter/core';
import { Step } from '@mdm/model/stepModel';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-data-model-main',
  templateUrl: './data-model-main.component.html',
  styleUrls: ['./data-model-main.component.sass']
})
export class DataModelMainComponent implements OnInit {
  isLinear = false;
  steps: Step[] = [];
  doneEvent = new EventEmitter<any>();
  parentFolderId: any;
  parentFolder: any;
  model: any = {
    metadata: [],
    classifiers: []
  };
  constructor(
    private broadcastSvc: BroadcastService,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private stateService: StateService,
    private title: Title
  ) { }

  ngOnInit() {
    this.title.setTitle('New Data Model');
    // tslint:disable-next-line: deprecation
    this.parentFolderId = this.stateService.params.parentFolderId;
    this.resources.folder.get(this.parentFolderId).toPromise().then(result => {
      result.domainType = 'Folder';
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

  save = async () => {
    const resource = {
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
    if (resource.type === 'Database') {
      resource.dialect = this.model.dialect;
    }

    // let queryStringParams = null;
    // if (this.model.selectedDataTypeProvider) {
    //   queryStringParams = {
    //     defaultDataTypeProvider: this.model.selectedDataTypeProvider.name
    //   };
    // }

   try {
      const response = await this.resources.dataModel.addToFolder(this.parentFolderId, resource).toPromise();
      this.messageHandler.showSuccess('Data Model saved successfully.');
      this.stateHandler.Go('datamodel', { id: response.body.id }, { reload: true, location: true });
   } catch (error) {
      this.messageHandler.showError('There was a problem saving the Data Model.', error);
   }
  };
}

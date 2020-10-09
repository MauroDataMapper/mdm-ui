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
import { Component, OnInit } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';

@Component({
  selector: 'mdm-data-model-step2',
  templateUrl: './data-model-step2.component.html',
  styleUrls: ['./data-model-step2.component.sass']
})
export class DataModelStep2Component implements OnInit {
  loadingData: any;
  defaultDataTypeProviders: any;
  dataTypes: any;
  step: any;

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService
  ) {}

  ngOnInit() {

    this.resources.dataModel.defaultDataTypes().subscribe(result => {
        this.defaultDataTypeProviders = result.body;
      },
      error => {
        this.messageHandler.showError('There was a problem loading Data Type Providers', error);
      }
    );
  }

  onSelectDataTypeProvider = dataTypeProvider => {
    if (!dataTypeProvider) {
      this.loadingData = false;
      this.dataTypes = null;
      return;
    }
    this.loadingData = true;
    this.step.scope.model.selectedDataTypeProvider = dataTypeProvider;
    this.dataTypes = {
      items: this.step.scope.model.selectedDataTypeProvider[0].dataTypes
    };
    this.loadingData = false;
  };
}

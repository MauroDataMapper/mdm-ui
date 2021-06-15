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
import { DataModelDefaultDataTypesResponse, DataTypeProvider } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { WizardStep } from '@mdm/wizards/wizards.model';
import { DataModelMainComponent } from '../data-model-main/data-model-main.component';

@Component({
  selector: 'mdm-data-model-step2',
  templateUrl: './data-model-step2.component.html',
  styleUrls: ['./data-model-step2.component.sass']
})
export class DataModelStep2Component implements OnInit {
  loadingData: any;
  defaultDataTypeProviders: DataTypeProvider[];
  dataTypes: any;
  step: WizardStep<DataModelMainComponent>;
  selectedDataTypeProvider?: DataTypeProvider;

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService
  ) {}

  ngOnInit() {
    this.resources.dataModel.defaultDataTypes()
      .subscribe(
        (result: DataModelDefaultDataTypesResponse) => this.defaultDataTypeProviders = result.body,
        error => this.messageHandler.showError('There was a problem loading Data Type Providers', error));
  }

  onSelectDataTypeProvider(dataTypeProvider: DataTypeProvider[]) {
    if (!dataTypeProvider) {
      this.loadingData = false;
      this.dataTypes = null;
      return;
    }
    this.loadingData = true;
    this.selectedDataTypeProvider = dataTypeProvider[0];
    this.dataTypes = {
      items: this.selectedDataTypeProvider.dataTypes
    };
    this.loadingData = false;
  }
}

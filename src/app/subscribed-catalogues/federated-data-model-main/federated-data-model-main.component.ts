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
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FederatedDataModel } from '@mdm/model/federated-data-model';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { BaseComponent } from '@mdm/shared/base/base.component';
import { UIRouterGlobals } from '@uirouter/angular';

@Component({
  selector: 'mdm-federated-data-model-main',
  templateUrl: './federated-data-model-main.component.html',
  styleUrls: ['./federated-data-model-main.component.scss']
})
export class FederatedDataModelMainComponent extends BaseComponent implements OnInit {

  dataModel: FederatedDataModel;

  constructor(
    private resources: MdmResourcesService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private messageHandler: MessageHandlerService,
    private title: Title) { 
    super();
  }

  ngOnInit(): void {
    const dataModelId: string = this.uiRouterGlobals.params.id;
    if (!dataModelId || !this.isGuid(dataModelId)) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.title.setTitle('Federated Data Model');

    // TODO: replace with API endpoint to fetch data
    this.dataModel = {
      id: dataModelId,
      label: 'Federated Data Model',
      description: 'Test description'
    };
  }
}

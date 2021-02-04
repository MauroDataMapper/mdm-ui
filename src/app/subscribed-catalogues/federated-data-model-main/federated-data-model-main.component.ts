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
import { SubscribedCataloguesService } from '../subscribed-catalogues.service';

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
    private subscribedCatalogues: SubscribedCataloguesService,
    private title: Title) { 
    super();
  }

  ngOnInit(): void {
    this.title.setTitle('Federated Data Model');

    // First check if dataModel was provided in state transition
    const dataModel = this.uiRouterGlobals.params.dataModel;
    if (dataModel) {
      this.dataModel = dataModel;
      return;
    }

    // If not from tree, fetch from the server again
    const parentId: string = this.uiRouterGlobals.params.parentId;
    if (!parentId || !this.isGuid(parentId)) {
      this.stateHandler.NotFound({ location: false });
    }

    const modelId: string = this.uiRouterGlobals.params.id;
    if (!modelId || !this.isGuid(modelId)) {
      this.stateHandler.NotFound({ location: false });
    }    

    this.subscribedCatalogues
      .getFederatedDataModels(parentId)
      .subscribe(
        models => this.dataModel = models.find(model => model.modelId === modelId),
        errors => this.messageHandler.showError('There was a problem getting the Federated Data Model', errors));
  }
}

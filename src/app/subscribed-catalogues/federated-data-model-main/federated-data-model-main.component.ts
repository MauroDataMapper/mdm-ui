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
import { Title } from '@angular/platform-browser';
import { FederatedDataModel } from '@mdm/model/federated-data-model';
import { TabCollection } from '@mdm/model/ui.model';
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

  catalogueId: string;
  modelId: string;
  dataModel: FederatedDataModel;
  activeTab: any;
  tabs = new TabCollection([
    'newVersion'
  ]);
  showNewerVersionsTab = true;

  constructor(
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private messageHandler: MessageHandlerService,
    private subscribedCatalogues: SubscribedCataloguesService,
    private title: Title) {
    super();
  }

  ngOnInit(): void {
    this.catalogueId = this.uiRouterGlobals.params.parentId;
    if (!this.catalogueId || !this.isGuid(this.catalogueId)) {
      this.stateHandler.NotFound({ location: false });
    }

    this.modelId = this.uiRouterGlobals.params.id;
    if (!this.modelId || !this.isGuid(this.modelId)) {
      this.stateHandler.NotFound({ location: false });
    }

    this.title.setTitle('Federated Data Model');

    // First check if dataModel was provided in state transition
    const dataModel = this.uiRouterGlobals.params.dataModel;
    if (dataModel) {
      this.dataModel = dataModel;
      return;
    }

    // If not from tree, fetch from the server again
    this.getFederatedDataModel();
  }

  onReloading() {
    this.getFederatedDataModel(true);
  }

  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go('dataModel', { tabView: tab.name }, { notify: false });
  }

  onNewerVersionsHasErrored() {
    this.showNewerVersionsTab = false;
  }

  private getFederatedDataModel(reloadView?: boolean) {
    this.subscribedCatalogues
      .getFederatedDataModels(this.catalogueId)
      .subscribe(
        models => {
          this.dataModel = models.find(model => model.modelId === this.modelId);
          if (reloadView) {
            this.reloadView();
          }
        },
        errors => this.messageHandler.showError('There was a problem getting the Federated Data Model', errors));
  }

  private reloadView() {
    this.stateHandler.Go(
      'federateddatamodel',
      {
        parentId: this.catalogueId,
        id: this.modelId
      },
      {
        reload: true
      });
  }
}

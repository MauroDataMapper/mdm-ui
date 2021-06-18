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
import { SubscribedCatalogue, SubscribedCatalogueResponse } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { BaseComponent } from '@mdm/shared/base/base.component';
import { UIRouterGlobals } from '@uirouter/core';

@Component({
  selector: 'mdm-subscribed-catalogue-main',
  templateUrl: './subscribed-catalogue-main.component.html',
  styleUrls: ['./subscribed-catalogue-main.component.scss']
})
export class SubscribedCatalogueMainComponent extends BaseComponent implements OnInit {

  subscribedCatalogue: SubscribedCatalogue;

  constructor(
    private resources: MdmResourcesService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private messageHandler: MessageHandlerService,
    private title: Title) {
      super();
    }

  ngOnInit(): void {
    const catalogueId: string = this.uiRouterGlobals.params.id;
    if (!catalogueId || !this.isGuid(catalogueId)) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.title.setTitle('Subscribed Catalogue');

    this.resources.subscribedCatalogues
      .get(catalogueId)
      .subscribe(
          (response: SubscribedCatalogueResponse) => this.subscribedCatalogue = response.body,
          error => this.messageHandler.showError('There was a problem getting the subscribed catalogue.', error));
  }
}

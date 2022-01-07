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
import { SubscribedCatalogue, SubscribedCatalogueResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, SharedService, StateHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { UIRouterGlobals } from '@uirouter/core';

interface SubscribedCatalogueComponentErrors {
  label?: string;
  url?: string;
  apiKey?: string;
}

@Component({
  selector: 'mdm-subscribed-catalogue',
  templateUrl: './subscribed-catalogue.component.html',
  styleUrls: ['./subscribed-catalogue.component.scss']
})
export class SubscribedCatalogueComponent implements OnInit {

  catalogue: SubscribedCatalogue;
  errors: SubscribedCatalogueComponentErrors;
  isCreating: boolean;

  constructor(
    private resources: MdmResourcesService,
    private routerGobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private shared: SharedService,
    private messageHandler: MessageHandlerService,
    private title: Title,
    private editingService: EditingService) { }

  ngOnInit(): void {
    if (!this.shared.features.useSubscribedCatalogues) {
      this.stateHandler.Go('alldatamodel');
      return;
    }

    this.editingService.start();
    const catalogueId : Uuid = this.routerGobals.params.id;

    if (catalogueId) {
      this.isCreating = false;
      this.title.setTitle('Subscribed Catalogue - Edit Subscription');

      this.resources.admin
        .getSubscribedCatalogue(catalogueId)
        .subscribe(
          (data: SubscribedCatalogueResponse) => this.catalogue = data.body,
          error => {
            this.messageHandler.showError('Unable to get the subscribed catalogue.', error);
            this.navigateToParent();
          });
    }
    else {
      this.isCreating = true;
      this.title.setTitle('Subscribed Catalogue - Add Subscription');

      this.catalogue = {
        label: '',
        url: ''
      };
    }
  }

  save() {
    if (!this.validate()) {
      return;
    }

    if (this.catalogue.id) {
      this.resources.admin
        .updateSubscribedCatalogue(this.catalogue.id, this.catalogue)
        .subscribe(
          () => {
            this.messageHandler.showSuccess('Subscribed catalogue updated successfully.');
            this.navigateToParent();
          },
          error => this.messageHandler.showError('There was a problem updating the subscribed catalogue.', error));
    }
    else {
      this.resources.admin
        .saveSubscribedCatalogues(this.catalogue)
        .subscribe(
          () => {
            this.messageHandler.showSuccess('Subscribed catalogue saved successfully.');
            this.navigateToParent();
          },
          error => this.messageHandler.showError('There was a problem saving the subscribed catalogue.', error));
    }
  }

  cancel() {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (confirm) {
        this.navigateToParent();
      }
    });
  }

  validate() {
    let isValid = true;
    this.errors = {};

    if (this.catalogue.label.trim().length === 0) {
      this.errors.label = 'Label cannot be empty';
      isValid = false;
    }

    if (this.catalogue.url.trim().length === 0) {
      this.errors.url = 'URL cannot be empty';
      isValid = false;
    }

    return isValid;
  }

  private navigateToParent() {
    this.editingService.stop();
    this.stateHandler.Go('appContainer.adminArea.subscribedCatalogues');
  }
}

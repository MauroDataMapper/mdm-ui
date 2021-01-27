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
import { SubscribedCatalogue } from '@mdm/model/subscribedCatalogueModel';
import { StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';

interface SubscribedCatalogueComponentErrors {
  name?: string;
  url?: string;
  apiKey?: string;
};

@Component({
  selector: 'mdm-subscribed-catalogue',
  templateUrl: './subscribed-catalogue.component.html',
  styleUrls: ['./subscribed-catalogue.component.scss']
})
export class SubscribedCatalogueComponent implements OnInit {

  catalogue: SubscribedCatalogue;
  errors: SubscribedCatalogueComponentErrors;

  constructor(
    private routerGobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private title: Title) { }

  ngOnInit(): void {
    const catalogueId = this.routerGobals.params.id;

    if (catalogueId) {
      this.title.setTitle('Subscribed Catalogue - Edit Subscription');

      alert('TODO: fetch subscription catalogue ' + catalogueId);

      // TODO: replace with fetch from server
      this.catalogue = {
        id: catalogueId,
        name: 'Test3',
        url: 'http://localhost',
        apiKey: '5678'
      };
    }
    else {
      this.title.setTitle('Subscribed Catalogue - Add Subscription');

      this.catalogue = {
        name: '',
        url: '',
        apiKey: ''
      };
    }
  }

  save() {
    if (!this.validate()) {
      return;
    }

    if (this.catalogue.id) {
      alert('TODO: save subscription catalogue ' + this.catalogue.id);
      this.navigateToParent();
    }
    else {
      alert('TODO: new connected catalogue ' + this.catalogue.url);
      this.navigateToParent();
    }
  }

  cancel() {
    this.navigateToParent();
  }

  private navigateToParent() {
    this.stateHandler.Go('appContainer.adminArea.subscribedCatalogues');
  }

  validate() {
    let isValid = true;
    this.errors = {};

    if (this.catalogue.name.trim().length === 0) {
      this.errors.name = 'Name cannot be empty!';
      isValid = false;
    }

    if (this.catalogue.url.trim().length === 0) {
      this.errors.url = 'URL cannot be empty!';
      isValid = false;
    }

    if (this.catalogue.apiKey.trim().length === 0) {
      this.errors.apiKey = 'API key cannot be empty!';
      isValid = false;
    }

    return isValid;
  }
}

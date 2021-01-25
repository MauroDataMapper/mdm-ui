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
import { StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';

@Component({
  selector: 'mdm-connected-catalogue',
  templateUrl: './connected-catalogue.component.html',
  styleUrls: ['./connected-catalogue.component.scss']
})
export class ConnectedCatalogueComponent implements OnInit {

  catalogue = {
    id: '',
    url: '',
    apiKey: ''
  };

  errors: any;

  constructor(
    private routerGobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private title: Title) { }

  ngOnInit(): void {
     const catalogueId = this.routerGobals.params.id;

    if (catalogueId) {
      this.title.setTitle('Connected Catalogue - Edit Catalogue');

      alert('TODO: fetch connected catalogue ' + catalogueId);
    }
    else {
      this.title.setTitle('Connected Catalogue - Add Catalogue');
    }
  }

  save() {
    if (!this.validate()) {
      return;
    }

    if (this.catalogue.id) {
      alert('TODO: save connected catalogue ' + this.catalogue.id);
      this.navigateToCatalogues();
    }
    else {
      alert('TODO: new connected catalogue ' + this.catalogue.url);
      this.navigateToCatalogues();
    }
  }

  cancel() {
    this.navigateToCatalogues();
  }

  private navigateToCatalogues() {
    this.stateHandler.Go('appContainer.adminArea.connectedCatalogues');
  }

  validate() {
    let isValid = true;
    this.errors = [];

    if (this.catalogue.url.trim().length === 0) {
      this.errors.url = 'URL cannot be empty!';
      isValid = false;
    }  

    if (this.catalogue.apiKey.trim().length === 0) {
      this.errors.apiKey = 'API key cannot be empty!';
      isValid = false;
    }

    if (isValid) {
      delete this.errors;
    }

    return isValid;
  }
}

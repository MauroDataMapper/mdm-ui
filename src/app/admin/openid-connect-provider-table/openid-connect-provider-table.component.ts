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
import { MatTableDataSource } from '@angular/material/table';
import { ModulesResponse, OpenIdConnectProvider, OpenIdConnectProvidersIndexResponse } from '@maurodatamapper/mdm-resources';
import { OpenIdConnectModuleName } from '@mdm/model/openid-connect.model';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, SharedService, StateHandlerService } from '@mdm/services';
import { EMPTY } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

@Component({
  selector: 'mdm-openid-connect-provider-table',
  templateUrl: './openid-connect-provider-table.component.html',
  styleUrls: ['./openid-connect-provider-table.component.scss']
})
export class OpenidConnectProviderTableComponent implements OnInit {

  loading = false;
  moduleLoaded = false;
  totalItemCount = 0;
  dataSource = new MatTableDataSource<OpenIdConnectProvider>();
  displayedColumns = ['label', 'standardProvider', 'lastUpdated', 'icons'];

  constructor(
    private shared: SharedService,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService) { }

  ngOnInit(): void {
    if (!this.shared.features.useOpenIdConnect) {
      this.stateHandler.Go('alldatamodel');
      return;
    }

    this.loading = true;

    this.resources.admin
      .modules()
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem getting the installed modules.', error);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((response: ModulesResponse) => {
        this.moduleLoaded = response.body.findIndex(module => module.name === OpenIdConnectModuleName) !== -1;
        if (this.moduleLoaded) {
          this.initialise();
        }
      });
  }

  private initialise() {
    this.refreshList();
  }

  private refreshList() {
    this.loading = true;
    this.resources.pluginOpenIdConnect
      .list()
      .pipe(
        map((response: OpenIdConnectProvidersIndexResponse) => {
          this.totalItemCount = response.body.count;
          return response.body.items;
        }),
        catchError(error => {
          this.messageHandler.showError('There was a problem getting the list of OpenID Connect providers.', error);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((data: OpenIdConnectProvider[]) => this.dataSource.data = data);
  }
}

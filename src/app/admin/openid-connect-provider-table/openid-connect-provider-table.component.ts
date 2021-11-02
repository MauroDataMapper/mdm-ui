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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { ModulesResponse, OpenIdConnectProvider, OpenIdConnectProvidersIndexResponse } from '@maurodatamapper/mdm-resources';
import { openIdConnectModuleName } from '@mdm/model/openid-connect.model';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService, MessageHandlerService, SharedService, StateHandlerService } from '@mdm/services';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { EMPTY, merge, Observable } from 'rxjs';
import { catchError, finalize, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'mdm-openid-connect-provider-table',
  templateUrl: './openid-connect-provider-table.component.html',
  styleUrls: ['./openid-connect-provider-table.component.scss']
})
export class OpenidConnectProviderTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  loading = false;
  moduleLoaded = true;
  totalItemCount = 0;
  dataSource = new MatTableDataSource<OpenIdConnectProvider>([]);
  displayedColumns = ['label', 'icons'];

  constructor(
    private shared: SharedService,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private grid: GridService,
    private dialog: MatDialog,
    private title: Title) { }

  ngOnInit(): void {
    if (!this.shared.features.useOpenIdConnect) {
      this.stateHandler.Go('alldatamodel');
      return;
    }

    this.title.setTitle('OpenID Connect providers');
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.sort = this.sort;

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
        this.moduleLoaded = response.body.findIndex(module => module.name === openIdConnectModuleName) !== -1;
        if (this.moduleLoaded) {
          this.initialise();
        }
      });
  }

  addProvider = () => {
    this.stateHandler.Go('appContainer.adminArea.openIdConnectProvider', { id: null });
  };

  editProvider(record: OpenIdConnectProvider) {
    if (!record) {
      return;
    }

    this.stateHandler.Go('appContainer.adminArea.openIdConnectProvider', { id: record.id });
  }

  deleteProvider(record: OpenIdConnectProvider) {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Are you sure you want to delete this OpenID Connect provider?',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: 'Once deleted, the provider cannot be retrieved.',
        }
      })
      .pipe(
        switchMap(() => this.resources.pluginOpenIdConnect.remove(record.id)),
        catchError(error => {
          this.messageHandler.showError('There was a problem deleting the OpenID Connect provider.', error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('OpenID Connect provider deleted successfully.');
        this.refreshList();
      });
  }

  private initialise() {
    this.refreshList();
  }

  private refreshList() {
    merge(
      this.sort.sortChange,
      this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.loading = true;
          return this.fetch(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort.active,
            this.sort.direction);
        }),
        map((response: OpenIdConnectProvidersIndexResponse) => {
          this.loading = false;
          this.totalItemCount = response.body.count;
          return response.body.items;
        }),
        catchError(error => {
          this.loading = false;
          this.messageHandler.showError('There was a problem getting the list of OpenID Connect providers.', error);
          return EMPTY;
        })
      )
      .subscribe((data: OpenIdConnectProvider[]) => this.dataSource.data = data);
  }

  private fetch(
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: SortDirection): Observable<OpenIdConnectProvidersIndexResponse> {
    const options = this.grid.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType);

    return this.resources.pluginOpenIdConnect.list(options);
  }
}

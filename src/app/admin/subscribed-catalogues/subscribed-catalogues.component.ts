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
import { SubscribedCatalogue, SubscribedCatalogueIndexResponse } from '@maurodatamapper/mdm-resources';
import { MdmHttpHandlerOptions, MdmResourcesService } from '@mdm/modules/resources';
import { GridService, MessageHandlerService, SharedService, StateHandlerService } from '@mdm/services';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'mdm-subscribed-catalogues',
  templateUrl: './subscribed-catalogues.component.html',
  styleUrls: ['./subscribed-catalogues.component.scss']
})
export class SubscribedCataloguesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  isLoadingResults: boolean;
  totalItemCount = 0;

  dataSource = new MatTableDataSource<any>();

  displayedColumns = ['label', 'description', 'connection', 'refreshPeriod', 'icons'];
  records: SubscribedCatalogue[] = [];

  constructor(
    private resources: MdmResourcesService,
    private gridService: GridService,
    private stateHandlerService: StateHandlerService,
    private shared: SharedService,
    private messageHandler: MessageHandlerService,
    private title: Title,
    private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource(this.records);
  }

  ngOnInit(): void {
    this.title.setTitle('Subscribed catalogues');
  }

  ngAfterViewInit(): void {
    if (!this.shared.features.useSubscribedCatalogues) {
      this.stateHandlerService.Go('alldatamodel');
      return;
    }

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.sort = this.sort;

    this.refreshList();
  }

  refreshList() {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.fetchConnections(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort.active,
            this.sort.direction
          );
        }),
        map((data: SubscribedCatalogueIndexResponse) => {
          this.totalItemCount = data.body.count;
          this.isLoadingResults = false;
          return data.body.items;
        }),
        catchError(error => {
          this.isLoadingResults = false;
          this.messageHandler.showError('There was a problem loading the subscribed catalogues.', error);
          return [];
        })
      )
      .subscribe((data: SubscribedCatalogue[]) => {
        this.records = data;
        this.dataSource.data = this.records;
      });
  }

  fetchConnections(
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: SortDirection): Observable<SubscribedCatalogueIndexResponse> {
    const options = this.gridService.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType);

    return this.resources.admin.listSubscribedCatalogues(options);
  }

  addSubscription = () => {
    this.stateHandlerService.Go('appContainer.adminArea.subscribedCatalogue', { id: null });
  };

  editSubscription(record: SubscribedCatalogue) {
    if (!record) {
      return;
    }

    this.stateHandlerService.Go('appContainer.adminArea.subscribedCatalogue', { id: record.id });
  }

  deleteSubscription(record: SubscribedCatalogue) {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Are you sure you want to delete this subscribed catalogue?',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: 'Once deleted, the subscription cannot be retrieved.',
        }
      })
      .pipe(
        switchMap(() => this.resources.admin.removeSubscribedCatalogue(record.id))
      )
      .subscribe(
        () => {
          this.messageHandler.showSuccess('Subscribed catalogue deleted successfully.');
          this.refreshList();
        },
        error => this.messageHandler.showError('There was a problem deleting the subscribed catalogue.', error));
  }

  testSubscription(record: SubscribedCatalogue) {
    this.messageHandler.showInfo(`Testing connection to "${record.label}"...`);

    const requestOptions: MdmHttpHandlerOptions = {
      handleGetErrors: false
    };

    this.resources.admin
      .testSubscribedCatalogueConnection(record.id, {}, requestOptions)
      .subscribe(
        () => this.messageHandler.showSuccess(`Subscribed catalogue "${record.label}" is functioning as expected.`),
        error => this.messageHandler.showError(`There was a problem connecting to the subscribed catalogue "${record.label}", please check the configuration.`, error)
      );
  }
}

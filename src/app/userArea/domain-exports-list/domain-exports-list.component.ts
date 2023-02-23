/*
Copyright 2020-2023 University of Oxford and NHS England

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
import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import {
  DomainExport,
  DomainExportIndexResponse
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  ExportHandlerService,
  GridService,
  MessageHandlerService,
  StateHandlerService
} from '@mdm/services';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { EMPTY, merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'mdm-domain-exports-list',
  templateUrl: './domain-exports-list.component.html',
  styleUrls: ['./domain-exports-list.component.scss']
})
export class DomainExportsListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;

  filtering = new EventEmitter<void>();
  filterValues = {};

  dataSource = new MatTableDataSource<DomainExport>([]);
  totalItemCount = 0;
  loading = false;
  displayedColumns = [
    'exportFileName',
    'exportFileSize',
    'exportedOn',
    'exportedBy',
    'actions'
  ];
  showFilters = false;

  constructor(
    private resources: MdmResourcesService,
    private title: Title,
    private grid: GridService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private exportHandler: ExportHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Exported models');
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filtering.subscribe(() => (this.paginator.pageIndex = 0));
    this.dataSource.sort = this.sort;

    this.refreshList();
  }

  toggleFilter() {
    this.showFilters = !this.showFilters;
  }

  inputFilterChanged(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    this.filterValues = {
      ...this.filterValues,
      [input.name]: input.value
    };
    this.filtering.emit();
  }

  viewExport(item: DomainExport) {
    this.stateHandler.Go('appContainer.userArea.domainExportsDetail', {
      id: item.id
    });
  }

  downloadExport(item: DomainExport) {
    this.exportHandler.downloadDomainExport(item);
  }

  deleteExport(item: DomainExport) {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Delete exported model',
          message: `Are you sure you want to delete the exported model "${item.export.fileName}"? This cannot be undone once deleted.`,
          okBtnTitle: 'Yes',
          cancelBtnTitle: 'No'
        }
      })
      .pipe(
        switchMap(() => this.resources.domainExports.remove(item.id)),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem deleting this exported model.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe(() => {
        // Trigger a refresh of the list
        this.filtering.emit();
      });
  }

  private refreshList() {
    merge(this.sort.sortChange, this.paginator.page, this.filtering)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.loading = true;
          return this.fetch(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort.active,
            this.sort.direction,
            this.filterValues
          );
        }),
        catchError((error) => {
          this.loading = false;
          this.messageHandler.showError(
            'There was a problem getting the list of exported models.',
            error
          );
          return EMPTY;
        }),
        map((response) => {
          this.loading = false;
          this.totalItemCount = response.body.count;
          return response.body.items;
        })
      )
      .subscribe((data) => (this.dataSource.data = data));
  }

  private fetch(
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: SortDirection,
    filter?: {}
  ): Observable<DomainExportIndexResponse> {
    const options = this.grid.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filter
    );

    return this.resources.domainExports.list(options);
  }
}

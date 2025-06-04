/*
Copyright 2020-2025 University of Oxford and NHS England

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
import { MatSort, SortDirection, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
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
import { FileSizePipe } from '@mdm/directives/file-size.pipe';
import { MdmPaginatorComponent as MdmPaginatorComponent_1 } from '../../shared/mdm-paginator/mdm-paginator';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatDivider } from '@angular/material/divider';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NgIf, NgClass, DatePipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'mdm-domain-exports-list',
    templateUrl: './domain-exports-list.component.html',
    styleUrls: ['./domain-exports-list.component.scss'],
    standalone: true,
    imports: [MatTooltip, NgIf, MatProgressBar, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatFormField, MatLabel, MatInput, MatCellDef, MatCell, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, MatDivider, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, NgClass, ExtendedModule, MdmPaginatorComponent_1, DatePipe, FileSizePipe]
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

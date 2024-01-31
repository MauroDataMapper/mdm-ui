/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import {
  CatalogueItem,
  ReferenceDataType,
  ReferenceDataTypeIndexResponse
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService, MessageHandlerService } from '@mdm/services';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { EMPTY, merge, Observable, Subject } from 'rxjs';
import {
  catchError,
  map,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs/operators';

@Component({
  selector: 'mdm-reference-data-type-select',
  templateUrl: './reference-data-type-select.component.html',
  styleUrls: ['./reference-data-type-select.component.scss']
})
export class ReferenceDataTypeSelectComponent
  implements OnChanges, AfterViewInit, OnDestroy {
  @Input() model: CatalogueItem;

  @Output() selectionChange = new EventEmitter<ReferenceDataType[]>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;

  filtering = new EventEmitter<void>();
  filterValues = {};

  dataSource = new MatTableDataSource<ReferenceDataType>([]);
  selection = new SelectionModel<ReferenceDataType>(true, []);
  totalItemCount = 0;
  loading = false;
  displayedColumns = ['select', 'label', 'description', 'type'];
  pageSize = 20;
  pageSizeOptions = [5, 10, 20, 50];
  showFilters = false;
  selectAll = false;

  private unsubscribe$ = new Subject<void>();

  get allSelected() {
    return this.selection.selected.length === this.totalItemCount;
  }

  constructor(
    private resources: MdmResourcesService,
    private grid: GridService,
    private messageHandler: MessageHandlerService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.model) {
      this.refreshList();
    }
  }

  ngAfterViewInit(): void {
    this.sort.sortChange
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => (this.paginator.pageIndex = 0));

    this.filtering
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => (this.paginator.pageIndex = 0));

    this.selection.changed
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((changes) =>
        this.selectionChange.emit(changes.source.selected)
      );

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

  selectionFilterChanged(event: MatSelectChange) {
    this.filterValues = {
      ...this.filterValues,
      [event.source.id]: event.value
    };

    if (!event.value) {
      delete this.filterValues[event.source.id];
    }

    this.filtering.emit();
  }

  selectAllItems() {
    if (this.allSelected) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((item) => this.selection.select(item));
    }
  }

  private refreshList() {
    if (!this.model) {
      return;
    }

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
            'There was a problem getting the list of jobs.',
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
      .subscribe((data) => {
        this.dataSource.data = data;
        this.updatePreviousSelectionReferences(data);
      });
  }

  private fetch(
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: SortDirection,
    filter?: {}
  ): Observable<ReferenceDataTypeIndexResponse> {
    const options = this.grid.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filter
    );

    return this.resources.referenceDataType.list(this.model.id, options);
  }

  private updatePreviousSelectionReferences(items: ReferenceDataType[]) {
    // Maintain previous selection state after pagination, work out
    // which objects to keep and re-add them to use latest object
    // references
    const itemsToSelect = items.filter((item) => {
      const selected = this.selection.selected.find(
        (selItem) => selItem.id === item.id
      );
      if (!selected) {
        return;
      }
      this.selection.deselect(selected);
      return item;
    });

    this.selection.select(...itemsToSelect);
  }
}

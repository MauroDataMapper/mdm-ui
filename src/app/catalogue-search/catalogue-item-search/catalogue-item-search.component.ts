/*
Copyright 2020-2026 University of Oxford and NHS England

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
import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { MessageHandlerService } from '@mdm/services';
import { SortByOption } from '@mdm/shared/sort-by/sort-by.component';
import { RawParams } from '@uirouter/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CatalogueSearchService } from '../catalogue-search.service';
import {
  CatalogueSearchContext,
  CatalogueSearchParameters,
  CatalogueSearchResultSet,
  getOrderFromSortByOptionString,
  getSortFromSortByOptionString,
  mapSearchParametersToRawParams,
  SearchListingSortByOption,
  SearchListingStatus
} from '../catalogue-search.types';
import { MdmPaginatorComponent } from '../../shared/mdm-paginator/mdm-paginator';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { CatalogueItemSearchResultComponent } from '../catalogue-item-search-result/catalogue-item-search-result.component';
import { SortByComponent } from '../../shared/sort-by/sort-by.component';
import { UIRouterModule } from '@uirouter/angular';
import { AlertComponent } from '../../shared/alert/alert.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';

@Component({
    selector: 'mdm-catalogue-item-search',
    templateUrl: './catalogue-item-search.component.html',
    styleUrls: ['./catalogue-item-search.component.scss'],
    standalone: true,
    imports: [NgIf, FormsModule, MatFormField, MatInput, MatIconButton, MatSuffix, MatIcon, MatProgressSpinner, AlertComponent, UIRouterModule, SortByComponent, NgFor, CatalogueItemSearchResultComponent, NgClass, ExtendedModule, MdmPaginatorComponent]
})
export class CatalogueItemSearchComponent {
  @Input() context: CatalogueSearchContext;

  status: SearchListingStatus = 'init';
  searchTerms?: string;
  parameters?: CatalogueSearchParameters;
  resultSet?: CatalogueSearchResultSet;
  sortBy?: SortByOption;
  /**
   * Each new option must have a {@link SearchListingSortByOption} as a value to ensure
   * the catalogue-search-listing page can interpret the result emitted by the SortByComponent
   */
  searchListingSortByOptions: SortByOption[] = [
    { value: 'label-asc', displayName: 'Label (a-z)' },
    { value: 'label-desc', displayName: 'Label (z-a)' }
  ];

  sortByDefaultOption: SortByOption = this.searchListingSortByOptions[0];

  routeParams?: RawParams;
  clientPageIndex = 0;
  clientPageSize = 20;

  constructor(
    private catalogueSearch: CatalogueSearchService,
    private messageHandler: MessageHandlerService
  ) {}

  startSearch() {
    this.parameters = {
      context: this.context,
      search: this.searchTerms,
      labelOnly: true,
      domainTypes: this.getDomainTypes(),
      offset: 0,
      max: 20
    };

    this.performSearch();
  }

  onSelectSortBy(selected: SortByOption) {
    this.clientPageIndex = 0;
    this.parameters.offset = 0;
    // Preserve max if it was already set
    if (!this.parameters.max) {
      this.parameters.max = 20;
    }
    const sortBy = selected.value as SearchListingSortByOption;
    this.parameters.sort = getSortFromSortByOptionString(sortBy);
    this.parameters.order = getOrderFromSortByOptionString(sortBy);
    this.performSearch();
  }

  onPageChange(event: PageEvent) {
    if (this.usesClientPagination) {
      this.clientPageIndex = event.pageIndex;
      this.clientPageSize = event.pageSize;
      return;
    }

    this.parameters.offset = event.pageIndex * event.pageSize;
    this.parameters.max = event.pageSize;
    this.performSearch();
  }

  get visibleItems() {
    if (!this.resultSet) {
      return [];
    }

    if (!this.usesClientPagination) {
      return this.resultSet.items;
    }

    const start = this.clientPageIndex * this.clientPageSize;
    const end = start + this.clientPageSize;
    return this.resultSet.items.slice(start, end);
  }

  get paginationLength() {
    if (!this.resultSet) {
      return 0;
    }

    return this.usesClientPagination ? this.resultSet.items.length : this.resultSet.count;
  }

  get paginationPageIndex() {
    if (this.usesClientPagination) {
      return this.clientPageIndex;
    }
    return this.resultSet?.max ? Math.floor(this.resultSet.offset / this.resultSet.max) : 0;
  }

  get paginationPageSize() {
    if (this.usesClientPagination) {
      return this.clientPageSize;
    }

    return this.resultSet?.max ?? this.parameters?.max ?? 20;
  }

  get usesClientPagination() {
    if (!this.resultSet) {
      return false;
    }

    return this.resultSet.items.length > (this.resultSet.max || 20);
  }

  private getDomainTypes() {
    if (this.context.domainType === CatalogueItemDomainType.DataModel) {
      return ['DataType', 'DataClass', 'DataElement'];
    }

    return [];
  }

  private performSearch() {
    this.status = 'loading';

    this.catalogueSearch
      .search(this.parameters)
      .pipe(
        catchError((error) => {
          this.status = 'error';
          this.messageHandler.showError(
            'A problem occurred when searching.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((resultSet) => {
        this.resultSet = resultSet;
        if (this.usesClientPagination) {
          const pageCount = Math.ceil(this.paginationLength / this.clientPageSize);
          if (this.clientPageIndex >= pageCount) {
            this.clientPageIndex = 0;
          }
        }
        this.status = 'ready';
        this.routeParams = mapSearchParametersToRawParams(this.parameters);
      });
  }
}

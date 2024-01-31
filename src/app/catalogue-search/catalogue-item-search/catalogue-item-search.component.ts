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
import { Component, Input } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
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

@Component({
  selector: 'mdm-catalogue-item-search',
  templateUrl: './catalogue-item-search.component.html',
  styleUrls: ['./catalogue-item-search.component.scss']
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
      page: 0,
      pageSize: 20
    };

    this.performSearch();
  }

  onSelectSortBy(selected: SortByOption) {
    const sortBy = selected.value as SearchListingSortByOption;
    this.parameters.sort = getSortFromSortByOptionString(sortBy);
    this.parameters.order = getOrderFromSortByOptionString(sortBy);
    this.performSearch();
  }

  onPageChange(event: PageEvent) {
    this.parameters.page = event.pageIndex;
    this.parameters.pageSize = event.pageSize;
    this.performSearch();
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
        this.status = 'ready';
        this.routeParams = mapSearchParametersToRawParams(this.parameters);
      });
  }
}

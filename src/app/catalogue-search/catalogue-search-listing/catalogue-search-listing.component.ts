/*
Copyright 2020-2022 University of Oxford
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
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
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
  mapStateParamsToSearchParameters,
  SearchListingSortByOption,
  SearchListingStatus
} from '../catalogue-search.types';
import { PageEvent } from '@angular/material/paginator';
import { SortByOption } from '@mdm/shared/sort-by/sort-by.component';
import { SearchFilterChange } from '../search-filters/search-filters.component';

@Component({
  selector: 'mdm-catalogue-search-listing',
  templateUrl: './catalogue-search-listing.component.html',
  styleUrls: ['./catalogue-search-listing.component.scss']
})
export class CatalogueSearchListingComponent implements OnInit {
  status: SearchListingStatus = 'init';
  parameters: CatalogueSearchParameters = {};
  searchTerms?: string;
  resultSet?: CatalogueSearchResultSet;
  sortBy?: SortByOption;
  //context: CatalogueSearchContext = null;
  /**
   * Each new option must have a {@link SearchListingSortByOption} as a value to ensure
   * the catalogue-search-listing page can interpret the result emitted by the SortByComponent
   */
  searchListingSortByOptions: SortByOption[] = [
    { value: 'label-asc', displayName: 'Label (a-z)' },
    { value: 'label-desc', displayName: 'Label (z-a)' }
  ];
  sortByDefaultOption: SortByOption = this.searchListingSortByOptions[0];

  constructor(
    private routerGlobals: UIRouterGlobals,
    private stateRouter: StateHandlerService,
    private catalogueSearch: CatalogueSearchService,
    private messageHandler: MessageHandlerService
  ) {}

  ngOnInit(): void {
    this.parameters = mapStateParamsToSearchParameters(
      this.routerGlobals.params
    );
    this.searchTerms = this.parameters.search;
    this.sortBy = this.setSortByFromRouteOrAsDefault(
      this.parameters.sort,
      this.parameters.order
    );

    if (!this.parameters.search || this.parameters.search === '') {
      this.setEmptyResultPage();
      return;
    }

    this.performSearch();
  }

  /**
   * Update the search by using the state router.
   */
  updateSearch() {
    const routeParams = mapSearchParametersToRawParams(this.parameters);

    // Force a reload and do not inherit from previous UI router transition. This fixes an
    // issue when clearing the model context so that the context query params can be removed from
    // the transition URL
    this.stateRouter.Go(
      'appContainer.mainApp.catalogueSearchListing',
      routeParams,
      { reload: true, inherit: false }
    );
  }

  onContextChanged(event: CatalogueSearchContext) {
    this.parameters.context = event;
    this.updateSearch();
  }

  onSearchTerm() {
    this.parameters.search = this.searchTerms;
    this.updateSearch();
  }

  onPageChange(event: PageEvent) {
    this.parameters.page = event.pageIndex;
    this.parameters.pageSize = event.pageSize;
    this.updateSearch();
  }

  onSelectSortBy(selected: SortByOption) {
    const sortBy = selected.value as SearchListingSortByOption;
    this.parameters.sort = getSortFromSortByOptionString(sortBy);
    this.parameters.order = getOrderFromSortByOptionString(sortBy);
    this.updateSearch();
  }

  onFilterChanged(event: SearchFilterChange) {
    this.parameters[event.name] = event.value;
    this.updateSearch();
  }

  onFilterReset() {
    this.parameters.context = undefined;
    this.parameters.domainTypes = [];
    this.parameters.labelOnly = undefined;
    this.parameters.exactMatch = undefined;
    this.parameters.lastUpdatedAfter = undefined;
    this.parameters.lastUpdatedBefore = undefined;
    this.parameters.createdAfter = undefined;
    this.parameters.createdBefore = undefined;
    this.parameters.classifiers = [];
    this.updateSearch();
  }

  private setEmptyResultPage() {
    this.resultSet = {
      count: 0,
      page: 1,
      pageSize: 10,
      items: []
    };
    this.status = 'ready';
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
      });
  }

  /**
   * Match route params sort and order to sortBy option or return the default value if not set.
   *
   * @param sort the route string value for which property is being sorted on.
   * @param order the order in which to sort that propery
   * @returns a SortByOption object with value matching the route string sortBy value or the default sortBy option.
   */
  private setSortByFromRouteOrAsDefault(
    sort: string | undefined,
    order: string | undefined
  ): SortByOption {
    if (!sort || !order) {
      return this.sortByDefaultOption;
    }
    const valueString = `${sort}-${order}`;

    const filteredOptionsList = this.searchListingSortByOptions.filter(
      (item: SortByOption) => item.value === valueString
    );

    return filteredOptionsList.length === 0
      ? this.sortByDefaultOption
      : filteredOptionsList[0];
  }
}

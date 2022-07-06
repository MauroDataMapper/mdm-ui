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
  mapStateParamsToSearchParameters
} from '../catalogue-search.types';
import { PageEvent } from '@angular/material/paginator';
import { SortByOption, SortOrder } from '@mdm/shared/sort-by/sort-by.component';
import { SearchFilterChange } from '../search-filters/search-filters.component';

export type SearchListingStatus = 'init' | 'loading' | 'ready' | 'error';

/**
 * These options must be of the form '{propertyToSortBy}-{order}' where propertyToSortBy
 * can be any property on the objects you are sorting and order must be of type
 * {@link SortOrder }
 */
export type SearchListingSortByOption = 'label-asc' | 'label-desc';

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
  context: CatalogueSearchContext = null;
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

    if (this.parameters.contextDomainType && this.parameters.contextId) {
      this.context = {
        domainType: this.parameters.contextDomainType,
        id: this.parameters.contextId,
        label: this.parameters.contextLabel,
        dataModelId: this.parameters.contextDataModelId,
        parentId: this.parameters.contextParentId,
      };
    }

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
    this.stateRouter.Go(
      'appContainer.mainApp.catalogueSearchListing',
      this.parameters
    );
  }

  onContextChanged(event: CatalogueSearchContext) {
    this.parameters.contextId = event ? event.id : null;
    this.parameters.contextDomainType = event ? event.domainType : null;
    this.parameters.contextLabel = event ? event.label : null;
    this.parameters.contextDataModelId = event ? event.dataModelId : null;
    this.parameters.contextParentId = event ? event.parentId : null;
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
    this.parameters.sort = this.getSortFromSortByOptionString(sortBy);
    this.parameters.order = this.getOrderFromSortByOptionString(sortBy);
    this.updateSearch();
  }

  onFilterChanged(event: SearchFilterChange) {
    this.parameters[event.name] = event.value;
    this.updateSearch();
  }

  onFilterReset() {
    this.parameters.contextDomainType = undefined;
    this.parameters.contextId = undefined;
    this.parameters.contextLabel = undefined;
    this.parameters.contextParentId = undefined;
    this.parameters.contextDataModelId = undefined;
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
      .contextualSearch(this.context, this.parameters)  
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

  private getSortFromSortByOptionString(sortBy: string) {
    return sortBy.split('-')[0];
  }

  private getOrderFromSortByOptionString(sortBy: string) {
    return sortBy.split('-')[1] as SortOrder;
  }
}
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
  CatalogueSearchParameters,
  CatalogueSearchResultSet,
  mapStateParamsToSearchParameters
} from '../catalogue-search.types';
import { PageEvent } from '@angular/material/paginator';

export type SearchListingStatus = 'init' | 'loading' | 'ready' | 'error';

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

    if (!this.parameters.search || this.parameters.search === '') {
      this.setEmptyResultPage();
      return;
    }

    this.performSearch();
  }

  updateSearch() {
    this.stateRouter.Go('appContainer.mainApp.catalogueSearchListing', {
      search: this.searchTerms
    });
  }

  onPageChange(event: PageEvent) {
    this.status = 'loading';
    this.stateRouter.Go('appContainer.mainApp.catalogueSearchListing', {
      search: this.searchTerms,
      page: event.pageIndex,
      pageSize: event.pageSize
    });
  }

  private setEmptyResultPage() {
    this.resultSet = {
      totalResults: 0,
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
}

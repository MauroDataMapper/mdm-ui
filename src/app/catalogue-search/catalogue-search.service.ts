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
import { Injectable } from '@angular/core';
import {
  CatalogueItemSearchResponse,
  CatalogueItemSearchResult,
  MdmIndexBody,
  PageParameters,
  SearchQueryParameters
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CatalogueSearchParameters,
  CatalogueSearchResultSet
} from './catalogue-search.types';

@Injectable({
  providedIn: 'root'
})
export class CatalogueSearchService {
  constructor(private resources: MdmResourcesService) {}

  search(
    params: CatalogueSearchParameters
  ): Observable<CatalogueSearchResultSet> {
    const [page, pageParams] = this.getPageParameters(params);
    const query: SearchQueryParameters = {
      ...this.getCommonQueryParameters(params),
      ...pageParams,
      searchTerm: params.search
    };

    return this.searchCatalogue(query).pipe(
      map((searchResults) => {
        return {
          totalResults: searchResults.count,
          pageSize: pageParams.max!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          page,
          items: searchResults.items
        };
      })
    );
  }

  private getPageParameters(
    params: CatalogueSearchParameters
  ): [number, PageParameters] {
    const page = params.page ?? 1;
    // TODO: add with pagination
    // const pageParams = this.pagination.buildPageParameters(page, params.pageSize);
    const pageParams: PageParameters = {
      max: 10,
      offset: 0
    };
    return [page, pageParams];
  }

  private getCommonQueryParameters(
    params: CatalogueSearchParameters
  ): SearchQueryParameters {
    return {
      sort: params.sort,
      order: params.order
    };
  }

  private searchCatalogue(
    query: SearchQueryParameters
  ): Observable<MdmIndexBody<CatalogueItemSearchResult>> {
    return this.resources.catalogueItem
      .search(query)
      .pipe(map((response: CatalogueItemSearchResponse) => response.body));
  }
}

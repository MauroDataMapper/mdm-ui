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
import { Injectable } from '@angular/core';
import {
  CatalogueItemDomainType,
  CatalogueItemSearchResponse,
  CatalogueItemSearchResult,
  MdmIndexBody,
  PageParameters,
  ProfileDefinition,
  ProfileDefinitionResponse,
  ProfileSummary,
  ProfileSummaryResponse,
  SearchQueryParameters
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CatalogueSearchContext,
  CatalogueSearchParameters,
  CatalogueSearchProfileFilter,
  CatalogueSearchProfileFilterDto,
  CatalogueSearchResultSet,
  defaultPage,
  defaultPageSize,
  serializeDate,
  ungroupProfileFiltersDto
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
      searchTerm: this.getSearchTerm(params)
    };

    return this.searchCatalogue(query, params.context).pipe(
      map((searchResults) => {
        return {
          count: searchResults.count,
          pageSize: pageParams.max!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          page,
          items: searchResults.items
        };
      })
    );
  }

  /**
   * Maps a {@link CatalogueSearchProfileFilterDto} into a full featured list of profile filters with usable
   * information.
   *
   * @param dto The DTO to map and transform.
   * @returns A list of {@link CatalogueSearchProfileFilter} objects.
   *
   * The DTO provided will only contain the essential information:
   *
   * 1. Profile provider - namespace, name and version
   * 2. Metadata key
   * 3. Metadata value
   *
   * Once unpacked, this function will then also fetch secondary information, such as the profile provider and
   * metadata key display names.
   */
  mapProfileFilters(
    dto?: CatalogueSearchProfileFilterDto
  ): Observable<CatalogueSearchProfileFilter[]> {
    if (!dto) {
      return of([]);
    }

    const ungroupedDto = ungroupProfileFiltersDto(dto);

    const foo = ungroupedDto.map((item) => {
      const provider$: Observable<ProfileSummary> = this.resources.profile
        .provider(item.namespace, item.name, item.version)
        .pipe(map((response: ProfileSummaryResponse) => response.body));

      const definition$: Observable<ProfileDefinition> = this.resources.profile
        .definition(item.namespace, item.name)
        .pipe(map((response: ProfileDefinitionResponse) => response.body));

      return forkJoin([provider$, definition$]).pipe(
        map(([provider, definition]) => {
          const fields = definition.sections.flatMap(
            (section) => section.fields
          );

          const key = fields.find(
            (field) => field.metadataPropertyName === item.key
          );

          return {
            provider,
            key,
            value: item.value
          };
        })
      );
    });

    return forkJoin(foo);
  }

  /**
   * If the exactMatch parameter is set then wrap then enclose the search term in quotes, if it
   * is not already so wrapped
   *
   * @param params
   *
   * @returns string The search term in quotes
   */
  private getSearchTerm(params: CatalogueSearchParameters): string {
    let search = params.search;
    if (params.exactMatch) {
      if (search[0] !== '"') {
        search = '"' + search;
      }
      if (search[search.length - 1] !== '"') {
        search = search + '"';
      }
    }
    return search;
  }

  private getPageParameters(
    params: CatalogueSearchParameters
  ): [number, PageParameters] {
    const page = params.page ?? defaultPage;
    const pageSize = params.pageSize ?? defaultPageSize;
    const pageParams: PageParameters = {
      max: pageSize,
      offset: page * pageSize
    };
    return [page, pageParams];
  }

  private getCommonQueryParameters(
    params: CatalogueSearchParameters
  ): SearchQueryParameters {
    return {
      sort: params.sort,
      order: params.order,
      domainTypes: params.domainTypes,
      labelOnly: params.labelOnly,
      lastUpdatedAfter: serializeDate(params.lastUpdatedAfter),
      lastUpdatedBefore: serializeDate(params.lastUpdatedBefore),
      createdAfter: serializeDate(params.createdAfter),
      createdBefore: serializeDate(params.createdBefore),
      classifiers: params.classifiers
    };
  }

  /**
   * Search the entire catalogue
   *
   * @param query
   * @returns
   */
  private searchCatalogue(
    query: SearchQueryParameters,
    context?: CatalogueSearchContext
  ): Observable<MdmIndexBody<CatalogueItemSearchResult>> {
    if (context) {
      if (context.domainType === CatalogueItemDomainType.DataClass) {
        // Data Classes are a special case. Otherwise use a generic approach for SearchableItemResource
        return this.resources.dataClass
          .search(context.dataModelId, context.id, query)
          .pipe(map((response: CatalogueItemSearchResponse) => response.body));
      }

      if (context.domainType === CatalogueItemDomainType.Terminology) {
        // Terminology and terms are a special case. Otherwise use a generic approach for SearchableItemResource
        return this.resources.term
          .search(context.id, query)
          .pipe(map((response: CatalogueItemSearchResponse) => response.body));
      }

      return this.resources
        .getSearchableResource(context.domainType)
        .search(context.id, query)
        .pipe(map((response: CatalogueItemSearchResponse) => response.body));
    }

    return this.resources.catalogueItem
      .search(query)
      .pipe(map((response: CatalogueItemSearchResponse) => response.body));
  }
}

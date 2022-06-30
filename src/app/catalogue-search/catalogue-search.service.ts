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
  CatalogueItemDomainType,
  CatalogueItemSearchResponse,
  CatalogueItemSearchResult,
  MdmIndexBody,
  PageParameters,
  SearchableItemResource,
  SearchQueryParameters
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CatalogueSearchContext,
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

  // /**
  //  * Search for catalogue items. If context is not null then search within that context (for example within a Folder
  //  * or DataModel), otherwise search the whole catalogue.
  //  *
  //  * @param context A context (i.e. specific item) within which to search. Can be null.
  //  * @param parameters
  //  * @returns Observable<any>
  //  */
  // contextualSearch(
  //   context: CatalogueSearchContext,
  //   parameters: CatalogueSearchParameters
  // ): Observable<any> {
  //   const searchQueryParameters: SearchQueryParameters = this.getSearchQueryParameters(
  //     parameters
  //   );

  //   if (context == null) {
  //     return this.searchCatalogue(searchQueryParameters).pipe(
  //       map((searchResults) => {
  //         return {
  //           count: searchResults.count,
  //           pageSize: parameters.pageSize!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
  //           page: parameters.page,
  //           items: searchResults.items
  //         };
  //       })
  //     );
  //   } else {
  //     return this.searchCatalogueItem(context, searchQueryParameters).pipe(
  //       map((searchResults) => {
  //         return {
  //           count: searchResults.count,
  //           pageSize: parameters.pageSize!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
  //           page: parameters.page,
  //           items: searchResults.items
  //         };
  //       })
  //     );
  //   }
  // }

  /**
   * Map CatalogueSearchParameters to SearchQueryParameters
   *
   * @param catalogueSearchParams
   *
   * @returns SearchQueryParameters
   */
  private getSearchQueryParameters(
    catalogueSearchParams: CatalogueSearchParameters
  ): SearchQueryParameters {
    const params: SearchQueryParameters = {
      searchTerm: this.getSearchTerm(catalogueSearchParams),
      labelOnly: catalogueSearchParams.labelOnly,
      lastUpdatedBefore: catalogueSearchParams.lastUpdatedBefore,
      lastUpdatedAfter: catalogueSearchParams.lastUpdatedAfter,
      createdAfter: catalogueSearchParams.createdAfter,
      createdBefore: catalogueSearchParams.createdBefore,
      domainTypes: catalogueSearchParams.domainTypes,
      dataModelTypes: [],
      classifiers: catalogueSearchParams.classifiers,
      sort: catalogueSearchParams.sort,
      order: catalogueSearchParams.order,
      max: catalogueSearchParams.pageSize,
      offset: (catalogueSearchParams.page ?? 1) * catalogueSearchParams.pageSize
    };

    return params;
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
    const page = params.page ?? 1;
    const pageParams: PageParameters = {
      max: params.pageSize,
      offset: page * params.pageSize
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
      lastUpdatedAfter: params.lastUpdatedAfter,
      lastUpdatedBefore: params.lastUpdatedBefore,
      createdAfter: params.createdAfter,
      createdBefore: params.createdBefore,
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

      return this.resources
        .getSearchableResource(context.domainType)
        .search(context.id, query)
        .pipe(map((response: CatalogueItemSearchResponse) => response.body));
    }

    return this.resources.catalogueItem
      .search(query)
      .pipe(map((response: CatalogueItemSearchResponse) => response.body));
  }

  // /**
  //  * Search within a specific catalogute item (the context)
  //  *
  //  * @param context
  //  * @param query
  //  * @returns
  //  */
  // private searchCatalogueItem(
  //   context: CatalogueSearchContext,
  //   query: SearchQueryParameters
  // ): Observable<MdmIndexBody<CatalogueItemSearchResult>> {
  //   // Data Classes are a special case. Otherwise use a generic approach for SearchableItemResource
  //   if (context.domainType === CatalogueItemDomainType.DataClass) {
  //     const resource = this.resources.dataClass;

  //     return resource
  //       .search(context.dataModelId, context.id, query)
  //       .pipe(map((response: CatalogueItemSearchResponse) => response.body));
  //   } else {
  //     const resource: SearchableItemResource = this.getSearchableItemResource(
  //       context.domainType
  //     );

  //     if (resource == null) {
  //       return throwError('No searchable resource');
  //     } else {
  //       return resource
  //         .search(context.id, query)
  //         .pipe(map((response: CatalogueItemSearchResponse) => response.body));
  //     }
  //   }
  // }

  // private getSearchableItemResource(domain: string): SearchableItemResource {
  //   switch (domain) {
  //     case CatalogueItemDomainType.Folder:
  //       return this.resources.folder;

  //     case CatalogueItemDomainType.DataModel:
  //       return this.resources.dataModel;

  //     case CatalogueItemDomainType.Terminology:
  //       return this.resources.terminology;

  //     case CatalogueItemDomainType.CodeSet:
  //       return this.resources.codeSet;

  //     case CatalogueItemDomainType.ReferenceDataModel:
  //       return this.resources.referenceDataModel;

  //     case CatalogueItemDomainType.VersionedFolder:
  //       return this.resources.versionedFolder;

  //     default:
  //       return null;
  //   }
  // }
}

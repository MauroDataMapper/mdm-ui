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
import {
  CatalogueItemDomainType,
  CatalogueItemSearchResult
} from '@maurodatamapper/mdm-resources';
import { RawParams, StateParams } from '@uirouter/core';

export type SortOrder = 'asc' | 'desc';

export const defaultPage = 0; // Zero-based page numbers for MatPaginator
export const defaultPageSize = 50;

/**
 * These options must be of the form '{propertyToSortBy}-{order}' where propertyToSortBy
 * can be any property on the objects you are sorting and order must be of type
 * {@link SortOrder }
 */
export type SearchListingSortByOption = 'label-asc' | 'label-desc';

export const getSortFromSortByOptionString = (sortBy: string) => {
  return sortBy.split('-')[0];
};

export const getOrderFromSortByOptionString = (sortBy: string) => {
  return sortBy.split('-')[1] as SortOrder;
};

export type SearchListingStatus = 'init' | 'loading' | 'ready' | 'error';

export type CatalogueSearchFilters = {
  [key: string]: string | undefined;
};

/**
 * Represents a single element within which a search should occur.
 */
export interface CatalogueSearchContext {
  domainType: CatalogueItemDomainType;
  id: string;
  label: string;
  parentId?: string;
  dataModelId?: string;
}

/**
 * Represents the parameters to drive a Catalogue Search.
 */
export interface CatalogueSearchParameters {
  /**
   * If provided, a search context element i.e. the catalogue item within
   * which searching should be restricted to.
   */
  context?: CatalogueSearchContext;

  /**
   * If provided, provides the search terms for full text search.
   */
  search?: string;

  /**
   * If provided, state which page of results to fetch. If not provided, the first page
   * is assumed.
   */
  page?: number;

  /**
   * If provided, state how many results to return per page. If not provided, the default
   * value is assumed.
   */
  pageSize?: number;

  /**
   * The field/property name to sort by.
   */
  sort?: string;

  /**
   * State what sort order to use. If supplied, must be either:
   *
   * * `'asc'` for ascending order, or
   * * `'desc'` for descending order.
   *
   * If not supplied, the default value used will depend on the resource requested.
   */
  order?: SortOrder;

  /**
   * Optionally provide filter values to control what search results are returned.
   */
  filters?: CatalogueSearchFilters;

  /**
   * Optionally filter by domain type(s)
   */
  domainTypes?: string[];

  /**
   * Optionally match on label only
   */
  labelOnly?: boolean;

  /**
   * Optionally do an exact match on the search term
   */
  exactMatch?: boolean;

  /**
   * Optionally filter on dates, as yyyy-MM-dd
   */
  lastUpdatedAfter?: string;
  lastUpdatedBefore?: string;
  createdAfter?: string;
  createdBefore?: string;

  /**
   * AND matching on classifiers
   */
  classifiers?: string[];
}

/**
 * Maps query parameters from a route to a {@link CatalogueSearchParameters} object.
 *
 * @param query The {@link StateParams} containing the query parameters.
 * @returns A {@link CatalogueSearchParameters} containing the mapped parameters.
 */
export const mapStateParamsToSearchParameters = (
  query: StateParams
): CatalogueSearchParameters => {
  let domainTypes: string[] = [];

  let classifiers: string[] = [];

  // There can be many domain types selected in the filter, each one of which is passed in a
  // separate &domainTypes query parameter. If there is exactly one of these parameters, then
  // it comes from the router as a string. If there is more than one then they come as an array.
  // Here we make sure that we always end up with an array.
  if (typeof query?.domainTypes === 'string') {
    domainTypes = [query?.domainTypes];
  } else if (query?.domainTypes instanceof Array) {
    domainTypes = query?.domainTypes;
  }

  if (typeof query?.classifiers === 'string') {
    classifiers = [query?.classifiers];
  } else if (query?.classifiers instanceof Array) {
    classifiers = query?.classifiers;
  }

  const hasContext = query?.contextDomainType && query?.contextId;
  const context: CatalogueSearchContext = {
    id: query?.contextId,
    domainType: query?.contextDomainType,
    label: query?.contextLabel,
    parentId: query?.contextParentId,
    dataModelId: query?.contextDataModelId
  };

  return {
    ...(hasContext && { context }),
    search: query?.search ?? undefined,
    page: query?.page ?? undefined,
    sort: query?.sort ?? undefined,
    order: query?.order ?? undefined,
    pageSize: query?.pageSize ?? undefined,
    domainTypes,
    labelOnly: query?.labelOnly === 'false' ? false : true,
    exactMatch: query?.exactMatch === 'true' ? true : undefined,
    lastUpdatedAfter: query?.lastUpdatedAfter ?? undefined,
    lastUpdatedBefore: query?.lastUpdatedBefore ?? undefined,
    createdAfter: query?.createdAfter ?? undefined,
    createdBefore: query?.createdBefore ?? undefined,
    classifiers
  };
};

export const mapSearchParametersToRawParams = (
  parameters: CatalogueSearchParameters
): RawParams => {
  return {
    ...(parameters.context?.domainType && {
      contextDomainType: parameters.context.domainType
    }),
    ...(parameters.context?.id && { contextId: parameters.context.id }),
    ...(parameters.context?.parentId && {
      contextParentId: parameters.context.parentId
    }),
    ...(parameters.context?.label && {
      contextLabel: parameters.context.label
    }),
    ...(parameters.context?.dataModelId && {
      contextDataModelId: parameters.context.dataModelId
    }),
    ...(parameters.search && { search: parameters.search }),
    ...(parameters.page && { page: parameters.page }),
    ...(parameters.sort && { sort: parameters.sort }),
    ...(parameters.order && { order: parameters.order }),
    ...(parameters.pageSize && { pageSize: parameters.pageSize }),
    ...(parameters.domainTypes && { domainTypes: parameters.domainTypes }),
    ...(parameters.labelOnly && { labelOnly: parameters.labelOnly }),
    ...(parameters.exactMatch && { exactMatch: parameters.exactMatch }),
    ...(parameters.lastUpdatedAfter && {
      lastUpdatedAfter: parameters.lastUpdatedAfter
    }),
    ...(parameters.lastUpdatedBefore && {
      lastUpdatedBefore: parameters.lastUpdatedBefore
    }),
    ...(parameters.createdAfter && { createdAfter: parameters.createdAfter }),
    ...(parameters.createdBefore && {
      createdBefore: parameters.createdBefore
    }),
    ...(parameters.classifiers && { classifiers: parameters.classifiers })
  };
};

export interface CatalogueSearchResultSet {
  count: number;
  pageSize: number;
  page: number;
  items: CatalogueItemSearchResult[];
}

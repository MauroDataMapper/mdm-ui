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
import {
  CatalogueItemDomainType,
  CatalogueItemSearchResult,
  ProfileField,
  ProfileSummary
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
 * Represents a criteria filter using Profiles.
 *
 * This type of filter presents three key attributes:
 *
 * 1. The profile to match against - effectively, the namespace of the profile/metadata
 * 2. The metadata property name to match against
 * 3. The value to search for on this key
 */
export interface CatalogueSearchProfileFilter {
  provider: ProfileSummary;
  key: ProfileField;
  value: string;
}

/**
 * A data transfer object (DTO) comprising the same information as a list of {@link CatalogueSearchProfileFilter}
 * values but compressed for better transfer.
 *
 * @see mapProfileFiltersToDto
 */
export interface CatalogueSearchProfileFilterDto {
  [ns: string]: {
    [key: string]: string;
  };
}

/**
 * Maps a list of {@link CatalogueSearchProfileFilter} objects into a compressed data transfer object (DTO)
 * ready to be passed as data to other pages.
 *
 * @param filters The profile filters to transform into the DTO.
 * @returns The minimal DTO containing the same information.
 *
 * The resulting DTO is designed to compress the important information from {@link CatalogueSearchProfileFilter} objects
 * into a minimal JSON object. Information is grouped by profile namespace/name/version, and each group lists each key/value
 * pair.
 *
 * For example, this list:
 *
 * ```ts
 * [
 *   {
 *     provider: {
 *       namespace: 'uk.ac.maurodatamapper.profiles',
 *       name: 'TestProfile',
 *       version: '1.0.0',
 *       // etc...
 *     },
 *     key: {
 *       metadataPropertyName: 'profileKey',
 *       // etc...
 *     },
 *     value: 'some value'
 *   }
 * ]
 * ```
 *
 * Would be transformed into this:
 *
 * ```json
 * {
 *   "uk.ac.maurodatamapper.profiles|TestProfile|1.0.0": {
 *     "profileKey": "some value"
 *   }
 * }
 * ```
 *
 * The reason for reducing this into a minimal DTO is to be able to compress and transfer the information
 * across pages via URL query parameters.
 *
 * @see serializeProfileFiltersDto
 */
export const mapProfileFiltersToDto = (
  filters: CatalogueSearchProfileFilter[]
): CatalogueSearchProfileFilterDto => {
  const grouped = filters.reduce((result, item) => {
    // Must combine all profile provider information into one parsable string
    const providerFullName = `${item.provider.namespace}|${item.provider.name}|${item.provider.version}`;

    return {
      ...result,
      [providerFullName]: {
        ...(result[providerFullName] || {}),
        [item.key.metadataPropertyName]: item.value
      }
    };
  }, {});

  return grouped;
};

/**
 * Unpack a {@link CatalogueSearchProfileFilterDto} and flatten into a straight list of
 * objects containing the key information contained in the DTO.
 *
 * @param dto A DTO to unpack.
 * @returns A flattened list of objects containing the key information from the DTO.
 */
export const ungroupProfileFiltersDto = (
  dto: CatalogueSearchProfileFilterDto
) => {
  return Object.entries(dto).flatMap(([fullName, keyMap]) => {
    // Full name is the same combined string created from mapProfileFiltersToDto()
    const [namespace, name, version] = fullName.split('|');

    return Object.entries(keyMap).map(([key, value]) => {
      return {
        namespace,
        name,
        version,
        key,
        value
      };
    });
  });
};

/**
 * Serializes the provided {@link CatalogueSearchProfileFilter} objects into a compressed, encoded string.
 *
 * @param filters The profile filter(s) to serialize
 * @returns A Base64 encoded string of the information.
 *
 * This function is required to transform this large list/object structure into something that can be transferred
 * via URL query parameters.
 */
export const serializeProfileFiltersDto = (
  dto: CatalogueSearchProfileFilterDto
): string => {
  if (!dto) {
    return undefined;
  }

  const json = JSON.stringify(dto);
  const base64 = btoa(json); // Base64 encoded string
  return base64;
};

/**
 * Deserializes a Base64 encoded string which contains profile filter information.
 *
 * @param base64String The encoded string to decode and deserialize
 * @returns A {@link CatalogueSearchProfileFilterDto} object.
 *
 * With the decoded DTO, you will need to transform into suitable {@link CatalogueSearchProfileFilter}
 * objects.
 *
 * @see {@link CatalogueSearchService.mapProfileFilters}
 */
export const deserializeProfileFiltersToDto = (base64String: string) => {
  const decoded = atob(base64String); // Base64 decoded string
  const dto = JSON.parse(decoded) as CatalogueSearchProfileFilterDto;
  return dto;
};

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
  lastUpdatedAfter?: Date;
  lastUpdatedBefore?: Date;
  createdAfter?: Date;
  createdBefore?: Date;

  /**
   * Optionally return documents that were superceded
   */
  includeSuperseded?: boolean;

  /**
   * AND matching on classifiers
   */
  classifiers?: string[];

  /**
   * Optional DTO containing filters for profiles and metadata search
   */
  profileFiltersDto?: CatalogueSearchProfileFilterDto;
}

export const serializeDate = (date: Date) => {
  if (!date) {
    return;
  }

  // Remember: getMonth() is zero based
  const yyyy: String = date.getFullYear().toString();
  const mm: String = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd: String = date.getDate().toString().padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
};

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
  if (typeof query?.dt === 'string') {
    domainTypes = [query?.dt];
  } else if (query?.dt instanceof Array) {
    domainTypes = query?.dt;
  }

  if (typeof query?.cls === 'string') {
    classifiers = [query?.cls];
  } else if (query?.cls instanceof Array) {
    classifiers = query?.cls;
  }

  const hasContext = query?.cxdt && query?.cxid;
  const context: CatalogueSearchContext = {
    id: query?.cxid,
    domainType: query?.cxdt,
    label: query?.cxl,
    parentId: query?.cxpid,
    dataModelId: query?.cxmid
  };

  const profileFilterDto = query?.md
    ? deserializeProfileFiltersToDto(query.md)
    : undefined;

  return {
    ...(hasContext && { context }),
    search: query?.search ?? undefined,
    page: query?.page ?? undefined,
    sort: query?.sort ?? undefined,
    order: query?.order ?? undefined,
    pageSize: query?.pageSize ?? undefined,
    domainTypes,
    labelOnly: query?.l === false ? false : true,
    exactMatch: query?.e === true ? true : undefined,
    lastUpdatedAfter: query?.lua ? new Date(query.lua) : undefined,
    lastUpdatedBefore: query?.lub ? new Date(query.lub) : undefined,
    createdAfter: query?.ca ? new Date(query.ca) : undefined,
    createdBefore: query?.cb ? new Date(query.cb) : undefined,
    includeSuperseded: query?.is === true ? true : false,
    classifiers,
    profileFiltersDto: profileFilterDto
  };
};

export const mapSearchParametersToRawParams = (
  parameters: CatalogueSearchParameters
): RawParams => {
  return {
    ...(parameters.context?.domainType && {
      cxdt: parameters.context.domainType
    }),
    ...(parameters.context?.id && { cxid: parameters.context.id }),
    ...(parameters.context?.parentId && {
      cxpid: parameters.context.parentId
    }),
    ...(parameters.context?.label && {
      cxl: parameters.context.label
    }),
    ...(parameters.context?.dataModelId && {
      cxmid: parameters.context.dataModelId
    }),
    ...(parameters.search && { search: parameters.search }),
    ...(parameters.page && { page: parameters.page }),
    ...(parameters.sort && { sort: parameters.sort }),
    ...(parameters.order && { order: parameters.order }),
    ...(parameters.pageSize && { pageSize: parameters.pageSize }),
    ...(parameters.domainTypes && { dt: parameters.domainTypes }),
    ...(parameters.labelOnly && { l: parameters.labelOnly }),
    ...(parameters.exactMatch && { e: parameters.exactMatch }),
    ...(parameters.lastUpdatedAfter && {
      lua: serializeDate(parameters.lastUpdatedAfter)
    }),
    ...(parameters.lastUpdatedBefore && {
      lub: serializeDate(parameters.lastUpdatedBefore)
    }),
    ...(parameters.createdAfter && {
      ca: serializeDate(parameters.createdAfter)
    }),
    ...(parameters.createdBefore && {
      cb: serializeDate(parameters.createdBefore)
    }),
    ...(parameters.includeSuperseded && { is: parameters.includeSuperseded }),
    ...(parameters.classifiers && { cls: parameters.classifiers }),
    ...(parameters.profileFiltersDto && {
      md: serializeProfileFiltersDto(parameters.profileFiltersDto)
    })
  };
};

export interface CatalogueSearchResultSet {
  count: number;
  pageSize: number;
  page: number;
  items: CatalogueItemSearchResult[];
}

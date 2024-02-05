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
  Breadcrumb,
  CatalogueItem,
  MdmResponse,
  PathableDomainType,
  Profile,
  ProfileValidationError,
  Uuid
} from '@maurodatamapper/mdm-resources';

export interface MauroIdentifierFetchOptions {
  /**
   * If true, will not throw a global error if unable to fetch this item.
   */
  failSilently?: boolean;
}

/**
 * Represents a generic identifier to locate any Mauro catalogue item.
 */
export interface MauroIdentifier extends Required<CatalogueItem> {
  /**
   * If locating a child catalogue item, provide the unique identifier of the parent model.
   */
  model?: Uuid;

  /**
   * If locating a Data Class, provide an optional parent Data Class if locating a child item.
   */
  parentDataClass?: Uuid;

  /**
   * If locating a Data Element, provide the unique identifier of the parent Data Class.
   */
  dataClass?: Uuid;

  fetchOptions?: MauroIdentifierFetchOptions;
}

/**
 * Represents a Mauro catalogue item in its most generic structure.
 *
 * The returned item may have many additional properties, which is why this type supports an index signature.
 * To provide more structure, cast this object to a more specific type e.g. {@link DataModel}.
 */
export interface MauroItem extends Required<CatalogueItem> {
  [key: string]: any;

  /**
   * The label assigned to this catalogue item.
   */
  label: string;

  /**
   * An optional description for this catalogue item.
   */
  description?: string;
}

export type MauroItemResponse = MdmResponse<MauroItem>;

/**
 * Represents the grouping of data required to update a collection of Mauro catalogue items in bulk.
 */
export interface MauroUpdatePayload {
  identifier: MauroIdentifier;
  item: MauroItem;
}

export interface MauroProfileUpdatePayload {
  identifier: MauroIdentifier;
  profile: Profile;
}

export interface MauroProfileValidationResult {
  profile: Profile;
  errors?: ProfileValidationError[];
}

export interface NavigatableProfile extends Profile {
  breadcrumbs?: Breadcrumb[];
}

/**
 * Options to control locating Mauro catalogue items by path.
 */
export interface MauroItemLocateOptions {
  /**
   * The domain to locate under. If not provided, it will be determined via the first path item if possible.
   */
  domain?: PathableDomainType;

  /**
   * The parent ID of the root item to locate under. If not provided, will search the entire domain.
   */
  parentId?: Uuid;

  /**
   * State if only the latest finalised models should be considered. This has no effect if the path
   * contains a model version identifier.
   */
  finalisedOnly?: boolean;
}

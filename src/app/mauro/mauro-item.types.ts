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
  Breadcrumb,
  CatalogueItem,
  MdmResponse,
  Profile,
  ProfileValidationError,
  Uuid
} from '@maurodatamapper/mdm-resources';

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
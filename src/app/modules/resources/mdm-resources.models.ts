/*
Copyright 2021 University of Oxford

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

import { IMdmRestHandlerOptions } from "@maurodatamapper/mdm-resources";

/**
 * Represents a response from an `mdm-resources` API endpoint.
 *
 */
export interface MdmResourcesResponse<T = any> {
  /**
   * The body of the response from the API.
   */
  body: T;
}

/**
 * Represents the body of a `mdm-resources` response for an index/list request.
 *
 */
export interface MdmResourcesIndexBody<T = any> {
  /**
   * Gets the number of items in the returned list.
   */
  count: number;

  /**
   * Gets the list of items returned from the API.
   */
  items: T[];
}

/**
 * Type alias for an `mdm-resources` API endpoint response for an index/list request.
 *
 */
export type MdmResourcesIndexResponse<T = any> = MdmResourcesResponse<MdmResourcesIndexBody<T>>;

/**
 * Interface to define standard properties/options for the `MdmRestHandlerService`.
 * 
 * @see MdmRestHandlerService
 */
export interface MdmHttpHandlerOptions {
  /**
   * Determine if the `MdmRestHandlerService` should automatically handle `GET` request errors.
   * 
   * If `true`, any `GET` request that returns a status code in the 4XX range will be automatically handled by the `MdmRestHandlerService`. 
   * Provide a `false` value to override this behaviour and handle any HTTP error yourself.
   * 
   * If no value is provided or is undefined, the default value is considered to be `true`.
   */
  handleGetErrors?: boolean;
}

export type MdmRestHandlerOptions = IMdmRestHandlerOptions & MdmHttpHandlerOptions;
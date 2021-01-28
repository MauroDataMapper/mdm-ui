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

/**
 * Represents a response from an `mdm-resources` API endpoint.
 *
 * @typedef T The type to represent the body of the response.
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
 * @typedef T The type to represent each item in the list.
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
 * @typedef T The type to represent each item in the list.
 */
export type MdmResourcesIndexResponse<T = any> = MdmResourcesResponse<MdmResourcesIndexBody<T>>;
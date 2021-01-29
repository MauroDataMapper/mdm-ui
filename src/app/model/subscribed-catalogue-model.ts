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

import { MdmResourcesIndexResponse, MdmResourcesResponse } from "@mdm/modules/resources/mdm-resources.models";

export interface SubscribedCatalogue {
  id?: string;  
  url: string;
  apiKey?: string;
  label: string;
  description?: string;
  refreshPeriod?: number;
}

export interface SubscribedCatalogueDataModel {
  id: string;
  label: string;
}

/**
 * Type alias for an operation for the Subscribed Catalogues API endpoint.
 * 
 * This type alias represents a response with a single body `SubscribedCatalogue` element in.
 * 
 * @see SubscribedCatalogueIndexResponse
 */
export type SubscribedCatalogueResponse = MdmResourcesResponse<SubscribedCatalogue>;

/**
 * Type alias for an index/list operation for the Subscribed Catalogues API endpoint.
 * 
 * This type alias represents a response with a multiple `SubscribedCatalogue` elements in.
 * 
 * @see SubscribedCatalogueResponse
 */
export type SubscribedCatalogueIndexResponse = MdmResourcesIndexResponse<SubscribedCatalogue>;
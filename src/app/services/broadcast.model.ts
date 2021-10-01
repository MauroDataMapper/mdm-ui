/*
Copyright 2020-2021 University of Oxford
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

import { CatalogueItem } from '@maurodatamapper/mdm-resources';
import { FlatNode } from '@mdm/folders-tree/flat-node';

/**
 * Represents the global events that can happen throughout the application.
 */
export type BroadcastEvent =
  'applicationOffline'
  | 'openLoginModalDialog'
  | 'openForgotPasswordModalDialog'
  | 'openRegisterModalDialog'
  | 'userLoggedIn'
  | 'userLoggedOut'
  | 'reloadCatalogueTree'
  | 'catalogueTreeNodeSelected'
  | 'pendingUserUpdated'
  | 'favoritesChanged'
  | 'elementDetailsUpdated'
  | 'elementDeleted'
  | 'profileImageUpdated'
  | 'apiPropertyUpdated'
  | 'favoritesChanged'
  | 'reloadClassificationTree';

/**
 * Represents a message to broadcast with an optional data payload.
 */
export class BroadcastMessage<T> {
  constructor(
    public event: BroadcastEvent,
    public data?: T) { }
}

/**
 * Data to broadcast for the `userLoggedIn` {@link BroadcastEvent}.
 */
export interface UserLoggedInBroadcastData {
  /**
   * The next UI route to navigate to after logging in.
   */
  nextRoute: string;
}

/**
 * Data to broadcast for the `catalogueTreeNodeSelected` {@link BroadcastEvent}.
 */
export interface CatalogueTreeNodeSelectedBroadcastData {
  /**
   * The node that was selected.
   */
  node: FlatNode;
}

/**
 * Data to broadcast for the `apiPropertyUpdated` {@link BroadcastEvent}.
 */
export interface ApiPropertyUpdatedBroadcastData {
  /**
   * The key of the property updated.
   */
  key: string;

  /**
   * The value of the property updated.
   */
  value: string;

  /**
   * State if the update involved deleting the API property.
   */
  deleted?: boolean;
}

export interface FavouritesUpdatedBroadcastData {
  name: 'add' | 'remove';
  element: CatalogueItem;
}
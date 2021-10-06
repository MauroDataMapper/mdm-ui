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
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ApiPropertyUpdatedBroadcastData, BroadcastEvent, BroadcastMessage, CatalogueTreeNodeSelectedBroadcastData, FavouritesUpdatedBroadcastData, UserLoggedInBroadcastData } from './broadcast.model';

/**
 * Service to broadcast events and data payloads to any other part of the application that subscribes to those events.
 */
@Injectable({
  providedIn: 'root'
})
export class BroadcastService {

  private handler = new Subject<BroadcastMessage<any>>();

  /**
   * Request an observable to subscribe to when a particular `BroadcastEvent` occurs.
   *
   * @typedef T The type of the event payload
   * @param event The `BroadcastEvent` type to watch.
   * @returns An `Observable<T>` to subscribe to for watching for these events.
   *
   * For any observable returned that is subscribed to, each must be correctly unsubscribed from when finished
   * to prevent memory leaks.
   */
  on<T>(event: BroadcastEvent): Observable<T> {
    return this.handler.pipe(
      filter(message => message.event === event),
      map(message => message.data)
    );
  }

  /**
   * Dispatch a new event to broadcast to any watchers.
   *
   * @typedef T The type of the event payload
   * @param event The `BroadcastEvent` type to broadcast.
   * @param data The optional payload that is associated with the event.
   */
  dispatch<T>(event: BroadcastEvent, data?: T) {
    this.handler.next(new BroadcastMessage(event, data));
  }

  /**
   * Notify that the application is offline.
   *
   * @param error The HTTP error response that triggered this event.
   */
  applicationOffline(error: HttpErrorResponse) {
    this.dispatch('applicationOffline', error);
  }

  /**
   * Get an observable to watch for the `applicationOffline` {@link BroadcastEvent}.
   */
  onApplicationOffline(): Observable<HttpErrorResponse> {
    return this.on<HttpErrorResponse>('applicationOffline');
  }

  /**
   * Notify that a user has logged in.
   *
   * @param data The data associated with the log in.
   */
  userLoggedIn(data: UserLoggedInBroadcastData) {
    this.dispatch('userLoggedIn', data);
  }

  /**
   * Get an observable to watch for the `userLoggedIn` {@link BroadcastEvent}.
   */
  onUserLoggedIn(): Observable<UserLoggedInBroadcastData> {
    return this.on<UserLoggedInBroadcastData>('userLoggedIn');
  }

  /**
   * Notify that a user has logged out.
   */
  userLoggedOut() {
    this.dispatch('userLoggedOut');
  }

  /**
   * Get an observable to watch for the `userLoggedOut` {@link BroadcastEvent}.
   */
  onUserLoggedOut(): Observable<void> {
    return this.on('userLoggedOut');
  }

  /**
   * Notify that the catalogue tree should be reloaded.
   */
  reloadCatalogueTree() {
    this.dispatch('reloadCatalogueTree');
  }

  /**
   * Get an observable to watch for the `reloadCatalogueTree` {@link BroadcastEvent}.
   */
  onReloadCatalogueTree(): Observable<void> {
    return this.on('reloadCatalogueTree');
  }

  /**
   * Notify that the classification tree should be reloaded.
   */
  reloadClassificationTree() {
    this.dispatch('reloadClassificationTree');
  }

  /**
   * Get an observable to watch for the `reloadClassificationTree` {@link BroadcastEvent}.
   */
  onReloadClassificationTree(): Observable<void> {
    return this.on('reloadClassificationTree');
  }

  /**
   * Notify that a tree node has been selected in the catalogue tree.
   *
   * @param data The data associated with the selection.
   */
  catalogueTreeNodeSelected(data: CatalogueTreeNodeSelectedBroadcastData) {
    this.dispatch('catalogueTreeNodeSelected', data);
  }

  /**
   * Get an observable to watch for the `catalogueTreeNodeSelected` {@link BroadcastEvent}.
   */
  onCatalogueTreeNodeSelected(): Observable<CatalogueTreeNodeSelectedBroadcastData> {
    return this.on<CatalogueTreeNodeSelectedBroadcastData>('catalogueTreeNodeSelected');
  }

  /**
   * Notify that an API property has been added, modified or removed.
   *
   * @param data The data associated with the change.
   */
  apiPropertyUpdated(data: ApiPropertyUpdatedBroadcastData) {
    this.dispatch('apiPropertyUpdated', data);
  }

  /**
   * Get an observable to watch for the `apiPropertyUpdated` {@link BroadcastEvent}.
   */
  onApiProperyUpdated(): Observable<ApiPropertyUpdatedBroadcastData> {
    return this.on<ApiPropertyUpdatedBroadcastData>('apiPropertyUpdated');
  }

  /**
   * Notify that a favourite has been added or removed by a user.
   *
   * @param data The data associated with the change.
   */
  favouritesChanged(data: FavouritesUpdatedBroadcastData) {
    this.dispatch('favoritesChanged', data);
  }

  /**
   * Get an observable to watch for the `favoritesChanged` {@link BroadcastEvent}.
   */
  onFavouritesChanged(): Observable<FavouritesUpdatedBroadcastData> {
    return this.on<FavouritesUpdatedBroadcastData>('favoritesChanged');
  }
}

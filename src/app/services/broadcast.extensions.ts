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
import { Observable } from 'rxjs';
import { CatalogueTreeNodeSelectedBroadcastData, UserLoggedInBroadcastData } from './broadcast.model';
import { BroadcastService } from './broadcast.service';

declare module './broadcast.service' {
  interface BroadcastService {
    applicationOffline(error: HttpErrorResponse): void;

    onApplicationOffline(): Observable<HttpErrorResponse>;

    userLoggedIn(data: UserLoggedInBroadcastData): void;

    onUserLoggedIn(): Observable<UserLoggedInBroadcastData>;

    userLoggedOut(): void;

    onUserLoggedOut(): Observable<void>;

    reloadCatalogueTree(): void;

    onReloadCatalogueTree(): Observable<void>;

    catalogueTreeNodeSelected(data: CatalogueTreeNodeSelectedBroadcastData): void;

    onCatalogueTreeNodeSelected(): Observable<CatalogueTreeNodeSelectedBroadcastData>;
  }
}

BroadcastService.prototype.applicationOffline = function(this: BroadcastService, error: HttpErrorResponse) {
  this.dispatch('applicationOffline', error);
}

BroadcastService.prototype.onApplicationOffline = function(this: BroadcastService): Observable<HttpErrorResponse> {
  return this.on<HttpErrorResponse>('applicationOffline');
}

BroadcastService.prototype.userLoggedIn = function(this: BroadcastService, data: UserLoggedInBroadcastData) {
  this.dispatch('userLoggedIn', data);
}

BroadcastService.prototype.onUserLoggedIn = function(this: BroadcastService): Observable<UserLoggedInBroadcastData> {
  return this.on<UserLoggedInBroadcastData>('userLoggedIn');
}

BroadcastService.prototype.userLoggedOut = function(this: BroadcastService) {
  this.dispatch('userLoggedOut');
}

BroadcastService.prototype.onUserLoggedOut = function(this: BroadcastService): Observable<void> {
  return this.on('userLoggedOut');
}

BroadcastService.prototype.reloadCatalogueTree = function(this: BroadcastService) {
  this.dispatch('reloadCatalogueTree');
}

BroadcastService.prototype.onReloadCatalogueTree = function(this: BroadcastService): Observable<void> {
  return this.on('reloadCatalogueTree');
}

BroadcastService.prototype.catalogueTreeNodeSelected = function(this: BroadcastService, data: CatalogueTreeNodeSelectedBroadcastData) {
  this.dispatch('catalogueTreeNodeSelected', data);
}

BroadcastService.prototype.onCatalogueTreeNodeSelected = function(this: BroadcastService): Observable<CatalogueTreeNodeSelectedBroadcastData> {
  return this.on<CatalogueTreeNodeSelectedBroadcastData>('catalogueTreeNodeSelected');
}

export { }
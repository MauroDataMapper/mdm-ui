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
import { Injectable } from '@angular/core';
import { UserSettingsHandlerService } from '../utility/user-settings-handler.service';
import { MessageHandlerService } from '../utility/message-handler.service';
import { BroadcastService } from '../broadcast.service';
import { CatalogueItem } from '@maurodatamapper/mdm-resources';


@Injectable({
  providedIn: 'root'
})
export class FavouriteHandlerService {

  constructor(
    private userSettingsHandler: UserSettingsHandlerService,
    private messageHandler: MessageHandlerService,
    private broadcast: BroadcastService) {
  }

  add(element: CatalogueItem) {
    const favorites = this.userSettingsHandler.get('favourites');
    let fvt = false;
    favorites.forEach(favorite => {
      if (favorite.id === element.id) {
        fvt = true;
        return;
      }
    });
    if (!fvt) {
      favorites.push({ id: element.id, domainType: element.domainType });
    }

    this.userSettingsHandler.update('favourites', favorites);
    this.userSettingsHandler.saveOnServer().subscribe(() => {
      this.messageHandler.showSuccess(`${element.domainType} added to Favorites successfully.`);
      this.broadcast.favouritesChanged({ name: 'add', element });
    }, error => {
      this.messageHandler.showError('There was a problem updating the Favorites.', error);
    });
    return favorites;
  }

  get() {
    return this.userSettingsHandler.get('favourites');
  }

  isAdded(element: CatalogueItem) {
    const favorites = this.userSettingsHandler.get('favourites');
    let fvt = false;
    favorites.forEach(favorite => {
      if (favorite.id === element.id) {
        fvt = true;
        return;
      }
    });
    return fvt ? true : false;
  }

  remove(element: CatalogueItem) {
    const favorites = this.userSettingsHandler.get('favourites');
    const index = favorites.findIndex(favorite =>
      favorite.id === element.id
    );
    if (index === -1) {
      return;
    }

    favorites.splice(index, 1);
    this.userSettingsHandler.update('favourites', favorites);
    this.userSettingsHandler.saveOnServer().subscribe(() => {
      this.messageHandler.showSuccess('Removed from Favorites successfully.');
      this.broadcast.favouritesChanged({ name: 'remove', element });
    }, (error) => {
      this.messageHandler.showError('There was a problem updating the Favorites.', error);
    });
  }

  toggle(element: CatalogueItem) {
    const favorites = this.userSettingsHandler.get('favourites');
    let processFinish = false;
    let fvt = false;
    favorites.forEach(favorite => {
      if (favorite.id === element.id) {
        fvt = true;
        return;
      }
    });
    if (!fvt) {
      this.add(element);
      processFinish = true;
    } else {
      this.remove(element);
      processFinish = true;
    }

    return processFinish;
  }
}
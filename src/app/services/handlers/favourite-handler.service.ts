/*
Copyright 2020 University of Oxford

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
import {Injectable} from '@angular/core';
import {UserSettingsHandlerService} from '../utility/user-settings-handler.service';
import {MessageHandlerService} from '../utility/message-handler.service';
import {BroadcastService} from '../broadcast.service';


@Injectable({
  providedIn: 'root'
})
export class FavouriteHandlerService {

  constructor(private userSettingsHandler: UserSettingsHandlerService, private messageHandler: MessageHandlerService, private broadcastSvc: BroadcastService) {
  }

  add(element) {
    const favorites = this.userSettingsHandler.get('favourites');
    let fvt = false;
    favorites.forEach(favorite => {
      if (favorite.id === element.id) {
        fvt = true;
        return;
      }
    });
    if (!fvt) {
      favorites.push({id: element.id, domainType: element.domainType});
    }

    this.userSettingsHandler.update('favourites', favorites);
    this.userSettingsHandler.saveOnServer().subscribe(result => {
      this.messageHandler.showSuccess('Added to Favorites successfully.');
      this.broadcastSvc.broadcast('favourites', {name: 'add', element});
    }, error => {
      this.messageHandler.showError('There was a problem updating the Favorites.', error);
    });
    return favorites;
  }

  get() {
    return this.userSettingsHandler.get('favourites');
  }

  isAdded(element) {
    const favorites = this.userSettingsHandler.get('favourites');
    let fvt = false;
    favorites.forEach(favorite => {
      if (favorite.id === element.id) {
        fvt = true;
        return;
      }
    });

    // var fvt = favorites.every(favorite =>{
    //   return favorite.id === element.id;
    // })

    return fvt ? true : false;
  }

  remove(element) {
    // var deferred = $q.defer();

    const favorites = this.userSettingsHandler.get('favourites');
    // var index = _.findIndex(favorites, function (favorite) {
    //   return favorite.id === element.id;
    // });
    const index = favorites.findIndex(favorite =>
      favorite.id === element.id
    );
    if (index === -1) {
      // deferred.resolve(favorites);
      return;
    }

    favorites.splice(index, 1);
    this.userSettingsHandler.update('favourites', favorites);
    this.userSettingsHandler.saveOnServer().subscribe(result => {
      this.messageHandler.showSuccess('Removed from Favorites successfully.');
      this.broadcastSvc.broadcast('favourites', {name: 'remove', element});
      // deferred.resolve(favorites);
    }, (error) => {
      this.messageHandler.showError('There was a problem updating the Favorites.', error);
      // deferred.reject(favorites);
    });
    // return deferred.promise;
  }

  toggle(element) {
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

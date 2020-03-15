import { Injectable } from '@angular/core';
import {UserSettingsHandlerService} from '../utility/user-settings-handler.service';
import {MessageHandlerService} from '../utility/message-handler.service';
import { BroadcastService } from '../broadcast.service';


@Injectable({
  providedIn: 'root'
})
export class FavouriteHandlerService {

  constructor(private userSettingsHandler: UserSettingsHandlerService, private messageHandler: MessageHandlerService, private broadcastSvc: BroadcastService) { }

  add(element) {
    let favorites = this.userSettingsHandler.get('favourites');
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
    let favorites = this.userSettingsHandler.get('favourites');
    let fvt = false;
    favorites.forEach(favorite => {
      if (favorite.id === element.id) { fvt = true;
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

    let favorites = this.userSettingsHandler.get('favourites');
    // var index = _.findIndex(favorites, function (favorite) {
    //   return favorite.id === element.id;
    // });
    const index = favorites.findIndex(favorite =>
           favorite.id == element.id
      );
    if (index === -1) {
      // deferred.resolve(favorites);
      return ;
    }

    favorites.splice(index, 1);
    this.userSettingsHandler.update('favourites', favorites);
    this.userSettingsHandler.saveOnServer().subscribe(result => {
      this.messageHandler.showSuccess('Removed from Favorites successfully.');
      this.broadcastSvc.broadcast('favourites', { name: 'remove', element});
      // deferred.resolve(favorites);
    }, (error) => {
      this.messageHandler.showError('There was a problem updating the Favorites.', error);
     // deferred.reject(favorites);
    });
    // return deferred.promise;
  }

  toggle(element) {
    let favorites = this.userSettingsHandler.get('favourites');
    let processFinish = false;
    let fvt = false;
    favorites.forEach (favorite => {
      if (favorite.id === element.id) {fvt = true;
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

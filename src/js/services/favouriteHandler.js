angular.module('services').factory('favouriteHandler', function (userSettingsHandler, messageHandler, $q, $rootScope) {

    return {
        add: function (element) {
            var favorites = userSettingsHandler.get("favourites");
            var fvt = _.find(favorites, function (favorite) {
                return favorite.id === element.id;
            });
            if (!fvt) {
                favorites.push({id:element.id, domainType:element.domainType});
            }

            userSettingsHandler.update("favourites", favorites);
            userSettingsHandler.saveOnServer().then(function (result) {
                messageHandler.showSuccess('Added to Favorites successfully.');
                $rootScope.$broadcast("favourites", "add", element);
            }).catch(function (error) {
                messageHandler.showError('There was a problem updating the Favorites.', error);
            });
            return favorites;
        },

        get: function () {
            return userSettingsHandler.get("favourites");
        },

        isAdded : function(element){
            var favorites = userSettingsHandler.get("favourites");
            var fvt = _.find(favorites, function (favorite) {
                return favorite.id === element.id;
            });
            return fvt ? true: false;
        },

        remove: function (element) {
            var deferred = $q.defer();

            var favorites = userSettingsHandler.get("favourites");
            var index = _.findIndex(favorites, function (favorite) {
                return favorite.id === element.id;
            });

            if (index === -1) {
                deferred.resolve(favorites);
                return deferred.promise;
            }

            favorites.splice(index, 1);
            userSettingsHandler.update("favourites", favorites);
            userSettingsHandler.saveOnServer().then(function (result) {
                messageHandler.showSuccess('Removed from Favorites successfully.');
                $rootScope.$broadcast("favourites", "remove", element);
                deferred.resolve(favorites);
            }).catch(function (error) {
                messageHandler.showError('There was a problem updating the Favorites.', error);
                deferred.reject(favorites);
            });
            return deferred.promise;
        },

        toggle: function (element) {
            var favorites = userSettingsHandler.get("favourites");
            var fvt = _.find(favorites, function (favorite) {
                return favorite.id === element.id;
            });
            if (!fvt) {
                this.add(element);
            }else{
                this.remove(element);
            }
        }
    };
});
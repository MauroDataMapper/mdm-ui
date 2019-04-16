angular.module('handlers').factory('folderHandler', function (resources, $rootScope, messageHandler, $q, confirmationModal) {

    return {

        askForSoftDelete: function (id) {
            var self = this;

            var deferred = $q.defer();
            if (!$rootScope.isAdmin()) {
                deferred.reject({message: "You should be an Admin!"});
            }
            confirmationModal.open("Folder", "Are you sure you want to delete this Folder?<br>The Folder will be marked as deleted and will not be viewable by users except Administrators.")
                .then(function (result) {
                    if (result.status !== "ok") {
                        deferred.reject(null);
                        return;
                    }
                    self.delete(id, false).then(function (result) {
                        deferred.resolve(result);
                    }).catch(function (error) {
                        deferred.reject(error);
                    });
                });
            return deferred.promise;
        },

        askForPermanentDelete: function (id) {
            var self = this;

            var deferred = $q.defer();
            if (!$rootScope.isAdmin()) {
                deferred.reject({message: "You should be an Admin!"});
            }
            confirmationModal.open("Folder", "Are you sure you want to <span class='errorMessage'>permanently</span> delete this Folder?")
                .then(function (result) {
                    if (result.status !== "ok") {
                        deferred.reject(null);
                        return;
                    }
                    confirmationModal.open("Folder", "<strong>Are you sure?</strong><br>All its 'Data Models' and 'Folders' will be deleted <span class='errorMessage'>permanently</span>.")
                        .then(function (result) {
                            if (result.status !== "ok") {
                                deferred.reject(null);
                                return;
                            }
                            self.delete(id, true).then(function (result) {
                                deferred.resolve(result);
                            }).catch(function (error) {
                                deferred.reject(error);
                            });
                        });
                });
            return deferred.promise;
        },


        delete: function (id, permanent) {
            var deferred = $q.defer();
            if (!$rootScope.isAdmin()) {
                deferred.reject({message: "You should be an Admin!"});
            } else {
                var queryString = permanent ? "permanent=true" : null;
                resources.folder.delete(id, null, queryString)
                    .then(function (result) {
                        if (permanent === true) {
                            $rootScope.$broadcast("$updateFoldersTree", "permanentDelete", result);
                        } else {
                            $rootScope.$broadcast("$updateFoldersTree", "softDelete", result);

                        }
                        deferred.resolve(result);
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem deleting the Folder.', error);
                        deferred.reject(error);
                    });
            }
            return deferred.promise;
        }
    }
});

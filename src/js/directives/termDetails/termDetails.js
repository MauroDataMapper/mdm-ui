angular.module('directives').directive('termDetails', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            mcTerm: "=",
            mcTerminology: "=",
            hideEditButton: "@",
            afterSave: "=",
            openEditForm: "="
        },
        templateUrl: './termDetails.html',
        link: function (scope, element, attrs) {
        },
        controller: function ($scope, resources, exportHandler, ngToast, $rootScope, $state, securityHandler, jointDiagramService, $q, stateHandler, confirmationModal, messageHandler, favouriteHandler, helpDialogueHandler) {

            $scope.securitySection = false;
            $scope.processing = false;
            $scope.exportError = null;
            $scope.exportList = [];
            $scope.isAdminUser = $rootScope.isAdmin();
            $scope.isLoggedIn = securityHandler.isLoggedIn();
            $scope.exportedFileIsReady = false;
            $scope.addedToFavourite = false;


            $scope.$watch('mcTerm', function (newValue, oldValue, scope) {

                if(newValue === null || newValue === undefined){
                    return;
                }

                newValue.aliases = newValue.aliases || [];
                newValue.editAliases = angular.copy(newValue.aliases);

                var access = securityHandler.elementAccess($scope.mcTerm);
                $scope.showEdit = access.showEdit;
                $scope.showDelete = access.showDelete;
                $scope.addedToFavourite = favouriteHandler.isAdded(newValue);
            });

            $scope.validateLabel = function (data) {
                if (!data || (data && data.trim().length === 0)) {
                    return "Term Definition can not be empty";
                }
            };

            $scope.formBeforeSave = function () {

                var d = $q.defer();
                var resource = {
                    id: $scope.mcTerm.id,
                    code: $scope.editableForm.$data.code,
                    definition: $scope.editableForm.$data.definition,
                    description: $scope.editableForm.$data.description,
                    terminology: $scope.mcTerm.terminology,
                    aliases: $scope.mcModelObject.editAliases,

                    classifiers: $scope.mcTerm.classifiers.map(function (cls) {
                        return {id: cls.id};
                    })
                };

                resources.term.put($scope.mcTerm.terminology, resource.id, null, {resource: resource})
                    .then(function (result) {
                        if ($scope.afterSave) {
                            $scope.afterSave(resource);
                        }

                        $scope.mcTerm.aliases =  angular.copy(result.aliases || []);
                        $scope.mcTerm.editAliases =  angular.copy($scope.mcTerm.aliases);

                        messageHandler.showSuccess('Term updated successfully.');
                        $rootScope.$broadcast('$reloadFoldersTree');
                        d.resolve();
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem updating the Term.', error);
                        d.resolve("error");
                    });
                return d.promise;
            };

            $scope.toggleSecuritySection = function () {
                $scope.securitySection = !$scope.securitySection;
            };

            $scope.delete = function (permanent) {
                if (!$rootScope.isAdmin()) {
                    return;
                }
                var queryString = permanent ? "permanent=true" : null;
                $scope.deleteInProgress = true;
                resources.term.delete($scope.mcTerm.id, null, queryString)
                    .then(function () {
                        if (permanent) {
                            stateHandler.Go("allDataModel", {reload: true, location: true});
                        } else {
                            stateHandler.reload();
                        }
                        $rootScope.$broadcast('$elementDeleted', $scope.mcTerm, permanent);
                    })
                    .catch(function (error) {
                        $scope.deleteInProgress = false;
                        messageHandler.showError('There was a problem deleting the Term.', error);
                    });
            };

            $scope.askForSoftDelete = function () {
                if (!$rootScope.isAdmin()) {
                    return;
                }
                confirmationModal.open("Term", "Are you sure you want to delete this Term?<br>The Term will be marked as deleted and will not be viewable by users except Administrators.")
                    .then(function (result) {
                        if (result.status !== "ok") {
                            return;
                        }
                        $scope.delete();
                    });
            };

            $scope.askForPermanentDelete = function () {
                if (!$rootScope.isAdmin()) {
                    return;
                }
                confirmationModal.open("Term", "Are you sure you want to <span class='errorMessage'>permanently</span> delete this Term?")
                    .then(function (result) {
                        if (result.status !== "ok") {
                            return;
                        }
                        $scope.delete(true);
                    });
            };

            $scope.openEditClicked = function (formName) {

                if ($scope.openEditForm) {
                    $scope.openEditForm(formName);
                }
            };

            $scope.onCancelEdit = function () {
                $scope.mcTerm.editAliases =  angular.copy($scope.mcTerm.aliases);
            };

            $scope.toggleFavourite = function () {
                favouriteHandler.toggle($scope.mcTerm);
            };

            $scope.$on("favourites", function (event, action, dataModel) {
                if (dataModel.id !== $scope.mcTerm.id) {
                    return;
                }
                $scope.addedToFavourite = action === "add";
            });

            $scope.loadHelp = function () {
                helpDialogueHandler.open("Term_details", {
                    my: "right top",
                    at: "bottom",
                    of: jQuery("#helpIcon")
                });
            };

        }
    };
});

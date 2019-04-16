angular.module('directives').directive('terminologyDetails', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            mcTerminology: "=",
            hideEditButton: "@",
            afterSave: "=",
            openEditForm: "="
        },
        templateUrl: './terminologyDetails.html',
        link: function (scope, element, attrs) {
        },
        controller: function ($scope, resources, exportHandler, $rootScope, $state, securityHandler, jointDiagramService, $q, stateHandler, confirmationModal, messageHandler, favouriteHandler, helpDialogueHandler) {

            $scope.securitySection = false;
            $scope.processing = false;
            $scope.exportError = null;
            $scope.exportList = [];
            $scope.isAdminUser = $rootScope.isAdmin();
            $scope.isLoggedIn = securityHandler.isLoggedIn();
            $scope.exportedFileIsReady = false;
            $scope.addedToFavourite = false;


            $scope.$watch('mcTerminology', function (newValue, oldValue, scope) {
                if (newValue) {
                    newValue.aliases = newValue.aliases || [];
                    newValue.editAliases = angular.copy(newValue.aliases);

                    var access = securityHandler.elementAccess($scope.mcTerminology);
                    $scope.showEdit = access.showEdit;
                    $scope.showPermission = access.showPermission;
                    $scope.showNewVersion = access.showNewVersion;
                    $scope.showFinalise = access.showFinalise;
                    $scope.showDelete = access.showDelete;

                    $scope.addedToFavourite = favouriteHandler.isAdded(newValue);
                }
            });

            $scope.validateLabel = function (data) {
                if (!data || (data && data.trim().length === 0)) {
                    return "Terminology name can not be empty";
                }
            };

            $scope.formBeforeSave = function () {
                var d = $q.defer();
                var resource = {
                    id: $scope.mcTerminology.id,
                    label: $scope.editableForm.$data.label,
                    description: $scope.editableForm.$data.description,
                    author: $scope.editableForm.$data.author,
                    organisation: $scope.editableForm.$data.organisation,
                    type: $scope.mcTerminology.type,
                    domainType: $scope.mcTerminology.domainType,
                    aliases: $scope.mcTerminology.editAliases,

                    classifiers: $scope.mcTerminology.classifiers.map(function (cls) {
                        return {id: cls.id};
                    })
                };

                resources.terminology.put(resource.id, null, {resource: resource})
                    .then(function (result) {
                        if ($scope.afterSave) {
                            $scope.afterSave(resource);
                        }
                        $scope.mcTerminology.aliases = angular.copy(result.aliases || []);
                        $scope.mcTerminology.editAliases = angular.copy($scope.mcTerminology.aliases);

                        messageHandler.showSuccess('Terminology updated successfully.');
                        $rootScope.$broadcast('$reloadFoldersTree');
                        d.resolve();
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem updating the Terminology.', error);
                        d.resolve("error");
                    });
                return d.promise;
            };

            $scope.toggleSecuritySection = function () {
                $scope.securitySection = !$scope.securitySection;
            };

            $scope.export = function (exporter) {
                $scope.exportError = null;
                $scope.processing = true;
                $scope.exportedFileIsReady = false;

                var promise = exportHandler.exportDataModel([$scope.mcTerminology], exporter);
                promise.then(function (result) {
                    $scope.exportedFileIsReady = true;

                    var aLink = exportHandler.createBlobLink(result.fileBlob, result.fileName);
                    //remove if any link exists
                    jQuery("#exportFileDownload a").remove();
                    jQuery("#exportFileDownload").append(jQuery(aLink)[0]);

                    $scope.processing = false;
                }, function (response) {
                    $scope.processing = false;
                    //error in saving!!
                    console.log(response);
                    $scope.exportError = "An error occurred when processing the request.";
                });
            };

            $scope.resetExportError = function () {
                $scope.exportError = null;
            };

            $scope.delete = function (permanent) {
                if (!$rootScope.isAdmin()) {
                    return;
                }
                var queryString = permanent ? "permanent=true" : null;
                $scope.deleteInProgress = true;
                resources.terminology.delete($scope.mcTerminology.id, null, queryString)
                    .then(function () {
                        if (permanent) {
                            stateHandler.Go("allDataModel", {reload: true, location: true});
                        } else {
                            stateHandler.reload();
                        }
                        $rootScope.$broadcast('$elementDeleted', $scope.mcTerminology, permanent);
                    })
                    .catch(function (error) {
                        $scope.deleteInProgress = false;
                        messageHandler.showError('There was a problem deleting the Terminology.', error);
                    });
            };

            $scope.askForSoftDelete = function () {
                if (!$rootScope.isAdmin()) {
                    return;
                }
                confirmationModal.open("Terminology", "Are you sure you want to delete this Terminology?<br>The Terminology will be marked as deleted and will not be viewable by users except Administrators.")
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
                confirmationModal.open("Terminology", "Are you sure you want to <span class='errorMessage'>permanently</span> delete this Terminology?")
                    .then(function (result) {
                        if (result.status !== "ok") {
                            return;
                        }
                        confirmationModal.open("Terminology", "<strong>Are you sure?</strong><br>All its 'Terms' will be deleted <span class='errorMessage'>permanently</span>.")
                            .then(function (result) {
                                if (result.status !== "ok") {
                                    return;
                                }
                                $scope.delete(true);
                            });
                    });
            };

            $scope.openEditClicked = function (formName) {

                if ($scope.openEditForm) {
                    $scope.openEditForm(formName);
                }
            };

            $scope.newVersion = function () {
                stateHandler.Go("newVersionTerminology", {id: $scope.mcTerminology.id}, {location: true});
            };

            $scope.finalise = function () {
                confirmationModal.open(
                    "Are you sure you want to finalise the Terminology ?",
                    "Once you finalise a Terminology, you can not edit it anymore!<br>" +
                    "but you can create new version of it.")
                    .then(function (result) {
                        if (result.status !== "ok") {
                            return;
                        }
                        $scope.processing = true;
                        resources.terminology.put($scope.mcTerminology.id, "finalise")
                            .then(function (response) {
                                $scope.processing = false;
                                messageHandler.showSuccess('Terminology finalised successfully.');
                                stateHandler.Go("terminology", {id: $scope.mcTerminology.id}, {reload: true});
                            })
                            .catch(function (error) {
                                $scope.processing = false;
                                messageHandler.showError('There was a problem finalising the Terminology.', error);
                            });
                    });

            };

            $scope.onCancelEdit = function () {
                $scope.mcTerminology.editAliases = angular.copy($scope.mcTerminology.aliases);
            };

            $scope.loadExporterList = function () {
                $scope.exportList = [];
                securityHandler.isValidSession().then(function (result) {
                    if (result === false) {
                        return;
                    }
                    resources.public.dataModelExporterPlugins().then(function (result) {
                        $scope.exportList = result;
                    }, function (error) {
                        messageHandler.showError('There was a problem loading exporters list.', error);
                    });
                });
            };

            $scope.loadExporterList();

            $scope.toggleFavourite = function () {
                favouriteHandler.toggle($scope.mcTerminology);
            };

            $scope.$on("favourites", function (event, action, terminology) {
                if (terminology.id !== $scope.mcTerminology.id) {
                    return;
                }
                $scope.addedToFavourite = action === "add";
            });

            $scope.loadHelp = function () {
                helpDialogueHandler.open("Terminology_details", {
                    my: "right top",
                    at: "bottom",
                    of: jQuery("#helpIcon")
                });
            };

        }
    };
});

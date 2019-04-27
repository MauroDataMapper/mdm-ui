angular.module('directives').directive('codeSetDetails', function () {
	return{
		restrict: 'E',
		replace: true,
        scope: false,
        // scope: {
			// mcCodeSetObject: "=",
			// hideEditButton: "@",
			// afterSave: "=",
        //     openEditForm:"="
        // },
        templateUrl: './codeSetDetails.html',
		link: function(scope, element, attrs) {
		},
		controller: function($scope, resources, ngToast, $rootScope, $state, securityHandler, jointDiagramService, $q, stateHandler, confirmationModal, messageHandler,favouriteHandler, helpDialogueHandler){

			$scope.securitySection = false;
			$scope.processing = false;
            $scope.isAdminUser = $rootScope.isAdmin();
            $scope.isLoggedIn  = securityHandler.isLoggedIn();
            $scope.addedToFavourite = false;
            $scope.showMarkDownPreview = false;

            $scope.$watch('mcCodeSetObject', function (newValue, oldValue, scope) {
                if (newValue) {
                    newValue.aliases = newValue.aliases || [];
                    newValue.editAliases = angular.copy(newValue.aliases);

                    var access = securityHandler.elementAccess($scope.mcCodeSetObject);
                    $scope.showEdit = access.showEdit;
                    $scope.showPermission = access.showPermission;
                    $scope.showDelete =  access.showDelete;
                    $scope.addedToFavourite = favouriteHandler.isAdded(newValue);
                }
            });


			$scope.validateLabel = function(data){
				if (!data || (data && data.trim().length === 0)) {
					return "CodeSet name can not be empty";
				}
			};


			$scope.formBeforeSave = function() {
                var d = $q.defer();
                var resource = {
                    id: $scope.mcCodeSetObject.id,
                    label: $scope.editableForm.$data.label,
                    description: $scope.editableForm.$data.description,
                    author: $scope.editableForm.$data.author,
                    organisation: $scope.editableForm.$data.organisation,
                    aliases: $scope.mcCodeSetObject.editAliases,

                    classifiers: $scope.mcCodeSetObject.classifiers.map(function (cls) {
                        return {id: cls.id};
                    })
                };

                resources.dataModel.put(resource.id, null, {resource: resource})
                    .then(function (result) {
                        if ($scope.afterSave) {
                            $scope.afterSave(resource);
                        }
                        $scope.mcCodeSetObject.aliases =  angular.copy(result.aliases || []);
                        $scope.mcCodeSetObject.editAliases =  angular.copy($scope.mcCodeSetObject.aliases);

                        messageHandler.showSuccess('CodeSet updated successfully.');
                        $rootScope.$broadcast('$reloadFoldersTree');
                        d.resolve();
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem updating the CodeSet.', error);
                        d.resolve("error");
                    });
                return d.promise;
            };

			$scope.toggleSecuritySection = function(){
				$scope.securitySection = !$scope.securitySection;
			};


            $scope.delete = function(permanent) {
                if (!$rootScope.isAdmin()) {
                    return;
                }
                var queryString = permanent ? "permanent=true" : null;
                $scope.deleteInProgress = true;
                resources.dataModel.delete($scope.mcCodeSetObject.id, null, queryString)
                    .then(function () {
                        if(permanent) {
                            $rootScope.$broadcast('$reloadFoldersTree');
                            stateHandler.Go("allDataModel", {reload: true, location: true});
                        }else{
                            $rootScope.$broadcast('$reloadFoldersTree');
                            stateHandler.reload();
                        }
                    })
                    .catch(function (error) {
                        $scope.deleteInProgress = false;
                        messageHandler.showError('There was a problem deleting the Data Model.', error);
                    });
            };

            $scope.askForSoftDelete = function () {
                if (!$rootScope.isAdmin()) {
                    return;
                }
                confirmationModal.open("Data Model", "Are you sure you want to delete this Code Set?<br>The Code Set will be marked as deleted and will not be viewable by users except Administrators.")
                    .then(function (result) {
                        if(result.status !== "ok"){
                            return;
                        }
                        $scope.delete();
                    });
            };

            $scope.askForPermanentDelete = function () {
                if (!$rootScope.isAdmin()) {
                    return;
                }
                confirmationModal.open("Code Set", "Are you sure you want to <span class='errorMessage'>permanently</span> delete this Code Set?")
                    .then(function (result) {
                        if(result.status !== "ok"){
                            return;
                        }
                        confirmationModal.open("Code Set", "<strong>Are you sure?</strong><br>It will be deleted <span class='errorMessage'>permanently</span>.")
                            .then(function (result) {
                                if(result.status !== "ok"){
                                    return;
                                }
                                $scope.delete(true);
                            });
                    });
            };

            $scope.openEditClicked = function (formName) {
                if($scope.openEditForm){
                    $scope.openEditForm(formName);
                }
            };

            $scope.onCancelEdit = function () {
                $scope.mcCodeSetObject.editAliases =  angular.copy($scope.mcCodeSetObject.aliases);
            };


            $scope.toggleFavourite = function () {
                favouriteHandler.toggle($scope.mcCodeSetObject);
            };

            $scope.$on("favourites", function (event, action, dataModel) {
                if(dataModel.id !==  $scope.mcCodeSetObject.id){
                    return;
                }
               $scope.addedToFavourite = action === "add";
            });

            $scope.loadHelp = function () {
                helpDialogueHandler.open("Edit_model_details", { my: "right top", at: "bottom", of: jQuery("#helpIcon") });
            };

            $scope.toggleShowSearch = function () {
                $scope.showSearch = !$scope.showSearch;
            };

        }
	};
});

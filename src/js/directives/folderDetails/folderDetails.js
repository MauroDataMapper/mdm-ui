angular.module('directives').directive('folderDetails',  function () {
	return{
		restrict: 'E',
		replace: true,
        scope: false,
        // scope: {
			// mcFolderObject: "=",
        //     editMode: "=",
			// hideEditButton: "@",
			// afterSave: "="
        // },
        templateUrl: './folderDetails.html',
		link: function(scope, element, attrs) {
		},
		controller: function($scope, resources, exportHandler, ngToast, $rootScope, $state, securityHandler, jointDiagramService, $q, stateHandler, confirmationModal, messageHandler, folderHandler, elementSelectorDialogue, markdownParser){

			$scope.securitySection = false;
            $scope.isAdminUser = $rootScope.isAdmin();
            $scope.isLoggedIn  = securityHandler.isLoggedIn();


            $scope.$watch('mcFolderObject', function (newValue, oldValue, scope) {
                if (newValue) {
                    var access = securityHandler.folderAccess($scope.mcFolderObject);
                    $scope.showEdit = access.showEdit;
                    $scope.showPermission = access.showPermission;
                    $scope.showDelete =  access.showDelete;

                    if($scope.editMode) {
                        $scope.editableForm.$show();

                    }
                }
            });

			$scope.validateLabel = function(data){
				if (!data || (data && data.trim().length === 0)) {
					return "DataModel name can not be empty";
				}
			};

			$scope.formBeforeSave = function() {
                var d = $q.defer();
                var resource = {
                    id: $scope.mcFolderObject.id,
                    label: $scope.editableForm.$data.label,
                    description: $scope.editableForm.$data.description
                };
                resources.folder.put(resource.id, null, {resource: resource})
                    .then(function (result) {
                        if ($scope.afterSave) {
                            $scope.afterSave(result);
                        }
                        messageHandler.showSuccess('Folder updated successfully.');
                        $rootScope.$broadcast('$reloadFoldersTree');
                        d.resolve();
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem updating the Folder.', error);
                        d.resolve("error");
                    });
                return d.promise;
            };

            $scope.askForSoftDelete = function () {
                if (!$rootScope.isAdmin()) {
                    return;
                }
                folderHandler.askForSoftDelete($scope.mcFolderObject.id).then(function () {
                    stateHandler.reload();
                });
            };

            $scope.askForPermanentDelete = function () {
                if (!$rootScope.isAdmin()) {
                    return;
                }
                folderHandler.askForPermanentDelete($scope.mcFolderObject.id).then(function () {
                    stateHandler.Go("allDataModel", {reload: true, location: true});
                    $rootScope.$broadcast('$reloadFoldersTree');
                });
            };



			$scope.shareReadWithEveryoneChanged = function () {
				var callBack;
				if($scope.mcFolderObject.readableByEveryone === true){
                    callBack = resources.dataModel.put($scope.mcFolderObject.id, "readByEveryone");
				}else{
                    callBack = resources.dataModel.delete($scope.mcFolderObject.id, "readByEveryone");
				}
                callBack
					.then(function () {
                        messageHandler.showSuccess('Data Model updated successfully.');
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem updating the Data Model.', error);
                    });
            };

			$scope.shareReadWithAuthenticatedChanged = function () {

                var callBack;
                if($scope.mcFolderObject.readableByAuthenticated === true){
                    callBack = resources.dataModel.put($scope.mcFolderObject.id, "readByAuthenticated");
                }else{
                    callBack = resources.dataModel.delete($scope.mcFolderObject.id, "readByAuthenticated");
                }
                callBack
                    .then(function () {
                        messageHandler.showSuccess('Data Model updated successfully.');
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem updating the Data Model.', error);
                    });
            };

            $scope.toggleShowSearch = function () {
                $scope.showSearch = !$scope.showSearch;
                //hide security section if search section is displayed
                $scope.showSecuritySection = false;
            };


            $scope.toggleSecuritySection = function () {
                $scope.showSecuritySection = !$scope.showSecuritySection;
                //hide search section if security section is displayed
                $scope.showSearch = false;
            };

            // $scope.showAddElementToMarkdown = function () {
            //     var position = jQuery("span.xeditableTextArea").find("textarea").prop("selectionStart");
            //
            //     elementSelectorDialogue.open([], true).then(function (selectedElement) {
            //         if(!selectedElement){
            //             return;
            //         }
            //
            //         var markdonwLink = markdownParser.createMarkdownLink(selectedElement);
            //         var description = $scope.editableForm.$data.description.slice(0, position) + " " + markdonwLink + " " + $scope.editableForm.$data.description.slice(position);
            //         $scope.editableForm.$data.description = description;
            //         jQuery("span.xeditableTextArea").find("textarea").val(description);
            //
            //         $scope.safeApply();
            //     });
            // };
            // $scope.lastWasShiftKey = null;
            // $scope.descriptionKeyUp = function($event){
            //     $event.stopImmediatePropagation();
            //
            //     $scope.currentShiftKey = ($event.keyCode === 16);
            //
            //     if($scope.lastWasShiftKey && $scope.currentShiftKey){
            //         $scope.showAddElementToMarkdown();
            //         $scope.lastWasShiftKey = false;
            //         return;
            //     }
            //
            //     if($scope.currentShiftKey) {
            //         $scope.lastWasShiftKey = true;
            //     }else{
            //         $scope.lastWasShiftKey = false ;
            //     }
            //
            // };
            // $scope.safeApply = function (fn) {
            //     var phase = this.$root.$$phase;
            //     if (phase === '$apply' || phase === '$digest') {
            //         if (fn && (typeof(fn) === 'function')) {
            //             fn();
            //         }
            //     } else {
            //         this.$apply(fn);
            //     }
            // };


		}
	};
});

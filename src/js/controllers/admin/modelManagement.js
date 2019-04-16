'use strict';

angular.module('controllers').controller('modelManagementCtrl', function (resources, $scope, $window, $rootScope, confirmationModal, messageHandler, $q) {
		$window.document.title = 'Admin - Model Management';

        $scope.selectedElements = {};
        $scope.selectedElementsCount = 0;
        $scope.filterStatus  = "";
        $scope.filterElement = "";

        $scope.onFilterChange = function(){
            if($scope.filterElement === ""){
                $scope.filterStatus = "";
            }
            $scope.loadFolders();
        };


        $scope.loadFolders = function () {
            $scope.reloading = true;

            var options = {
                queryStringParams :{
                    includeDocumentSuperseded: true,
                    includeModelSuperseded: true,
                    includeDeleted: true
                }
            };
            var method = resources.tree.get(null, null, options);
            if($scope.filterStatus === null){
                //no op
            }else if($scope.filterStatus === "deleted"){
                if($scope.filterElement === "dataModel"){
                    method = resources.admin.get("dataModels/deleted");
                }else if($scope.filterElement === "terminology"){
                    method = resources.admin.get("terminologies/deleted");
                }
            }else if($scope.filterStatus === "documentSuperseded"){
                if($scope.filterElement === "dataModel"){
                    method = resources.admin.get("dataModels/documentSuperseded");
                }else if($scope.filterElement === "terminology"){
                    method = resources.admin.get("terminologies/documentSuperseded");
                }
            }else if($scope.filterStatus === "modelSuperseded"){
                if($scope.filterElement === "dataModel"){
                    method = resources.admin.get("dataModels/modelSuperseded");
                }else if($scope.filterElement === "terminology"){
                    method = resources.admin.get("terminologies/modelSuperseded");
                }
            }

            method.then(function (data) {
                $scope.folders = {
                    "children": data,
                    isRoot: true
                };

                angular.forEach($scope.folders.children, function (n) {
                    n.checked = false;
                    $scope.markChildren(n);
                });

                $scope.reloading = false;
            }, function () {
                $scope.reloading = false;
            });
        };
        $scope.loadFolders();


        $scope.markChildren = function(node){
            if($scope.selectedElements[node.id]){
                node.checked = true;
            }
            angular.forEach(node.children, function (n) {
                $scope.markChildren(n);
            });
        };


        $scope.onNodeChecked = function(node) {
            if(!$scope.selectedElements[node.id]){
                $scope.selectedElements[node.id] = node;
                $scope.selectedElementsCount++;
            }else{
            	delete $scope.selectedElements[node.id];
                $scope.selectedElementsCount--;
			}
        };

        $scope.resetSettings = function(){
            $scope.loadFolders();
            $scope.selectedElements = {};
            $scope.selectedElementsCount = 0;
            $scope.deleteSuccessMessage = null;
        };

        $scope.delete = function(permanent) {

            var dataModelResources = {
                permanent: permanent,
                ids:[]
            };
            for (var id in $scope.selectedElements) {
                if($scope.selectedElements[id].domainType === "DataModel") {
                    dataModelResources.ids.push(id);
                }
            }

            $scope.deleteInProgress = true;
            resources.dataModel.delete(null, null, null, dataModelResources)
                .then(function () {
                    if(permanent) {
                        $scope.deleteSuccessMessage  = $scope.selectedElementsCount + " Data Model(s) deleted successfully.";
                        $scope.deleteInProgress = false;

                        setTimeout(function(){
                            $scope.resetSettings();
                        }, 2000);

                    }else{
                        $scope.deleteSuccessMessage  = $scope.selectedElementsCount + " Data Model(s) marked as deleted successfully.";
                        $scope.deleteInProgress = false;

                        setTimeout(function(){
                            $scope.resetSettings();
                        }, 2000);
                }
                }).catch(function (error) {
                    $scope.deleteInProgress = false;
                    messageHandler.showError('There was a problem deleting the Data Model(s).', error);
                });
        };

        $scope.askForSoftDelete = function () {
            if (!$rootScope.isAdmin()) {
                return;
            }
            var message = "Are you sure you want to delete these Elements?<br>They will be marked as deleted and will not be viewable by users except Administrators.";
            if($scope.selectedElementsCount === 1){
                message = "Are you sure you want to delete this Element?<br>It will be marked as deleted and will not be viewable by users except Administrators.";
            }
            confirmationModal.open("Data Model",  message)
                .then(function (result) {
                    if(result.status !== "ok"){
                        return;
                    }
                    $scope.delete(false);
                });
        };

        $scope.askForPermanentDelete = function () {
            if (!$rootScope.isAdmin()) {
                return;
            }

            var message = "Are you sure you want to <span class='errorMessage'>permanently</span> delete these Elements?";
            if($scope.selectedElementsCount === 1){
                message = "Are you sure you want to <span class='errorMessage'>permanently</span> delete this Element?";
            }

            confirmationModal.open("Data Model", message)
                .then(function (result) {
                    if(result.status !== "ok"){
                        return;
                    }

                    var message = "<strong>Are you sure?</strong><br>All their child elements such as 'Data Classes', 'Data Elements', 'Data Types' and 'Terms(for terminology)' will be deleted <span class='errorMessage'>permanently</span>.";
                    if($scope.selectedElementsCount === 1){
                        message = "<strong>Are you sure?</strong><br>All its child elements such as 'Data Classes', 'Data Elements', 'Data Types' and 'Terms(for terminology)' will be deleted <span class='errorMessage'>permanently</span>.";
                    }

                    confirmationModal.open("Data Model", message)
                        .then(function (result) {
                            if(result.status !== "ok"){
                                return;
                            }
                            $scope.delete(true);
                        });
                });
        };

    }
);


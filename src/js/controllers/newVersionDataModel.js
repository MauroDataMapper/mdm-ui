angular.module('controllers').controller('newVersionDataModelCtrl', function ($window, $scope, $q, $stateParams, messageHandler, resources, validator, stateHandler) {
        $window.document.title = "New Version";
        $scope.step = 1;
        $scope.form = {
            label: "",
            copyPermissions: false,
            copyDataFlows: false,

            moveDataFlows: false
        };

        if(!$stateParams.dataModelId){
            stateHandler.NotFound({ location: false } );
            return;
        }

        resources.dataModel.get($stateParams.dataModelId).then(function(response) {
           $scope.dataModel =  response;
        });

        $scope.versionTypeChecked = function () {
            $scope.step++;
        };

        $scope.validate = function () {
            $scope.errors = null;

            if(!$scope.versionType){
                return false;
            }

            if($scope.versionType === "newElementVersion") {
                if(validator.isEmpty($scope.form.label)){
                    $scope.errors = $scope.errors || {};
                    $scope.errors.label = "Name can not be empty!";
                }else if ($scope.form.label.trim().toLowerCase() ===  $scope.dataModel.label.trim().toLowerCase()){
                    $scope.errors = $scope.errors || {};
                    $scope.errors.label = "The name should be different from the current version name '" + $scope.dataModel.label + "'"
                }
            }
            return !$scope.errors;
        };

        $scope.save = function () {
            if(!$scope.validate()){
                return;
            }
            //newElementVersion
            //newDocumentVersion
            if($scope.versionType === "newElementVersion"){
                var resource = {
                    label: $scope.form.label,
                    copyPermissions : $scope.form.copyPermissions,
                    copyDataFlows: $scope.form.copyDataFlows
                };
                $scope.processing = true;
                resources.dataModel.put($scope.dataModel.id, "newVersion", {resource:resource})
                    .then(function (response) {
                        $scope.processing = false;
                        messageHandler.showSuccess('New Data Model version created successfully.');
                        stateHandler.Go("datamodel", {id: response.id}, {reload:true});
                    }).catch(function (error) {
                        $scope.processing = false;
                        messageHandler.showError('There was a problem creating the new Data Model version.', error);
                    });
            }else if($scope.versionType === "newDocumentVersion"){
                var resource = {
                    moveDataFlows: $scope.form.moveDataFlows
                };
                $scope.processing = true;
                resources.dataModel.put($scope.dataModel.id, "newDocumentationVersion", {resource:resource})
                    .then(function (response) {
                        $scope.processing = false;
                        messageHandler.showSuccess('New Document Model version created successfully.');
                        stateHandler.Go("datamodel", {id: response.id}, {reload:true});
                    }).catch(function (error) {
                        $scope.processing = false;
                        messageHandler.showError('There was a problem creating the new Document Model version.', error);
                    });
            }
        };

        $scope.cancel = function () {
            stateHandler.Go("datamodel", {id:  $scope.dataModel.id});
        };

    });


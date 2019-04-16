angular.module('controllers').controller('newVersionTerminologyCtrl', function ($window, $scope, $q, $stateParams, messageHandler, resources, validator, stateHandler) {
        $window.document.title = "New Version";
        $scope.step = 1;
        $scope.form = {
            label: "",
            copyPermissions: false,
        };

        if(!$stateParams.id){
            stateHandler.NotFound({ location: false } );
            return;
        }

        resources.terminology.get($stateParams.id).then(function(response) {
           $scope.terminology =  response;
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
                }else if ($scope.form.label.trim().toLowerCase() ===  $scope.terminology.label.trim().toLowerCase()){
                    $scope.errors = $scope.errors || {};
                    $scope.errors.label = "The name should be different from the current version name '" + $scope.terminology.label + "'";
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
                    copyPermissions : $scope.form.copyPermissions
                };
                $scope.processing = true;
                resources.terminology.put($scope.terminology.id, "newVersion", {resource:resource})
                    .then(function (response) {
                        $scope.processing = false;
                        messageHandler.showSuccess('New Terminology version created successfully.');
                        stateHandler.Go("terminology", {id: response.id}, {reload:true});
                    }).catch(function (error) {
                        $scope.processing = false;
                        messageHandler.showError('There was a problem creating the new Terminology version.', error);
                    });
            }else if($scope.versionType === "newDocumentVersion"){
                $scope.processing = true;
                resources.terminology.put($scope.terminology.id, "newDocumentationVersion", {resource:{}})
                    .then(function (response) {
                        $scope.processing = false;
                        messageHandler.showSuccess('New Document version created successfully.');
                        stateHandler.Go("terminology", {id: response.id}, {reload:true});
                    }).catch(function (error) {
                        $scope.processing = false;
                        messageHandler.showError('There was a problem creating the new Document version.', error);
                    });
            }
        };

        $scope.cancel = function () {
            stateHandler.Go("terminology", {id:  $scope.terminology.id});
        };

    });


angular.module('controllers').controller('newDataModelStep2Ctrl', function ($scope, multiStepFormInstance, $state, resources) {

            resources.public.get("defaultDataTypeProviders").then(function (result) {
                $scope.defaultDataTypeProviders = result;
            }).catch(function (error) {
                messageHandler.showError('There was a problem loading Data Type Providers', error);
            });

            $scope.onSelectDataTypeProvider = function (dataTypeProvider) {
                if(!dataTypeProvider){
                    $scope.loadingData = false;
                    $scope.dataTypes = null;
                    return;
                }
                $scope.loadingData = true;
                $scope.model.selectedDataTypeProvider = dataTypeProvider;
                $scope.dataTypes = {items: $scope.model.selectedDataTypeProvider.dataTypes};
                $scope.loadingData = false;
            };
	});



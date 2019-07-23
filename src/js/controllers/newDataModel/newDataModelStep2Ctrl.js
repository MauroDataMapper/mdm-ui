angular.module('controllers').controller('newDataModelStep2Ctrl', function (
    $scope, multiStepFormInstance, $state, resources, $q, ngToast, stateHandler, messageHandler, $rootScope) {
    //$scope, multiStepFormInstance, $state, resources) {

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
 //Save at step 2 -AS
    $scope.save = function () {
        var resource = {
            folder: $scope.parentFolderId,
            label: $scope.model.label,
            description: $scope.model.description,
            author: $scope.model.author,
            organisation: $scope.model.organisation,
            type: $scope.model.dataModelType,
            classifiers: $scope.model.classifiers.map(function (cls) {
                return {id: cls.id};
            }),
            metadata: $scope.model.metadata.map(function (m) {
                return {
                    key: m.key,
                    value: m.value,
                    namespace: m.namespace
                };
            })
        };
        if(resource.type === "Database"){
            resource.dialect = $scope.model.dialect;
        }

        var queryStringParams = null;
        if($scope.model.selectedDataTypeProvider){
            queryStringParams = {
                defaultDataTypeProvider: $scope.model.selectedDataTypeProvider.name
            };
        }


        resources.dataModel.post(null, null, {resource:resource, queryStringParams:queryStringParams})
            .then(function (response) {
                messageHandler.showSuccess('Data Model saved successfully.');
                $rootScope.$broadcast('$reloadFoldersTree');
                stateHandler.Go("dataModel", {id: response.id}, {reload: true, location: true});
            })
            .catch(function (error) {
                messageHandler.showError('There was a problem saving the Data Model.', error);
            });
    };
	});



angular.module('controllers').controller('newDataModelStep3Ctrl', function ($scope, multiStepFormInstance, $state, resources, $q, ngToast, stateHandler, messageHandler, $rootScope) {

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



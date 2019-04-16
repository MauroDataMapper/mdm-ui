angular.module('controllers').controller('newDataClassStep2Ctrl', function ($scope, multiStepFormInstance, $state,resources, stateHandler, messageHandler, $q, $rootScope) {

		$scope.getMultiplicity = function(resource, multiplicity) {
            if($scope.model[multiplicity] == "*"){
                $scope.model[multiplicity] = -1;
            }
            if(!isNaN($scope.model[multiplicity])){
                resource[multiplicity] = parseInt($scope.model[multiplicity]);
            }
        };


        $scope.save = function () {
            if($scope.model.createType === 'new'){
                $scope.saveNewDataClass();
            }else{
                $scope.saveCopiedDataClasses();
            }
        };



		$scope.saveNewDataClass = function () {
			var resource = {
				label: $scope.model.label,
				description: $scope.model.description,
                classifiers: $scope.model.classifiers.map(function (cls) {
                    return {id: cls.id};
                }),
                metadata: $scope.model.metadata.map(function (m) {
                    return {
                        key: m.key,
                        value: m.value,
                        namespace: m.namespace
                    };
                }),
                minMultiplicity: null,
                maxMultiplicity: null
			};

            $scope.getMultiplicity(resource,"minMultiplicity");
            $scope.getMultiplicity(resource,"maxMultiplicity");


            var deferred;
            if($scope.model.parent.domainType === "DataClass"){
            	deferred = resources.dataClass.post($scope.model.parent.dataModel, $scope.model.parent.id, "dataClasses", {resource: resource});
			}else{
                deferred = resources.dataModel.post($scope.model.parent.id, "dataClasses", {resource: resource});
			}

			deferred.then(function(response) {
                 messageHandler.showSuccess('Data Class saved successfully.');
                 $rootScope.$broadcast('$reloadFoldersTree');
                 stateHandler.Go("dataClass", {
                        dataModelId:response.dataModel,
                        dataClassId:response.parentDataClass,
                        id: response.id
                }, {reload: true, location: true});
            })
            .catch(function (error) {
                messageHandler.showError('There was a problem saving the Data Class.', error);
            });
		};

        $scope.finalResult = {};
        $scope.successCount = 0;
        $scope.failCount = 0;

        $scope.saveCopiedDataClasses = function () {
            $scope.processing = true;
            $scope.isProcessComplete = false;
            var chain = $q.when();
            angular.forEach($scope.model.selectedDataClasses, function (dc) {
                (function() {
                    chain = chain.then(function(result) {
                        $scope.successCount++;
                        $scope.finalResult[dc.id] = {result:result, hasError:false};
                        var link = "dataClasses/" +  dc.dataModel + "/" + dc.id;
                        if($scope.model.parent.domainType === "DataClass"){
                            return resources.dataClass.post($scope.model.parent.dataModel, $scope.model.parent.id, link);
                        }else{
                            return resources.dataModel.post($scope.model.parent.id, link);
                        }
                    }).catch(function (error) {
                        $scope.failCount++;
                        var errorText = messageHandler.getErrorText(error);
                        $scope.finalResult[dc.id] = {result:errorText, hasError:true};
                    });
                })();
            });
            chain.then(function (all) {
                $scope.processing = false;
                $scope.isProcessComplete = true;
                $rootScope.$broadcast('$reloadFoldersTree');
            }).catch(function (error) {
                $scope.processing = false;
                $scope.isProcessComplete = true;
            });
        };

});



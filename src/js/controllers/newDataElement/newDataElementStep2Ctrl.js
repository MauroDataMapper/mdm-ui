angular.module('controllers').controller('newDataElementStep2Ctrl', function ($scope, multiStepFormInstance, $state, resources, $q, messageHandler, stateHandler) {

            $scope.save = function () {
                if($scope.model.createType === 'new'){
                    $scope.saveNewDE_DT();
                }else{
                    $scope.saveCopiedDataElements();
                }
            };


            $scope.saveNewDataType = function () {
                var deferred = $q.defer();

                var resource = {
                    label: $scope.model.newlyAddedDataType.label,
                    description: $scope.model.newlyAddedDataType.description,
                    organisation: $scope.model.newlyAddedDataType.organisation,
                    domainType: $scope.model.newlyAddedDataType.domainType,

                    referenceClass: {id: $scope.model.newlyAddedDataType.referencedDataClass ? $scope.model.newlyAddedDataType.referencedDataClass.id : null},

                    terminology:{id: $scope.model.newlyAddedDataType.referencedTerminology ? $scope.model.newlyAddedDataType.referencedTerminology.id : null},

                    classifiers: $scope.model.newlyAddedDataType.classifiers.map(function (cls) {
                        return {id: cls.id};
                    }),
                    enumerationValues: $scope.model.newlyAddedDataType.enumerationValues.map(function (m) {
                        return {
                            key: m.key,
                            value: m.value
                        };
                    }),
                    metadata: $scope.model.newlyAddedDataType.metadata.map(function (m) {
                        return {
                            key: m.key,
                            value: m.value,
                            namespace: m.namespace
                        };
                    })
                };
                resources.dataModel.post($scope.model.parentDataModel.id, 'dataTypes', {resource: resource}).then(function (newDataType) {
                    deferred.resolve(newDataType);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            };
            $scope.saveNewDataElement = function () {
				var resource = {
					label: $scope.model.label,
					description: $scope.model.description,
                    minMultiplicity: null,
                    maxMultiplicity: null,
					dataType:{
						id: $scope.model.dataType.id
					},
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

                if($scope.model.minMultiplicity === "*"){
                    $scope.model.minMultiplicity = -1;
                }
                if(!isNaN($scope.model.minMultiplicity)){
                    resource.minMultiplicity = parseInt($scope.model.minMultiplicity);
                }
                if($scope.model.maxMultiplicity === "*"){
                    $scope.model.maxMultiplicity = -1;
                }
                if(!isNaN($scope.model.maxMultiplicity)){
                    resource.maxMultiplicity = parseInt($scope.model.maxMultiplicity);
                }

                resources.dataClass
                    .post($scope.model.parentDataModel.id, $scope.model.parentDataClass.id, "dataElements", {resource: resource})
					.then(function (response) {
                        messageHandler.showSuccess('Data Element saved successfully.');
                        multiStepFormInstance.finish();
                        stateHandler.Go("dataElement", {
                                id: response.id,
                                dataModelId: response.dataModel,
                                dataClassId: response.dataClass
                            }, {reload: true, location: true});

				}).catch(function (error) {
                    messageHandler.showError('There was a problem saving the Data Element.', error);
                });
			};


            $scope.saveNewDE_DT = function(){
                //we need to save the new DataType
                if($scope.model.showNewInlineDataType){
                    $scope.saveNewDataType().then(function (newDataType) {
                        $scope.model.dataType = newDataType;

                        $scope.model.inlineDataTypeValid   = true;
                        $scope.model.showNewInlineDataType = false;

                        $scope.saveNewDataElement();
                    }, function (error) {
                        messageHandler.showError('There was a problem saving the Data Element.', error);
                    });
                }else{
                    $scope.saveNewDataElement();
                }
            };


            $scope.finalResult = {};
            $scope.successCount = 0;
            $scope.failCount = 0;
            $scope.saveCopiedDataElements = function () {
                $scope.processing = true;
                var chain = $q.when();
                angular.forEach($scope.model.selectedDataElements, function (de) {
                    (function () {
                        chain = chain.then(function (result) {
                            $scope.successCount++;
                            $scope.finalResult[de.id] = {result: result, hasError: false};
                            var action = "dataElements/" + de.dataModel + "/" + de.dataClass + "/" + de.id;
                            return resources.dataClass.post($scope.model.parentDataModel.id, $scope.model.parentDataClass.id, action);
                        }).catch(function (error) {
                            $scope.failCount++;
                            var errorText = messageHandler.getErrorText(error);
                            $scope.finalResult[de.id] = {result: errorText, hasError: true};
                        });
                    })();
                });
                chain.then(function (all) {
                    $scope.processing = false;
                    $scope.isProcessComplete = true;
                }).catch(function (error) {
                    $scope.processing = false;
                    $scope.isProcessComplete = true;
                });
            };

	});

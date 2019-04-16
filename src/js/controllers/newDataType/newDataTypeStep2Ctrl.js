angular.module('controllers').controller('newDataTypeStep2Ctrl', function ($scope, multiStepFormInstance, messageHandler, $state, $q, resources, stateHandler) {
            $scope.save = function () {

                if($scope.model.createType === 'new'){
                    $scope.saveNewDataType();
                }else{
                    $scope.saveCopiedDataTypes();
                }
            };

            $scope.saveNewDataType = function () {
                var resource = {
                    label: $scope.model.details.label,
                    description: $scope.model.details.description,
                    organisation: $scope.model.details.organisation,
                    domainType: $scope.model.details.domainType,

                    referenceClass: {id: $scope.model.details.referencedDataClass ? $scope.model.details.referencedDataClass.id : null},

                    terminology:{id: $scope.model.details.referencedTerminology ? $scope.model.details.referencedTerminology.id : null},

                    classifiers: $scope.model.details.classifiers.map(function (cls) {
                        return {id: cls.id};
                    }),
                    enumerationValues: $scope.model.details.enumerationValues.map(function (m) {
                        return {
                            key: m.key,
                            value: m.value,
                            category: m.category
                        };
                        }),
                    metadata: $scope.model.details.metadata.map(function (m) {
                        return {
                            key: m.key,
                            value: m.value,
                            namespace: m.namespace
                        };
                    })
                };

                resources.dataModel
                    .post($scope.model.parentDataModel.id, 'dataTypes', {resource: resource})
                    .then(function (response) {
                        messageHandler.showSuccess('Data Type saved successfully.');
                        multiStepFormInstance.finish();
                        stateHandler.Go("DataType",
                            {dataModelId: response.dataModel, id: response.id},
                            {reload: true, location: true});

                    }).catch(function (error) {
                    messageHandler.showError('There was a problem saving the Data Type.', error);
                });

            };


            $scope.finalResult = {};
            $scope.successCount = 0;
            $scope.failCount = 0;

            $scope.saveCopiedDataTypes = function () {
                $scope.processing = true;
                $scope.isProcessComplete = false;

                var chain = $q.when();
                angular.forEach($scope.model.selectedDataTypes, function (dt) {
                    (function() {
                        chain = chain.then(function(result) {
                            $scope.successCount++;
                            $scope.finalResult[dt.id] = {result:result, hasError:false};
                            var action = "dataTypes/"+ dt.dataModel + "/" + dt.id;
                            return resources.dataModel.post($scope.model.parentDataModel.id, action);
                        }).catch(function (error) {
                            $scope.failCount++;
                            var errorText = messageHandler.getErrorText(error);
                            $scope.finalResult[dt.id] = {result:errorText, hasError:true};
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



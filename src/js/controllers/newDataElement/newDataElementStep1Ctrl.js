angular.module('controllers').controller('newDataElementStep1Ctrl',	function (
    $scope, multiStepFormInstance, $state, validator ,resources, $q, messageHandler, stateHandler) {
    // $scope, multiStepFormInstance, $state, validator, resources, $q) {

		multiStepFormInstance.setValidity(false);
		//This is a very very expensive watch as it check 'model' object and all its properties ( as we passed true )...
		//we check if the values are valid and then make the Next button active or inactive
		$scope.$watch('model', function (newValue, oldValue, scope) {
			if (newValue && newValue !== oldValue) {
				$scope.validate(newValue);
			}
		}, true);

		//watch changes in newDataTypeInline
        $scope.$on("newDataTypeInlineUpdated", function(e, data) {
            $scope.model.inlineDataTypeValid = data.isValid;
            $scope.validate($scope.model);
        });

		//..............................................................................................................
        $scope.selectedDataElementsStr = "";
        $scope.add = function (record) {
            var index = _.findIndex($scope.model.selectedDataElements, function (r) {
                return r.id === record.id;
            });
            if(index === -1){
                $scope.model.selectedDataElements.push(record);
            }else{
                $scope.model.selectedDataElements.splice(index, 1);
            }
            $scope.validate();

            $scope.selectedDataElementsStr = "";
            angular.forEach($scope.model.selectedDataElements, function (dt) {
                $scope.selectedDataElementsStr += "<div>"+ dt.label +"</div>";
            });
        };

        $scope.isChecked = function (record) {
            var index = _.findIndex($scope.model.selectedDataElements, function (r) {
                return r.id === record.id;
            });
            return index !== -1;
        };

		$scope.validate = function (newValue) {
			var isValid = true;


            if($scope.model.createType === 'new'){
                //check Min/Max
                $scope.multiplicityError = validator.validateMultiplicities(newValue.minMultiplicity, newValue.maxMultiplicity);

                //Check Mandatory fields
                if (!newValue.label || newValue.label.trim().length === 0 || $scope.multiplicityError) {
                    isValid = false;
                }

                if(!$scope.model.showNewInlineDataType && !newValue.dataType){
                    isValid = false;
                }

                if($scope.model.showNewInlineDataType && !$scope.model.inlineDataTypeValid){
                    isValid = false;
                }

			}else{
                if($scope.model.selectedDataElements.length === 0){
                    isValid = false;
                }
			}

			multiStepFormInstance.setValidity(isValid);
			return isValid;
		};

        $scope.fetch = function (text, loadAll, offset, limit) {
            var deferred = $q.defer();
            limit = limit ? limit : 30;
            offset = offset ? offset : 0;
            var options = {
                pageSize: limit,
                pageIndex: offset,
                filters: "search=" + text,
                sortBy: "label",
                sortType: "asc",
                queryStringParams:{
                    labelOnly: "true"
                }
            };

            if(loadAll){
                delete options.filters;
            }

            $scope.searchTerm = text;
            resources.dataModel.get($scope.model.parentDataModel.id, "dataTypes", options).then(function (result) {
                deferred.resolve({
                    results: result.items,
                    count: result.count,
                    limit: limit,
                    offset: offset
                });
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        $scope.init = function(){
            $scope.hasDataTypes = true;
            if($scope.model.createType === 'new'){
                resources.dataModel.get($scope.model.parentDataModel.id, "dataTypes").then(function (result) {
                    if(result.count === 0){
                        $scope.hasDataTypes = false;
                    }
                });
            }
        };
        $scope.init();

        $scope.onTargetSelect = function (selectedValue) {
            $scope.model.dataType = selectedValue;
            $scope.validate($scope.model);
        };

        $scope.dataElementsFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
            var options = {
                pageSize: pageSize,
                pageIndex:pageIndex,
                sortBy: sortBy,
                sortType:sortType,
                filters: filters
            };
            var dataClass = $scope.model.copyFromDataClass[0];
            return resources.dataClass.get(dataClass.dataModel, null, dataClass.id, "dataElements", options);
        };

        $scope.showNewInlineDataType = function () {
            $scope.model.showNewInlineDataType = !$scope.model.showNewInlineDataType;
        };



        $scope.mcTableValues = {
            selectAllRows: false
        };

        $scope.selectAllClicked = function ($event) {
            $event.stopPropagation();
            return false;
        };
        $scope.selectAllChanged = function () {
            if($scope.mcTableValues.selectAllRows){
                if(!$scope.mcTableValues.mcTableHandler.mcDisplayRecords){
                    return;
                }
                angular.forEach($scope.mcTableValues.mcTableHandler.mcDisplayRecords, function (record) {
                    var index = _.findIndex($scope.model.selectedDataElements, function (r) {
                        return r.id === record.id;
                    });
                    if(index === -1){
                        $scope.model.selectedDataElements.push(record);
                    }
                });
            }else{
                if(!$scope.mcTableValues.mcTableHandler.mcDisplayRecords){
                    return;
                }
                angular.forEach($scope.mcTableValues.mcTableHandler.mcDisplayRecords, function (record) {
                    var index = _.findIndex($scope.model.selectedDataElements, function (r) {
                        return r.id === record.id;
                    });
                    if(index !== -1){
                        $scope.model.selectedDataElements.splice(index, 1);
                    }
                });
            }
        };

        $scope.onFetchCalled = function () {
            $scope.mcTableValues.selectAllRows = false;
        };
//Save data at step 2 - AS

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

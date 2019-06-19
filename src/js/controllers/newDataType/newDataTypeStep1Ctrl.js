angular.module('controllers').controller('newDataTypeStep1Ctrl', function (
    // $scope, multiStepFormInstance, messageHandler, $state, $q, resources, stateHandler)
$scope, multiStepFormInstance, $state, resources, $q, confirmationModal, elementTypes,messageHandler,stateHandler) {

        $scope.copyDataModel = null;

        $scope.allDataTypes = elementTypes.getAllDataTypesArray();

        //This is a very very expensive watch as it check 'model' object and all its properties ( as we passed true )...
		//we check if the values are valid and then make the Next button active or inactive
		$scope.$watch('model', function (newValue, oldValue, scope) {
			if (newValue && newValue !== null && newValue !== undefined) {
				$scope.validate();
			}
		}, true);

        //watch changes in newDataTypeInline
        $scope.$on("newDataTypeInlineUpdated", function(e, data) {
            $scope.handleNewDataTypeInlineUpdated(data);
        });
        $scope.handleNewDataTypeInlineUpdated = function(data){
            $scope.model.isValid = data.isValid;
            $scope.validate();
        };
		//..............................................................................................................
        $scope.selectedDataTypesStr = "";
        $scope.add = function (record) {
            var index = _.findIndex($scope.model.selectedDataTypes, function (r) {
                return r.id === record.id;
            });
            if(index === -1){
                $scope.model.selectedDataTypes.push(record);
            }else{
                $scope.model.selectedDataTypes.splice(index, 1);
            }
            $scope.validate();

            $scope.selectedDataTypesStr = "";
            angular.forEach($scope.model.selectedDataTypes, function (dt) {
                $scope.selectedDataTypesStr += "<div>"+ dt.label +"</div>";
            });
        };
        $scope.isChecked = function (record) {
            var index = _.findIndex($scope.model.selectedDataTypes, function (r) {
                return r.id === record.id;
            });
            return index !== -1;
        };

		$scope.validate = function () {
			var isValid = true;

			if($scope.model.createType === 'new'){
			    if(!$scope.model.isValid){
                    isValid = false;
                }
            }else{
			    if($scope.model.selectedDataTypes.length === 0){
			        isValid = false;
                }
            }
			multiStepFormInstance.setValidity(isValid);
			return isValid;
		};

        $scope.dataTypesFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
            var options = {
                pageSize: pageSize,
                pageIndex:pageIndex,
                sortBy: sortBy,
                sortType:sortType,
                filters:filters
            };
            return resources.dataModel.get($scope.model.copyFromDataModel[0].id, "dataTypes", options);
        };

        $scope.onDataClassSelect = function (dataClass, model) {
            model.referencedDataClass = dataClass;
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
                    var index = _.findIndex($scope.model.selectedDataTypes, function (r) {
                        return r.id === record.id;
                    });
                    if(index === -1){
                        $scope.model.selectedDataTypes.push(record);
                    }
                });
            }else{
                if(!$scope.mcTableValues.mcTableHandler.mcDisplayRecords){
                    return;
                }
                angular.forEach($scope.mcTableValues.mcTableHandler.mcDisplayRecords, function (record) {
                    var index = _.findIndex($scope.model.selectedDataTypes, function (r) {
                        return r.id === record.id;
                    });
                    if(index !== -1){
                        $scope.model.selectedDataTypes.splice(index, 1);
                    }
                });
            }
        };

        $scope.onFetchCalled = function () {
           $scope.mcTableValues.selectAllRows = false;
        };

        //Save at step 2 -AS

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

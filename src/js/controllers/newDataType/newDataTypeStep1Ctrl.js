angular.module('controllers').controller('newDataTypeStep1Ctrl', function ($scope, multiStepFormInstance, $state, resources, $q, confirmationModal, elementTypes) {

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

	});
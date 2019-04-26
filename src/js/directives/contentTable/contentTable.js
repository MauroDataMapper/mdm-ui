angular.module('directives').directive('contentTable', function () {
	return{
		restrict: 'E',
		scope: {
            parentDataModel: "=",
            grandParentDataClass: "=",
            parentDataClass: "=",
            loadingData:"="
		},
		templateUrl: './contentTable.html',

		link: function(scope, element, attrs){

		},
		controller: function($scope, resources, stateHandler, $q, messageHandler){


            $scope.contentFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {

                var options = {
                    pageSize: pageSize,
                    pageIndex:pageIndex,
                    sortBy: sortBy,
                    sortType:sortType,
                    filters: filters
                };

                return resources.dataClass.get(
                        $scope.parentDataModel.id,
                        null,
                        $scope.parentDataClass.id,
                        "content",
                        options);
            };

            $scope.newDataClass = function () {
                stateHandler.Go("NewDataClass", {
                    parentDataModelId: $scope.parentDataModel.id,
                    parentDataClassId: $scope.parentDataClass.id,
                    grandParentDataClassId: $scope.grandParentDataClass.id
                });
            };

            $scope.newDataElement = function () {
                stateHandler.Go("NewDataElement", {
                    parentDataModelId: $scope.parentDataModel.id,
                    parentDataClassId: $scope.parentDataClass.id,
                    grandParentDataClassId: $scope.grandParentDataClass.id
                });
            };


            $scope.deleteRows = function () {
                var deferred = $q.defer();

                $scope.processing = true;
                $scope.failCount = 0;
                $scope.total = 0;


                var chain = $q.when();
                angular.forEach($scope.mcTableHandler.mcDisplayRecords, function (record) {

                    if(record.checked !== true){
                        return;
                    }

                    (function () {
                        chain = chain.then(function (result) {

                            if(record.domainType === "DataClass"){
                                $scope.total++;
                                return resources.dataClass.delete(record.dataModel, record.parentDataClass, record.id);
                            }else if(record.domainType === "DataElement"){
                                $scope.total++;
                                return resources.dataElement.delete(record.dataModel, record.dataClass, record.id);
                            }

                        }).catch(function (error) {
                            $scope.failCount++;
                            // var errorText = messageHandler.getErrorText(error);
                            // $scope.finalResult[de.id] = {result: errorText, hasError: true};
                        });
                    })();
                });
                chain.then(function (all) {

                    deferred.resolve();

                    $scope.processing = false;
                    if ($scope.failCount === 0) {
                        messageHandler.showSuccess($scope.total + " Elements deleted successfully");
                    } else {
                        var successCount = $scope.total - $scope.failCount;
                        var message = "";
                        if (successCount !== 0) {
                            message += successCount + " Elements deleted successfully.<br>";
                        }
                        if ($scope.failCount > 0) {
                            message += "There was a problem deleting " + $scope.failCount + " elements.";
                        }

                        if ($scope.failCount > 0) {
                            messageHandler.showError(message);
                        } else {
                            messageHandler.showSuccess(message);
                        }
                    }
                    if ($scope.mcTableHandler) {
                        $scope.mcTableHandler.fetchForDynamic();
                    }

                }).catch(function (error) {

                    deferred.reject();

                    $scope.processing = false;
                    messageHandler.saveErrorMessages("There was a problem deleting the elements.", error);
                });



                return deferred.promise;
            };

		}
	};
});







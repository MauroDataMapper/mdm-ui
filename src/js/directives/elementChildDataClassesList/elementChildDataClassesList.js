angular.module('directives').directive('elementChildDataClassesList',  function ($state, resources) {

    return {
        restrict: 'E',
        scope: {
            parentDataModel: "=",
            parentDataClass: "=",
            type: "=", // static, dynamic

            childDataClasses: "=", //used when type='static'
            loadingData: "=",//used when type='static'

            clientSide: "@", //if true, it should NOT pass values to the serve in save/update/delete
            afterSave: "&"
        },
        templateUrl: './elementChildDataClassesList.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope, stateHandler, $state, $q, messageHandler) {

            if ($scope.type == 'dynamic') {
                $scope.dataClassesFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {

                    //it's just dataModel
                    if(!$scope.parentDataClass.id){

                        var options = {
                            pageSize: pageSize,
                            pageIndex:pageIndex,
                            sortBy: sortBy,
                            sortType:sortType,
                            filters: filters
                        };
                        return resources.dataModel.get($scope.parentDataModel.id, "dataClasses", options);
                    }
                    return resources.dataClass.get($scope.parentDataModel.id, null, $scope.parentDataClass.id, "dataClasses", options);
                };
            }

            if ($scope.type == 'static') {
                $scope.loading = true;
                $scope.records = [];

                $scope.$watch('loadingData', function (newValue, oldValue, scope) {
                    if (newValue !== null && newValue !== undefined) {
                        $scope.loading = newValue;
                    }
                });

                $scope.$watch('childDataClasses.items', function (newValue, oldValue, scope) {
                    if (newValue !== null && newValue !== undefined) {
                        $scope.showStaticRecords();
                    }
                });

                $scope.showStaticRecords = function () {
                    if ($scope.childDataClasses && $scope.type == 'static') {
                        $scope.records = [].concat($scope.childDataClasses.items);
                        $scope.safeApply();
                    }
                };
            }

            $scope.openEdit = function (dataClass) {
                if(!dataClass || (dataClass && !dataClass.id)){
                    return ""
                }
                stateHandler.NewWindow("dataClass", {
                    dataModelId: $scope.parentDataModel.id,
                    dataClassId: $scope.parentDataClass ? $scope.parentDataClass.id : null,
                    id: dataClass.id
                });
            };

            $scope.add = function () {
                stateHandler.Go("newDataClass", {
                    parentDataModelId: $scope.parentDataModel.id,
                    parentDataClassId: $scope.parentDataClass ? $scope.parentDataClass.id : null
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
                            $scope.total++;
                            return resources.dataClass.delete(record.dataModel, record.parentDataClass, record.id);
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
                    if($scope.failCount === 0){
                        messageHandler.showSuccess($scope.total +  " Elements deleted successfully");
                    }else{
                        var successCount =  $scope.total-$scope.failCount;
                        var message = "";
                        if(successCount !== 0){
                            message += successCount  + " Elements deleted successfully.<br>";
                        }
                        if($scope.failCount > 0) {
                            message += "There was a problem deleting " + $scope.failCount + " elements.";
                        }

                        if($scope.failCount > 0){
                            messageHandler.showError(message);
                        }else{
                            messageHandler.showSuccess(message);
                        }
                    }
                    if($scope.mcTableHandler) {
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

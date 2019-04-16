angular.module('directives').directive('elementOwnedDataTypesList', function ($state, resources) {

    return {
        restrict: 'E',
        scope: {
            parent: "=",
            type: "=", // static, dynamic

            childOwnedDataTypes: "=", //used when type='static'
            loadingData: "=",//used when type='static'

            clientSide: "@", //if true, it should NOT pass values to the serve in save/update/delete
            afterSave: "&"
        },
        templateUrl: './elementOwnedDataTypesList.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope, stateHandler, elementTypes, $q, messageHandler) {

            $scope.allDataTypes = elementTypes.getAllDataTypesArray();
            $scope.allDataTypesMap = elementTypes.getAllDataTypesMap();


            if ($scope.type == 'dynamic') {
                $scope.dataTypesFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
                    var options = {
                        pageSize: pageSize,
                        pageIndex:pageIndex,
                        sortBy: sortBy,
                        sortType:sortType,
                        filters:filters
                    };
                    return resources.dataModel.get($scope.parent.id, "dataTypes", options);
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

                $scope.$watch('childOwnedDataTypes.items', function (newValue, oldValue, scope) {
                    if (newValue !== null && newValue !== undefined) {
                        $scope.showStaticRecords();
                    }
                });

                $scope.showStaticRecords = function () {
                    if ($scope.childOwnedDataTypes && $scope.type == 'static') {
                        $scope.records = [].concat($scope.childOwnedDataTypes.items);
                        $scope.safeApply();
                    }
                };
            }

            $scope.openEdit = function (dataType) {
                if(!dataType || (dataType && !dataType.id)){
                    return ""
                }
                stateHandler.NewWindow("dataType",{
                    id: dataType.id,
                    dataModelId:$scope.parent.id
                });
            };

            $scope.add = function () {
                stateHandler.Go("newDataType",{
                    parentDataModelId: $scope.parent.id
                });
            };


            $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };


            $scope.deleteRows = function () {

                var deferred = $q.defer();

                $scope.processing = true;
                $scope.failCount = 0;
                $scope.total = 0;


                var chain = $q.when();
                angular.forEach($scope.mcTableHandler.mcDisplayRecords, function (record) {

                    if (record.checked !== true) {
                        return;
                    }

                    (function () {
                        chain = chain.then(function (result) {
                            $scope.total++;
                            return resources.dataType.delete(record.dataModel, record.id);
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



//
//
// angular.module('brc.mc.ui.elementOwnedDataTypesList',[]).directive('elementOwnedDataTypesList', function () {
// 	return{
// 		restrict: 'E',
// 		scope: {
// 			parent: "=",
// 			ownedDataTypes: "=",
// 			showAddNewRowButton: "@",
// 			loadingData:"="
// 		},
// 		templateUrl: 'views/directives/elementOwnedDataTypesList.html',
// 		link: function(scope, element, attrs){
// 		},
// 		controller:['$scope','NgTableParams','securityHandler','$state', '$q', 'userSettingsHandler', function($scope,ngTableParams,securityHandler,$state,$q,userSettingsHandler){
// 			$scope.$watch('ownedDataTypes.length', function (newValue, oldValue, scope) {
// 				if (newValue !== null && newValue !== oldValue ) {
//                     initializeTable();
// 				}
// 			});
//
// 			$scope.addNewDataType = function(){
// 				$state.go("twoSidePanel.catalogue.NewDataType",{parentId:$scope.parent.id});
// 			};
//
//
//
// 			$scope.dtypes = function(){
// 				var def = $q.defer();
// 				var docType = [
// 					{'id':'Primitive', 'title':'Primitive'},
// 					{'id':'Enumeration', 'title':'Enumeration'},
// 					{'id':'Reference', 'title':'Reference'}];
// 				def.resolve(docType);
// 				return def;
// 			};
//
//             //initialize the table, in case if there are not any data in the list
//             initializeTable();
//
// 			//initial table params
// 			var tableParams = {
// 						count: 10,
// 						sorting: {label: 'asc'}
// 					};
//             function initializeTable() {
//                 var showAddNewRowButton = securityHandler.showIfRoleIsWritable($scope.parent);
//
// 				//Check if user changed item count or sorting order
// 				// if (
// 				// 	$scope.tableParams
// 				// 	&& JSON.stringify($scope.tableParams.parameters().sorting) !== '{}'
// 				// 	&& ($scope.tableParams.parameters().sorting != tableParams.sorting || $scope.tableParams.parameters().count != tableParams.count)
// 				// ) {
// 				// 	//Reapply table params changed through UI
// 				// 	tableParams = $scope.tableParams.parameters();
// 				// }
//
//                 var countPerTable = parseInt(userSettingsHandler.get("countPerTable"));
//                 var counts = userSettingsHandler.get("counts");
//                 if($scope.ownedDataTypes && $scope.ownedDataTypes.length < countPerTable){
//                     counts = [];
//                 }
//
// 				$scope.tableParams = new ngTableParams(
// 					{count: countPerTable},
// 					{
// 						tableTitle:"Types",
// 						hideAddNewRowButton: !showAddNewRowButton,
// 						onAddNewRow: $scope.addNewDataType,
// 						counts: counts,
// 						dataset: $scope.ownedDataTypes
// 					}
// 				);
//             }
//
// 		}]
// 	};
// });
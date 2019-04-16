angular.module('directives').directive('elementChildDataElementsList',  function ($state, resources) {

    return {
        restrict: 'E',
        scope: {
            parentDataModel: "=",
            parentDataClass: "=",

            parentDataType: "=",//we can use this directive to load all dataElements of a dataType
            type: "=", // static, dynamic

            childDataElements: "=", //used when type='static'
            loadingData: "=",//used when type='static'

            clientSide: "@", //if true, it should NOT pass values to the serve in save/update/delete
            afterSave: "&"
        },
        templateUrl: './elementChildDataElementsList.html',

        link: function (scope, element, attrs) {

        },
        controller:  function ($scope) {

            if ($scope.type === 'dynamic') {

                $scope.dataElementsFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
                    var options = {
                        pageSize: pageSize,
                        pageIndex:pageIndex,
                        sortBy: sortBy,
                        sortType:sortType,
                        filters: filters
                    };

                    if($scope.parentDataModel && $scope.parentDataClass){
            		    return resources.dataClass.get($scope.parentDataModel.id, null, $scope.parentDataClass.id, "dataElements", options);
                    }
                    if($scope.parentDataModel && $scope.parentDataType){
                        return resources.dataType.get($scope.parentDataModel.id, $scope.parentDataType.id, "dataElements", options);
                    }
                };
            }

            if ($scope.type === 'static') {
                $scope.loading = true;
                $scope.records = [];

                $scope.$watch('loadingData', function (newValue, oldValue, scope) {
                    if (newValue !== null && newValue !== undefined) {
                        $scope.loading = newValue;
                    }
                });

                $scope.$watch('childDataElements.items', function (newValue, oldValue, scope) {
                    if (newValue !== null && newValue !== undefined) {
                        $scope.showStaticRecords();
                    }
                });

                $scope.showStaticRecords = function () {
                    if ($scope.childDataElements && $scope.type === 'static') {
                        $scope.records = [].concat($scope.childDataElements.items);
                        $scope.safeApply();
                    }
                };
            }

        }
    };

});







//
//
//
// angular.module('brc.mc.ui.elementChildDataElementsList',[]).directive('elementChildDataElementsList', function () {
// 	return{
// 		restrict: 'E',
// 		scope: {
// 			parent: "=",
// 			childDataElements: "=",
// 			showAddNewRowButton: "=",
// 			loadingData:"="
// 		},
// 		templateUrl: 'views/directives/elementChildDataElementsList.html',
// 		link: function(scope, element, attrs){
// 		},
// 		controller:['$scope','NgTableParams','securityHandler','$state', 'userSettingsHandler', function($scope,ngTableParams,securityHandler,$state,userSettingsHandler){
//
//
// 			$scope.$watch('childDataElements.length', function (newValue, oldValue, scope) {
// 				if (newValue !== null && newValue !== oldValue ) {
//
//
// 					var isWritable = securityHandler.showIfRoleIsWritable(scope.parent);
// 					var show = false;
// 					if(isWritable && scope.showAddNewRowButton == true) {
// 						show = true;
// 					}
//
//                     var countPerTable = parseInt(userSettingsHandler.get("countPerTable"));
//                     var counts = userSettingsHandler.get("counts");
//                     if($scope.childDataElements && $scope.childDataElements.length < countPerTable){
//                         counts = [];
//                     }
//
//
// 					$scope.tableParams = new ngTableParams(
// 						{count: countPerTable},
// 						{
// 							tableTitle:"Data Elements",
// 							hideAddNewRowButton: !show,
// 							onAddNewRow: $scope.addNewDataElement,
// 							counts: counts,
// 							dataset: $scope.childDataElements
// 						}
// 					);
// 				}
// 			});
//
// 			//for adding new dataElement, just go to new dataElement wizard form
// 			$scope.addNewDataElement = function(){
// 				$state.go("twoSidePanel.catalogue.NewDataElement",{parentId:$scope.parent.id});
// 			}
//
// 			if($scope.tableParams == undefined){
// 				var showAddNewRowButton = securityHandler.showIfRoleIsWritable();
//
//                 var countPerTable = parseInt(userSettingsHandler.get("countPerTable"));
//                 var counts = userSettingsHandler.get("counts");
//                 if($scope.childDataElements && $scope.childDataElements.length < countPerTable){
//                     counts = [];
//                 }
//
//
//                 $scope.tableParams = new ngTableParams(
// 					{count: countPerTable},
// 					{
// 						tableTitle:"Data Elements",
// 						hideAddNewRowButton: !showAddNewRowButton,
// 						onAddNewRow: $scope.addNewDataElement,
// 						counts: counts,
// 						dataset: $scope.childDataElements
// 					}
// 				);
// 			}
//
//
// 		}]
// 	};
// });
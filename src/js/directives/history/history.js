angular.module('directives').directive('history', function () {
    return {
        restrict: 'E',
        scope: {
            parent: "=",
            parentType:"="
        },
        templateUrl: './history.html',
        link: function (scope, element, attrs) {

        },
        controller: function ($scope, resources, elementTypes) {

            $scope.historyFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {

                var options = {
                    pageSize:pageSize,
                    pageIndex:pageIndex,
                    sortBy:sortBy,
                    sortType:sortType,
                    filters: filters
                };

                //Just these elements have History
                // DataModel
                // Classifier
                // userGroup
                // Folder
                // Terminology
                // CodeSet

                var elementMap = angular.merge(elementTypes.getBaseTypes(), elementTypes.getUserTypes());

                var resource = elementMap[$scope.parentType];
                if(resource){
                    return resources[resource.resourceName].get($scope.parent.id, "edits", options);
                }else{
                    return resources.dataModel.get($scope.parent.id, "edits", options);
                }

            };
        }
    };
});
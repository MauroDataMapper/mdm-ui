
angular.module('directives')
.directive('classifiedElementsList', function () {

    return {
        restrict: 'E',
        scope: {
            parent: "=",
            classifiedElementType: "="
        },
        templateUrl: './classifiedElementsList.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope, resources, elementTypes) {

            $scope.baseTypes = [{id:"", title:""}].concat(elementTypes.getBaseTypesAsArray());
            $scope.classifiableBaseTypes = _.filter($scope.baseTypes, function (type) {
                return type.classifiable;
            });
            $scope.classifiableBaseTypes = [{id:"", title:""}].concat($scope.classifiableBaseTypes);

            $scope.elementsFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
                var options = {
                    pageSize: pageSize,
                    pageIndex:pageIndex,
                    sortBy: sortBy,
                    sortType:sortType,
                    filters: filters
                };
                return resources.classifier.get($scope.parent.id, $scope.classifiedElementType, options);
            };

        }
    };
});
angular.module('directives').directive('simpleViewDataType', function () {
    return {
        restrict: 'E',
        scope: {
            parent: "=",
            hideMoreDetailsLink: "=",
        },
        templateUrl: './simpleViewDataType.html',

        link: function (scope, element, attrs) {

        },
        controller:  function ($scope, elementTypes) {

            $scope.allDataTypes    = elementTypes.getAllDataTypesArray();
            $scope.allDataTypesMap = elementTypes.getAllDataTypesMap();

            $scope.advancedViewLink    = elementTypes.getLinkUrl($scope.parent, "advancedView");

        }
    };
});







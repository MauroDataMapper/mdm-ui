angular.module('directives').directive('simpleViewClassifier', function () {
    return {
        restrict: 'E',
        scope: {
            parent: "=",
            hideMoreDetailsLink: "=",
        },
        templateUrl: './simpleViewClassifier.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope, elementTypes) {

            $scope.advancedViewLink    = elementTypes.getLinkUrl($scope.parent, "advancedView");

        }
    };
});







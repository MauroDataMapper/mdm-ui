angular.module('directives').directive('simpleViewDataClass', function () {
    return {
        restrict: 'E',
        scope: {
            parent: "=",
            hideMoreDetailsLink: "=",
        },
        templateUrl: './simpleViewDataClass.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope, elementTypes) {

            $scope.advancedViewLink    = elementTypes.getLinkUrl($scope.parent, "advancedView");

        }
    };
});







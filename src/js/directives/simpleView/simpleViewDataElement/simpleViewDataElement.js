angular.module('directives').directive('simpleViewDataElement', function () {
    return {
        restrict: 'E',
        scope: {
            parent: "=",
            hideMoreDetailsLink: "=",
        },
        templateUrl: './simpleViewDataElement.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope, elementTypes) {

            $scope.advancedViewLink    = elementTypes.getLinkUrl($scope.parent, "advancedView");
        }
    };
});







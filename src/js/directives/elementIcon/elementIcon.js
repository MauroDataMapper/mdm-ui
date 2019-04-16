angular.module('directives').directive('elementIcon', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            element: "="
        },
        templateUrl: './elementIcon.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope) {

        }
    };
});



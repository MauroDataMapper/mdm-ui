angular.module('directives').directive('enumerationCompare', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            diffs: "="
        },

        templateUrl: './enumerationCompare.html',

        link: function (scope, iElement, iAttrs, ctrl) {

        },

        controller: ['$scope', function ($scope) {

        }]
    };
});

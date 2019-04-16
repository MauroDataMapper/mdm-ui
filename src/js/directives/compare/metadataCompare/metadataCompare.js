angular.module('directives').directive('metadataCompare',  function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            diffs: "=",
            diffColumnWidth:"="
        },

        templateUrl: './metadataCompare.html',

        link: function (scope, iElement, iAttrs, ctrl) {
            scope.diffColumnWidthIn = scope.diffColumnWidth || '35';
        },

        controller: ['$scope', function ($scope) {

        }]
    };
});

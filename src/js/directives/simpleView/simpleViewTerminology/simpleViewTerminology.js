angular.module('directives').directive('simpleViewTerminology', function () {
    return {
        restrict: 'E',
        scope: {
            parent: "=",
            hideMoreDetailsLink: "=",
        },
        templateUrl: './simpleViewTerminology.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope, elementTypes) {

            $scope.advancedViewLink  = elementTypes.getLinkUrl($scope.parent, "advancedView");

            // $scope.rootNode = null;
            // resources.terminology.get($scope.parent.id ,"tree").then(function (data) {
            //     $scope.rootNode = {
            //         "children": data,
            //         isRoot: true
            //     };
            // });


        }
    };
});







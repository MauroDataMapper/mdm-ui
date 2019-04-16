angular.module('directives').directive('simpleViewTerm', function () {
    return {
        restrict: 'E',
        scope: {
            parent: "=",
            hideMoreDetailsLink: "=",
        },
        templateUrl: './simpleViewTerm.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope, resources, elementTypes) {

            $scope.advancedViewLink    = elementTypes.getLinkUrl($scope.parent, "advancedView");

            $scope.$watch("parent", function (newVal, oldVal, scope) {
				if (!newVal){return;}
				resources.terminology.get($scope.parent.terminology).then(function (result) {
                    $scope.terminology = result;
				});
			});

		}
    };
});







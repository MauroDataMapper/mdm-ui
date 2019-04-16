angular.module('directives').directive('simpleViewDataModel', function () {
    return {
        restrict: 'E',
        scope: {
            parent: "=",
            hideSearch: "=",
            hideMoreDetailsLink: "=",
            showLabelAsLink: "="
        },
        templateUrl: './simpleViewDataModel.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope, $state, $stateParams, stateHandler, elementTypes) {


            $scope.simpleViewLabelLink = stateHandler.getURL("simpleviewelement",{id:$scope.parent.id, domainType:"DataModel"});
            $scope.advancedViewLink    = elementTypes.getLinkUrl($scope.parent, "advancedView");

            $scope.defaultCriteria = $stateParams.criteria;
            $scope.defaultPageIndex = $stateParams.pageIndex;
            $scope.defaultPageSize = $stateParams.pageSize;
            $scope.defaultOffset = $stateParams.offset;

            $scope.onSearchChange = function (settings) {
                stateHandler.Go($state.current.name, {
                    criteria: settings.criteria,
                    pageSize: settings.pageSize,
                    offset: settings.offset,
                    pageIndex: settings.pageIndex,
                    id: $scope.parent.id,
                    domainType: $scope.parent.domainType
                }, {notify: false});
            };

        }
    };
});







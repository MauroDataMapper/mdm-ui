angular.module('directives').directive('modelPath', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            path: "=",
            doNotDisplayStatus: "=",
            doNotShowParentDataModel: "=",
            showAsSimpleText: "=",
            newWindow:"="
        },
        templateUrl: './modelPath.html',
        link: function (scope, element, attrs) {

        },

        controller: function ($scope, $state, elementTypes) {

            //This block builds the link using stateHandler which will create proper links for simpleView...............
            $scope.updatedPath = null;
            $scope.$watch("path", function (newVal, oldVal, scope) {
                if (newVal === undefined || newVal === null) {return;}
                $scope.updatedPath = [];
                angular.forEach($scope.path, function (p, index) {
                    if(index === 0){
                        p.link = elementTypes.getLinkUrl({id:p.id, domainType:"DataModel"});
                    }else if(index === 1){
                        p.link = elementTypes.getLinkUrl({id:p.id, dataModel: $scope.path[0].id,  domainType:"DataClass"});
                    }else{
                        p.link = elementTypes.getLinkUrl({id:p.id, dataModel: $scope.path[0].id,  parentDataClass: $scope.path[index - 1].id, domainType:"DataClass"});
                    }
                    $scope.updatedPath.push(p);
                });
            });
            //..........................................................................................................

            $scope.targetWindow = "";
            if($scope.newWindow){
                $scope.targetWindow = "_blank";
            }
        }
    };
});
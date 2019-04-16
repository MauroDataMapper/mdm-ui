angular.module('directives').directive('elementHierarchy', function () {
    return {
        restrict: 'E',
        scope: {
            parent: "=",
        },
        templateUrl: './elementHierarchy.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope, resources, elementTypes) {


            //We need this to load description of the dataModel
            resources.dataModel.get($scope.parent.breadcrumbs[0].id).then(function (result) {
                $scope.parent.breadcrumbs[0] = result;

                //This block builds the link using stateHandler which will create proper links for simpleView...........
                $scope.updatedPath = null;
                $scope.$watch("parent", function (newVal, oldVal, scope) {
                    if (newVal === undefined || newVal === null) {return;}
                    $scope.updatedPath = [];
                    angular.forEach($scope.parent.breadcrumbs, function (p, index) {
                        if(index === 0){
                            p.link = elementTypes.getLinkUrl({id:p.id, domainType:"DataModel"});
                        }else if(index === 1){
                            p.link = elementTypes.getLinkUrl({id:p.id, dataModel: $scope.parent.breadcrumbs[0].id,  domainType:"DataClass"});
                        }else{
                            p.link = elementTypes.getLinkUrl({id:p.id, dataModel: $scope.parent.breadcrumbs[0].id,  parentDataClass: $scope.parent.breadcrumbs[index - 1].id, domainType:"DataClass"});
                        }
                        $scope.updatedPath.push(p);
                    });
                });
                //......................................................................................................
            });


        }
    };
});







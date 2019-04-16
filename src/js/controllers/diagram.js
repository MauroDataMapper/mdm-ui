angular.module('controllers').controller('diagramCtrl',  function ($window, $scope, $stateParams, stateHandler, resources, jointDiagramService3, $q) {

        $scope.diagram;
        $scope.cells;
        $scope.rootCell;

        if(!$stateParams.id){
            stateHandler.NotFound({location:false});
        }

        resources.dataModel.get($stateParams.id,"hierarchy").then(function(data){
            $scope.currentDataModel = data;
            var result = jointDiagramService3.DrawDataModel($scope.currentDataModel);
            $scope.cells    = result.cells;
            $scope.rootCell = result.rootCell;
        });

        resources.tree.get().then(function (data) {
            $scope.allModels = {
                "children": data,
                isRoot: true
            };
        });

        $scope.diagramModelsOnSelect = function (element) {

            //just only show diagram for DataModels
            //don't load diagram for the current dataModel again
            if(element.domainType !== "DataModel" ||
               $scope.currentDataModel.id === element.id){
                return;
            }

            // $scope.loading = true;
            $scope.cells    = [];
            $scope.rootCell = null;

            resources.dataModel.get(element.id, "hierarchy").then(function(data){

                // $scope.loading = false;

                $scope.currentDataModel = data;
                var result = jointDiagramService3.DrawDataModel($scope.currentDataModel);
                $scope.cells    = result.cells;
                $scope.rootCell = result.rootCell;
            }, function () {
                // $scope.loading = false;
            });
        };
    });


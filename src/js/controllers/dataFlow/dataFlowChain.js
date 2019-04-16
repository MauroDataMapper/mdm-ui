'use strict';

angular.module('controllers').controller('dataFlowChainCtrl', function ($window, $scope, $q, resources, jointDiagramService3, $stateParams, stateHandler) {
        $window.document.title = "Data Flow";

        if(!$stateParams.dataModelId){
            stateHandler.NotFound({ location: false } );
            return;
        }
        resources.dataModel.get($stateParams.dataModelId).then(function(data){
            $scope.dataModel = data;
        });

        var height =  $(window).height() - 135;//100;
        $scope.height = Math.max(height, 800);

        $scope.onElementClick = function (event) {
            
            if(!event){
                $scope.selectedElement = {
                    id:null,
                    label:"",
                    description:""
                };
                return;
            }

			var element = null;
			if(event.model) {
				element = event.model.attributes['mc'];
			}else if(event.domainType){
				element = event;
            }

            if(element && element.domainType === "DataClass"){
                var parentId = null;
                if(element.breadcrumbs.length >= 2){
                    parentId = element.breadcrumbs[element.breadcrumbs.length - 1].id;
                }
                resources.dataClass.get(element.breadcrumbs[0].id, parentId, element.id).then(function (result) {
                    $scope.selectedElement = result;
                    $scope.safeApply();
                });
            }else if(element && element.domainType === "DataModel"){
                resources.dataModel.get(element.id).then(function (result) {
                    $scope.selectedElement = result;
                    $scope.safeApply();
                });
            }else if(element && element.domainType === "DataFlow"){
                $scope.selectedElement = element;
				$scope.safeApply();
            }else if(element && element.domainType === "Transformation"){
                $scope.selectedElement = element;
                $scope.safeApply();
            }else{
                $scope.selectedElement = {
                    id:null,
                    label:"",
                    description:""
                };
				$scope.safeApply();
            }
        };


        $scope.safeApply = function (fn) {
            var phase = this.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

    });


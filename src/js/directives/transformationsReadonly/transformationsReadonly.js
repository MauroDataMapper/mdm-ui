angular.module('directives').directive('transformationsReadonly', function (resources, $q, securityHandler, dataFlowHandler) {
    return {
        restrict: 'E',

        scope: {
            refresher: '=',
            isEditable: '=',
            targetDataModel: '=',
            targetDataClass: '=',
            flowId: '=',
            onElementClick: '='
        },

        templateUrl: './transformationsReadonly.html',

        link: function (scope, element, attrs) {

            scope.$watch('refresher', function (newValue, oldValue, scope) {
                if (newValue === null || newValue === undefined) {
                    return;
                }
                scope.init();
            });

            scope.init = function () {

                scope.refreshDesignerContainer();

                scope.selectedElement = null;
                scope.source = null;
                scope.sourceTree = [];
                scope.target = null;
                scope.targetTree = [];
                scope.dataFlow = null;

                scope.targetTreeLoading = true;
                scope.sourceTreeLoading = true;

                scope.loadingDiagram = true;

                resources.dataFlow.get(scope.targetDataModel, scope.flowId).then(function (data) {
                    scope.dataFlow = data;
                    //Show it's properties on left pane
                    scope.selectedElement = scope.dataFlow;
                    scope.form = {};
                    scope.form.id = scope.dataFlow.id;
                    scope.form.label = scope.dataFlow.label;
                    scope.form.description = scope.dataFlow.description;

                    resources.dataFlow.get(scope.targetDataModel, scope.dataFlow.id, "/dataClassFlows/" + scope.targetDataClass + "/dataFlowComponents", {filters: "all=true"}).then(function (result) {
                        scope.dataFlow.dataFlowComponents = result.items;
                        scope.dataFlowHandler = dataFlowHandler.getDataFlowHandler(jQuery(element).find("div.designer"), jQuery(element).find("svg.designer"), true);
                        scope.addDataFlowHandlerEventListeners();

                        var positionsStr = scope.dataFlow.diagramLayout || "";
                        var positions = {};
                        if (positionsStr.length > 0) {
                            positions = JSON.parse(positionsStr);
                        }
                        scope.dataFlowHandler.drawDataFlow(scope.dataFlow, positions);

                        scope.loadingDiagram = false;
                    });
                });
            };

        },
        controller: function ($scope, dataFlowHandler, $q, resources) {

            $scope.updateUserSettings = function () {
                if(!$scope.isEditable){
                    return;
                }

                var details = $scope.dataFlowHandler.getElementPositions();
                var resource = {
                    diagramLayout: JSON.stringify(details.positions)
                };
                resources.dataFlow.put($scope.targetDataModel, $scope.dataFlow.id, "diagramLayout", {resource:resource}).then(function (result) {
                    //console.log("Diagram saved")
                }, function (error) {
                    console.log("Error in saving the diagram layout", error);
                });
            };
            $scope.addDataFlowHandlerEventListeners = function() {
                //update the detail of the dataClass size change and save it in the userSettings.......

                jQuery($scope.dataFlowHandler).off('dataClassResize', $scope.updateUserSettings);
                jQuery($scope.dataFlowHandler).on('dataClassResize', $scope.updateUserSettings);

                jQuery($scope.dataFlowHandler).off('dataClassMove', $scope.updateUserSettings);
                jQuery($scope.dataFlowHandler).on('dataClassMove', $scope.updateUserSettings);

                jQuery($scope.dataFlowHandler).off('transformationMove', $scope.updateUserSettings);
                jQuery($scope.dataFlowHandler).on('transformationMove', $scope.updateUserSettings);

                jQuery($scope.dataFlowHandler).off('dataFlowElementSelected', $scope.elementClick);
                jQuery($scope.dataFlowHandler).on('dataFlowElementSelected', $scope.elementClick);

                //......................................................................................
            };


            $scope.elementClick = function(event, selectedElement){
                if(!selectedElement) {
                    if($scope.onElementClick){
                        $scope.onElementClick(null);
                    }
                    return;
                }

                var form = {};
                if(selectedElement.type === "transformation"){
                    form = {
                        id: selectedElement.transformation.id,
                        label: selectedElement.transformation.label,
                        description:selectedElement.transformation.description,
                        domainType: "Transformation"
                    };
                }else if(selectedElement.type === "dataClass"){
                    form = {
                        id: selectedElement.dataClass.id,
                        label: selectedElement.dataClass.label,
                        breadcrumbs: selectedElement.dataClass.breadcrumbs,
                        dataModel: selectedElement.dataModel,
                        domainType: "DataClass"
                    };
                }

                if($scope.onElementClick){
                    $scope.onElementClick(form);
                }
            };

            $scope.refreshDesignerContainer = function () {
              jQuery("div.designerContainer").empty();
              var div =
                  [ '<div class="designer">',
                        '<svg class="designer" xmlns="http://www.w3.org/2000/svg">',
                        '</svg>',
                    '</div>'].join("");
                jQuery("div.designerContainer").append(jQuery(div));

            };

        }
    };
});







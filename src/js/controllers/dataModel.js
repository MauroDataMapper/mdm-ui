angular.module('controllers').controller('dataModelCtrl', function ($scope, $state, $stateParams, resources,$window, ngToast, $rootScope, jointDiagramService3, $q, elementTypes, stateHandler) {
        $scope.activeTab = {index:-1};

        $scope.initialize = function(){
			
            if(!$stateParams.id){
                stateHandler.NotFound({ location: false } );
				return;
			}
			
			$scope.dataModel = null;
            $scope.diagram = null;
            $window.document.title = "Data Model";


            resources.dataModel.get($stateParams.id).then(function(data){
                $scope.dataModel = data;
                $scope.mcModelObject = data;

                $scope.dataModel.classifiers = $scope.dataModel.classifiers || [];
                $scope.parentForDataFlow = $scope.dataModel;
                $scope.activeTab = getTabDetail($stateParams.tabView);

                //it user is Not loggedIn or has just readAccess, then show extra tabs
                $scope.showExtraTabs =  !$rootScope.isLoggedIn() || (!$scope.dataModel.editable || $scope.dataModel.finalised);
                if($rootScope.isLoggedIn()) {
                  resources.dataModel.get($stateParams.id, 'permissions').then(function(permissions){
                    for (var attrname in permissions) {
                      $scope.dataModel[attrname] = permissions[attrname]; }
                  })
                }

            });

		};


        //These should be in the same order as in the HTML template file (dataModel.html)
        function getTabDetail(tabName) {
            switch (tabName) {
                case 'dataClasses':     return {index:0, name:'dataClasses'};
                case 'types':    	    return {index:1, name:'types'};
                case 'properties': 	    return {index:2, name:'properties'};
                case 'summaryMetadata': return {index:3, name:'summaryMetadata'};
                case 'comments':  	    return {index:4, name:'comments'};
                case 'history': 	    return {index:5, name:'history'};
                case 'diagram': 	    return {index:6, name:'diagram'};
                case 'links':   	    return {index:7, name:'links'};
                case 'attachments':     return {index:8, name:'attachments'};
                case 'dataflow': 	  {
                    if($scope.dataModel.type === 'Data Asset'){
                        return {index:9, name:'dataflow'};
                    }
                        return {index:0, name:'dataClasses'};
                }
                default: return {index:0, name:'dataClasses'};
            }
        }

		$scope.afterSave = function (updatedResource) {
			$rootScope.$broadcast('$elementDetailsUpdated', updatedResource);
		};

		$scope.tabSelected = function (itemsName) {
		    var tab = getTabDetail(itemsName);
		    stateHandler.Go("dataModel", { tabView: itemsName }, { notify: false, location: tab.index != 0 });
            $scope[itemsName] = [];


            $scope.activeTab = getTabDetail(itemsName);

            if(itemsName === "diagram") {
                $scope.dataModel4Diagram = null;
                $scope.cells    = null;
                $scope.rootCell = null;

                resources.dataModel.get($scope.dataModel.id, "hierarchy", {}).then(function(data){
                    var result = jointDiagramService3.DrawDataModel(data);
                    $scope.dataModel4Diagram = data;
                    $scope.cells    = result.cells;
                    $scope.rootCell = result.rootCell;
                });
                return;
            }


            if(itemsName === "dataflow") {
                // $scope.dataModel4Diagram = null;
                // $scope.cellsDF    = null;
                // $scope.rootCellDF = null;
                //
                // resources.dataModel.get($scope.dataModel.id, "dataFlows").then(function (data) {
                //     var result = jointDiagramServiceRecursiveDataflow.drawDFChain($scope.dataModel, data);
                //     $scope.dataModel4Diagram = $scope.dataModel;
                //     $scope.cellsDF    = result.cells;
                //     $scope.rootCellDF = result.rootCell;
                // });
                return;
            }


            if($scope.activeTab && $scope.activeTab.fetchUrl){
                $scope[$scope.activeTab.name] = [];
                $scope.loadingData = true;
                resources.dataModel.get($stateParams.id, $scope.activeTab.fetchUrl).then(function (data) {
                    $scope[$scope.activeTab.name] = data || [];
                    $scope.loadingData = false;
                });
            }
		};


        $scope.showEditForm = false;
        $scope.editForm = null;
		$scope.openEditForm = function (formName) {
            $scope.showEditForm = true;
			$scope.editForm = formName;
        };

        $scope.closeEditForm = function() {
            $scope.showEditForm = false;
            $scope.editForm = null;
        };

        $scope.initialize();

	});

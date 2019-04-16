angular.module('controllers').controller('dataElementCtrl',  function ($scope, $state, $stateParams,resources,$window,selectionHandler, stateHandler, $rootScope) {
        $scope.activeTab = {index:-1};

        $scope.initialize = function(){

            if(!$stateParams.id || !$stateParams.dataModelId || !$stateParams.dataClassId){
                stateHandler.NotFound({ location: false } );
                return;
            }
            $scope.dataModel = {id: $stateParams.dataModelId};
            $scope.dataClass = {id: $stateParams.dataClassId};
            $scope.dataElement = null;
            $scope.diagram = null;
            $window.document.title = "Data Element";

            resources.dataElement.get($stateParams.dataModelId, $stateParams.dataClassId, $stateParams.id).then(function(data){
                $scope.dataElement = data;
                $scope.dataElement.classifiers = $scope.dataElement.classifiers || [];

                $scope.activeTab = getTabDetail($stateParams.tabView);

                //it user is Not loggedIn or has just readAccess, then show extra tabs
                $scope.showExtraTabs =  !$rootScope.isLoggedIn() || !$scope.dataElement.editable;
            });

        };

        //These should be in the same order as in the HTML template file (dataElement.html)
        function getTabDetail(tabName) {
            switch (tabName) {
                case 'properties':  return {index:0, name:'properties'};
                case 'comments':    return {index:1, name:'comments'};
                case 'links': 	    return {index:2, name:'links'};
                case 'summaryMetadata': return {index:3, name:'summaryMetadata'};
                case 'attachments': return {index:4, name:'attachments'};
                // case 'history':  	return {index:2, name:'history' , fetchUrl:null};
                default: 		 	return {index:0, name:'properties'};
            }
        }

		//will be called after successful save/update
		//any action that should be run after successful save/update
		$scope.Save = function (updatedResource) {};

		$scope.tabSelected = function (itemsName) {
            var tab = getTabDetail(itemsName);
            stateHandler.Go("dataElement", { tabView: itemsName }, { notify: false, location: tab.index != 0 });
            $scope[itemsName] = [];

            $scope.activeTab = getTabDetail(itemsName);
            if($scope.activeTab && $scope.activeTab.fetchUrl){
                $scope[$scope.activeTab.name] = [];
                $scope.loadingData = true;
                resources.dataElement.get($stateParams.dataModelId, $stateParams.dataClassId, $stateParams.id, $scope.activeTab.fetchUrl).then(function (data) {
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

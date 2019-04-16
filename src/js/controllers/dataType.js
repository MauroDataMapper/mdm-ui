angular.module('controllers').controller('dataTypeCtrl', function ($scope, $state, $stateParams, resources, $window, stateHandler, $rootScope) {
        $scope.activeTab = {index:-1};

        $scope.initialize = function(){

            if(!$stateParams.id || !$stateParams.dataModelId){
                stateHandler.NotFound({ location: false } );
                return;
            }

            $scope.dataModel = {id: $stateParams.dataModelId};
            $scope.dataType = null;
            $window.document.title = "Data Type";

            $scope.loadingData = true;
            resources.dataType.get($stateParams.dataModelId, $stateParams.id).then(function(data){
                $scope.dataType = data;
                $scope.dataType.classifiers = $scope.dataType.classifiers || [];
                $scope.loadingData = false;
                $scope.activeTab = getTabDetail($stateParams.tabView);

                //it user is Not loggedIn or has just readAccess, then show extra tabs
                $scope.showExtraTabs =  !$rootScope.isLoggedIn() || !$scope.dataType.editable;
            }, function (error) {
                $scope.loadingData = false;
            });
        };

        //These should be in the same order as in the HTML template file (dataType.html)
        function getTabDetail(tabName) {
            switch (tabName) {
                case 'properties':   return {index:0, name:'properties'};
                case 'dataElements': return {index:1, name:'dataElements'};
                case 'comments':     return {index:2, name:'comments'};
                case 'links': 	 	 return {index:3, name:'links'};
                case 'attachments':  return {index:4, name:'attachments'};
                case 'history':  	 return {index:5, name:'history' , fetchUrl:null};
                default: 		 	 return {index:0, name:'properties'};
            }
        }


		//will be called after successful save/update
		//any action that should be run after successful save/update
		$scope.Save = function (updatedResource) {

		};

        $scope.tabSelected = function (itemsName) {
            var tab = getTabDetail(itemsName);
            stateHandler.Go("dataType", { tabView: itemsName }, { notify: false, location: tab.index != 0 });
            $scope[itemsName] = [];

            $scope.activeTab = getTabDetail(itemsName);
            if($scope.activeTab && $scope.activeTab.fetchUrl){
                $scope[$scope.activeTab.name] = [];
                $scope.loadingData = true;
                resources.dataType.get($stateParams.dataModelId, $stateParams.id, $scope.activeTab.fetchUrl).then(function (data) {
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

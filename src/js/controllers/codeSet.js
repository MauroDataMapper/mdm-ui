angular.module('controllers').controller('codeSetCtrl', function ($scope, $state, $stateParams, resources,$window, selectionHandler, ngToast, $rootScope, $q, elementTypes, stateHandler) {
        $scope.activeTab = {index:-1};

        $scope.initialize = function(){
			
            if(!$stateParams.id){
                stateHandler.NotFound({ location: false } );
				return;
			}
			
			$scope.mcCodeSetObject = null;
            $scope.diagram = null;
            $window.document.title = "Data Model";

            resources.codeSet.get($stateParams.id).then(function(data){
                $scope.mcCodeSetObject = data;
                $scope.mcCodeSetObject.classifiers = $scope.mcCodeSetObject.classifiers || [];
                $scope.activeTab = getTabDetail($stateParams.tabView);
            });
		};


        //These should be in the same order as in the HTML template file (dataModel.html)
        function getTabDetail(tabName) {
            switch (tabName) {
                case 'terms':  	    return {index:0, name:'terms'};
                case 'properties': 	    return {index:1, name:'properties'};
                case 'comments':  	    return {index:2, name:'comments'};
                case 'history': 	    return {index:3, name:'history'};
                case 'links':   	    return {index:4, name:'links'};
                case 'attachments':     return {index:5, name:'attachments'};
                default: return {index:0, name:'terms'};
            }
        }

		$scope.afterSave = function (updatedResource) {
			$rootScope.$broadcast('$elementDetailsUpdated', updatedResource);
		};

		$scope.tabSelected = function (itemsName) {
		    var tab = getTabDetail(itemsName);
		    stateHandler.Go("codeSet", { tabView: itemsName }, { notify: false, location: tab.index != 0 });
            $scope[itemsName] = [];

            $scope.activeTab = getTabDetail(itemsName);

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

angular.module('controllers').controller('dataClassCtrl', function ($scope, $state, $stateParams, resources,$window,selectionHandler, $rootScope, stateHandler) {

        $scope.activeTab = {index:-1};

		$scope.initialize = function(){
            if(!$stateParams.id || !$stateParams.dataModelId){
                stateHandler.NotFound({ location: false } );
                return;
            }

            $scope.parentDataClass = {id:null};
            if($stateParams.id && $stateParams.dataClassId && $stateParams.dataClassId.trim()!=""){
                $scope.parentDataClass = {id: $stateParams.dataClassId};
            }

			$window.document.title = "Data Class";
            resources.dataClass.get($stateParams.dataModelId, $scope.parentDataClass.id, $stateParams.id)
                .then(function(data){
                    $scope.dataClass = data;
                    $scope.parentDataModel = {
                        id: $stateParams.dataModelId,
                        editable: $scope.dataClass.editable,
                        finalised: $scope.dataClass.breadcrumbs[0].finalised
                    };

                    $scope.mcClassObject = data;
                    $scope.mcParentDataModel = $scope.parentDataModel;
                    $scope.mcParentDataClass = $scope.parentDataClass;

                    $scope.dataClass.classifiers = $scope.dataClass.classifiers || [];
                    $scope.activeTab = getTabDetail($stateParams.tabView);

                    //it user is Not loggedIn or has just readAccess, then show extra tabs
                    $scope.showExtraTabs =  !$rootScope.isLoggedIn() || !$scope.dataClass.editable;
                });
		};

        //These should be in the same order as in the HTML template file (dataClass.html)
        function getTabDetail(tabName) {
            switch (tabName) {
                case 'content': return {index:0, name:'content'};
                // case 'dataClasses':  return {index:0, name:'dataClasses'};
                // case 'dataElements': return {index:1, name:'dataElements'};
                case 'properties': 	 return {index:1, name:'properties'};
                case 'comments':     return {index:2, name:'comments'};
                case 'links': 		 return {index:3, name:'links'};
                case 'summaryMetadata': return {index:4, name:'summaryMetadata'};
                case 'attachments':  return {index:5, name:'attachments'};
                // case 'history': 	 return {index:4, name:'history'     , fetchUrl:null};
                // default: 			 return {index:0, name:'dataClasses', fetchUrl:'dataClasses'};
                default: 			 return {index:0, name:'content'};
            }
        }

		$scope.afterSave = function (updatedResource) {
			$rootScope.$broadcast('$elementDetailsUpdated', updatedResource);
		};


		$scope.tabSelected = function (itemsName) {
            var tab = getTabDetail(itemsName);
            stateHandler.Go("dataClass", { tabView: itemsName }, { notify: false, location: tab.index != 0 });
            $scope[itemsName] = [];

            $scope.activeTab = getTabDetail(itemsName);
            if($scope.activeTab && $scope.activeTab.fetchUrl){
                $scope[$scope.activeTab.name] = [];
                $scope.loadingData = true;
                resources.dataClass.get($stateParams.dataModelId, $stateParams.id, $scope.activeTab.fetchUrl).then(function (data) {
                    $scope[$scope.activeTab.name] = data || [];
                    $scope.loadingData = false;
                });
            }
            // if(currentTab && currentTab.name == 'content'){
            //     $scope['dataClasses']  = null;
            //     $scope['dataElements'] = null;
            //
            //     $scope.loadingData = true;
            //     var promises = [];
            //     promises.push(resources.getResource('dataClasses/'+ $stateParams.id + '/dataClasses'));
            //     promises.push(resources.getResource('dataClasses/'+ $stateParams.id +'/dataElements'));
            //
            //     $q.all(promises).then(function(results) {
            //         $scope['dataClasses']  = results[0];
            //         $scope['dataElements'] = results[1];
            //         $scope.loadingData = false;
            //     },function (error) {
            //         $scope['dataClasses']  = [];
            //         $scope['dataElements'] = [];
            //         $scope.loadingData = false;
            //     });
            // }

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

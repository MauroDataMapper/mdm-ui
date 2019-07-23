angular.module('controllers').controller('folderCtrl', function ($scope, $state, $stateParams, resources,$window, ngToast, $rootScope, jointDiagramService3, $q, elementTypes, stateHandler) {
        $scope.activeTab = {index:-1};

        $scope.initialize = function(){
            if(!$stateParams.id){
                stateHandler.NotFound({ location: false } );
				return;
			}

			//if it is in edit mode
            $scope.editMode = false;
			if($stateParams.edit === "true"){
                $scope.editMode = true;
            }


			$scope.folder = null;
            $scope.diagram = null;
            $window.document.title = "Folder";

            resources.folder.get($stateParams.id).then(function(data){
              $scope.folder = data;
              $scope.mcFolderObject = data;
              if($rootScope.isLoggedIn()) {
                resources.folder.get($stateParams.id, 'permissions').then(function(permissions) {
                  for (var attrname in permissions) {
                    $scope.folder[attrname] = permissions[attrname];
                  }
                })
              }
              $scope.activeTab = getTabDetail($stateParams.tabView);
            });
		};


        function getTabDetail(tabName) {
            switch (tabName) {
                case 'access': 	 return {index:0, name:'access'};
                case 'history':  return {index:1, name:'history'};
                default: 		 return {index:0, name:'access'};
            }
        }

		$scope.AfterSave = function (updatedResource) {

		};

		$scope.tabSelected = function (itemsName) {
		    var tab = getTabDetail(itemsName);
		    stateHandler.Go("folder", { tabView: itemsName }, { notify: false, location: tab.index !== 0 });
            $scope[itemsName] = [];


            $scope.activeTab = getTabDetail(itemsName);
            if($scope.activeTab && $scope.activeTab.fetchUrl){
                $scope[$scope.activeTab.name] = [];
                $scope.loadingData = true;
                resources.folder.get($stateParams.id, $scope.activeTab.fetchUrl).then(function (data) {
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

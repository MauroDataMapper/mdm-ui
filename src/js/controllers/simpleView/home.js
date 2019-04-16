'use strict';

angular.module('controllers').controller('simpleViewHomeCtrl', function ($window, $scope, stateHandler, $rootScope) {
        $window.document.title = "Metadata Catalogue";


        $scope.dataModelType = "Data Asset";

		if(!$rootScope.simpleViewSupport){
			stateHandler.Go("home");
			return;
		}

        $("#searchInput").trigger("focus");


        $scope.newSearch = function () {
            stateHandler.Go("simpleViewResult", {criteria:$scope.searchInput, pageSize:20, offset:0, pageIndex:1, dataModelType:$scope.dataModelType});
        };

        $scope.onKeyPress = function(keyEvent) {
            if (keyEvent.which === 13)
            {
                stateHandler.Go("simpleViewResult", {criteria:$scope.searchInput, pageSize:20, offset:0, pageIndex:1, dataModelType:$scope.dataModelType});
            }
        };

    });


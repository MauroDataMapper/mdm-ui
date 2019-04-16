'use strict';

angular.module('controllers').controller('groupsCtrl', function (resources, $scope, ngToast, $window, messageHandler) {
		$window.document.title = 'Admin - Groups';
		$scope.groups = [];
		resources.userGroup.get().then(function(groups){
			$scope.groups = groups;
		}).catch(function (error) {
            messageHandler.showError('There was a problem getting the group list.', error);
		});

	}
);


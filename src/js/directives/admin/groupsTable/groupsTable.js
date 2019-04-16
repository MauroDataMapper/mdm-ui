angular.module('directives').directive('groupsTable', function () {
	return {
		restrict: 'E',
		replace: true,
		scope: {},
		templateUrl: './groupsTable.html',
		controller: ['$scope',  'resources', 'messageHandler', 'stateHandler', function ($scope, resources, messageHandler, stateHandler) {
            $scope.groups = [];
            $scope.loading = true;
            resources.userGroup.get().then(function(groups){
                $scope.groups = groups;
                $scope.loading = false;
            }).catch(function (error) {
                $scope.loading = false;
                messageHandler.showError('There was a problem loading the group list.', error);
            });

			$scope.add = function () {
                stateHandler.Go("admin.group",{});
			};

			$scope.onEdit = function (row) {
                stateHandler.Go("admin.group",{id: row.id});
			};

			$scope.delete = function (row, $index) {
                resources.userGroup
                    .delete(row.id, null)
                    .then(function() {
                        $scope.groups.splice($index, 1);
                        messageHandler.showSuccess('Group deleted successfully.');
                    }).catch(function (error) {
                        messageHandler.showError('There was a problem deleting the group.', error);
                });
			};

		}]
	}
});

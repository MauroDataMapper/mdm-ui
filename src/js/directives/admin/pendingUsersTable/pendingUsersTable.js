
angular.module('directives').directive('pendingUsersTable', function () {
    return {
        restrict: 'E',
        templateUrl: './pendingUsersTable.html',

        link: function (scope, element, attrs) {

        },

        controller:  function ($scope, securityHandler, resources, messageHandler, $rootScope) {
            $scope.pendingUserFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
                var options = {
                    pageSize: pageSize,
                    pageIndex: pageIndex,
                    sortBy: sortBy,
                    sortType: sortType,
                    filters: filters
                };
                options.filters+="&disabled=false";
                return resources.catalogueUser.get(null, "pending", options);
            };

            $scope.approve = function ($index, row) {
                resources.catalogueUser.put(row.id, "approveRegistration", {}).then(function () {
                    $scope.mcDisplayRecords.splice($index, 1);
                    messageHandler.showSuccess('User approved successfully.');
                    $scope.mcTableHandler.fetchForDynamic();
                    $rootScope.$broadcast('$pendingUserUpdated');
                  }).catch(function (error) {
                    messageHandler.showError('There was a problem processing the request.', error);
                });
            };

            $scope.reject = function ($index, row) {
                resources.catalogueUser.put(row.id, "rejectRegistration", {}).then(function () {
                    $scope.mcDisplayRecords.splice($index, 1);
                    messageHandler.showSuccess('User updated successfully.');
                    $scope.mcTableHandler.fetchForDynamic();
                    $rootScope.$broadcast('$pendingUserUpdated');
                }).catch(function (error) {
                    messageHandler.showError('There was a problem processing the request.', error);
                });
            };

        }
    };
});



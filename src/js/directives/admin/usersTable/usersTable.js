
angular.module('directives').directive('usersTable', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            onEditUser: "&"
        },
        templateUrl: './usersTable.html',

        link: function (scope, element, attrs) {
        },

        controller: ['$scope', 'securityHandler', 'NgTableParams', 'ROLES', 'resources', 'stateHandler', 'messageHandler',
            function ($scope, securityHandler, ngTableParams, ROLES, resources, stateHandler, messageHandler) {

                $scope.ROLES = ROLES.map;

                function defineTableParams() {
                    var counts = [5, 10, 25, 50];
                    if ($scope.users && $scope.users.length <= 10) {
                        counts = [];
                    }
                    var showAddNewRowButton = securityHandler.showIfRoleIsWritable();
                    $scope.tableParams = new ngTableParams(
                        {
                            count: 10,
                            after: 1
                        },
                        {
                            tableTitle: "Users",
                            //add eventHandler when user clicks on addNew button
                            onAddNewRow: $scope.addNewUser,
                            hideAddNewRowButton: !showAddNewRowButton, //it should be displayed, as it is in add/new form
                            counts: counts,
                            getData: function (params) {
                                var options = {
                                    pageSize: params.parameters().count,
                                    pageIndex: (params.parameters().page - 1) * params.parameters().count,
                                    sortBy: null,
                                    sortType: null,
                                    filters: ""
                                };

                                var filters = params.filter();
                                for (var filter in filters) {
                                    if (filters.hasOwnProperty(filter)) {
                                        options.filters += filter + "=" + filters[filter] + "&";
                                    }
                                }

                                var sorting = params.sorting();
                                for (var sort in sorting) {
                                    if (sorting.hasOwnProperty(sort)) {
                                        options.sortBy = sort;
                                        options.sortType = sorting[sort];
                                    }
                                }

                                var promise = resources.catalogueUser.get(null, null, options);
                                return promise.then(function (data) {
                                    if (data.count < 10) {
                                        params.settings().counts = [];
                                    } else {
                                        params.settings().counts = [5, 10, 25, 50, 100];
                                    }
                                    params.total(data.count);
                                    return data.items;
                                });
                            }
                        }
                    );
                }

                $scope.addNewUser = function () {
                    stateHandler.Go('admin.user', {id: null});
                };

                $scope.edit = function (row) {
                    stateHandler.Go('admin.user', {id: row.id});
                };

                $scope.resetPassword = function (row) {
                    resources.catalogueUser.put(row.id, 'adminPasswordReset').then(function (result) {
                        messageHandler.showSuccess('Reset password email sent successfully!');
                    }).catch(function (error) {
                        messageHandler.showError('There was a problem sending reset password email.', error)
                    });
                };

                $scope.toggleDeactivate = function (row) {
                    row.disabled = !row.disabled;
                    resources.catalogueUser.put(row.id, null, {resource: row}).then(function () {
                        messageHandler.showSuccess('User updated successfully.');
                    }).catch(function (error) {
                        messageHandler.showError('There was a problem updating the user.', error);
                    });

                };

                defineTableParams();

            }]
    };
});



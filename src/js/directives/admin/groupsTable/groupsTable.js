
angular.module('directives').directive('groupsTable', function () {
        return {
        restrict: 'E',
        replace: true,
        scope: {
            onEditUser: "&"
        },

        templateUrl: './groupsTable.html',

        link: function (scope, element, attrs) {
        },


        controller: ['$scope',  'resources', 'messageHandler', 'stateHandler', 'NgTableParams', function ($scope, resources, messageHandler, stateHandler, ngTableParams) {

                // $scope.ROLES = ROLES.map;

                function defineTableParams() {
                    var counts = [5, 10, 25, 50];
                    if ($scope.groups && $scope.groups.length <= 10) {
                        counts = [];
                    }
                    // var showAddNewRowButton = securityHandler.showIfRoleIsWritable();
                    $scope.tableParams = new ngTableParams(
                        {
                            count: 10,
                            after: 1
                        },
                        {
                            tableTitle: "Groups",
                            //add eventHandler when user clicks on addNew button
                            onAddNewRow: $scope.add,
                            // hideAddNewRowButton: !showAddNewRowButton, //it should be displayed, as it is in add/new form
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

                                var promise = resources.userGroup.get(null, null, options);
                                    return promise.then(function (data) {
                                    if (data.count < 10) {
                                        params.settings().counts = [];
                                    } else {
                                        params.settings().counts = [5, 10, 25, 50, 100];
                                    }
                                    params.total(data.count);
                                        $scope.groups = data.items;
                                    return data.items;
                                });
                            }
                        }
                    );
                }

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
                        defineTableParams();
                        }).catch(function (error) {
                        messageHandler.showError('There was a problem deleting the group.', error);
                });
			};

                defineTableParams();

            }]
    };
});
















// angular.module('directives').directive('groupsTable', function () {
// 	return {
// 		restrict: 'E',
// 		replace: true,
// 		scope: {},
// 		templateUrl: './groupsTable.html',
// 		controller: ['$scope',  'resources', 'messageHandler', 'stateHandler', function ($scope, resources, messageHandler, stateHandler) {
//             $scope.groups = [];
//             $scope.loading = true;
//             resources.userGroup.get().then(function(groups){
//                 $scope.groups = groups;
//                 $scope.loading = false;
//             }).catch(function (error) {
//                 $scope.loading = false;
//                 messageHandler.showError('There was a problem loading the group list.', error);
//             });
//
// 			$scope.add = function () {
//                 stateHandler.Go("admin.group",{});
// 			};
//
// 			$scope.onEdit = function (row) {
//                 stateHandler.Go("admin.group",{id: row.id});
// 			};
//
// 			$scope.delete = function (row, $index) {
//                 resources.userGroup
//                     .delete(row.id, null)
//                     .then(function() {
//                         $scope.groups.splice($index, 1);
//                         messageHandler.showSuccess('Group deleted successfully.');
//                     }).catch(function (error) {
//                         messageHandler.showError('There was a problem deleting the group.', error);
//                 });
// 			};
//
// 		}]
// 	}
// });

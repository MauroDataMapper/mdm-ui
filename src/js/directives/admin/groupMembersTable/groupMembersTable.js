angular.module('directives').directive('groupMembersTable', function () {
    return{
        restrict: 'E',
        replace:true,
        scope: {
            parent: "="
        },
        templateUrl: './groupMembersTable.html',
        link: function(scope, iElement, iAttrs, ctrl) {
        },

        controller:['$scope','securityHandler', '$q', 'resources', 'messageHandler', 'ROLES', function($scope, securityHandler, $q, resources, messageHandler, ROLES){

            $scope.ROLES = ROLES.map;

            $scope.groupMembersFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
                var options = {
                    pageSize: pageSize,
                    pageIndex:pageIndex,
                    sortBy: sortBy,
                    sortType:sortType,
                    filters: filters
                };
                return resources.userGroup.get($scope.parent.id, "catalogueUsers", options);
            };

            $scope.validate = function() {
                var isValid = true;
                $scope.errors = [];
                if ($scope.parent.label.trim().length === 0) {
                    $scope.errors['label'] = "Name can't be empty!";
                    isValid = false;
                }
                if (isValid) {
                    delete $scope.errors;
                }
                return isValid;
            };

            $scope.add = function() {
                var newRecord = {
                    id:"",
                    firstName:"",
                    lastName:"",
                    organisation:"",
                    userRole:"",
                    disabled: false,
                    isNew:true
                };
                $scope.mcDisplayRecords = [].concat([newRecord]).concat($scope.mcDisplayRecords);
            };

            $scope.fetchUser = function (text, offset, limit) {
                var deferred = $q.defer();
                limit  = limit ? limit : 10;
                offset = offset ? offset : 0;
                var options = {
                    pageSize: limit,
                    pageIndex: offset,
                    filters: "search=" + text,
                    sortBy: "emailAddress",
                    sortType: "asc"
                };
                resources.catalogueUser.get(null, "search", options).then(function (result) {
                    deferred.resolve({
                        results:result.items,
                        count: result.count,
                        limit: limit,
                        offset: offset
                    });
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            };

            $scope.onUserSelect = function (select, record) {
                record.id = select.id;
                record.emailAddress = select.emailAddress;
                record.firstName = select.firstName;
                record.lastName = select.lastName;
                record.organisation = select.organisation;
                record.userRole = select.userRole;
                record.disabled = select.disabled;
            };

            $scope.cancelEdit = function (record, index) {
                if(record.isNew){
                   $scope.mcDisplayRecords.splice(index, 1);
                }
            };

            $scope.confirmAddMember = function(record, $index) {
                if(!record.id || !record.emailAddress){
                    return;
                }
                resources.userGroup.put($scope.parent.id, "catalogueUsers/" + record.id).then(function() {
                        $scope.mcDisplayRecords[$index] = record;
                        messageHandler.showSuccess('User added successfully.');
                        $scope.mcTableHandler.fetchForDynamic();
                }).catch(function (error) {
                    messageHandler.showError('There was a problem adding the user to the group.', error);
                });
            };

            $scope.removeMember = function(record) {
                record.deletePending = true;
            };

            $scope.confirmRemove = function (record, $index) {
                resources.userGroup.delete($scope.parent.id, "catalogueUsers/" + record.id).then(function() {
                    delete record.deletePending;
                    $scope.mcDisplayRecords.splice($index, 1);
                    messageHandler.showSuccess('User removed successfully.');
                    $scope.mcTableHandler.fetchForDynamic();
                }).catch(function (error) {
                    messageHandler.showError('There was a problem removing the user from the group.', error);
                });
            };

            $scope.cancelRemove = function (record) {
                delete record.deletePending;
            }

        }]
    };
});
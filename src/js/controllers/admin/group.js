'use strict';

angular.module('controllers').controller('groupCtrl', function (resources, $scope, messageHandler, $window, $stateParams, $state, stateHandler) {
		$window.document.title = 'Admin - Group';

        $scope.group = {
            label: "",
            description:""
        };

        if($stateParams.id) {
            resources.userGroup
                .get($stateParams.id)
                .then(function (group) {
                    $scope.group = group;
                    $scope.group.groupMembers = $scope.group.groupMembers || [];
                    $window.document.title = 'Admin - Edit Group';
                });
        }

        $scope.validate = function() {
            var isValid = true;
            $scope.errors = [];
            if ($scope.group.label.trim().length === 0) {
                $scope.errors['label'] = "Name can't be empty!";
                isValid = false;
            }
            if (isValid) {
                delete $scope.errors;
            }
            return isValid;
        };

        $scope.save = function() {
            if(!$scope.validate()){
                return;
            }
            //it's in edit mode
            if ($scope.group.id) {
                //it's in edit mode (update)
                resources.userGroup
                    .put($scope.group.id, null, {resource: $scope.group})
                    .then(function() {
                        messageHandler.showSuccess('Group updated successfully.');
                        stateHandler.Go('admin.groups');
                    }).catch(function (error) {
                        messageHandler.showError('There was a problem updating the group.', error);
                    });

            } else {
                //it's in new mode (create)
                resources.userGroup
                    .post(null, null, {resource:$scope.group})
                    .then(function () {
                        messageHandler.showSuccess('Group saved successfully.');
                        stateHandler.Go('admin.groups');
                    }).catch(function (error) {
                        messageHandler.showError('There was a problem saving the group.', error);
                    });
            }
        };

        $scope.cancel = function () {
			stateHandler.Go('admin.groups');
		};
	}
);


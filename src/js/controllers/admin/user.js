'use strict';

angular.module('controllers').controller('userCtrl', function (resources, $scope, messageHandler, ROLES, $window, $q, $stateParams, stateHandler, validator) {
		$window.document.title = 'Admin - Create User';
		$scope.allGroups = [];
        $scope.roles = ROLES.notPendingArray;
        $scope.user = {
            emailAddress: "",
            firstName:"",
            lastName: "",
            organisation: "",
            jobTitle: "",
            userRole: 'EDITOR',
			groups:[]
		};

        //edit mode
        if($stateParams.id) {
        	//edit mode
            resources.catalogueUser.get($stateParams.id).then(function (user) {
                $scope.user = user;
                $scope.safeApply();
                $window.document.title = 'Admin - Edit User';
            });
        }
        //get all groups
		resources.userGroup.get().then(function (data) {
            $scope.allGroups = data;
		});

        $scope.validate = function() {
            var isValid = true;
            $scope.errors = [];
			if ($scope.user.emailAddress.trim().length === 0) {
				$scope.errors['emailAddress'] = "Email can't be empty!";
				isValid = false;
			}

            if ($scope.user.emailAddress && !validator.validateEmail($scope.user.emailAddress)) {
                $scope.errors['emailAddress'] = "Invalid Email";
                isValid = false;
            }

            if ($scope.user.firstName.trim().length === 0) {
                $scope.errors['firstName'] = "First Name can't be empty!";
                isValid = false;
            }
            if ($scope.user.lastName.trim().length === 0) {
                $scope.errors['lastName'] = "Last Name can't be empty!";
                isValid = false;
            }
            if ($scope.user.userRole.trim().length === 0) {
                $scope.errors['userRole'] = "Role can't be empty!";
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
			var resource = {
		        emailAddress: $scope.user.emailAddress,
                firstName: $scope.user.firstName,
                lastName: $scope.user.lastName,
                organisation: $scope.user.organisation,
                jobTitle: $scope.user.jobTitle,
                userRole: $scope.user.userRole,
                groups: $scope.user.groups || []
            };
			//it's in edit mode
			if ($scope.user.id) {
				//it's in edit mode (update)
				resources.catalogueUser
					.put($scope.user.id, null, {resource: resource})
					.then(function(result) {
                        messageHandler.showSuccess('User updated successfully.');
                        stateHandler.Go('admin.users');
					}).catch(function (error) {
                         messageHandler.showError('There was a problem updating the user.', error);
					});

			} else {
				//it's in new mode (create)
                resources.catalogueUser
                    .post(null, "adminRegister", {resource: resource})
					.then(function (result) {
                        messageHandler.showSuccess('User saved successfully.');
                        stateHandler.Go('admin.users');
					}).catch(function (error) {
                        messageHandler.showError('There was a problem saving the user.', error);
					});
			}
		};

		$scope.cancel = function () {
            stateHandler.Go('admin.users');
		};


		$scope.onGroupSelect = function (groups) {
            $scope.user.groups = groups.map(function (group) {
                return {id:group.id, label:group.label}
            });
        };

        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

	});


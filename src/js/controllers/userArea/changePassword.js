'use strict';

angular.module('controllers').controller('changePasswordCtrl', function ($scope, resources, messageHandler, $window, $cookies, securityHandler, $state, stateHandler) {
			$window.document.title = "Change Password";

			$scope.needsToResetPassword = securityHandler.isLoggedIn() && $cookies.get('needsToResetPassword') === 'true';
			$scope.changePassword = {};
			$scope.onAfterSavePassword = function (form) {
				var resource = {
					oldPassword: $scope.changePassword.oldPassword,
					newPassword: $scope.changePassword.newPassword.trim()
				};
				$scope.error = false;
				resources.catalogueUser
					.put($cookies.get('userId'),'changePassword', {resource:resource})
					.then(function(result) {
						if ($scope.needsToResetPassword === true || $scope.needsToResetPassword === "true") {
							$cookies.put('needsToResetPassword', 'false');
							$scope.changePassword = {};
							form.$setPristine();
                            messageHandler.showSuccess('Password updated successfully.');
                            stateHandler.Go("alldatamodel", {}, {location: false});
						}else{
                            messageHandler.showSuccess('Password updated successfully.');
							$scope.changePassword = {};
							form.$setPristine();
						}
					}).catch(function (error) {
						if(error.status === 422){
                            messageHandler.showError('Old password is not valid!', error);
                            return;
						}
                    	messageHandler.showError('There was a problem updating your password.', error);
					});
			};
		}

);
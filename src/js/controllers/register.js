
angular.module('controllers').controller('registerCtrl', function ($scope, resources, ngToast, $window, validator, stateHandler, helpDialogueHandler, messageHandler) {
		$window.document.title = "Register new account";
		$scope.errors = [];
		$scope.confirmed  = false;
		$scope.processing = false;
		$scope.user = {
            emailAddress: "",
            firstName: "",
            lastName: "",
            organisation: "",
            userRole: "",
            password: "",
			confirmPassword:""
		};

		$scope.validate = function () {
			$scope.errors = [];
			var isValid = true;
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
            if ($scope.user.password.trim().length < 4) {
                $scope.errors['password'] = "Password must be at least 4 characters long!";
                isValid = false;
            }
            if ($scope.user.password.trim() !== $scope.user.confirmPassword.trim()) {
                $scope.errors['password'] = " ";
                $scope.errors['confirmPassword'] = "These passwords don't match";
                isValid = false;
            }
            if (isValid) {
                delete $scope.errors;
            }
			return isValid;
        };

		$scope.save = function () {
			if(!$scope.validate()){
				return;
			}
            $scope.processing = true;
			resources.catalogueUser.post(null, null, {resource:$scope.user}).then(function (result) {
				$scope.confirmed  = true;
                $scope.processing = false;
			}, function (error) {
			    messageHandler.showError('There was a problem creating the account.', error);
                $scope.processing = false;
            });
		};

        $scope.cancel = function () {
            stateHandler.Go("home");
		};

        $scope.loadHelp = function ($event, name) {
            helpDialogueHandler.open(name, { my: "right top", at: "bottom", of: jQuery($event.target) });
        };

	});
angular.module('controllers').controller('resetPasswordCtrl', function ($scope, resources, ngToast, $window, validator, stateHandler, $stateParams, securityHandler) {
      $window.document.title = "Reset Password";
      $scope.errors = [];
      $scope.confirmed = false;
      $scope.processing = false;
      $scope.user = {
          password: "",
          confirmPassword: ""
      };

      if(!$stateParams.uid || !$stateParams.token || securityHandler.isLoggedIn()){
          stateHandler.Go("home");
          return;
      }
      $scope.uid = $stateParams.uid;
      $scope.token = $stateParams.token;
      $scope.validate = function () {
          $scope.errors = [];
          var isValid = true;

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
          if (!$scope.validate()) {
              return;
          }

          var resource = {
              "newPassword": $scope.user.password.trim(),
              "resetToken":  $scope.token
          };

          $scope.processing = true;
          resources.catalogueUser.put($scope.uid,'changePassword', {resource:resource}).then(function (result) {
              $scope.message  = 'success';
              $scope.processing = false;
              $scope.confirmed = true;
          }, function (error) {
              $scope.message  = 'error';
              $scope.processing = false;
              $scope.confirmed = false;
          });
      };

      $scope.cancel = function () {
          stateHandler.Go("home");
      };

  });
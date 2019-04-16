'use strict';

angular.module('controllers').controller('adminCtrl', function ($window, $scope, resources, $rootScope) {
      $scope.pendingUsersCount = 0;

      $scope.findPendingCount = function () {
          resources.catalogueUser.get(null, "pending", {filters: "count=true&disabled=false"}).then(function (data) {
              $scope.pendingUsersCount = data.count;
          });
      };
      $scope.findPendingCount();

      $rootScope.$on('$pendingUserUpdated', function (event, args) {
          $scope.findPendingCount();
      });

  });


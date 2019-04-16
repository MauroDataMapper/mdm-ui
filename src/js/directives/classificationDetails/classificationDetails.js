angular.module('directives').directive('classificationDetails', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            mcClassification: "=",
            afterSave: "="
        },
        templateUrl: './classificationDetails.html',
        controller:  function ($scope, resources, stateHandler, $rootScope, messageHandler, $q) {
            $scope.securitySection = false;

            $scope.validateEmpty = function (label, data) {
                if (!data || (data && !data.trim().length)) {
                    return "Classification " + label + " can not be empty";
                }
            };

            $scope.formBeforeSave = function () {
                var d = $q.defer();
                var resource = {
                    id: $scope.mcClassification.id,
                    label: $scope.editableForm.$data.label,
                    description: $scope.editableForm.$data.description
                };

                resources.classifier.put($scope.mcClassification.id, null, {resource: resource})
                  .then(function () {
                      if ($scope.afterSave) {
                          $scope.afterSave(resource);
                      }
                      messageHandler.showSuccess('Classifier updated successfully.');
                      d.resolve();
                  }, function (error) {
                      messageHandler.showError('There was a problem updating the Classifier.', error);
                      d.resolve("error");
                  });
                return d.promise;
            };

            $scope.shareReadWithEveryoneChanged = function () {
                var callBack;
                if ($scope.mcClassification.readableByEveryone === true) {
                    callBack = resources.classifier.put($scope.mcClassification.id, "readByEveryone");
                } else {
                    callBack = resources.classifier.delete($scope.mcClassification.id, "readByEveryone");
                }
                callBack
                  .then(function () {
                      messageHandler.showSuccess('Classifier updated successfully.');
                  })
                  .catch(function (error) {
                      messageHandler.showError('There was a problem updating the Classifier.', error);
                  });
            };

            $scope.shareReadWithAuthenticatedChanged = function () {
                var callBack;
                if ($scope.mcClassification.readableByAuthenticated === true) {
                    callBack = resources.classifier.put($scope.mcClassification.id, "readByAuthenticated");
                } else {
                    callBack = resources.classifier.delete($scope.mcClassification.id, "readByAuthenticated");
                }
                callBack
                  .then(function () {
                      messageHandler.showSuccess('Classifier updated successfully.');
                  })
                  .catch(function (error) {
                      messageHandler.showError('There was a problem updating the Classifier.', error);
                  });
            };


            $scope.toggleSecuritySection = function () {
                $scope.securitySection = !$scope.securitySection;
            };

            $scope.delete = function () {
                resources.classifier.delete($scope.mcClassification.id).then(function (result) {
                    $rootScope.$broadcast('$reloadClassifiers');
                    stateHandler.Go("allDataModel", {location: true});
                })
            }

        }
    };
});

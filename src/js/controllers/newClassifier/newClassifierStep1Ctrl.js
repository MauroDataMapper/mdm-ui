angular.module('controllers').controller('newClassifierStep1Ctrl',	function ($scope, multiStepFormInstance, $state, resources, stateHandler, $rootScope, messageHandler) {

		$scope.$watch('model', function (newValue, oldValue, scope) {
			if (newValue && newValue != oldValue) {
				$scope.validate(newValue);
			}
		}, true);

		$scope.validate = function (newValue) {
			var isValid = true;
			if (!newValue.label || newValue.label.trim().length == 0) {
				isValid = false;
			}
			multiStepFormInstance.setValidity(isValid);
		};

        $scope.cancelWizard = function () {
            stateHandler.GoPrevious();
        };


		$scope.save = function () {
			var resource = {
				label: $scope.model.label,
				description: $scope.model.description
			};


			resources.classifier.post(null, null, {resource:resource})
				.then(function (response) {
                    messageHandler.showSuccess('Classifier saved successfully.');
					multiStepFormInstance.finish();
					stateHandler.Go("classification", {id: response.id},{location: true});
                    $rootScope.$broadcast('$reloadClassifiers');
				})
				.catch(function (error) {
                    messageHandler.showError('There was a problem saving the Classifier.', error);
				});
		};
	});
angular.module('controllers').controller('newClassifierCtrl', function ($scope, $window) {

		$window.document.title = "New Classifier";

		$scope.steps = [
			{
				templateUrl: '../../../views/newClassifier/step1.html',
				title: 'Classifier Details',
				hasForm: 'true',
				controller: 'newClassifierStep1Ctrl'
			}
		];

		$scope.model =  {
			label: undefined,
			description: undefined
		};
		$scope.saveErrorMessages = undefined;

	});
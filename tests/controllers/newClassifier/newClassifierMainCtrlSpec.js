import {mock} from '../../_globalMock';

describe('Controller: newClassifierCtrl', function () {
	var scope, controller;

    mock.init();
	beforeEach(inject(function ($controller, $rootScope, _$window_) {
		scope = $rootScope.$new();
		controller = $controller('newClassifierCtrl', {$scope: scope, $window:_$window_});
		scope.$digest();
	}));

	it('newClassifierCtrl steps are defined properly', function () {
		//it has 1 step
		expect(scope.steps.length).toBe(1,"It should have 1 steps");
		expect(scope.steps[0]).toEqual({
			templateUrl: '../../../views/newClassifier/step1.html',
			title: 'Classifier Details',
			hasForm: 'true',
			controller: 'newClassifierStep1Ctrl'
		});
	});

	it('newClassifierCtrl scope is initialized properly', function () {
		//default models are initialized properly
		expect(scope.model).toBeDefined();
		expect(scope.model.label).not.toBeDefined();
		expect(scope.model.description).not.toBeDefined();
	});

});
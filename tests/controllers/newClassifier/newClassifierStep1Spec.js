import {mock} from '../../_globalMock';

describe('Controller: newClassifier (wizard:Step 1)', function () {
	var $rootScope, step, multiStepForm, formStepElement,
		mainWizardController, $httpBackend, stepScope, stepElement, resources, $q, messageHandler,$state;

    mock.init();
	//load step1
	beforeEach(module('views/newClassifier/step1.html'));
	beforeEach(module('views/app.html'));
	beforeEach(module('views/appContainer.html'));

	beforeEach(inject(function(_$rootScope_, _multiStepForm_, FormStep, _formStepElement_,_$templateCache_,_$window_,$controller, _$httpBackend_,_resources_, _$q_,_messageHandler_,_$state_) {
		//load the template
		var tempHTML = _$templateCache_.get('../../../views/newClassifier/step1.html');
		$rootScope = _$rootScope_;
		resources = _resources_;
		$q = _$q_;
        messageHandler = _messageHandler_;
		$state = _$state_;

		_$httpBackend_.whenGET('views/home.html').respond(200, '');
		$httpBackend = _$httpBackend_;

		//https://github.com/troch/angular-multi-step-form/blob/master/tests/form-step-element-factory.spec.js
		// Multi step form factory (function)
		multiStepForm = _multiStepForm_;
		// Form step element factory
		formStepElement = _formStepElement_;

		//Create steps using FormStep factory and pass its controller, it is does not have a controller, we can pass a default one
		//controller = ['multiStepFormInstance', function (multiStepFormInstance) {
		//	this.name = "It's me, Mario!";
		//  this.multiStepFormInstance = multiStepFormInstance;
		//}];
		//https://github.com/troch/angular-multi-step-form/blob/master/tests/form-step-element-factory.spec.js
		step = new FormStep({title: 'Step 1', template: tempHTML, controller: "newClassifierStep1Ctrl"});

		formStepElement(step, multiStepForm(), $rootScope)
			.then(function (data) {
				//get step scope
				stepScope = data.scope;
				//get step element (HTML node)
				stepElement = data.element;
			});

		//run it on $rootScope
		$rootScope.$digest();
		//pass stepScope to the mainWizard Controller and it will add the main scopes and models to it
		//and they will be available in step template UI
		mainWizardController = $controller('newClassifierCtrl', {$scope: stepScope, $window:_$window_});

	}));

	it('Wizard form and its models are initialized properly',  function () {
		//main controllers is defined
		expect(mainWizardController).toBeDefined();
		//check if element is defined
		expect(stepElement).toBeDefined();
		//check if default model is initialized
		expect(stepScope.model).toEqual( {
			label: undefined,
			description: undefined
		});
		expect(stepScope.saveErrorMessages).toEqual(undefined);
	});

	it('should not validate the form if mandatory fields are not provided', function () {
		stepScope.model = {
			label: ""
		};
		stepScope.$digest();
		expect(stepScope.detailForm.$valid).toBeFalsy();
	});

	it("Successful save will show success message, pass values to server and changes the state", function () {
		spyOn(messageHandler, 'showSuccess').and.returnValue({});
		spyOn($state, 'go').and.returnValue({});

		//Save successfully happens
		spyOn(resources.classifier, 'post').and.callFake(function() {
			var deferred = $q.defer();
			deferred.resolve({id:'NEWLY-CREATED-ID'});
			return deferred.promise;
		});

		//update the fields in the UI
		stepScope.model = {
			label: "ALabel",
			description: "ADescription"
		};
		stepScope.$digest();
		expect(stepScope.detailForm.$valid).toBeTruthy();

		//save button is pressed
		stepScope.save();
		stepScope.$digest();

		expect(resources.classifier.post).toHaveBeenCalledWith(null, null, {resource:stepScope.model});
		expect(messageHandler.showSuccess).toHaveBeenCalledWith('Classifier saved successfully.');
		expect($state.go).toHaveBeenCalledWith(
			"appContainer.mainApp.twoSidePanel.catalogue.classification",
			{id: 'NEWLY-CREATED-ID'},
			{
				location: true
			});
	});

	it("Failure in save will show error message", function () {
		spyOn(messageHandler, 'showError').and.returnValue({});
		spyOn($state, 'go').and.returnValue({});

		//Save successfully happens
		spyOn(resources.classifier, 'post').and.callFake(function() {
			var deferred = $q.defer();
			deferred.reject({});
			return deferred.promise;
		});

		//update the fields in the UI
		stepScope.model = {
			label: "ALabel",
			description: "ADescription"
		};
		stepScope.$digest();
		expect(stepScope.detailForm.$valid).toBeTruthy();

		//save button is pressed
		stepScope.save();
		stepScope.$digest();

		expect(resources.classifier.post).toHaveBeenCalledWith(null, null, {resource:stepScope.model});
		expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem saving the Classifier.',{});

	});
});
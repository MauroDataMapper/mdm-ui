import {mock} from '../../_globalMock';

describe('Controller: newDataModelCtrl (wizard:Step 1)', function () {

	var $rootScope,

		step,
		multiStepForm,
		formStepElement,
        $q,

		mainWizardController,
		$httpBackend,

        resources,

		stepScope,

        $stateParams,

		stepElement;



    mock.init();	//load step1
	beforeEach(angular.mock.module('views/newDataModel/step1.html'));



	beforeEach(inject(function(_$rootScope_, _multiStepForm_, FormStep, _formStepElement_,_$templateCache_,_$window_,$controller, _$httpBackend_, _resources_, _$q_, _$stateParams_) {

		//load the template
		var tempHTML = _$templateCache_.get('views/newDataModel/step1.html');
		$rootScope = _$rootScope_;
		$rootScope.simpleViewSupport = false;
        $q = _$q_;

        $stateParams = _$stateParams_;
        $stateParams.parentFolderId = "Parent-Folder-ID";


        _$httpBackend_.whenGET('views/home.html').respond(200, '');
		_$httpBackend_.whenGET('views/twoSidePanel.html').respond(200, '');


        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/types').respond(['Data Asset', 'Data Standard']);
        //as classification directive loads all classifiers, we need to mock its call here
		_$httpBackend_.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);

		$httpBackend = _$httpBackend_;


        resources = _resources_;
        spyOn(resources.folder, "get").and.returnValue($q.when([]));


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
		step = new FormStep({title: 'Step 1', template: tempHTML, controller: "newDataModelStep1Ctrl"});

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
		mainWizardController = $controller('newDataModelCtrl', {$scope: stepScope, $window:_$window_});

	}));

	it('Wizard form and its models are initialized properly',  function () {

		//main controllers is defined
		expect(mainWizardController).toBeDefined();

		//check if element is defined
		expect(stepElement).toBeDefined();

		//check if default model is initialized
		expect(stepScope.model).toEqual( {
			metadata: [],
			classifiers: [],
		});

		expect(stepScope.saveErrorMessages).toEqual(undefined);

	});

	it('should not validate the form if author is not provided', function () {
		stepScope.model = {
			author: "",
			label: "ALabel",
			organisation: "AnOrganisation"
		};
		stepScope.$digest();
		expect(stepScope.detailForm.$valid).toBeFalsy();
	});

	it('should not validate the form if label is not provided', function () {
		stepScope.model = {
			author: "AnAuthor",
			label: "",
			organisation: "AnOrganisation"
		};
		stepScope.$digest();
		expect(stepScope.detailForm.$valid).toBeFalsy();
	});

	it('should not validate the form if organisation is not provided', function () {
		stepScope.model = {
			author: "AnAuthor",
			label: "ALabel",
			organisation: ""
		};
		stepScope.$digest();
		expect(stepScope.detailForm.$valid).toBeFalsy();
	});


	it('type selector should be displayed', function () {
		stepScope.model = {
			author: "AAuthor",
			label: "ALabel",
			newElementType: "dataModel"
		};
		stepScope.$digest();
		expect(jQuery(stepElement[0]).find("tr.type:not(.ng-hide)").length).toBe(1);
	});

});
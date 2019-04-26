import {mock} from '../../_globalMock';

describe('Controller: newDataElementCtrl (wizard:Step 0)', function () {

	var $rootScope,

		step,
		multiStepForm,
		formStepElement,

		mainWizardController,

		stepScope,
		stepElement,

		resources,
		$stateParams,
		$state,
		$httpBackend;


    mock.init();
	//load step1
	beforeEach(angular.mock.module('views/newDataElement/step0.html'));
    beforeEach(angular.mock.module('./foldersTree2.html'));
    beforeEach(angular.mock.module('./modelSelectorTree.html'));

	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
		$httpBackend = _$httpBackend_;
	}));


	beforeEach(inject(function (_$rootScope_, _multiStepForm_, FormStep, _formStepElement_, _$templateCache_, _$window_, $controller, _resources_, $q, _$stateParams_,_securityHandler_, _$httpBackend_) {

		//load the template
		var tempHTML = _$templateCache_.get('views/newDataElement/step0.html');
		$rootScope = _$rootScope_;

        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));

        //https://github.com/troch/angular-multi-step-form/blob/master/tests/form-step-element-factory.spec.js
		// Multi step form factory (function)
		multiStepForm = _multiStepForm_;
		// Form step element factory
		formStepElement = _formStepElement_;
		//for mocking calls to resources
		resources = _resources_;
		$stateParams = _$stateParams_;


        $stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";
        $stateParams.parentDataClassId = "DEFAULT-PARENT-DC-ID";
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/tree/').respond([]);
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/dataClasses/DEFAULT-PARENT-DC-ID/').respond({});
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/dataTypes').respond({});





        //Create steps using FormStep factory and pass its controller, it is does not have a controller, we can pass a default one
		//controller = ['multiStepFormInstance', function (multiStepFormInstance) {
		//	this.name = "It's me, Mario!";
		//  this.multiStepFormInstance = multiStepFormInstance;
		//}];
		//https://github.com/troch/angular-multi-step-form/blob/master/tests/form-step-element-factory.spec.js
		step = new FormStep({title: 'Step 1', template: tempHTML, controller: "newDataElementStep0Ctrl"});

        $rootScope.model = {
            metadata: [],
            dataType: undefined,
            description: undefined,
            classifiers: [],
            parentDataModel: {id:$stateParams.parentDataModelId},
            parentDataClass: {id:$stateParams.parentDataClassId},
            createType:"new",
            copyFromDataClass:[],
            selectedDataElements:[],
        };
		formStepElement(step, multiStepForm(), $rootScope)
			.then(function (data) {
				//get step scope
				stepScope = data.scope;
				//get step element (HTML node)
				stepElement = data.element;
			});

        $rootScope.$digest();
	}));


    it('Validate checks if Step0 is valid', function () {
        expect(stepScope.validate()).toBeTruthy();

        stepScope.model.createType = 'copy';
        expect(stepScope.validate()).toBeFalsy();

        stepScope.model.createType = 'copy';
        stepScope.model.copyFromDataClass = [{id:1,label:'selected-DataModel'}];
        expect(stepScope.validate()).toBeTruthy();
    });



});

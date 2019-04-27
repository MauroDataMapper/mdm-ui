import {mock} from '../../_globalMock';

describe('Controller: newDataType (wizard:Step 1)', function () {
	var $rootScope, step, multiStepForm, formStepElement,
		mainWizardController, $httpBackend, stepScope, stepElement, resources, $q, ngToast,$state, elementTypes, $stateParams;

    mock.init();
	beforeEach(angular.mock.module('views/newDataType/step1.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./moreDescription.html'));
    beforeEach(angular.mock.module('./elementDataType.html'));
    beforeEach(angular.mock.module('./elementClassifications.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./newDataTypeInline.html'));
    beforeEach(angular.mock.module('./enumerationListWithCategory.html'));
    beforeEach(angular.mock.module('./modelPath.html'));
    beforeEach(angular.mock.module('./modelSelectorTree.html'));
    beforeEach(angular.mock.module('./foldersTree2.html'));


	beforeEach(inject(function(_$rootScope_, _multiStepForm_, FormStep, _formStepElement_,_$templateCache_,_$window_,$controller, _$httpBackend_,_resources_, _$q_,_ngToast_,_$state_, _elementTypes_,_$stateParams_) {
		//load the template
		var tempHTML = _$templateCache_.get('views/newDataType/step1.html');
		$rootScope = _$rootScope_;
		resources = _resources_;
		$q = _$q_;
		ngToast = _ngToast_;
		$state = _$state_;
        elementTypes = _elementTypes_;

		_$httpBackend_.whenGET('views/home.html').respond(200, '');
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/terminologies/').respond([]);
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);


        $stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/').respond({});


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
		step = new FormStep({title: 'Step 1', template: tempHTML, controller: "newDataTypeStep1Ctrl"});

        $rootScope.model =  {
            metadata: [],
            dataType: "PrimitiveType",
            enumerationValues: [],
            classifiers: [],

            createType:"new",
            copyFromDataModel:[],
            selectedDataTypes:[],

            parentDataModel: {id:"Parent-DM-ID", domainType:"DataModel"}
        };
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
		mainWizardController = $controller('newDataTypeCtrl', {$scope: stepScope, $window:_$window_});

	}));


    it('Validate for New Data Type Mode', function () {
        var testCases = [
            {label: "",  dataType:"PrimitiveType"},
            {label: "A", dataType:null},
            {label: "A", dataType:"EnumerationType", enumerationValues:[]},
            {label: "A", dataType:"ReferenceType",   referencedDataClass:null}

        ];
        angular.forEach(testCases, function (testCase) {
            var result = stepScope.validate(testCase);
            expect(result).toBeFalsy();
        });
    });

    it('Validate Copy Data Type Mode', function () {
        stepScope.model.createType = 'copy';
        stepScope.model.selectedDataTypes = [];
        expect(stepScope.validate({})).toBeFalsy();

        stepScope.model.createType = 'copy';
        stepScope.model.selectedDataTypes = [{id:1,label:"A-DT"}];
        expect(stepScope.validate({})).toBeTruthy();
    });

    it('handleNewDataTypeInlineUpdated runs validate and sets model validity', function () {
        stepScope.model.createType = 'new';
        spyOn(stepScope,"validate").and.returnValue({});
        stepScope.handleNewDataTypeInlineUpdated({isValid:false});
        expect(stepScope.validate).toHaveBeenCalled();
        expect(stepScope.model.isValid).toEqual(false);
    });

});
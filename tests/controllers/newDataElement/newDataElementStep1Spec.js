import {mock} from '../../_globalMock';

describe('Controller: newDataElementCtrl (wizard:Step 1)', function () {

    var $rootScope,

        step,
        multiStepForm,
        formStepElement,

        mainWizardController,
        $q,

        stepScope,
        stepElement,

        resources,
        $stateParams,
        $state,
        $httpBackend;


    mock.init();
    //load step1
    beforeEach(angular.mock.module('views/newDataElement/step1.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./moreDescription.html'));
    beforeEach(angular.mock.module('./elementDataType.html'));
    beforeEach(angular.mock.module('./modelPath.html'));
    beforeEach(angular.mock.module('./elementClassifications.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));


    beforeEach(inject(function (_$httpBackend_) {
        _$httpBackend_.whenGET('views/home.html').respond(200, '');
        $httpBackend = _$httpBackend_;
    }));


    beforeEach(inject(function (_$rootScope_, _multiStepForm_, FormStep, _formStepElement_, _$templateCache_, _$window_, $controller, _resources_, _$q_, _$stateParams_, _securityHandler_, _$httpBackend_) {

        //load the template
        var tempHTML = _$templateCache_.get('views/newDataElement/step1.html');
        $rootScope = _$rootScope_;
        $q= _$q_;


        $stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";
        $stateParams.parentDataClassId = "DEFAULT-PARENT-DC-ID";
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/dataTypes').respond({});
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/dataClasses/DEFAULT-PARENT-DC-ID/').respond({});


        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));

        //https://github.com/troch/angular-multi-step-form/blob/master/tests/form-step-element-factory.spec.js
        // Multi step form factory (function)
        multiStepForm = _multiStepForm_;
        // Form step element factory
        formStepElement = _formStepElement_;
        //for mocking calls to resources
        resources = _resources_;
        $stateParams = _$stateParams_;


        $httpBackend.expect("GET", $rootScope.backendURL + '/dataModels/dataTypes').respond([]);


        //Create steps using FormStep factory and pass its controller, it is does not have a controller, we can pass a default one
        //controller = ['multiStepFormInstance', function (multiStepFormInstance) {
        //	this.name = "It's me, Mario!";
        //  this.multiStepFormInstance = multiStepFormInstance;
        //}];
        //https://github.com/troch/angular-multi-step-form/blob/master/tests/form-step-element-factory.spec.js
        step = new FormStep({title: 'Step 1', template: tempHTML, controller: "newDataElementStep1Ctrl"});


        $rootScope.model = {
            metadata: [],
            dataType: undefined,
            description: undefined,
            classifiers: [],
            parentDataModel: {id: $stateParams.parentDataModelId},
            parentDataClass: {id: $stateParams.parentDataClassId},
            createType: "new",
            copyFromDataClass: [],
            selectedDataElements: [],
        };
        formStepElement(step, multiStepForm(), $rootScope)
            .then(function (data) {
                //get step scope
                stepScope = data.scope;
                //get step element (HTML node)
                stepElement = data.element;
            });

        $rootScope.$digest();
        //mock returning all classifiers for classification selector
        $httpBackend.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);

    }));


    it('Validate for New Data Element Mode', function () {
        stepScope.model.showNewInlineDataType = false;
        var testCases = [
            {label: "A", dataType: undefined, minMultiplicity: "1", maxMultiplicity: "2"},
            {label: "", dataType: {id: 1}, minMultiplicity: "1", maxMultiplicity: "2"},
            {label: "A", dataType: {id: 1}, minMultiplicity: "", maxMultiplicity: "2"},
            {label: "A", dataType: {id: 1}, minMultiplicity: "1", maxMultiplicity: ""}
        ];
        angular.forEach(testCases, function (testCase) {
            var result = stepScope.validate(testCase);
            expect(result).toBeFalsy();
        });
    });

    it('Validate for New Data Element Mode When also adding an inline DataType', function () {
        stepScope.model.showNewInlineDataType = true;
        stepScope.model.inlineDataTypeValid = true;
        var result = stepScope.validate({label: "A"});
        expect(result).toBeTruthy();

        stepScope.model.showNewInlineDataType = true;
        stepScope.model.inlineDataTypeValid = false;
        result = stepScope.validate({label: "A"});
        expect(result).toBeFalsy();

    });


    it('Validate Copy Data Element Mode', function () {
        stepScope.model.createType = 'copy';
        stepScope.model.selectedDataElements = [];
        expect(stepScope.validate({})).toBeFalsy();

        stepScope.model.createType = 'copy';
        stepScope.model.selectedDataElements = [{id:1,label:"A-DE"}];
        expect(stepScope.validate({})).toBeTruthy();
    });


    it('If Mode is New Data Element, it should check if Data Types exists', function () {
        spyOn(resources.dataModel, 'get').and.returnValue($q.when({count:1}));

        stepScope.model.createType = 'new';
        stepScope.init();
        $rootScope.$digest();

        expect(stepScope.hasDataTypes).toBeTruthy();
        expect(resources.dataModel.get).toHaveBeenCalledWith(stepScope.model.parentDataModel.id, "dataTypes");
    });

    it('add will add selected Data Element into the list', function () {
        stepScope.model.createType = 'copy';

        stepScope.model.selectedDataElements = [
            {id:1, label:"A1"},
            {id:2, label:"A2"},];

        var record = {id:3, label:"A3"};

        stepScope.add(record);

        expect(stepScope.model.selectedDataElements.length).toBe(3);
        expect(stepScope.selectedDataElementsStr).toEqual("<div>A1</div><div>A2</div><div>A3</div>");
    });

    it('add will remove selected Data Element from the list if it already exists', function () {
        stepScope.model.createType = 'copy';

        stepScope.model.selectedDataElements = [
            {id:1, label:"A1"},
            {id:2, label:"A2"},];

        var record = {id:1, label:"A1"};

        stepScope.add(record);

        expect(stepScope.model.selectedDataElements.length).toBe(1);
        expect(stepScope.selectedDataElementsStr).toEqual("<div>A2</div>");
    });

});

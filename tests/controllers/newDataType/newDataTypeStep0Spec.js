import {mock} from '../../_globalMock';

describe('Controller: newDataType (wizard:Step 0)', function () {
    var $rootScope, step, multiStepForm, formStepElement,
        mainWizardController, $httpBackend, stepScope, stepElement, resources, $q, ngToast, $state, $stateParams;

    mock.init();
    beforeEach(angular.mock.module('views/newDataType/step0.html'));
    beforeEach(angular.mock.module('./modelSelectorTree.html'));
    beforeEach(angular.mock.module('./foldersTree2.html'));

    beforeEach(inject(function (_$rootScope_, _multiStepForm_, FormStep, _formStepElement_, _$templateCache_, _$window_, $controller, _$httpBackend_, _resources_, _$q_, _ngToast_, _$state_, _$stateParams_) {
        var tempHTML = _$templateCache_.get('views/newDataType/step0.html');
        $rootScope = _$rootScope_;
        resources = _resources_;
        $q = _$q_;
        ngToast = _ngToast_;
        $state = _$state_;

        $stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/tree/').respond([]);
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/').respond({});


        _$httpBackend_.whenGET('views/home.html').respond(200, '');
        $httpBackend = _$httpBackend_;

        multiStepForm = _multiStepForm_;
        formStepElement = _formStepElement_;


        _$httpBackend_.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);

        step = new FormStep({title: 'Step 0', template: tempHTML, controller: "newDataTypeStep0Ctrl"});

        $rootScope.model = {
            metadata: [],
            dataType: "PrimitiveType",
            enumerationValues: [],
            classifiers: [],

            createType: "new",
            copyFromDataModel: [],
            selectedDataTypes: []
        };

        formStepElement(step, multiStepForm(), $rootScope)
            .then(function (data) {
                //get step scope
                stepScope = data.scope;
                //get step element (HTML node)
                stepElement = data.element;
            });

        $rootScope.$digest();
        mainWizardController = $controller('newDataTypeCtrl', {$scope: stepScope, $window: _$window_});
    }));


    it('Validate checks if Step0 is valid', function () {
        expect(stepScope.validate()).toBeTruthy();

        stepScope.model.createType = 'copy';
        expect(stepScope.validate()).toBeFalsy();

        stepScope.model.createType = 'copy';
        stepScope.model.copyFromDataModel = [{id: 1, label: 'selected-DataModel'}];
        expect(stepScope.validate()).toBeTruthy();
    });

});
import {mock} from '../../_globalMock';

describe('Controller: newDataClass (wizard:Step 0)', function () {
    var $rootScope, step, multiStepForm, formStepElement,
        mainWizardController, $httpBackend, stepScope, stepElement, resources, $q, ngToast, $state, $stateParams;

    mock.init();
    beforeEach(angular.mock.module('views/newDataClass/step0.html'));


    beforeEach(inject(function (_$rootScope_, _multiStepForm_, FormStep, _formStepElement_, _$templateCache_, _$window_, $controller, _$httpBackend_, _resources_, _$q_, _ngToast_, _$state_, _securityHandler_, _$stateParams_) {
        var tempHTML = _$templateCache_.get('views/newDataClass/step0.html');
        $rootScope = _$rootScope_;
        resources = _resources_;
        $q = _$q_;
        ngToast = _ngToast_;
        $state = _$state_;

        $stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/').respond({});


        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));

        _$httpBackend_.whenGET('views/home.html').respond(200, '');
        $httpBackend = _$httpBackend_;

        $httpBackend.expect("GET", $rootScope.backendURL + '/tree/').respond([]);

        multiStepForm = _multiStepForm_;
        formStepElement = _formStepElement_;

        step = new FormStep({title: 'Step 0', template: tempHTML, controller: "newDataClassStep0Ctrl"});

        formStepElement(step, multiStepForm(), $rootScope)
            .then(function (data) {
                //get step scope
                stepScope = data.scope;
                //get step element (HTML node)
                stepElement = data.element;
            });

        $rootScope.$digest();
        mainWizardController = $controller('newDataClassCtrl', {$scope: stepScope, $window: _$window_});

    }));

    it('Wizard form and its models are initialized properly', function () {
        expect(mainWizardController).toBeDefined();
        expect(stepElement).toBeDefined();
        expect(stepScope.model).toBeDefined();
        expect(stepScope.model.metadata).toEqual([]);
        expect(stepScope.model.classifiers).toEqual([]);
        expect(stepScope.model.createType).toEqual('new');
    });

    it('Validate checks if Step0 is valid', function () {
        expect(stepScope.validate()).toBeTruthy();

        stepScope.model.createType = 'copy';
        expect(stepScope.validate()).toBeFalsy();

        stepScope.model.createType = 'copy';
        stepScope.model.copyFromDataModel = [{id:1,label:'selected-DataModel'}];
        expect(stepScope.validate()).toBeTruthy();

    });

    it('Selecting a dataModel will reset list of selected DataTypes', function () {
        stepScope.model.selectedDataTypes = [{id:1, label:"some-dt1"}, {id:2, label:"some-dt2"}];
        expect(stepScope.model.selectedDataTypes.length).toBe(2);
        stepScope.onSelect();
        expect(stepScope.model.selectedDataTypes.length).toBe(0);
    });

});
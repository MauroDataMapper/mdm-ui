import {mock} from '../../_globalMock';

describe('Controller: newDataClass (wizard:Step 1)', function () {
    var $rootScope, step, multiStepForm, formStepElement,
        mainWizardController, $httpBackend, stepScope, stepElement, resources, $q, ngToast, $state, $stateParams;

    mock.init();
    beforeEach(angular.mock.module('views/newDataClass/step1.html'));
    beforeEach(angular.mock.module('./modelPath.html'));
    beforeEach(angular.mock.module('./elementClassifications.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./modelSelectorTree.html'));
    beforeEach(angular.mock.module('./foldersTree2.html'));

    beforeEach(inject(function (_$rootScope_, _multiStepForm_, FormStep, _formStepElement_, _$templateCache_, _$window_, $controller, _$httpBackend_, _resources_, _$q_, _ngToast_, _$state_, _securityHandler_, _$stateParams_) {
debugger
    	var tempHTML = _$templateCache_.get('views/newDataClass/step1.html');
        $rootScope = _$rootScope_;
        resources = _resources_;
        $q = _$q_;
        ngToast = _ngToast_;
        $state = _$state_;


        $stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/').respond({});


        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));

        _$httpBackend_.whenGET('views/home.html').respond(200, '');
        $httpBackend = _$httpBackend_;



        multiStepForm = _multiStepForm_;
        formStepElement = _formStepElement_;

        step = new FormStep({title: 'Step 0', template: tempHTML, controller: "newDataClassStep1Ctrl"});

        $rootScope.model = {
            metadata: [],
            classifiers: [],

            createType:"new",
            copyFromDataModel:[],

            selectedDataClasses:[],
            selectedDataClassesMap:{}
        };

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

    it('Validate New Data Class Mode', function () {
        stepScope.model.createType = 'new';
        stepScope.multiplicityError = true;
        var newValue = {label:""};
        expect(stepScope.validate(newValue)).toBeFalsy();


        stepScope.model.createType = 'new';
        stepScope.multiplicityError = true;
        newValue = {label:"A-Label", minMultiplicity:null, maxMultiplicity:null};
        expect(stepScope.validate(newValue)).toBeTruthy();


        stepScope.model.createType = 'copy';
        stepScope.model.selectedDataClasses = [];
        expect(stepScope.validate({})).toBeFalsy();

        stepScope.model.createType = 'copy';
        stepScope.model.selectedDataClasses = [{id:1,label:"a-dc"}];
        expect(stepScope.validate({})).toBeTruthy();
    });

    it('Validate Copy Data Class Mode', function () {
        stepScope.model.createType = 'copy';
        stepScope.model.selectedDataClasses = [];
        expect(stepScope.validate({})).toBeFalsy();

        stepScope.model.createType = 'copy';
        stepScope.model.selectedDataClasses = [{id:1,label:"a-dc"}];
        expect(stepScope.validate({})).toBeTruthy();
    });


});

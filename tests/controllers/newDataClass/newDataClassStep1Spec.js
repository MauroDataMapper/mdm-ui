import {mock} from '../../_globalMock';

describe('Controller: newDataClass (wizard:Step 1)', function () {
    var $rootScope, step, multiStepForm, formStepElement,
        mainWizardController, $httpBackend, stepScope, stepElement, resources, $q, ngToast, $state, $stateParams, messageHandler;

    mock.init();
    beforeEach(angular.mock.module('views/newDataClass/step1.html'));
    beforeEach(angular.mock.module('./modelPath.html'));
    beforeEach(angular.mock.module('./elementClassifications.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./modelSelectorTree.html'));
    beforeEach(angular.mock.module('./foldersTree2.html'));

    //AS
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./moreDescription.html'));
    beforeEach(angular.mock.module('./dataSetMetadata.html'));
    beforeEach(angular.mock.module('./markdownTextArea.html'));

    beforeEach(inject(function (_$rootScope_, _multiStepForm_, FormStep, _formStepElement_, _$templateCache_, _$window_, $controller, _$httpBackend_, _resources_, _$q_, _ngToast_, _$state_, _securityHandler_, _$stateParams_ , _messageHandler_) {

    	var tempHTML = _$templateCache_.get('views/newDataClass/step1.html');
        $rootScope = _$rootScope_;
        resources = _resources_;
        $q = _$q_;
        ngToast = _ngToast_;
        messageHandler = _messageHandler_;
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

    //AS
    it("saveNewDataClass adds a DataClass to a DataModel", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn($state, 'go').and.returnValue({});
        spyOn($rootScope, '$broadcast').and.returnValue({});

        spyOn(resources.dataModel, 'post').and.callFake(function() {
            return $q.when({
                id:'NEWLY-CREATED-DATA-CLASS-ID',
                dataModel:"DM-ID"
            });
        });

        stepScope.model = {
            createType : 'new',
            parent:{id:"DM-ID", domainType:"DataModel"},
            label: "ALabel",
            description: "ADescription",
            metadata:[],
            classifiers:[],
            minMultiplicity:"1",
            maxMultiplicity:"-1"
        };
        stepScope.$digest();
        stepScope.save();
        stepScope.$digest();

        var resource = {
            label: "ALabel",
            description: "ADescription",
            metadata:[],
            classifiers:[],
            minMultiplicity:1,
            maxMultiplicity:-1
        };
        expect(resources.dataModel.post).toHaveBeenCalledWith(stepScope.model.parent.id, "dataClasses", {resource:resource});
        expect($rootScope.$broadcast).toHaveBeenCalledWith('$reloadFoldersTree');
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Class saved successfully.');
        expect($state.go).toHaveBeenCalledWith(
            "appContainer.mainApp.twoSidePanel.catalogue.dataClass",
            {
                dataModelId: "DM-ID",
                dataClassId:undefined,
                id: 'NEWLY-CREATED-DATA-CLASS-ID'
            },
            {reload: true, location: true});
    });

    it("saveNewDataClass adds a DataClass to a DataClass", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn($state, 'go').and.returnValue({});
        spyOn($rootScope, '$broadcast').and.returnValue({});

        spyOn(resources.dataClass, 'post').and.callFake(function() {
            return $q.when({
                id:'NEWLY-CREATED-DATA-CLASS-ID',
                dataModel:"DM-ID",
                parentDataClass:"P-DC-ID"
            });
        });

        stepScope.model = {
            createType : 'new',
            parent:{id:"P-DC-ID", domainType:"DataClass",dataModel:"DM-ID"},
            label: "ALabel",
            description: "ADescription",
            metadata:[],
            classifiers:[],
            minMultiplicity:"1",
            maxMultiplicity:"-1"
        };
        stepScope.$digest();
        stepScope.save();
        stepScope.$digest();

        var resource = {
            label: "ALabel",
            description: "ADescription",
            metadata:[],
            classifiers:[],
            minMultiplicity:1,
            maxMultiplicity:-1
        };
        expect(resources.dataClass.post).toHaveBeenCalledWith(stepScope.model.parent.dataModel, stepScope.model.parent.id,"dataClasses", {resource:resource});
        expect($rootScope.$broadcast).toHaveBeenCalledWith('$reloadFoldersTree');

        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Class saved successfully.');
        expect($state.go).toHaveBeenCalledWith(
            "appContainer.mainApp.twoSidePanel.catalogue.dataClass",
            {
                dataModelId: "DM-ID",
                dataClassId: "P-DC-ID",
                id: 'NEWLY-CREATED-DATA-CLASS-ID'
            },
            {reload: true, location: true});
    });

    it("Failure in save will show proper error message", function () {
        spyOn(messageHandler, 'showError').and.returnValue({});
        spyOn($state, 'go').and.returnValue({});

        spyOn(resources.dataModel, 'post').and.callFake(function() {
            return $q.reject({});
        });

        //update the fields in the UI
        stepScope.model = {
            createType : 'new',
            parent:{id:"DM-ID", domainType:"DataModel"},
            label: "ALabel",
            description: "ADescription",
            metadata:[],
            classifiers:[],
            minMultiplicity:"2",
            maxMultiplicity:"2"
        };
        stepScope.$digest();

        //save button is pressed
        stepScope.save();
        stepScope.$digest();

        var resource = {
            label: "ALabel",
            description: "ADescription",
            minMultiplicity:2,
            maxMultiplicity:2,
            metadata:[],
            classifiers:[]
        };
        expect(resources.dataModel.post).toHaveBeenCalledWith(stepScope.model.parent.id, "dataClasses", {resource:resource});
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem saving the Data Class.',{});
        expect($state.go).not.toHaveBeenCalledWith(
            "appContainer.mainApp.twoSidePanel.catalogue.dataClass",
            {id: 'NEWLY-CREATED-DATA-CLASS-ID'},
            {reload: true, location: true});
    });


});

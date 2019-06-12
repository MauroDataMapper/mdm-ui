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
        messageHandler,
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
    beforeEach(angular.mock.module('./newDataTypeInline.html'));
    beforeEach(angular.mock.module('./modelSelectorTree.html'));
    beforeEach(angular.mock.module('./enumerationListWithCategory.html'));
    beforeEach(angular.mock.module('./modelPath.html'));
    beforeEach(angular.mock.module('./foldersTree2.html'));

    //AS
    beforeEach(angular.mock.module('./dataSetMetadata.html'));
    beforeEach(angular.mock.module('./markdownTextArea.html'));


    beforeEach(inject(function (_$httpBackend_) {
        _$httpBackend_.whenGET('views/home.html').respond(200, '');
        $httpBackend = _$httpBackend_;
    }));


    beforeEach(inject(function (_$rootScope_, _multiStepForm_, FormStep, _formStepElement_, _$templateCache_, _$window_, $controller, _resources_, _$q_,_$state_, _$stateParams_, _securityHandler_, _$httpBackend_, _messageHandler_) {

        //load the template
        var tempHTML = _$templateCache_.get('views/newDataElement/step1.html');
        $rootScope = _$rootScope_;
        $rootScope.simpleViewSupport = false;
        $q= _$q_;
        messageHandler = _messageHandler_;
        $state = _$state_;
        $stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";
        $stateParams.parentDataClassId = "DEFAULT-PARENT-DC-ID";
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/dataTypes').respond({});
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/dataClasses/DEFAULT-PARENT-DC-ID/').respond({});

        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/dataTypes').respond({});

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

    //AS

    // it("saveNewDataType saves a newly added DataType", function () {
    //     //Save successfully happens
    //     debugger
    //     spyOn(resources.dataModel, 'post').and.returnValue($q.when());
    //     stepScope.model = {
    //         parentDataModel:{id:"PARENT-DM-ID"},
    //         newlyAddedDataType:{
    //             label:"NEW-DT-LABEL",
    //             description:"NEW-DT-DESC",
    //             organisation:"NEW-DT-ORG",
    //             domainType:"PrimitiveType",
    //             enumerationValues:[],
    //             classifiers:[],
    //             metadata:[
    //                 {key:"1", value:"1", namespace:"1"},
    //                 {key:"2", value:"2", namespace:"2"},
    //             ]
    //         }
    //     };
    //     stepScope.$digest();
    //
    //     //save button is pressed
    //     stepScope.saveNewDataType();
    //     stepScope.$digest();
    //
    //     var resource = {
    //         label:"NEW-DT-LABEL",
    //         description:"NEW-DT-DESC",
    //         organisation:"NEW-DT-ORG",
    //         domainType:"PrimitiveType",
    //         referenceClass: {id:null},
    //         terminology: {id:null},
    //         classifiers:[],
    //         enumerationValues:[],
    //         metadata:[
    //             {key:"1", value:"1", namespace:"1"},
    //             {key:"2", value:"2", namespace:"2"},
    //         ]
    //     };
    //     expect(resources.dataModel.post).toHaveBeenCalledWith("PARENT-DM-ID", 'dataTypes',  {resource:resource});
    // });
    //
    // it("saveNewDE_DT saves newly added DataType", function () {
    //     spyOn(stepScope,"saveNewDataType").and.returnValue($q.when({id:"DT-ID"}));
    //     spyOn(stepScope,"saveNewDataElement").and.returnValue($q.when());
    //
    //     stepScope.model.showNewInlineDataType = true;
    //     stepScope.saveNewDE_DT();
    //
    //     stepScope.$digest();
    //     expect(stepScope.model.dataType).toEqual({id:"DT-ID"});
    //     expect(stepScope.saveNewDataType).toHaveBeenCalled();
    //     expect(stepScope.saveNewDataElement).toHaveBeenCalled();
    // });
    //
    // it("saveNewDE_DT saves Data Element When it does NOT have a newly added DataType", function () {
    //     spyOn(stepScope,"saveNewDataType").and.returnValue($q.when({id:"DT-ID"}));
    //     spyOn(stepScope,"saveNewDataElement").and.returnValue($q.when());
    //
    //     stepScope.model.showNewInlineDataType = false;
    //     stepScope.saveNewDE_DT();
    //
    //     stepScope.$digest();
    //     expect(stepScope.saveNewDataType).not.toHaveBeenCalled();
    //     expect(stepScope.saveNewDataElement).toHaveBeenCalled();
    // });
    //
    //
    // it("saveNewDataElement adds a new Data Element to a DataClass", function () {
    //     spyOn(messageHandler, 'showSuccess').and.returnValue({});
    //     spyOn($state, 'go').and.returnValue({});
    //
    //     //Save successfully happens
    //     spyOn(resources.dataClass, 'post').and.callFake(function() {
    //         return $q.when(
    //             {
    //                 id:'NEWLY-CREATED-DATA-ELEMENT-ID',
    //                 dataModel:"Response-DM-ID",
    //                 dataClass:"Response-DC-ID"
    //             });
    //     });
    //
    //     stepScope.model = {
    //         createType: 'new',
    //         label: "ALabel",
    //         description: "ADescription",
    //         parentDataModel:{id:"P-DM-ID"},
    //         parentDataClass:{id:"P-DC-ID"},
    //         dataType:{
    //             id:"DATA-TYPE-ID"
    //         },
    //         classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
    //         metadata:[{key:'key1', value:'value1', namespace: 'n1'},{key:'key2', value:'value2', namespace: 'n2'}],
    //         minMultiplicity:"1",
    //         maxMultiplicity:"-1"
    //     };
    //     stepScope.parentDataClassId = "PARENT-ID";
    //
    //     stepScope.$digest();
    //
    //     //save button is pressed
    //     stepScope.saveNewDataElement();
    //     stepScope.$digest();
    //
    //     var resource = {
    //         label: "ALabel",
    //         description: "ADescription",
    //         dataType:{id:"DATA-TYPE-ID"},
    //         minMultiplicity:1,
    //         maxMultiplicity:-1,
    //         classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
    //         metadata:[{key:'key1', value:'value1', namespace: 'n1'},{key:'key2', value:'value2', namespace: 'n2'}],
    //     };
    //     expect(resources.dataClass.post).toHaveBeenCalledWith("P-DM-ID", "P-DC-ID", "dataElements", {resource:resource});
    //     expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Element saved successfully.');
    //     expect($state.go).toHaveBeenCalledWith(
    //         "appContainer.mainApp.twoSidePanel.catalogue.dataElement",
    //         {
    //             id: 'NEWLY-CREATED-DATA-ELEMENT-ID',
    //             dataModelId: "Response-DM-ID",
    //             dataClassId: "Response-DC-ID"
    //         },
    //         {reload: true, location: true});
    // });
    //
    // it("Failure in dataElement saving will show proper error message", function () {
    //     spyOn(messageHandler, 'showError').and.returnValue({});
    //     spyOn($state, 'go').and.returnValue({});
    //
    //     spyOn(resources.dataClass, 'post').and.callFake(function() {
    //         return $q.reject({error:"ERROR"});
    //     });
    //
    //     stepScope.allDataTypesCount = 10;
    //     stepScope.showNewInlineDataType = false;
    //
    //     stepScope.model = {
    //         createType: 'new',
    //         label: "ALabel",
    //         description: "ADescription",
    //         parentDataModel:{id:"P-DM-ID"},
    //         parentDataClass:{id:"P-DC-ID"},
    //         dataType:{
    //             id:"DATA-TYPE-ID"
    //         },
    //         classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
    //         metadata:[{key:'key1', value:'value1', namespace: 'n1'},{key:'key2', value:'value2', namespace: 'n2'}],
    //         minMultiplicity:"1",
    //         maxMultiplicity:"-1",
    //
    //         inlineDataTypeValid: false,
    //         showNewInlineDataType: false,
    //         newlyAddedDataType:{}
    //     };
    //     stepScope.parentDataClassId = "PARENT-ID";
    //
    //     stepScope.$digest();
    //
    //     //save button is pressed
    //     stepScope.save();
    //     stepScope.$digest();
    //
    //     var resource = {
    //         label: "ALabel",
    //         description: "ADescription",
    //         dataType:{id:"DATA-TYPE-ID"},
    //         minMultiplicity:1,
    //         maxMultiplicity:-1,
    //         classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
    //         metadata:[{key:'key1', value:'value1', namespace: 'n1'},{key:'key2', value:'value2', namespace: 'n2'}]
    //     };
    //     expect(resources.dataClass.post).toHaveBeenCalledWith("P-DM-ID", "P-DC-ID", "dataElements", {resource:resource});
    //     expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem saving the Data Element.', {error:"ERROR"});
    // });
    //
    // it("saveCopiedDataElements copies DataElement(s) to a DataClass", function () {
    //
    //     spyOn(resources.dataClass, 'post').and.callFake(function() {
    //         return $q.when({
    //             id:'NEWLY-CREATED-DATA-CLASS-ID',
    //         });
    //     });
    //
    //     stepScope.model = {
    //         createType : 'copy',
    //         parentDataModel: {id:"P-DM-ID", domainType:"DataModel"},
    //         parentDataClass: {id:"P-DC-ID", domainType:"DataClass"},
    //         selectedDataElements:[
    //             {id:111, label:"DE1", dataModel:"DE-P-DM-ID", dataClass:"DE-P-DC-ID", domainType:"DataElement", dataType:{id:1, label:"A-DT", domainType:"PrimitiveType", dataModel:"DM-1"}},
    //             {id:222, label:"DE2", dataModel:"DE-P-DM-ID", dataClass:"DE-P-DC-ID", domainType:"DataElement", dataType:{id:1, label:"A-DT", domainType:"PrimitiveType", dataModel:"DM-1"}},
    //             {id:333, label:"DE3", dataModel:"DE-P-DM-ID", dataClass:"DE-P-DC-ID", domainType:"DataElement", dataType:{id:1, label:"A-DT", domainType:"PrimitiveType", dataModel:"DM-1"}},
    //         ]
    //     };
    //
    //     stepScope.$digest();
    //     stepScope.save();
    //     stepScope.$digest();
    //
    //     expect(resources.dataClass.post.calls.count()).toBe(3);
    //     expect(resources.dataClass.post.calls.argsFor(0)).toEqual(["P-DM-ID", "P-DC-ID", "dataElements/DE-P-DM-ID/DE-P-DC-ID/111"]);
    //     expect(resources.dataClass.post.calls.argsFor(1)).toEqual(["P-DM-ID", "P-DC-ID", "dataElements/DE-P-DM-ID/DE-P-DC-ID/222"]);
    //     expect(resources.dataClass.post.calls.argsFor(2)).toEqual(["P-DM-ID", "P-DC-ID", "dataElements/DE-P-DM-ID/DE-P-DC-ID/333"]);
    //
    // });

});

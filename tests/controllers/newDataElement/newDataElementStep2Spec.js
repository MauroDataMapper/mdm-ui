import {mock} from '../../_globalMock';

describe('Controller: newDataElement (wizard:Step 2)', function () {
	var $rootScope, step, multiStepForm, formStepElement,
		mainWizardController, $httpBackend, stepScope, stepElement, resources, $q, messageHandler,$state,$stateParams;

    mock.init();
	beforeEach(angular.mock.module('views/newDataElement/step2.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./moreDescription.html'));
    beforeEach(angular.mock.module('./elementDataType.html'));
    beforeEach(angular.mock.module('./dataSetMetadata.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./markdownTextArea.html'));


	beforeEach(inject(function(_$rootScope_, _multiStepForm_, FormStep, _formStepElement_,_$templateCache_,_$window_,$controller, _$httpBackend_,_resources_, _$q_,_$state_,_securityHandler_,_$stateParams_,_messageHandler_) {
		//load the template
		var tempHTML = _$templateCache_.get('views/newDataElement/step2.html');
		$rootScope = _$rootScope_;
		$rootScope.simpleViewSupport = false;
		resources = _resources_;
		$q = _$q_;
		messageHandler = _messageHandler_;
		$state = _$state_;


        $stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";
        $stateParams.parentDataClassId = "DEFAULT-PARENT-DC-ID";
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/dataClasses/DEFAULT-PARENT-DC-ID/').respond({});
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/dataTypes').respond({});


        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));

        _$httpBackend_.whenGET('views/home.html').respond(200, '');
		$httpBackend = _$httpBackend_;

		//as classification directive loads all classifiers, we need to mock its call here
		$httpBackend.expect("GET", $rootScope.backendURL + '/metadata/namespaces/').respond([]);
		$httpBackend.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);

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
		step = new FormStep({title: 'Step 2', template: tempHTML, controller: "newDataElementStep2Ctrl"});

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
		mainWizardController = $controller('newDataElementCtrl', {$scope: stepScope, $window:_$window_});

	}));


    it("saveNewDataType saves a newly added DataType", function () {
        //Save successfully happens
        spyOn(resources.dataModel, 'post').and.returnValue($q.when());
        stepScope.model = {
            parentDataModel:{id:"PARENT-DM-ID"},
            newlyAddedDataType:{
                label:"NEW-DT-LABEL",
                description:"NEW-DT-DESC",
                organisation:"NEW-DT-ORG",
                domainType:"PrimitiveType",
                enumerationValues:[],
                classifiers:[],
                metadata:[
                    {key:"1", value:"1", namespace:"1"},
                    {key:"2", value:"2", namespace:"2"},
                ]
            }
        };
        stepScope.$digest();

        //save button is pressed
        stepScope.saveNewDataType();
        stepScope.$digest();

        var resource = {
            label:"NEW-DT-LABEL",
            description:"NEW-DT-DESC",
            organisation:"NEW-DT-ORG",
            domainType:"PrimitiveType",
            referenceClass: {id:null},
            terminology: {id:null},
            classifiers:[],
            enumerationValues:[],
            metadata:[
                {key:"1", value:"1", namespace:"1"},
                {key:"2", value:"2", namespace:"2"},
            ]
        };
        expect(resources.dataModel.post).toHaveBeenCalledWith("PARENT-DM-ID", 'dataTypes',  {resource:resource});
    });

    it("saveNewDE_DT saves newly added DataType", function () {
        spyOn(stepScope,"saveNewDataType").and.returnValue($q.when({id:"DT-ID"}));
        spyOn(stepScope,"saveNewDataElement").and.returnValue($q.when());

        stepScope.model.showNewInlineDataType = true;
        stepScope.saveNewDE_DT();

        stepScope.$digest();
        expect(stepScope.model.dataType).toEqual({id:"DT-ID"});
        expect(stepScope.saveNewDataType).toHaveBeenCalled();
        expect(stepScope.saveNewDataElement).toHaveBeenCalled();
    });

    it("saveNewDE_DT saves Data Element When it does NOT have a newly added DataType", function () {
        spyOn(stepScope,"saveNewDataType").and.returnValue($q.when({id:"DT-ID"}));
        spyOn(stepScope,"saveNewDataElement").and.returnValue($q.when());

        stepScope.model.showNewInlineDataType = false;
        stepScope.saveNewDE_DT();

        stepScope.$digest();
        expect(stepScope.saveNewDataType).not.toHaveBeenCalled();
        expect(stepScope.saveNewDataElement).toHaveBeenCalled();
    });


    it("saveNewDataElement adds a new Data Element to a DataClass", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
		spyOn($state, 'go').and.returnValue({});

		//Save successfully happens
		spyOn(resources.dataClass, 'post').and.callFake(function() {
			return $q.when(
				{
					id:'NEWLY-CREATED-DATA-ELEMENT-ID',
					dataModel:"Response-DM-ID",
                    dataClass:"Response-DC-ID"
				});
		});

		stepScope.model = {
            createType: 'new',
			label: "ALabel",
			description: "ADescription",
            parentDataModel:{id:"P-DM-ID"},
            parentDataClass:{id:"P-DC-ID"},
			dataType:{
				id:"DATA-TYPE-ID"
			},
            classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
            metadata:[{key:'key1', value:'value1', namespace: 'n1'},{key:'key2', value:'value2', namespace: 'n2'}],
            minMultiplicity:"1",
            maxMultiplicity:"-1"
		};
		stepScope.parentDataClassId = "PARENT-ID";

		stepScope.$digest();

		//save button is pressed
		stepScope.saveNewDataElement();
		stepScope.$digest();

		var resource = {
			label: "ALabel",
			description: "ADescription",
			dataType:{id:"DATA-TYPE-ID"},
            minMultiplicity:1,
            maxMultiplicity:-1,
            classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
            metadata:[{key:'key1', value:'value1', namespace: 'n1'},{key:'key2', value:'value2', namespace: 'n2'}],
        };
		expect(resources.dataClass.post).toHaveBeenCalledWith("P-DM-ID", "P-DC-ID", "dataElements", {resource:resource});
		expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Element saved successfully.');
		expect($state.go).toHaveBeenCalledWith(
			"appContainer.mainApp.twoSidePanel.catalogue.dataElement",
			{
				id: 'NEWLY-CREATED-DATA-ELEMENT-ID',
                dataModelId: "Response-DM-ID",
                dataClassId: "Response-DC-ID"
			},
			{reload: true, location: true});
	});

	it("Failure in dataElement saving will show proper error message", function () {
		spyOn(messageHandler, 'showError').and.returnValue({});
		spyOn($state, 'go').and.returnValue({});

        spyOn(resources.dataClass, 'post').and.callFake(function() {
			return $q.reject({error:"ERROR"});
		});

        stepScope.allDataTypesCount = 10;
		stepScope.showNewInlineDataType = false;

        stepScope.model = {
            createType: 'new',
            label: "ALabel",
            description: "ADescription",
            parentDataModel:{id:"P-DM-ID"},
            parentDataClass:{id:"P-DC-ID"},
            dataType:{
                id:"DATA-TYPE-ID"
            },
            classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
            metadata:[{key:'key1', value:'value1', namespace: 'n1'},{key:'key2', value:'value2', namespace: 'n2'}],
            minMultiplicity:"1",
            maxMultiplicity:"-1",

            inlineDataTypeValid: false,
            showNewInlineDataType: false,
            newlyAddedDataType:{}
        };
		stepScope.parentDataClassId = "PARENT-ID";

		stepScope.$digest();

		//save button is pressed
		stepScope.save();
		stepScope.$digest();

        var resource = {
            label: "ALabel",
            description: "ADescription",
            dataType:{id:"DATA-TYPE-ID"},
            minMultiplicity:1,
            maxMultiplicity:-1,
            classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
            metadata:[{key:'key1', value:'value1', namespace: 'n1'},{key:'key2', value:'value2', namespace: 'n2'}]
        };
        expect(resources.dataClass.post).toHaveBeenCalledWith("P-DM-ID", "P-DC-ID", "dataElements", {resource:resource});
		expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem saving the Data Element.', {error:"ERROR"});
	});

    it("saveCopiedDataElements copies DataElement(s) to a DataClass", function () {

        spyOn(resources.dataClass, 'post').and.callFake(function() {
            return $q.when({
                id:'NEWLY-CREATED-DATA-CLASS-ID',
            });
        });

        stepScope.model = {
            createType : 'copy',
            parentDataModel: {id:"P-DM-ID", domainType:"DataModel"},
            parentDataClass: {id:"P-DC-ID", domainType:"DataClass"},
            selectedDataElements:[
                {id:111, label:"DE1", dataModel:"DE-P-DM-ID", dataClass:"DE-P-DC-ID", domainType:"DataElement", dataType:{id:1, label:"A-DT", domainType:"PrimitiveType", dataModel:"DM-1"}},
                {id:222, label:"DE2", dataModel:"DE-P-DM-ID", dataClass:"DE-P-DC-ID", domainType:"DataElement", dataType:{id:1, label:"A-DT", domainType:"PrimitiveType", dataModel:"DM-1"}},
                {id:333, label:"DE3", dataModel:"DE-P-DM-ID", dataClass:"DE-P-DC-ID", domainType:"DataElement", dataType:{id:1, label:"A-DT", domainType:"PrimitiveType", dataModel:"DM-1"}},
            ]
        };

        stepScope.$digest();
        stepScope.save();
        stepScope.$digest();

        expect(resources.dataClass.post.calls.count()).toBe(3);
        expect(resources.dataClass.post.calls.argsFor(0)).toEqual(["P-DM-ID", "P-DC-ID", "dataElements/DE-P-DM-ID/DE-P-DC-ID/111"]);
        expect(resources.dataClass.post.calls.argsFor(1)).toEqual(["P-DM-ID", "P-DC-ID", "dataElements/DE-P-DM-ID/DE-P-DC-ID/222"]);
        expect(resources.dataClass.post.calls.argsFor(2)).toEqual(["P-DM-ID", "P-DC-ID", "dataElements/DE-P-DM-ID/DE-P-DC-ID/333"]);

    });

});

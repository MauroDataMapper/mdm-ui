import {mock} from '../../_globalMock';

describe('Controller: newDataType (wizard:Step 2)', function () {
	var $rootScope, step, multiStepForm, formStepElement,
		mainWizardController, $httpBackend, stepScope, stepElement, resources, $q, messageHandler,$state,stateHandler, $stateParams;

    mock.init();
	beforeEach(angular.mock.module('views/newDataType/step2.html'));

    
	beforeEach(inject(function(_$rootScope_, _multiStepForm_, FormStep, _formStepElement_,_$templateCache_,_$window_,$controller, _$httpBackend_,_resources_, _$q_,_messageHandler_,_$state_,_stateHandler_, _$stateParams_) {
		var tempHTML = _$templateCache_.get('views/newDataType/step2.html');
		$rootScope = _$rootScope_;
		$rootScope.simpleViewSupport = false;

		resources = _resources_;
		$q = _$q_;
		messageHandler = _messageHandler_;
		$state = _$state_;


        $stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/').respond({});



        _$httpBackend_.whenGET('views/home.html').respond(200, '');
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/metadata/namespaces/').respond([]);
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);

		$httpBackend = _$httpBackend_;
        stateHandler =_stateHandler_;
		multiStepForm = _multiStepForm_;
        formStepElement = _formStepElement_;

		step = new FormStep({title: 'Step 1', template: tempHTML, controller: "newDataTypeStep2Ctrl"});

        $rootScope.model =  {
            metadata: [],
            dataType: "PrimitiveType",
            enumerationValues: [],
            classifiers: [],

            createType:"new",
            copyFromDataModel:[],
            selectedDataTypes:[]
        };
		formStepElement(step, multiStepForm(), $rootScope)
			.then(function (data) {
				//get step scope
				stepScope = data.scope;
				//get step element (HTML node)
				stepElement = data.element;
			});

		$rootScope.$digest();
		mainWizardController = $controller('newDataTypeCtrl', {$scope: stepScope, $window:_$window_});

	}));

    it("saveNewDataType adds a new Data Type to a DataModel", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn(stateHandler, 'Go').and.returnValue({});

        //Save successfully happens
        spyOn(resources.dataModel, 'post').and.callFake(function() {
            return $q.when(
                {
                    id:'NEWLY-CREATED-DATA-TYPE-ID',
                    dataModel:"Response-DM-ID",
                    dataClass:"Response-DC-ID"
                });
        });

        stepScope.model = {
            createType:"new",
            copyFromDataModel:[],
            isValid:true,
            parentDataModel:{id:"P-DM-ID"},
            details:{
               label: "ALabel",
               description: "ADescription",
               organisation: "Org",
               domainType:"PrimitiveType",
               referenceClass:null,
               terminology:null,
               enumerationValues: [],
               classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
               metadata:[{key:'key1', value:'value1', namespace: 'n1'},{key:'key2', value:'value2', namespace: 'n2'}],
           }
        };
        stepScope.parentDataClassId = "PARENT-ID";

        stepScope.$digest();

        //save button is pressed
        stepScope.saveNewDataType();
        stepScope.$digest();

        var resource = {
            label: "ALabel",
            description: "ADescription",
            organisation: "Org",
            domainType:"PrimitiveType",
            referenceClass:{id:null},
            terminology:{id:null},
            classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
            enumerationValues: [],
            metadata:[{key:'key1', value:'value1', namespace: 'n1'},{key:'key2', value:'value2', namespace: 'n2'}],
        };

        expect(resources.dataModel.post).toHaveBeenCalledWith("P-DM-ID", "dataTypes", {resource:resource});


        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Type saved successfully.');

        expect(stateHandler.Go).toHaveBeenCalledWith(
            "DataType",
            {
                dataModelId: "Response-DM-ID",
                id: 'NEWLY-CREATED-DATA-TYPE-ID',
            },
            {reload: true, location: true});
    });



    it("saveCopiedDataTypes copies DataTypes(s) to a DataModel", function () {

        spyOn(resources.dataModel, 'post').and.callFake(function() {
            return $q.when({
                id:'NEWLY-CREATED-DATA-TYPE-ID',
            });
        });

        stepScope.model = {
            createType : 'copy',
            parentDataModel: {id:"P-DM-ID", domainType:"DataModel"},
            selectedDataTypes:[
                {id:111, label:"DT1", dataModel:"DE-P-DM-ID", domainType:"DataType"},
                {id:222, label:"DT2", dataModel:"DE-P-DM-ID", domainType:"DataType"},
                {id:333, label:"DT3", dataModel:"DE-P-DM-ID", domainType:"DataType"},
            ]
        };
        stepScope.$digest();
        stepScope.save();
        stepScope.$digest();

        expect(resources.dataModel.post.calls.count()).toBe(3);
        expect(resources.dataModel.post.calls.argsFor(0)).toEqual(["P-DM-ID", "dataTypes/DE-P-DM-ID/111"]);
        expect(resources.dataModel.post.calls.argsFor(1)).toEqual(["P-DM-ID", "dataTypes/DE-P-DM-ID/222"]);
        expect(resources.dataModel.post.calls.argsFor(2)).toEqual(["P-DM-ID", "dataTypes/DE-P-DM-ID/333"]);

    });
});
import {mock} from '../../_globalMock';

describe('Controller: newDataClass (wizard:Step 2)', function () {
	var $rootScope, step, multiStepForm, formStepElement,
		mainWizardController, $httpBackend, stepScope, stepElement, resources, $q, messageHandler,$state, $stateParams;

	
    mock.init();
	//load step1
	
	beforeEach(angular.mock.module('views/newDataClass/step2.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./moreDescription.html'));
    beforeEach(angular.mock.module('./dataSetMetadata.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./markdownTextArea.html'));

	beforeEach(inject(function(_$rootScope_, _multiStepForm_, FormStep, _formStepElement_,_$templateCache_,_$window_,$controller, _$httpBackend_,_resources_, _$q_,_messageHandler_,_$state_,_securityHandler_, _$stateParams_) {
		//load the template
		var tempHTML = _$templateCache_.get('views/newDataClass/step2.html');
		$rootScope = _$rootScope_;
        $rootScope.simpleViewSupport = false;

		resources = _resources_;
		$q = _$q_;
        messageHandler = _messageHandler_;
		$state = _$state_;


        $stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/metadata/namespaces/').respond([]);
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/').respond({});


        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));

        _$httpBackend_.whenGET('views/home.html').respond(200, '');
		$httpBackend = _$httpBackend_;

		//as classification directive loads all classifiers, we need to mock its call here
		$httpBackend.expect("GET", $rootScope.backendURL + '/metadata/namespaces/').respond([]);
		// $httpBackend.expect("GET", $rootScope.backendURL + '/classifiers/').respond([]);

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
		step = new FormStep({title: 'Step 2', template: tempHTML, controller: "newDataClassStep2Ctrl"});

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

		//run it on $rootScope
		$rootScope.$digest();
		//pass stepScope to the mainWizard Controller and it will add the main scopes and models to it
		//and they will be available in step template UI
		mainWizardController = $controller('newDataClassCtrl', {$scope: stepScope, $window:_$window_});

	}));

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

    it("Successfully saving 'a dataClass for a dataModel' with unbound multiplicity", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn($state, 'go').and.returnValue({});
        spyOn($rootScope, '$broadcast').and.returnValue({});

        spyOn(resources.dataModel, 'post').and.callFake(function() {
            return $q.when({id:'NEWLY-CREATED-DATA-CLASS-ID'});
        });

        stepScope.model = {
            createType : 'new',
            parent:{id:"DM-ID", domainType:"DataModel"},
            label: "ALabel",
            description: "ADescription",
            metadata:[{key:'key1', value:'value1', namespace:'n1'},{key:'key2', value:'value2', namespace:'n2'}],
            classifiers:[],
            minMultiplicity:"1",
            maxMultiplicity:"*"
        };
        stepScope.$digest();

        stepScope.save();
        stepScope.$digest();

        var resource = {
            label: "ALabel",
            description: "ADescription",
            minMultiplicity:1,
            maxMultiplicity:-1,
            metadata:[{key:'key1', value:'value1', namespace:'n1'},{key:'key2', value:'value2', namespace:'n2'}],
            classifiers:[]
        };
        expect(resources.dataModel.post).toHaveBeenCalledWith(stepScope.model.parent.id, "dataClasses", {resource:resource});
        expect($rootScope.$broadcast).toHaveBeenCalledWith('$reloadFoldersTree');
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Class saved successfully.');
    });

    it("saveCopiedDataClasses copies a DataClass(s) to a DataModel", function () {

        spyOn($rootScope, '$broadcast').and.returnValue({});

        spyOn(resources.dataModel, 'post').and.callFake(function() {
            return $q.when({
                id:'NEWLY-CREATED-DATA-CLASS-ID',
                dataModel:"DM-ID"
            });
        });

        stepScope.model = {
            createType : 'copy',
            parent:{id:"DM-ID", domainType:"DataModel"},
            selectedDataClasses:[
                {id:1, label:"DC1", dataModel:"A-DataModel-ID", domainType:"DataClass"},
                {id:2, label:"DC2", dataModel:"A-DataModel-ID", domainType:"DataClass"},
                {id:3, label:"DC3", dataModel:"A-DataModel-ID", domainType:"DataClass"},
            ]
        };

        stepScope.$digest();
        stepScope.save();
        stepScope.$digest();

        expect(resources.dataModel.post.calls.count()).toBe(3);
        expect(resources.dataModel.post.calls.argsFor(0)).toEqual([stepScope.model.parent.id, "dataClasses/A-DataModel-ID/1"]);
        expect(resources.dataModel.post.calls.argsFor(1)).toEqual([stepScope.model.parent.id, "dataClasses/A-DataModel-ID/2"]);
        expect(resources.dataModel.post.calls.argsFor(2)).toEqual([stepScope.model.parent.id, "dataClasses/A-DataModel-ID/3"]);

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$reloadFoldersTree');

    });

    it("saveCopiedDataClasses copies a DataClass(s) to a DataClass", function () {

        spyOn($rootScope, '$broadcast').and.returnValue({});

        spyOn(resources.dataClass, 'post').and.callFake(function() {
            return $q.when({
                id:'NEWLY-CREATED-DATA-CLASS-ID',
                dataModel:"DM-ID"
            });
        });

        stepScope.model = {
            createType : 'copy',
            parent:{id:"DC-ID", dataModel:"Parent-DM-ID",  domainType:"DataClass"},
            selectedDataClasses:[
                {id:1, label:"DC1", dataModel:"A-DataModel-ID", domainType:"DataClass"},
                {id:2, label:"DC2", dataModel:"A-DataModel-ID", domainType:"DataClass"},
                {id:3, label:"DC3", dataModel:"A-DataModel-ID", domainType:"DataClass"},
            ]
        };

        stepScope.$digest();
        stepScope.save();
        stepScope.$digest();

        expect(resources.dataClass.post.calls.count()).toBe(3);
        expect(resources.dataClass.post.calls.argsFor(0)).toEqual([stepScope.model.parent.dataModel, "DC-ID", "dataClasses/A-DataModel-ID/1"]);
        expect(resources.dataClass.post.calls.argsFor(1)).toEqual([stepScope.model.parent.dataModel, "DC-ID", "dataClasses/A-DataModel-ID/2"]);
        expect(resources.dataClass.post.calls.argsFor(2)).toEqual([stepScope.model.parent.dataModel, "DC-ID", "dataClasses/A-DataModel-ID/3"]);

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$reloadFoldersTree');

    });

});
import {mock} from '../../_globalMock';

describe('Controller: newDataModel (wizard:Step 3)', function () {
	var $rootScope, step, multiStepForm, formStepElement,
		mainWizardController, $httpBackend, stepScope, stepElement, resources, $q, messageHandler,$state, scope, $stateParams;

    mock.init();
	beforeEach(angular.mock.module('views/newDataModel/step3.html'));
    beforeEach(angular.mock.module('./dataSetMetadata.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./markdownTextArea.html'));
    beforeEach(angular.mock.module('./moreDescription.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));


    //noinspection JSUnresolvedFunction
	beforeEach(inject(function(_$rootScope_, _multiStepForm_, FormStep, _formStepElement_,_$templateCache_,_$window_,$controller, _$httpBackend_,_resources_, _$q_,_messageHandler_,_$state_, _$stateParams_) {
		//load the template
		var tempHTML = _$templateCache_.get('views/newDataModel/step3.html');
		$rootScope = _$rootScope_;
		$rootScope.simpleViewSupport = false;
		resources = _resources_;
		$q = _$q_;
        messageHandler = _messageHandler_;
		$state = _$state_;

        $stateParams = _$stateParams_;
        $stateParams.parentFolderId = "Parent-Folder-ID";

		_$httpBackend_.whenGET('views/home.html').respond(200, '');
		$httpBackend = _$httpBackend_;

		$httpBackend.expect("GET", $rootScope.backendURL + '/metadata/namespaces/').respond([]);
		$httpBackend.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);


        scope = $rootScope.$new();
        scope.parentFolderId = "Parent-Folder-ID";

        spyOn(resources.folder, "get").and.returnValue($q.when([]));

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
		step = new FormStep({title: 'Step 2', template: tempHTML, controller: "newDataModelStep3Ctrl"});

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
		mainWizardController = $controller('newDataModelCtrl', {$scope: stepScope, $window:_$window_});

	}));

	it('Wizard form and its models are initialized properly',  function () {
		//main controllers is defined
		expect(mainWizardController).toBeDefined();
		//check if element is defined
		expect(stepElement).toBeDefined();
		//check if default model is initialized
		//default models are initialized properly
		expect(stepScope.model).toBeDefined();
		expect(stepScope.model.metadata).toEqual([]);
		expect(stepScope.model.classifiers).toEqual([]);
	});

	it("Successfully saving a dataModel will show success message, pass values to server and changes the state", function () {
		spyOn(messageHandler, 'showSuccess').and.returnValue({});
		spyOn($state, 'go').and.returnValue({});

		//Save successfully happens
		spyOn(resources.dataModel, 'post').and.callFake(function() {
			return $q.when({id:'NEWLY-CREATED-DATA-MODEL-ID'});
		});

		//update the fields in the UI
		stepScope.model = {
			folder: "Parent-Folder-ID",
			label: "ALabel",
			description: "ADescription",
			author: "AnAuthor",
			organisation: "AnOrganisation",
			metadata:[],
			classifiers:[],
			dataModelType: "DataSet"
		};
		stepScope.parentDataClassId = "PARENT-ID";

		stepScope.$digest();

		//save button is pressed
		stepScope.save();
		stepScope.$digest();

		var newDataSet = {
            folder: stepScope.parentFolderId,
			label: stepScope.model.label,
			description: stepScope.model.description,
			author: stepScope.model.author,
			organisation: stepScope.model.organisation,
			metadata:[],
			classifiers:[],
			type:"DataSet"
		};

		expect(resources.dataModel.post).toHaveBeenCalledWith(null, null, {resource:newDataSet, queryStringParams:null});
		expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Model saved successfully.');
		expect($state.go).toHaveBeenCalledWith(
			"appContainer.mainApp.twoSidePanel.catalogue.dataModel",
			{id: 'NEWLY-CREATED-DATA-MODEL-ID'},
			{reload: true, location: true});
	});

	it("Successfully saving a dataModel will pass all details to the backend", function () {
		spyOn(messageHandler, 'showSuccess').and.returnValue({});
		spyOn($state, 'go').and.returnValue({});

		//Save successfully happens
		spyOn(resources.dataModel, 'post').and.callFake(function() {
			return $q.when({id:'NEWLY-CREATED-DATA-MODEL-ID'});
		});

		//update the fields in the UI
		stepScope.model = {
            folder: "Parent-Folder-ID",
            label: "ALabel",
			description: "ADescription",
			author: "AnAuthor",
			organisation: "AnOrganisation",
            dataModelType: "DataSet",
			classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
			metadata:[{namespace:"namespace1",key:"key1",value:"value1"}]
		};
		stepScope.parentDataClassId = "PARENT-ID";

		stepScope.$digest();

		//save button is pressed
		stepScope.save();
		stepScope.$digest();

		var newDataSet = {
            folder: stepScope.parentFolderId,
            label: stepScope.model.label,
			description: stepScope.model.description,
			author: stepScope.model.author,
			organisation: stepScope.model.organisation,
            type: "DataSet",
            classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
            metadata:[{namespace:"namespace1",key:"key1",value:"value1"}]
        };

		expect(resources.dataModel.post).toHaveBeenCalledWith(null, null, {resource:newDataSet, queryStringParams:null});
		expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Model saved successfully.');
		expect($state.go).toHaveBeenCalledWith(
			"appContainer.mainApp.twoSidePanel.catalogue.dataModel",
			{id: 'NEWLY-CREATED-DATA-MODEL-ID'},
			{reload: true, location: true});
	});

    it("Pass dialect if the dataModel type is Database", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn($state, 'go').and.returnValue({});

        //Save successfully happens
        spyOn(resources.dataModel, 'post').and.callFake(function() {
            return $q.when({id:'NEWLY-CREATED-DATA-MODEL-ID'});
        });

        //update the fields in the UI
        stepScope.model = {
            folder: "Parent-Folder-ID",
            label: "ALabel",
            description: "ADescription",
            author: "AnAuthor",
            dialect:"Postgres-DB",
            organisation: "AnOrganisation",
            dataModelType: "Database",
            classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
            metadata:[{namespace:"namespace1",key:"key1",value:"value1"}]
        };
        stepScope.parentDataClassId = "PARENT-ID";

        stepScope.$digest();

        //save button is pressed
        stepScope.save();
        stepScope.$digest();

        var newDataSet = {
            folder: stepScope.parentFolderId,
            label: stepScope.model.label,
            description: stepScope.model.description,
            author: stepScope.model.author,
            organisation: stepScope.model.organisation,
            dialect:"Postgres-DB",
            type: "Database",
            classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
            metadata:[{namespace:"namespace1",key:"key1",value:"value1"}]
        };

        expect(resources.dataModel.post).toHaveBeenCalledWith(null, null, {resource:newDataSet, queryStringParams:null});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Model saved successfully.');
        expect($state.go).toHaveBeenCalledWith(
            "appContainer.mainApp.twoSidePanel.catalogue.dataModel",
            {id: 'NEWLY-CREATED-DATA-MODEL-ID'},
            {reload: true, location: true});
    });



    it("Pass defaultDataTypeProvider if the defaultDataTypeProvider is selected", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn($state, 'go').and.returnValue({});

        //Save successfully happens
        spyOn(resources.dataModel, 'post').and.callFake(function() {
            return $q.when({id:'NEWLY-CREATED-DATA-MODEL-ID'});
        });

        //update the fields in the UI
        stepScope.model = {
            folder: "Parent-Folder-ID",
            label: "ALabel",
            description: "ADescription",
            author: "AnAuthor",
            dialect:"Postgres-DB",
            organisation: "AnOrganisation",
            dataModelType: "Database",
            classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
            metadata:[{namespace:"namespace1",key:"key1",value:"value1"}]
        };
        stepScope.parentDataClassId = "PARENT-ID";
        stepScope.model.selectedDataTypeProvider = {
            name: "DataTypeService",
            version: "1.0.0",
            displayName: "Core Default DataTypes"
		};

        stepScope.$digest();

        //save button is pressed
        stepScope.save();
        stepScope.$digest();

        var newDataSet = {
            folder: stepScope.parentFolderId,
            label: stepScope.model.label,
            description: stepScope.model.description,
            author: stepScope.model.author,
            organisation: stepScope.model.organisation,
            dialect:"Postgres-DB",
            type: "Database",
            classifiers:[{id:'classifierID1'},{id:'classifierID2'}],
            metadata:[{namespace:"namespace1",key:"key1",value:"value1"}]
        };

        expect(resources.dataModel.post).toHaveBeenCalledWith(null, null, {resource:newDataSet, queryStringParams:{
                defaultDataTypeProvider: "DataTypeService"
			}});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Model saved successfully.');
        expect($state.go).toHaveBeenCalledWith(
            "appContainer.mainApp.twoSidePanel.catalogue.dataModel",
            {id: 'NEWLY-CREATED-DATA-MODEL-ID'},
            {reload: true, location: true});
    });


	it("Failure in dataModel saving will show ngToast error message", function () {
		spyOn(messageHandler, 'showError').and.returnValue({});
		spyOn($state, 'go').and.returnValue({});

		spyOn(resources.dataModel, 'post').and.callFake(function() {
			return $q.reject({});
		});

		//update the fields in the UI
		stepScope.model = {
            folder: "Parent-Folder-ID",
            label: "ALabel",
			description: "ADescription",
			author: "AnAuthor",
			organisation: "AnOrganisation",
			metadata:[],
			classifiers:[],
            dataModelType: "DataSet"
		};
		stepScope.parentDataClassId = "PARENT-ID";

		stepScope.$digest();

		//save button is pressed
		stepScope.save();
		stepScope.$digest();

		var newDataSet = {
            folder: stepScope.parentFolderId,
            label: stepScope.model.label,
			description: stepScope.model.description,
			author: stepScope.model.author,
			organisation: stepScope.model.organisation,
            metadata:[],
            classifiers:[],
            type: "DataSet"
		};

		expect(resources.dataModel.post).toHaveBeenCalledWith(null, null, {resource:newDataSet, queryStringParams:null});
		expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem saving the Data Model.',{} );
	});
});
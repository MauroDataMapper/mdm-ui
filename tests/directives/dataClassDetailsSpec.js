import {mock} from '../_globalMock';

describe('Directive: dataClassDetails', function () {

	var scope, element, resources, messageHandler, $q, $httpBackend, securityHandler, $rootScope;

    mock.init();

	beforeEach(angular.mock.module('./dataClassDetails.html'));
	beforeEach(angular.mock.module('./modelPath.html'));
	beforeEach(angular.mock.module('./editableFormButtons.html'));
	beforeEach(angular.mock.module('./elementClassifications.html'));
	beforeEach(angular.mock.module('./mcPagedList.html'));
	beforeEach(angular.mock.module('./allLinksInPagedList.html'));
	beforeEach(angular.mock.module('./moreDescription.html'));
    beforeEach(angular.mock.module('./elementAlias.html'));
    beforeEach(angular.mock.module('./markdownTextArea.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));

    beforeEach(inject(function ($compile,_$httpBackend_,_$rootScope_, _resources_, _messageHandler_, _$q_, _securityHandler_) {
		$rootScope = _$rootScope_;
		$httpBackend = _$httpBackend_;
		resources = _resources_;
		messageHandler = _messageHandler_;
		$q = _$q_;
        securityHandler = _securityHandler_;

		$httpBackend.whenGET('views/home.html').respond(200, '');
		$httpBackend.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);

		scope = $rootScope.$new();
		scope.mcClassObject = {
            domainType:"DataClass",
			id: "DataClass-id",
			label: "ALabel",
			lastUpdated:1450344938815,
			description:"ADescription",
            editable: true,
			breadcrumbs:[
				{"id":19,"label":"ParentDataModel"},
				{"id":637,"label":"ParentDataClass"}
			],
			classifiers:[
				{id:"1"},
				{id:"2"}
			],
      aliases:["A", "B"]
		};
		scope.mcParentDataModel = {
			id:"P-DM-ID",
			editable:true
		};
		scope.mcParentDataClass = {
			id:"P-DC-ID"
		};
		element = angular.element('<dataclass-details mc-class-object="mcClassObject" mc-parent-data-model="mcParentDataModel" mc-parent-data-class="mcParentDataClass"></dataclass-details>');
		$compile(element)(scope);
        //Loads all semanticLinks
        spyOn(resources.catalogueItem, 'get').and.callFake(function() {return $q.when([]);});
	}));

	it("should check if user has writableAccess or not", function () {
        spyOn(securityHandler, 'showIfRoleIsWritable').and.returnValue(true);
        debugger
		scope.$digest();
		expect(securityHandler.showIfRoleIsWritable).toHaveBeenCalledWith(scope.mcClassObject);
	});

	it("formBeforeSave passes values to the backend", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
		spyOn(resources.dataClass, 'put').and.returnValue($q.resolve({}));
		scope.mcClassObject.label  = "A new Label";
		scope.mcClassObject.description = "A new Desc";
		scope.$digest();
        // var isolateScope = element.isolateScope();
        scope.editableForm.$data.description = "A new Desc";

        scope.formBeforeSave();
        scope.$digest();
        var resource =
            {
                id: "DataClass-id",
                label: "A new Label",
                description: "A new Desc",
                domainType: "DataClass",
                classifiers: [{id: "1"}, {id: "2"}],
                aliases:["A", "B"],
                minMultiplicity: null,
                maxMultiplicity: null
            };
		expect(resources.dataClass.put).toHaveBeenCalledWith(scope.mcParentDataModel.id, scope.mcParentDataClass.id, scope.mcClassObject.id, null, {resource:resource});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Class updated successfully.');

    });

	it("Failure in save will show messageHandler error message", function () {
        spyOn(messageHandler, 'showError').and.returnValue({});
        spyOn(resources.dataClass, 'put').and.returnValue($q.reject({error: "ERROR"}));
        scope.mcClassObject.label  = "A new Label";
        scope.mcClassObject.description = "A new Desc";
        scope.$digest();
        // var isolateScope = element.isolateScope();
        scope.editableForm.$data.description = "A new Desc";

        scope.formBeforeSave();
        scope.$digest();
        var resource =
            {
                id: "DataClass-id",
                label: "A new Label",
                description: "A new Desc",
                domainType: "DataClass",
                classifiers: [{id: "1"}, {id: "2"}],
                aliases:["A", "B"],
                minMultiplicity: null,
                maxMultiplicity: null
            };
        expect(resources.dataClass.put).toHaveBeenCalledWith(scope.mcParentDataModel.id, scope.mcParentDataClass.id, scope.mcClassObject.id, null, {resource:resource});
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem updating the Data Class.', {error: "ERROR"});
	});

    it("Save passes multiplicities values to the backend", function () {
        spyOn(resources.dataClass, 'put').and.returnValue($q.resolve({aliases:["A", "B"]}));

        var testCases = [
            {input:{min:"0", max:"1"}, output:{min:0, max:1}},
            {input:{min:"0", max:"2"}, output:{min:0, max:2}},
            {input:{min:"0", max:"-1"},output:{min:0, max:-1}},
            {input:{min:"1", max:"5"}, output:{min:1, max:5}},
            {input:{min:"1", max:"*"}, output:{min:1, max:-1}},
            {input:{min:"0", max:"*"}, output:{min:0, max:-1}},
            {input:{min:"",  max:""},  output:{min:null, max:null}},
            {input:{min:null,max:null},  output:{min:null, max:null}}
        ];

        for(var i = 0; i < testCases.length;i++) {
            scope.mcClassObject.minMultiplicity = testCases[i].input.min;
            scope.mcClassObject.maxMultiplicity = testCases[i].input.max;
            scope.$digest();

            var resource =
                {
                    id: "DataClass-id",
                    label: "ALabel",
                    description:"ADescription",
                    domainType: "DataClass",
                    aliases:["A", "B"],
                    classifiers: [{id: "1"}, {id: "2"}],
                    minMultiplicity : testCases[i].output.min,
            		    maxMultiplicity : testCases[i].output.max
                };

            //var controllerScope = element.isolateScope();
            scope.editableForm.$data.description = "ADescription";
            scope.formBeforeSave();
            expect(resources.dataClass.put).toHaveBeenCalledWith(scope.mcParentDataModel.id, scope.mcParentDataClass.id, scope.mcClassObject.id, null, {resource:resource});
        }
    });

});
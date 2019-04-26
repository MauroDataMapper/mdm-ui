import {mock} from '../_globalMock';


describe('Directive: classificationDetails', function () {

	var scope, element, securityHandler, resources, messageHandler, $q, stateHandler, rootScope;
	var $httpBackend;

	//add main module
	mock.init();

	beforeEach(angular.mock.module('./classificationDetails.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./editableFormButtons.html'));
    beforeEach(angular.mock.module('./shareWith.html'));
    beforeEach(angular.mock.module('./userAccessNew.html'));
    beforeEach(angular.mock.module('./groupAccessNew.html'));
    beforeEach(angular.mock.module('./modelPath.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./markdownTextArea.html'));


    beforeEach(inject(function ($rootScope, $compile,_$httpBackend_,_$rootScope_, _resources_, _messageHandler_, _$q_,_securityHandler_, _stateHandler_) {
		rootScope = _$rootScope_;
		$httpBackend = _$httpBackend_;
		resources = _resources_;
		messageHandler = _messageHandler_;
		$q = _$q_;
        securityHandler = _securityHandler_;
        stateHandler = _stateHandler_;
		scope = rootScope.$new();

		scope.currentClassification = {
			id:"CLF-ID",
			label: "CLF-Label",
			description:"CLF-Desc",
            readableByEveryone: false,
            readableByAuthenticated: false
		};

		element = angular.element('<classification-details mc-classification="currentClassification"></classification-details>');
		$compile(element)(scope);
	}));

	it("should check if user has writableAccess or not", function () {
		spyOn(securityHandler, 'showIfRoleIsWritable').and.returnValue(true);
		scope.$digest();

		expect(securityHandler.showIfRoleIsWritable).toHaveBeenCalledWith(scope.currentClassification);
	});

	it("if user is a readonly, then edit button should be hidden", function () {
		//the user does not have Writable access
		spyOn(securityHandler, 'showIfRoleIsWritable').and.returnValue(false);
		scope.$digest();
		expect(angular.element(element).is(":hidden")).toBe(true); //expect edit row to be hidden as user does NOT have writable access
	});

    it("formBeforeSave passes the details to the backend", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
    	spyOn(resources.classifier, 'put').and.returnValue($q.when({}));
        scope.currentClassification.label =  "CLF-Label";
        scope.currentClassification.description = "CLF-Desc";
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.editableForm.$data.description = "CLF-Desc";

        isolateScope.formBeforeSave();
        scope.$digest();

        var resource = {
            id: scope.currentClassification.id,
            label: scope.currentClassification.label,
            description: scope.currentClassification.description
		};
        expect(resources.classifier.put).toHaveBeenCalledWith("CLF-ID", null, {resource: resource});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Classifier updated successfully.');
    });

    it("shareReadWithEveryoneChanged calls the right backend", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn(resources.classifier, 'put').and.returnValue($q.when({}));
        spyOn(resources.classifier, 'delete').and.returnValue($q.when({}));

        //Grant access to everyone
        scope.currentClassification.readableByEveryone = true;
        scope.$digest();
        var isolateScope = element.isolateScope();
        debugger
        isolateScope.shareReadWithEveryoneChanged();
        scope.$digest();
        expect(resources.classifier.put).toHaveBeenCalledWith("CLF-ID", "readByEveryone");
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Classifier updated successfully.');

        //Revoke access to everyone
        scope.currentClassification.readableByEveryone = false;
        scope.$digest();
        isolateScope.shareReadWithEveryoneChanged();
        scope.$digest();
        expect(resources.classifier.delete).toHaveBeenCalledWith("CLF-ID", "readByEveryone");
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Classifier updated successfully.');
    });


    it("shareReadWithAuthenticatedChanged calls the right backend", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn(resources.classifier, 'put').and.returnValue($q.when({}));
        spyOn(resources.classifier, 'delete').and.returnValue($q.when({}));

        //Grant access to everyone
        scope.currentClassification.readableByAuthenticated = true;
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.shareReadWithAuthenticatedChanged();
        scope.$digest();
        expect(resources.classifier.put).toHaveBeenCalledWith("CLF-ID", "readByAuthenticated");
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Classifier updated successfully.');

        //Revoke access to everyone
        scope.currentClassification.readableByAuthenticated = false;
        scope.$digest();
        isolateScope.shareReadWithAuthenticatedChanged();
        scope.$digest();
        expect(resources.classifier.delete).toHaveBeenCalledWith("CLF-ID", "readByAuthenticated");
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Classifier updated successfully.');
    });

    it("delete calls the right backend for deleting the classifier", function () {
        spyOn(rootScope, "$broadcast").and.returnValue({});
        spyOn(stateHandler, 'Go').and.returnValue({});
        spyOn(resources.classifier, 'delete').and.returnValue($q.when({}));

        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.delete();
        scope.$digest();
        
        expect(resources.classifier.delete).toHaveBeenCalledWith("CLF-ID");
        expect(stateHandler.Go).toHaveBeenCalledWith("allDataModel", {location: true});
        expect(rootScope.$broadcast).toHaveBeenCalledWith('$reloadClassifiers');
    });

});
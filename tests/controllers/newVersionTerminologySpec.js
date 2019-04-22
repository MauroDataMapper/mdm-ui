import {mock} from '../_globalMock';

describe('Controller: newVersionTerminologyCtrl', function () {

	var scope, controller, resources, window, stateParams, $rootScope, stateHandler, $q, messageHandler;

    mock.init();
	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
	}));

	beforeEach(inject(function (_$q_, $controller, _$rootScope_, _resources_, $window, $stateParams, _securityHandler_,_stateHandler_, _messageHandler_) {
		resources = _resources_;
        stateHandler = _stateHandler_;
		$rootScope = _$rootScope_;
		scope = _$rootScope_.$new();
		stateParams = $stateParams;
		window = $window;
        $q = _$q_;
        messageHandler = _messageHandler_;
        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));

        spyOn(resources.terminology, 'get').and.returnValue($q.when({id:'TG-ID', label:"A-TERMINOLOGY", finalised:true, editable:false, classifiers:[{id:"CLS-ID"}]}));

    }));

	function initController($controller){
		controller = $controller('newVersionTerminologyCtrl', {
			$scope: scope,
            stateHandler: stateHandler,
			$stateParams: stateParams,
			resources:resources,
			$window: window,
			$rootScope: $rootScope
		});
	}

    it('will go to resourceNotFound, if terminologyId-id is NOT provided, ',  inject(function ($controller) {
        spyOn(stateHandler, 'NotFound');
        stateParams.id = undefined;
        initController($controller);
        scope.$digest();
        expect(stateHandler.NotFound).toHaveBeenCalledWith({location: false});
    }));

    it('loads terminology',  inject(function ($controller) {
        stateParams.id = "TG-ID";

        initController($controller);
        scope.$digest();

        expect(resources.terminology.get).toHaveBeenCalledWith("TG-ID");
        expect(scope.terminology).toEqual({id:'TG-ID', label:"A-TERMINOLOGY", finalised:true, editable:false, classifiers:[{id:"CLS-ID"}]});
        expect(window.document.title).toBe("New Version");
    }));


    it('Validate checks if values are entered correctly for newElementVersion',  inject(function ($controller) {
        stateParams.id = "TG-ID";
        scope.versionType = "newElementVersion";

        scope.form = {label:null};
        initController($controller);
        scope.$digest();

        scope.validate();
        scope.$digest();
        expect(scope.errors).toEqual({label:"Name can not be empty!"});

        scope.form = {label:"A-LABEL"};
        scope.validate();
        scope.$digest();
        expect(scope.errors).toEqual(null);

        scope.form = {label:"A-TERMINOLOGY"};
        scope.validate();
        scope.$digest();
        expect(scope.errors).toEqual({label:"The name should be different from the current version name 'A-TERMINOLOGY'"});
    }));

    it('Save passes values to the backend for newElementVersion',  inject(function ($controller) {
        stateParams.id = "TG-ID";
        scope.versionType = "newElementVersion";

        initController($controller);
        scope.$digest();

        spyOn(resources.terminology, 'put').and.returnValue($q.when({id:"NEW-TG-ID"}));
        spyOn(stateHandler, 'Go');
        spyOn(messageHandler, 'showSuccess');

        scope.form = {
            label: "A-LABEL",
            copyPermissions: true
        };
        scope.save();
        scope.$digest();

        expect(resources.terminology.put).toHaveBeenCalledWith("TG-ID", "newVersion", {resource:{label: "A-LABEL", copyPermissions: true}});
        expect(stateHandler.Go).toHaveBeenCalledWith("terminology", {id: "NEW-TG-ID"}, {reload:true});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith("New Terminology version created successfully.");
    }));

    it('Save shows proper error when saving newElementVersion fails',  inject(function ($controller) {
        stateParams.id = "TG-ID";
        scope.versionType = "newElementVersion";

        initController($controller);
        scope.$digest();

        spyOn(resources.terminology, 'put').and.returnValue($q.reject({error:"ERROR"}));
        spyOn(messageHandler, 'showError');

        scope.form = {
            label: "A-LABEL",
            copyPermissions: true
        };
        scope.save();
        scope.$digest();

        expect(resources.terminology.put).toHaveBeenCalledWith("TG-ID", "newVersion", {resource:{label: "A-LABEL", copyPermissions: true}});
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem creating the new Terminology version.', {error:"ERROR"});
    }));

    it('Save passes values to the backend for newDocumentVersion',  inject(function ($controller) {
        stateParams.id = "TG-ID";
        scope.versionType = "newDocumentVersion";

        initController($controller);
        scope.$digest();

        spyOn(resources.terminology, 'put').and.returnValue($q.when({id:"NEW-TG-ID"}));
        spyOn(stateHandler, 'Go');
        spyOn(messageHandler, 'showSuccess');

        scope.form = {
            label: "A-LABEL",
            copyPermissions: true
        };
        scope.save();
        scope.$digest();

        expect(resources.terminology.put).toHaveBeenCalledWith("TG-ID", "newDocumentationVersion", {resource:{}});
        expect(stateHandler.Go).toHaveBeenCalledWith("terminology", {id: "NEW-TG-ID"}, {reload:true});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('New Document version created successfully.');
    }));

    it('Save shows proper error when saving newDocumentVersion fails',  inject(function ($controller) {
        stateParams.id = "TG-ID";
        scope.versionType = "newDocumentVersion";

        initController($controller);
        scope.$digest();

        spyOn(resources.terminology, 'put').and.returnValue($q.reject({error:"ERROR"}));
        spyOn(messageHandler, 'showError');

        scope.form = {
            label: "A-LABEL",
            copyPermissions: true
        };
        scope.save();
        scope.$digest();

        expect(resources.terminology.put).toHaveBeenCalledWith("TG-ID", "newDocumentationVersion", {resource:{}});
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem creating the new Document version.', {error:"ERROR"});
    }));

    it('Cancel changes the status to the terminology homepage',  inject(function ($controller) {
        stateParams.id = "TG-ID";

        initController($controller);
        scope.$digest();

        spyOn(stateHandler, 'Go').and.returnValue(true);

        scope.cancel();
        scope.$digest();

        expect(stateHandler.Go).toHaveBeenCalledWith("terminology", {id: "TG-ID"});
    }));

});
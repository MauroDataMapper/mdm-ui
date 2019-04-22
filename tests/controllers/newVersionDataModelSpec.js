import {mock} from '../_globalMock';

describe('Controller: newVersionDataModelCtrl', function () {

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
        spyOn(resources.dataModel, 'get').and.returnValue($q.when({id:'DM-ID', label:"DM-LABEL", finalised:true, editable:false, classifiers:[{id:"CLS-ID"}]}));
    }));

	function initController($controller){
		controller = $controller('newVersionDataModelCtrl', {
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
        stateParams.dataModelId = undefined;
        initController($controller);
        scope.$digest();
        expect(stateHandler.NotFound).toHaveBeenCalledWith({location: false});
    }));

    it('loads the DataModel',  inject(function ($controller) {
        stateParams.dataModelId = "DM-ID";

        initController($controller);
        scope.$digest();

        expect(resources.dataModel.get).toHaveBeenCalledWith("DM-ID");
        expect(scope.dataModel).toEqual({id:'DM-ID', label:"DM-LABEL", finalised:true, editable:false, classifiers:[{id:"CLS-ID"}]});
        expect(window.document.title).toBe("New Version");
    }));


    it('Validate checks if values are entered correctly for newElementVersion',  inject(function ($controller) {
        stateParams.dataModelId = "DM-ID";
        scope.versionType = "newElementVersion";

        scope.form = {label:null};
        initController($controller);
        scope.$digest();

        scope.validate();
        scope.$digest();
        expect(scope.errors).toEqual({label:"Name can not be empty!"});

        scope.form = {label:"DM-LABEL-NEW"};
        scope.validate();
        scope.$digest();
        expect(scope.errors).toEqual(null);

        scope.form = {label:"DM-LABEL"};
        scope.validate();
        scope.$digest();
        expect(scope.errors).toEqual({label:"The name should be different from the current version name 'DM-LABEL'"});
    }));

    it('Save passes values to the backend for newElementVersion',  inject(function ($controller) {
        stateParams.dataModelId = "DM-ID";
        scope.versionType = "newElementVersion";

        initController($controller);
        scope.$digest();

        spyOn(resources.dataModel, 'put').and.returnValue($q.when({id:"NEW-DM-ID"}));
        spyOn(stateHandler, 'Go');
        spyOn(messageHandler, 'showSuccess');

        scope.form = {
            label: "DM-LABEL-NEW",
            copyPermissions: true,
            copyDataFlows: true
        };
        scope.save();
        scope.$digest();

        expect(resources.dataModel.put).toHaveBeenCalledWith("DM-ID", "newVersion", {resource:{label: "DM-LABEL-NEW", copyPermissions: true, copyDataFlows: true}});
        expect(stateHandler.Go).toHaveBeenCalledWith("datamodel", {id: "NEW-DM-ID"}, {reload:true});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith("New Data Model version created successfully.");
    }));

    it('Save shows proper error when saving newElementVersion fails',  inject(function ($controller) {
        stateParams.dataModelId = "DM-ID";
        scope.versionType = "newElementVersion";

        initController($controller);
        scope.$digest();

        spyOn(resources.dataModel, 'put').and.returnValue($q.reject({error:"message"}));
        spyOn(messageHandler, 'showError');

        scope.form = {
            label: "DM-LABEL-NEW",
            copyPermissions: true,
            copyDataFlows: true
        };
        scope.save();
        scope.$digest();

        expect(resources.dataModel.put).toHaveBeenCalledWith("DM-ID", "newVersion", {resource:{label: "DM-LABEL-NEW", copyPermissions: true, copyDataFlows: true}});
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem creating the new Data Model version.', {error:"message"});
    }));

    it('Save passes values to the backend for newDocumentVersion',  inject(function ($controller) {
        stateParams.dataModelId = "DM-ID";
        scope.versionType = "newDocumentVersion";

        initController($controller);
        scope.$digest();

        spyOn(resources.dataModel, 'put').and.returnValue($q.when({id:"NEW-DM-ID"}));
        spyOn(stateHandler, 'Go');
        spyOn(messageHandler, 'showSuccess');

        scope.form = {
            moveDataFlows: true
        };
        scope.save();
        scope.$digest();

        expect(resources.dataModel.put).toHaveBeenCalledWith("DM-ID", "newDocumentationVersion", {resource:{ moveDataFlows: true}});
        expect(stateHandler.Go).toHaveBeenCalledWith("datamodel", {id: "NEW-DM-ID"}, {reload:true});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('New Document Model version created successfully.');
    }));

    it('Save shows proper error when saving newDocumentVersion fails',  inject(function ($controller) {
        stateParams.dataModelId = "DM-ID";
        scope.versionType = "newDocumentVersion";

        initController($controller);
        scope.$digest();

        spyOn(resources.dataModel, 'put').and.returnValue($q.reject({error:"message"}));
        spyOn(messageHandler, 'showError');

        scope.form = {
            moveDataFlows: true
        };
        scope.save();
        scope.$digest();

        expect(resources.dataModel.put).toHaveBeenCalledWith("DM-ID", "newDocumentationVersion", {resource:{ moveDataFlows: true}});
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem creating the new Document Model version.', {error:"message"});
    }));

    it('Cancel changes the status to the terminology homepage',  inject(function ($controller) {
        stateParams.dataModelId = "DM-ID";

        initController($controller);
        scope.$digest();

        spyOn(stateHandler, 'Go').and.returnValue(true);

        scope.cancel();
        scope.$digest();

        expect(stateHandler.Go).toHaveBeenCalledWith("datamodel", {id: "DM-ID"});
    }));

});
import {mock} from '../../_globalMock';


describe('Controller: groupCtrl', function () {

	var scope, controller, resources, $rootScope, $httpBackend, window, messageHandler, $q, $state, $stateParams, stateHandler;

    mock.init();


	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
		_$httpBackend_.whenGET('views/models.html').respond(200, '');
        _$httpBackend_.whenGET('views/menuTwoSidePanel.html').respond(200, '');
	}));

	beforeEach(inject(function (_$rootScope_, _$httpBackend_, _resources_, _messageHandler_, $window, _$q_, _$state_, _$stateParams_,_stateHandler_) {
		scope = _$rootScope_.$new();
		scope.editableForm = {
			$show: angular.noop,
			$hide: angular.noop
		};
		resources = _resources_;
		$httpBackend = _$httpBackend_;
		$rootScope = _$rootScope_;
		$q = _$q_;
		window = $window;
        messageHandler = _messageHandler_;
		$state = _$state_;
        $stateParams = _$stateParams_;
        stateHandler = _stateHandler_;
	}));

	function initController ($controller, returnValue, id) {

        $stateParams.id = id;
		var getResourceSpy = spyOn(resources.userGroup, 'get').and.returnValue($q.when(returnValue));

		controller = $controller('groupCtrl', {
			$scope: scope,
            messageHandler: messageHandler,
			resources: resources,
            $stateParams: $stateParams,
            stateHandler:stateHandler
		});

		return getResourceSpy;
	}

	it('updates the page title',  inject(function ($controller) {

		var group = {id:"123", name:"group1"};
		initController($controller, group, group.id);

		scope.$digest();

		expect(window.document.title).toBe("Admin - Edit Group");

	}));

	it('will initialize the groups object in the page',  inject(function ($controller) {
		//initialise the controller
        var group = {id:"123", name:"group1"};
        initController($controller, group, group.id);
		scope.$digest();

		expect(resources.userGroup.get).toHaveBeenCalledWith(group.id);
		expect(resources.userGroup.get).toHaveBeenCalledTimes(1);
		expect(scope.group).toBeDefined();
		expect(scope.group).toEqual(group);
	}));

	it('will cancel "edit group" mode',  inject(function ($controller) {
		//initialise the controller
		spyOn(stateHandler, 'Go');
		initController($controller, []);
		scope.$digest();

		scope.cancel();
		scope.$digest();
		expect(stateHandler.Go).toHaveBeenCalledWith('admin.groups');
	}));

	it('will create a group on save',  inject(function ($controller) {
		//initialise the controller
		initController($controller);
		scope.$digest();

        spyOn(resources.userGroup, 'post').and.returnValue($q.when({}));
        spyOn(stateHandler, 'Go');
		spyOn(messageHandler, 'showSuccess');

		scope.group = {
			label: 'Test Group Label',
			description: 'Test Group Description'
		};
		scope.save();
		scope.$digest();

        expect(resources.userGroup.post).toHaveBeenCalledWith(null, null, {resource:scope.group});
        expect(resources.userGroup.post).toHaveBeenCalledTimes(1);
		expect(messageHandler.showSuccess).toHaveBeenCalledTimes(1);
		expect(messageHandler.showSuccess).toHaveBeenCalledWith('Group saved successfully.');
		expect(stateHandler.Go).toHaveBeenCalledTimes(1);
		expect(stateHandler.Go).toHaveBeenCalledWith('admin.groups');
	}));

	it('will update a group on save',  inject(function ($controller) {
		//initialise the controller
		initController($controller, []);
		scope.$digest();

        spyOn(resources.userGroup, 'put').and.returnValue($q.when({}));
		spyOn(stateHandler, 'Go');
		spyOn(messageHandler, 'showSuccess');

		scope.group = {
			id: 1,
			label: 'Test Group Label',
			description: 'Test Group Description'
		};
		scope.save();
		scope.$digest();

        expect(resources.userGroup.put).toHaveBeenCalledWith(scope.group.id, null, {resource:scope.group});
        expect(resources.userGroup.put).toHaveBeenCalledTimes(1);
		expect(messageHandler.showSuccess).toHaveBeenCalledTimes(1);
		expect(messageHandler.showSuccess).toHaveBeenCalledWith('Group updated successfully.');
		expect(stateHandler.Go).toHaveBeenCalledTimes(1);
		expect(stateHandler.Go).toHaveBeenCalledWith('admin.groups');
	}));

	it('will validate an input value correctly', inject(function ($controller) {
		initController($controller);
		scope.$digest();
		var result = scope.validate();

		expect(result).toBeFalsy();
		expect(scope.errors).toBeDefined();
		expect(scope.errors['label']).toBe("Name can't be empty!");
	}));

});

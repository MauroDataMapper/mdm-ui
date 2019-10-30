import {mock} from '../../_globalMock';

describe('Controller: userCtrl', function () {

	var scope, controller, resources, $rootScope, $httpBackend, window, messageHandler, $q, stateHandler;
	var $stateParams = {
		id: null
	};

    mock.init();
	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
	}));

	beforeEach(inject(function (_$rootScope_, _$httpBackend_, _resources_, _messageHandler_, $window, _$q_, _stateHandler_) {
		scope = _$rootScope_.$new();
		resources = _resources_;
		$httpBackend = _$httpBackend_;
		$rootScope = _$rootScope_;
		$q = _$q_;
		window = $window;
		messageHandler = _messageHandler_;
        stateHandler = _stateHandler_;
	}));

	function initController ($controller) {

		//load all groups
		spyOn(resources.userGroup, 'get').and.returnValue($q.when([]));

		controller = $controller('userCtrl', {
			$scope: scope,
			messageHandler: messageHandler,
			resources: resources,
			$stateParams: $stateParams
		});
        scope.user = {
            emailAddress: "",
            firstName:"",
            lastName: "",
            organisation: "",
            jobTitle: "",
            userRole: 'EDITOR',
            groups:[]
        };
	}

	it('will initialize the create user page',  inject(function ($controller) {
		//initialise the controller
		initController($controller, [null, null, Object({ pageSize: 0, pageIndex: 0, filters: null, sortType: 'asc' })]);
		scope.$digest();
		expect(scope.user).toBeDefined();
		expect(window.document.title).toBe("Admin - Create User");
        expect(resources.userGroup.get).toHaveBeenCalledWith(null, null, Object({ pageSize: 0, pageIndex: 0, filters: null, sortType: 'asc' }));
        expect(resources.userGroup.get).toHaveBeenCalledTimes(1);
	}));

	it('will initialize the edit user page',  inject(function ($controller) {
		//initialise the controller
		$stateParams.id = '123';
        spyOn(resources.catalogueUser, 'get').and.returnValue($q.when({id:123, emailAddress:'User1@user.com'}));

		initController($controller);
		scope.$digest();

        expect(resources.userGroup.get).toHaveBeenCalledWith(null, null, Object({ pageSize: 0, pageIndex: 0, filters: null, sortType: 'asc' }));
        expect(resources.userGroup.get).toHaveBeenCalledTimes(1);
        expect(resources.catalogueUser.get).toHaveBeenCalledWith($stateParams.id);
        expect(resources.catalogueUser.get).toHaveBeenCalledTimes(1);

        var user = {
        	id:123,
            emailAddress: "User1@user.com"
        };
		expect(scope.user).toEqual(user);
		expect(window.document.title).toBe("Admin - Edit User");
	}));

	it('will cancel "edit user" mode',  inject(function ($controller) {
        $stateParams.id = null;
		//initialise the controller
		spyOn(stateHandler, 'Go');
		initController($controller);
		scope.$digest();

		scope.cancel();
		scope.$digest();
		expect(stateHandler.Go).toHaveBeenCalledWith('admin.users');
	}));

	it('will create a user on save',  inject(function ($controller) {
		//initialise the controller
        $stateParams.id = null;
		initController($controller);
		scope.$digest();

		spyOn(stateHandler, 'Go');
		spyOn(messageHandler, 'showSuccess');
		scope.user = {
			emailAddress: 'email@addresstest.com',
			firstName: 'FirstNameTest',
			lastName: 'LastNameTest',
			organisation: 'OrganisationTest',
            jobTitle: "NewJobTitle",
			userRole: 'UserRoleTest',
			groups:[]
		};
		spyOn(resources.catalogueUser, 'post').and.returnValue($q.when(scope.currentUser));
		scope.save();
		scope.$digest();

        expect(resources.catalogueUser.post).toHaveBeenCalledWith(null, "adminRegister", {resource: scope.user});
        expect(resources.catalogueUser.post).toHaveBeenCalledTimes(1);
		expect(messageHandler.showSuccess).toHaveBeenCalledTimes(1);
		expect(messageHandler.showSuccess).toHaveBeenCalledWith('User saved successfully.');
		expect(stateHandler.Go).toHaveBeenCalledWith('admin.users');
		expect(stateHandler.Go).toHaveBeenCalledTimes(1);
	}));

	it('will update a user on save',  inject(function ($controller) {
		//initialise the controller
		initController($controller, []);
		scope.$digest();

		spyOn(stateHandler, 'Go');
		spyOn(messageHandler, 'showSuccess');

		scope.user = {
			id:1,
			emailAddress: 'email@addresstest.com',
			firstName: 'FirstNameTest',
			lastName: 'LastNameTest',
			organisation: 'OrganisationTest',
            jobTitle: "NewJobTitle",
			userRole: 'UserRoleTest'
		};
		scope.$digest();
		spyOn(resources.catalogueUser, 'put').and.returnValue($q.when(scope.currentUser));
		scope.save();
		scope.$digest();

        var resource = {
            emailAddress: 'email@addresstest.com',
            firstName: 'FirstNameTest',
            lastName: 'LastNameTest',
            organisation: 'OrganisationTest',
            jobTitle: "NewJobTitle",
            userRole: 'UserRoleTest',
			groups:[]
        };

        expect(resources.catalogueUser.put).toHaveBeenCalledWith(scope.user.id, null, {resource: resource});
        expect(resources.catalogueUser.put).toHaveBeenCalledTimes(1);

		expect(messageHandler.showSuccess).toHaveBeenCalledTimes(1);
		expect(messageHandler.showSuccess).toHaveBeenCalledWith('User updated successfully.');
		expect(stateHandler.Go).toHaveBeenCalledTimes(1);
		expect(stateHandler.Go).toHaveBeenCalledWith('admin.users');
	}));

    it('will update a user on save TestCase2',  inject(function ($controller) {
        //initialise the controller
        initController($controller, []);
        scope.$digest();

        spyOn(stateHandler, 'Go');
        spyOn(messageHandler, 'showSuccess');

        scope.user = {
            id:1,
            emailAddress: 'email@addresstest.com',
            firstName: 'FirstNameTest',
            lastName: 'LastNameTest',
            organisation: 'OrganisationTest',
            jobTitle: "NewJobTitle",
            userRole: 'UserRoleTest',
			groups:[{id:1},{id:2}]
        };
        scope.$digest();
        spyOn(resources.catalogueUser, 'put').and.returnValue($q.when(scope.currentUser));
        scope.save();
        scope.$digest();

        var resource = {
            emailAddress: 'email@addresstest.com',
            firstName: 'FirstNameTest',
            lastName: 'LastNameTest',
            organisation: 'OrganisationTest',
            jobTitle: "NewJobTitle",
            userRole: 'UserRoleTest',
            groups:[{id:1},{id:2}]
        };

        expect(resources.catalogueUser.put).toHaveBeenCalledWith(scope.user.id, null, {resource: resource});
        expect(resources.catalogueUser.put).toHaveBeenCalledTimes(1);

        expect(messageHandler.showSuccess).toHaveBeenCalledTimes(1);
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('User updated successfully.');
        expect(stateHandler.Go).toHaveBeenCalledTimes(1);
        expect(stateHandler.Go).toHaveBeenCalledWith('admin.users');
    }));

	it('will validate an input value correctly', inject(function ($controller) {
		initController($controller, []);
		scope.$digest();
		var result = scope.validate();

		expect(result).toBeFalsy();

		expect(scope.errors['firstName']).toBe("First Name can't be empty!");
		expect(scope.errors['lastName']).toBe("Last Name can't be empty!");
        expect(scope.errors['emailAddress']).toBe("Email can't be empty!");
	}));
});

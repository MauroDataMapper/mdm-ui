import {mock} from '../../_globalMock';


describe('Controller: configurationCtrl', function () {

	var scope, controller, resources, $rootScope, $httpBackend, window, messageHandler, $q ;

	mock.init();

	beforeEach(inject(function (_$rootScope_, _$httpBackend_, _resources_, _messageHandler_, $window, _$q_) {
		scope = _$rootScope_.$new();
		resources = _resources_;
		$httpBackend = _$httpBackend_;
		$rootScope = _$rootScope_;
		$q = _$q_;
		window = $window;
		messageHandler = _messageHandler_;
	}));

	var objectEnhancer = {
		diff: function (newObj) {
			return newObj;
		}
	};

	function initController ($controller, returnValue) {
		var getResourceSpy = spyOn(resources.admin, 'get').and.returnValue($q.when(returnValue));

		controller = $controller('configurationCtrl', {
			$scope: scope,
            messageHandler: messageHandler,
			resources: resources,
			objectEnhancer: objectEnhancer
		});

		expect(resources.admin.get).toHaveBeenCalledWith('properties');
		expect(resources.admin.get).toHaveBeenCalledTimes(1);

		return getResourceSpy;
	}

	it('updates the page title',  inject(function ($controller) {

		initController($controller, {});

		scope.$digest();

		expect(window.document.title).toBe("Admin - Configuration");

	}));

	it('will initialize the properties object in the page',  inject(function ($controller) {
		//initialise the controller
		initController($controller, { 'email.prop': 'Test Subject' });
		scope.$digest();

		expect(scope.properties).toBeDefined();
		expect(scope.properties).toEqual({ 'email.prop': 'Test Subject' });
		expect(scope.saving).toBe(false);
		expect(scope.old).toEqual({ 'email.prop': 'Test Subject' });
	}));

	it('will update properties on save',  inject(function ($controller) {
		//initialise the controller
		initController($controller, {});
		scope.$digest();

		spyOn(messageHandler, 'showSuccess');

		var properties = scope.properties = {
			'email.test1': 'Test 1',
			'email.test2': 'Test 2'
		};
		scope.$digest();

		spyOn(resources.admin, 'post').and.returnValue($q.when(scope.properties));

		scope.submit();
		scope.$digest();

		expect(resources.admin.post).toHaveBeenCalledWith('editProperties', {resource:properties});
		expect(resources.admin.post).toHaveBeenCalledTimes(1);
		expect(messageHandler.showSuccess).toHaveBeenCalledTimes(1);
		expect(messageHandler.showSuccess).toHaveBeenCalledWith('Configuration properties updated successfully.');
	}));

	it('checks objects are the same', inject(function ($controller) {
		//initialise the controller
		initController($controller, {});
		scope.$digest();
		scope.old = { a: 1 };
		scope.properties = { a: 1 };

		expect(scope.same()).toBe(true);

		scope.properties = { a: 2 };
		expect(scope.same()).toBe(false);
	}));
});

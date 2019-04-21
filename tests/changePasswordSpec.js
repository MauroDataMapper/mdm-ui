import {mock} from './_globalMock';

describe('Controller: changePasswordCtrl', function () {

	var scope, controller, resources, $rootScope, $httpBackend, window, messageHandler, $q;

    mock.init();

	beforeEach(inject(function (_$rootScope_, _resources_, _$httpBackend_, _messageHandler_, $window, _$q_) {
		resources = _resources_;
		scope = _$rootScope_.$new();
		$q = _$q_;
		$httpBackend = _$httpBackend_;
		$rootScope = _$rootScope_;
		window = $window;
        messageHandler = _messageHandler_;
	}));

	function initController($controller){
		controller = $controller('changePasswordCtrl', {
			$scope: scope,
			resources:resources,
            messageHandler: messageHandler
		});
	}

	it('updates the page title',  inject(function ($controller) {
		//initialise the controller
		initController($controller);
		scope.$digest();

		expect(window.document.title).toBe("Change Password");
	}));


	it('will initialize the changePassword object in the page',  inject(function ($controller) {
		//initialise the controller
		initController($controller);
		scope.$digest();

		expect(scope.changePassword).toEqual({});
	}));

	it('will update the changePassword password on save',  inject(function ($controller) {
		//initialise the controller
		initController($controller);
		scope.$digest();

		spyOn(messageHandler, 'showSuccess');
		spyOn(resources.catalogueUser, 'put').and.callFake(function () {
			return $q.when(null);
		});

		scope.changePassword.password = 'Abcdef123';
        scope.changePassword.newPassword = 'Abcdef123';
		scope.changePassword.confirm = 'Abcdef123';
		scope.onAfterSavePassword({ $setPristine: function (){ }});
		scope.$digest();

		expect(messageHandler.showSuccess).toHaveBeenCalledTimes(1);
		expect(scope.changePassword.password).toBe(undefined);
		expect(scope.changePassword.confirm).toBe(undefined);
	}));
});

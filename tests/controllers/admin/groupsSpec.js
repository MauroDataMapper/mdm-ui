import {mock} from '../../_globalMock';

describe('Controller: groupsCtrl', function () {

	var scope, controller, resources, $rootScope, $httpBackend, window, ngToast, $q, stateHandler;

    mock.init();

	beforeEach(inject(function (_$rootScope_, _$httpBackend_, _resources_, _ngToast_, $window, _$q_, _stateHandler_) {
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
		ngToast = _ngToast_;
        stateHandler = _stateHandler_;
	}));

	function initController ($controller, returnValue) {
		var getResourceSpy = spyOn(resources.userGroup, 'get').and.returnValue($q.when(returnValue));
		controller = $controller('groupsCtrl', {
			$scope: scope,
			ngToast: ngToast,
			resources: resources,
            stateHandler: stateHandler
		});
		return getResourceSpy;
	}

	it('updates the page title',  inject(function ($controller) {
		initController($controller, []);
		scope.$digest();
		expect(window.document.title).toBe("Admin - Groups");

	}));

	it('will initialize the groups object in the page',  inject(function ($controller) {
		//initialise the controller
		initController($controller, [{id:1},{id:2}]);
		scope.$digest();

		expect(resources.userGroup.get).toHaveBeenCalledWith();
		expect(resources.userGroup.get).toHaveBeenCalledTimes(1);
		expect(scope.groups).toEqual([{id:1},{id:2}]);
	}));
});

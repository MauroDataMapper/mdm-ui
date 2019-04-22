import {mock} from '../_globalMock';

describe('Controller: dataElementCtrl', function () {

	var scope, controller, resources, stateParams, window, state, $rootScope, $q, stateHandler;

    mock.init();
	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
		_$httpBackend_.whenGET('views/models.html').respond(200, '');
	}));

	beforeEach(inject(function (_$q_, $controller, _$rootScope_, _resources_, $window, $stateParams,_securityHandler_, _stateHandler_) {
		resources = _resources_;
        _$rootScope_.isLoggedIn = function () {
            return true;
        };
		$rootScope = _$rootScope_;
		scope = _$rootScope_.$new();
		stateParams = $stateParams;
		window = $window;
        stateHandler = _stateHandler_;
        $q = _$q_;
        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));
	}));

	function initController($controller){
		controller = $controller('dataElementCtrl', {
			$scope: scope,
			$state: state,
			$stateParams: stateParams,
			resources:resources,
			$window: window
		});
	}

    it('will go to resourceNotFound, if dataElement id is NOT provided, ',  inject(function ($controller) {
        spyOn(stateHandler, 'NotFound');
        stateParams.id = undefined;
        initController($controller);
        scope.$digest();
        expect(stateHandler.NotFound).toHaveBeenCalledWith({location: false});
    }));
    it('loads the dataElement',  inject(function ($controller) {
        stateParams.id = "id";
        stateParams.dataModelId = "dataModelId";
        stateParams.dataClassId = "dataClassId";
        spyOn(resources.dataElement, 'get').and.returnValue($q.when({id:123}));

        initController($controller);
        scope.$digest();

        expect(resources.dataElement.get).toHaveBeenCalledWith(stateParams.dataModelId, stateParams.dataClassId, stateParams.id);
        expect(resources.dataElement.get).toHaveBeenCalledTimes(1);
        expect(window.document.title).toBe("Data Element");

        expect(scope.dataElement).toBeDefined({id:123});
    }));
});
import {mock} from '../_globalMock';

describe('Controller: classificationCtrl', function () {

	var scope, controller, resources, stateParams, window, state, $rootScope, stateHandler, $q ;

    mock.init();
	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
	}));

	beforeEach(inject(function (_$q_, $controller, _$rootScope_, _resources_, $window, $stateParams, _securityHandler_, _stateHandler_) {
		resources = _resources_;
		$rootScope = _$rootScope_;
    _$rootScope_.isLoggedIn = function () {
      return true;
    };

    scope = _$rootScope_.$new();
		stateParams = $stateParams;
		window = $window;
        stateHandler = _stateHandler_;
        $q = _$q_;
        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));
	}));

	function initController($controller){
		controller = $controller('classificationCtrl', {
			$scope: scope,
			$state: state,
			$stateParams: stateParams,
			resources:resources,
			$window: window
		});
	}
    it('will go to resourceNotFound, if classification id is NOT provided, ',  inject(function ($controller) {
        spyOn(stateHandler, 'NotFound');
        stateParams.id = undefined;
        initController($controller);
        scope.$digest();
        expect(stateHandler.NotFound).toHaveBeenCalledWith({location: false});
    }));
    it('loads the classifier',  inject(function ($controller) {
        stateParams.id = "id";
        spyOn(resources.classifier, 'get').and.returnValue($q.when({}));

        initController($controller);
        scope.$digest();

        expect(resources.classifier.get).toHaveBeenCalledWith(stateParams.id);
        expect(resources.classifier.get).toHaveBeenCalledTimes(5);
        expect(window.document.title).toBe("Classifier");

        expect(scope.classifier).toBeDefined({id:123});
    }));

});

import {mock} from '../_globalMock';


describe('Controller: dataModelCtrl', function () {

	var scope, controller, resources, window, stateParams, $rootScope, stateHandler, $q, jointDiagramService3;

    mock.init();
	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
	}));

	beforeEach(inject(function (_$q_, $controller, _$rootScope_, _resources_, $window, $stateParams, _securityHandler_,_stateHandler_,_jointDiagramService3_) {
		resources = _resources_;
        stateHandler = _stateHandler_;
		$rootScope = _$rootScope_;
        _$rootScope_.isLoggedIn = function () {
            return true;
        };
		scope = _$rootScope_.$new();
		stateParams = $stateParams;
		window = $window;
        $q = _$q_;
        jointDiagramService3 = _jointDiagramService3_;

        //Mock _jointDiagramService3_
        _jointDiagramService3_.DrawDataModel = function () {
            return {
                cells:[],
                rootCell:{}
            }
        };

        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));
	}));

	function initController($controller){
		controller = $controller('dataModelCtrl', {
			$scope: scope,
            stateHandler: stateHandler,
			$stateParams: stateParams,
			resources:resources,
			$window: window,
			$rootScope: $rootScope,
            jointDiagramService3: jointDiagramService3
		});
	}

    it('will go to resourceNotFound, if dataModel id is NOT provided, ',  inject(function ($controller) {
        spyOn(stateHandler, 'NotFound');
        stateParams.id = undefined;
        initController($controller);
        scope.$digest();
        expect(stateHandler.NotFound).toHaveBeenCalledWith({location: false});
    }));

    it('loads the dataModel',  inject(function ($controller) {
        stateParams.id = "id";
        spyOn(resources.dataModel, 'get').and.returnValue($q.when({id:123}));

        initController($controller);
        scope.$digest();

        expect(resources.dataModel.get).toHaveBeenCalledWith(stateParams.id);
        expect(resources.dataModel.get).toHaveBeenCalledTimes(1);
        expect(window.document.title).toBe("Data Model");

        expect(scope.dataModel).toBeDefined({id:123});
    }));
});
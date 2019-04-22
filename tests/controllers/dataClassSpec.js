import {mock} from '../_globalMock';

describe('Controller: dataClassCtrl', function () {

	var scope, controller, resources, stateParams, window,stateHandler,$q ;

    mock.init();
	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
	}));

	beforeEach(inject(function (_$q_, $controller, _$rootScope_, _resources_, $window, $stateParams,_stateHandler_) {
		resources = _resources_;
        _$rootScope_.isLoggedIn = function () {
			return true;
        };
		scope = _$rootScope_.$new();
		stateParams = $stateParams;
		window = $window;
        stateHandler = _stateHandler_;
        $q = _$q_;
	}));

	function initController($controller){
		controller = $controller('dataClassCtrl', {
			$scope: scope,
			$stateParams: stateParams,
			resources:resources,
			$window: window
		});
	}

	it('If dataClass id is NOT provided, dataClassCtrl will go to resourceNotFound',  inject(function ($controller) {
		spyOn(stateHandler, 'NotFound');

		stateParams.id = undefined;
		initController($controller);

		scope.$digest();
		expect(stateHandler.NotFound).toHaveBeenCalledWith({location: false});
	}));


	it('dataClassCtrl loads the first level dataClass (dataModel/dataClass)',  inject(function ($controller) {
		stateParams.dataModelId = "dmId";
        stateParams.id = "id";
        spyOn(resources.dataClass, 'get').and.returnValue($q.when({id:123, breadcrumbs:[{id:"DM-ID", finalised:false}]}));

		initController($controller);
		scope.$digest();

        expect(resources.dataClass.get).toHaveBeenCalledWith(stateParams.dataModelId, null, stateParams.id);
        expect(resources.dataClass.get).toHaveBeenCalledTimes(1);
		expect(window.document.title).toBe("Data Class");

        expect(scope.dataClass).toBeDefined({id:123});

	}));
    it('dataClassCtrl loads the second level dataClass (dataModel/dataClass/dataClass)',  inject(function ($controller) {
        stateParams.dataModelId = "dmId";
        stateParams.dataClassId = "dcId";
        stateParams.id = "id";
        spyOn(resources.dataClass, 'get').and.returnValue($q.when({id:123,breadcrumbs:[{id:"DM-ID", finalised:false}]}));

        initController($controller);
        scope.$digest();

        expect(resources.dataClass.get).toHaveBeenCalledWith(stateParams.dataModelId, stateParams.dataClassId, stateParams.id);
        expect(resources.dataClass.get).toHaveBeenCalledTimes(1);
        expect(window.document.title).toBe("Data Class");

        expect(scope.dataClass).toBeDefined({id:123});
    }));

});
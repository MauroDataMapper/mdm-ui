import {mock} from '../../_globalMock';


describe('Controller: modelManagementCtrl', function () {

	var scope, controller, resources, $rootScope, $httpBackend, window, ngToast, $q, stateHandler;

    mock.init();
	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
	}));

	beforeEach(inject(function (_$rootScope_, _$httpBackend_, _resources_, _ngToast_, $window, _$q_) {
		scope = _$rootScope_.$new();
		resources = _resources_;
		$httpBackend = _$httpBackend_;
		$rootScope = _$rootScope_;
		$q = _$q_;
		window = $window;
		ngToast = _ngToast_;
	}));

	function initController ($controller) {
		//load all groups
		spyOn(resources.tree, 'get').and.returnValue($q.when([
            {id:"FID1", label:"FLabel1", domainType:"Folder"}
		]));

		controller = $controller('modelManagementCtrl', {
			$scope: scope,
			ngToast: ngToast,
			resources: resources
		});
	}

	it('will initialize the page correctly',  inject(function ($controller) {
		initController($controller, []);
		scope.$digest();
		expect(scope.folders).toEqual({
            "children": [
                {id:"FID1", label:"FLabel1", domainType:"Folder", checked: false}
            ],
            isRoot: true
        });
	}));

    it('onNodeChecked adds/removes the selected node to/from the map',  inject(function ($controller) {
        initController($controller, []);
        scope.$digest();

        expect(scope.selectedElements).toEqual({});
        expect(scope.selectedElementsCount).toEqual(0);
        scope.onNodeChecked({id:"DM-ID1"});

        expect(scope.selectedElements).toEqual({
			"DM-ID1":{id:"DM-ID1"}
		});
        expect(scope.selectedElementsCount).toEqual(1);

        //now remove it
        scope.onNodeChecked({id:"DM-ID1"});
        expect(scope.selectedElements).toEqual({});
        expect(scope.selectedElementsCount).toEqual(0);
    }));

    it('delete will call the backend correctly for soft delete',  inject(function ($controller) {
        initController($controller, []);
        scope.$digest();
        scope.onNodeChecked({id:"DM-ID1", domainType: "DataModel"});
        scope.onNodeChecked({id:"DM-ID2", domainType: "DataModel"});

        spyOn(resources.dataModel, "delete").and.returnValue($q.when());
        scope.delete(false);

        expect(resources.dataModel.delete).toHaveBeenCalledWith(null, null, null, { permanent: false, ids: [ 'DM-ID1', 'DM-ID2' ] });

    }));

    it('delete will call the backend correctly for permanent delete',  inject(function ($controller) {
        initController($controller, []);
        scope.$digest();
        scope.onNodeChecked({id:"DM-ID1", domainType: "DataModel"});
        scope.onNodeChecked({id:"DM-ID2", domainType: "DataModel"});

        spyOn(resources.dataModel, "delete").and.returnValue($q.when());
        scope.delete(true);

        expect(resources.dataModel.delete).toHaveBeenCalledWith(null, null, null, { permanent: true, ids: [ 'DM-ID1', 'DM-ID2' ] });
    }));

});

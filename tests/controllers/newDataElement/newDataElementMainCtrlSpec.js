import {mock} from '../../_globalMock';

describe('Controller: newDataElementCtrl', function () {

	var scope, controller, $state, $stateParams,resources, $rootScope, stateHandler;
    mock.init();


	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/twoSidePanel.html').respond(200, '');
	}));


	beforeEach(inject(function ($controller, $rootScope, _$window_, _$state_, _$stateParams_, _resources_, _$rootScope_, _stateHandler_, _$httpBackend_) {
		scope = $rootScope.$new();
		$state = _$state_;
        $rootScope = _$rootScope_;
        $rootScope.simpleViewSupport = false;
        stateHandler = _stateHandler_;

        $stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";
        $stateParams.parentDataClassId = "DEFAULT-PARENT-DC-ID";
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/dataClasses/DEFAULT-PARENT-DC-ID/').respond({});
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/dataTypes').respond({});

		resources = _resources_;
		controller = $controller('newDataElementCtrl', {$scope: scope, $window:_$window_, $state:_$state_, $stateParams:_$stateParams_, resources: resources});
	}));


	it('newDataElementCtrl steps are defined properly', function () {
		//it has 2 steps
		expect(scope.steps.length).toBe(3, "It should have 2 steps");

        expect(scope.steps[0]).toEqual({
            templateUrl: '../../../views/newDataElement/step0.html',
            title: 'How to create?',
            hasForm: 'true',
            controller: 'newDataElementStep0Ctrl'
        });

		expect(scope.steps[1]).toEqual({
			templateUrl: '../../../views/newDataElement/step1.html',
			title: 'Element Details',
			hasForm: 'true',
			controller: 'newDataElementStep1Ctrl'
		});

		expect(scope.steps[2]).toEqual({
			templateUrl: '../../../views/newDataElement/step2.html',
			title: 'Properties',
			controller: 'newDataElementStep2Ctrl'
		});
	});

	it('newDataElementCtrl scope is initialized properly', function () {
		//default models are initialized properly
		expect(scope.model).toBeDefined("model");
		expect(scope.model.metadata).toBeDefined("model.metadata");
		expect(scope.model.dataType).not.toBeDefined("model.dataType");
		expect(scope.model.description).not.toBeDefined("model.description");
		expect(scope.model.classifiers).toEqual([],"classifiers to be an empty array");
		expect(scope.model.parentDataModel).toBeDefined();
		expect(scope.model.parentDataClass).toBeDefined();
	});

	it('will redirect to resource not found if parentDataModel is not provided',inject(function ($controller, $rootScope, $window, _$state_, _$stateParams_) {
		spyOn(stateHandler, 'NotFound').and.returnValue({});
		$stateParams.parentDataModelId  = undefined;
		$controller('newDataElementCtrl', {$scope: scope, $window:$window, $state:$state, $stateParams: $stateParams});
		scope.$digest();
		expect(stateHandler.NotFound).toHaveBeenCalledWith({ location: false });
	}));

    it('will redirect to resource not found if parentDataClass is not provided',inject(function ($controller, $rootScope, $window, _$state_, _$stateParams_) {
        spyOn(stateHandler, 'NotFound').and.returnValue({});
        $stateParams.parentDataModelId  = 123;
        $stateParams.parentDataClassId  = undefined;
        $controller('newDataElementCtrl', {$scope: scope, $window:$window, $state:$state, $stateParams: $stateParams});
        scope.$digest();
        expect(stateHandler.NotFound).toHaveBeenCalledWith({ location: false });
    }));


	it('loads parent dataClass object and related objects',inject(function ($controller, $window, $q) {
		var parentDataClass = {
			id:"P-DC-ID",
			label:"P-DC-LABEL",
            breadcrumbs:[{id:"P-DM-ID", label:"P-DM-Label"}]
		};
		spyOn(resources.dataClass, 'get').and.callFake(function() {
				return $q.when(parentDataClass);
		});
        spyOn(resources.dataModel, 'get').and.callFake(function() {
            return $q.when({count:5,items:[1,2,3,4,5]});
        });

		$stateParams = { parentDataModelId: "P-DM-ID", parentDataClassId:"P-DC-ID"};

		$controller('newDataElementCtrl', {$scope: scope, $window:$window, $state:$state, $stateParams: $stateParams, resources:resources});
		scope.$digest();

		expect(resources.dataClass.get).toHaveBeenCalledWith("P-DM-ID", undefined, "P-DC-ID");
		expect(resources.dataModel.get).toHaveBeenCalledWith("P-DM-ID", "dataTypes");

		expect(scope.model.parent.label).toBe("P-DC-LABEL");
		expect(scope.model.parent.breadcrumbs.length).toBe(1);
		expect(scope.model.parent.breadcrumbs[0].label).toBe("P-DM-Label");
		expect(scope.allDataTypesCount).toBe(5);
	}));
});
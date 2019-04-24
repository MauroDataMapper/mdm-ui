import {mock} from '../../_globalMock';


describe('Controller: newDataTypeCtrl', function () {
	var scope, controller, $stateParams, $state, resources, $rootScope, stateHandler;

    mock.init();

	//noinspection JSUnresolvedFunction
	beforeEach(inject(function ($controller, _$rootScope_, _$window_, _$stateParams_, _$state_, _resources_, $q, _securityHandler_, _stateHandler_, _$httpBackend_) {
        $rootScope = _$rootScope_;
        $rootScope.simpleViewSupport = false;

		scope = $rootScope.$new();
		$stateParams = _$stateParams_;
		$state = _$state_;
		resources = _resources_;
        stateHandler = _stateHandler_;


        $stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/').respond({});


        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));

		controller = $controller('newDataTypeCtrl', {$scope: scope, $window:_$window_});
	}));

	it('newDataTypeCtrl steps are defined properly', function () {
		//it has 2 steps
		expect(scope.steps.length).toBe(3,"It should have 2 steps");

        expect(scope.steps[0]).toEqual({
            templateUrl: '../../../views/newDataType/step0.html',
            title: 'How to create?',
            hasForm: 'true',
            controller: 'newDataTypeStep0Ctrl'
        });

		expect(scope.steps[1]).toEqual({
			templateUrl: '../../../views/newDataType/step1.html',
			title: 'Data Type Details',
			hasForm: 'true',
			controller: 'newDataTypeStep1Ctrl'
		});
		expect(scope.steps[2]).toEqual({
			templateUrl: '../../../views/newDataType/step2.html',
			title: 'Metadata',
			controller: 'newDataTypeStep2Ctrl'
		});
	});

	it('newDataTypeCtrl scope is initialized properly', function () {

		expect(scope.model).toBeDefined();
		expect(scope.model.details.metadata).toEqual([]);
		expect(scope.model.details.enumerationValues).toEqual([]);
		expect(scope.model.details.classifiers).toEqual([]);
		expect(scope.model.details.domainType).toEqual("PrimitiveType");
	});


	it('will redirect to resource not found if parentId is not provided',inject(function ($controller, $rootScope, $window) {
		spyOn(stateHandler, 'NotFound').and.returnValue({});
		$stateParams.parentDataModelId  = undefined;
		$controller('newDataTypeCtrl', {$scope: scope, $window:$window, $state:$state, $stateParams: $stateParams});
		scope.$digest();
		expect(stateHandler.NotFound).toHaveBeenCalledWith({ location: false });
	}));


	it('loads parent dataModel object and related objects',inject(function ($controller, $window, $q) {
		var parentDataModel = {id:"P-DM-ID"};
		spyOn(resources.dataModel, 'get').and.callFake(function() {
			return $q.when(parentDataModel);
		});
		$stateParams = {parentDataModelId:"P-DM-ID"};
		$controller('newDataTypeCtrl', {$scope: scope, $window:$window, $state:$state, $stateParams: $stateParams, resources:resources});
		scope.$digest();

		expect(resources.dataModel.get).toHaveBeenCalledWith("P-DM-ID");
		expect(scope.model.parentDataModel).toEqual(parentDataModel);
	}));

});
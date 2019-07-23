import {mock} from '../../_globalMock';

describe('Controller: newDataClassCtrl', function () {
	var scope, controller, $state, $stateParams, resources, $window, $rootScope, stateHandler;

    mock.init();
	beforeEach(angular.mock.module('views/resourceNotFound.html'));

    //noinspection JSUnresolvedFunction
	beforeEach(inject(function ($controller, $rootScope, _$window_, _$state_, _$stateParams_, _resources_,_securityHandler_,$q, _$rootScope_ , _stateHandler_, _$httpBackend_) {
		scope = $rootScope.$new();
		$state = _$state_;
		$stateParams = _$stateParams_;
        $stateParams.parentDataModelId = "DEFAULT-PARENT-DM-ID";

		resources = _resources_;
		$window = _$window_;
        $rootScope =  _$rootScope_;
        stateHandler = _stateHandler_;
        $rootScope.simpleViewSupport = false;

		//Load default
        _$httpBackend_.expect("GET", $rootScope.backendURL + '/dataModels/DEFAULT-PARENT-DM-ID/').respond({});

        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));
		controller = $controller('newDataClassCtrl', {$scope: scope, $window:_$window_, $state:_$state_, $stateParams:_$stateParams_, resources:_resources_});
	}));

	it('newDataClassCtrl steps are defined properly', function () {
		//it has 2 step
		expect(scope.steps.length).toBe(2, "It should have 2 steps");

        expect(scope.steps[0]).toEqual({
            templateUrl: '../../../views/newDataClass/step0.html',
            title: 'How to create?',
            hasForm: 'true',
            controller: 'newDataClassStep0Ctrl'
        });

		expect(scope.steps[1]).toEqual({
			templateUrl: '../../../views/newDataClass/step1.html',
			title: 'Element Details',
			hasForm: 'true',
			controller: 'newDataClassStep1Ctrl'
		});
		//Removed one step -AS
		// expect(scope.steps[2]).toEqual({
		// 	templateUrl: '../../../views/newDataClass/step2.html',
		// 	title: 'Properties',
		// 	controller: 'newDataClassStep2Ctrl'
		// });

		expect($window.document.title).toBe("New DataClass");
	});

	it('newDataClassCtrl scope is initialized properly', function () {
		//default models are initialized properly
		expect(scope.model).toBeDefined();
		expect(scope.model.label).not.toBeDefined();
		expect(scope.model.description).not.toBeDefined();
		expect(scope.model.metadata).toEqual([]);
		expect(scope.model.classifiers).toEqual([]);
	});

	it('newDataClassCtrl will redirect to resource not found if parentId is not provided',inject(function ($controller, $window) {
		//create a mock on $state to capture 'go'
		//noinspection JSUnresolvedFunction
		spyOn(stateHandler, 'NotFound').and.returnValue({});
		//initialize the $stateParams
		$stateParams.parentDataModelId  = undefined;
		$stateParams.parentType = "datamodel";
		//create a local controller
		$controller('newDataClassCtrl', {$scope: scope, $window:$window, $state:$state, $stateParams: $stateParams});
		scope.$digest();
		expect(stateHandler.NotFound).toHaveBeenCalledWith({ location: false });
	}));

	it('newDataClassCtrl will redirect to resource not found if parentType is not provided',inject(function ($controller, $window) {
		spyOn(stateHandler, 'NotFound').and.returnValue({});
		$stateParams.parentDataModelId = undefined;
		$controller('newDataClassCtrl', {$scope: scope, $window:$window, $state:$state, $stateParams: $stateParams});
		scope.$digest();
		expect(stateHandler.NotFound).toHaveBeenCalledWith({ location: false });
	}));


	it('loads dataModel object if parent is a dataModel',inject(function ($controller, $window, $q) {
		spyOn(resources.dataModel, 'get').and.callFake(function() {
			return $q.when({id:"P-DM-ID", label:"P-DM-Label"});
		});
		$stateParams = {
			parentDataModelId:"P-DM-ID",
			parentDataClassId:null
		};

		$controller('newDataClassCtrl', {$scope: scope, $window:$window, $state:$state, $stateParams: $stateParams, resources:resources});
		scope.$digest();

		expect(resources.dataModel.get).toHaveBeenCalledWith("P-DM-ID");
        expect(scope.model.parent).toBeDefined();
        expect(scope.model.parent.breadcrumbs.length).toBe(1);
        expect(scope.model.parent.breadcrumbs[0].label).toEqual("P-DM-Label");
	}));

	it('loads dataClass object if parent is a dataClass',inject(function ($controller, $window, $q) {
        spyOn(resources.dataClass, 'get').and.callFake(function() {
            return $q.when({
            	id:"P-DC-ID",
				label:"P-DC-Label",
                breadcrumbs:[
                	{id:"P-DM-ID", label:"P-DM-Label"},
                	{id:"GP-DC-ID",label:"GP-DC-Label"}
				]
            });
        });
        $stateParams = {
            parentDataModelId:"P-DM-ID",
            parentDataClassId:"P-DC-ID",
            grandParentDataClassId:"GP-DC-ID"
        };
        $controller('newDataClassCtrl', {$scope: scope, $window:$window, $state:$state, $stateParams: $stateParams, resources:resources});
        scope.$digest();

        expect(resources.dataClass.get).toHaveBeenCalledWith("P-DM-ID", "GP-DC-ID", "P-DC-ID");
        expect(scope.model.parent).toBeDefined();
        expect(scope.model.parent.breadcrumbs.length).toBe(3);
        expect(scope.model.parent.breadcrumbs[2].label).toEqual("P-DC-Label");
	}));
});

import {mock} from '../../_globalMock';

describe('Controller: newDataModelCtrl', function () {

	var scope, controller, resources, $q, $stateParams;
    mock.init();

	beforeEach(inject(function ($controller, $rootScope, _$window_,_resources_, _$q_, _$stateParams_, _$httpBackend_) {
        resources =_resources_;
        $q= _$q_;
        $stateParams = _$stateParams_;
		scope = $rootScope.$new();
        $stateParams.parentFolderId = "Parent-Folder-ID";

        spyOn(resources.folder, "get").and.returnValue($q.when([]));


        _$httpBackend_.expect("GET", $rootScope.backendURL + '/folders/Parent-Folder-ID/').respond({});


        controller = $controller('newDataModelCtrl', {$scope: scope, $window:_$window_, resources:resources});
	}));

	it('newDataModelCtrl steps are defined properly', function () {
        scope.$digest();
		//it has 2 steps
		expect(scope.steps.length).toBe(2,"It should have 2 steps");
		expect(scope.steps[0]).toEqual({
			templateUrl: '../../../views/newDataModel/step1.html',
			title: 'Element Details',
			hasForm: 'true',
			controller: 'newDataModelStep1Ctrl'
		});
        expect(scope.steps[1]).toEqual({
            templateUrl: '../../../views/newDataModel/step2.html',
            title: 'Properties',
            controller: 'newDataModelStep2Ctrl'
        });
		//Removed one step -AS
		// expect(scope.steps[2]).toEqual({
		// 	templateUrl: '../../../views/newDataModel/step3.html',
		// 	title: 'Properties',
		// 	controller: 'newDataModelStep3Ctrl'
		// });
        expect(resources.folder.get).toHaveBeenCalledWith("Parent-Folder-ID");
    });

	it('newDataModelCtrl scope is initialized properly', function () {
        scope.$digest();
		//default models are initialized properly
		expect(scope.model).toBeDefined();
		expect(scope.model.metadata).toEqual([]);
		expect(scope.model.classifiers).toEqual([]);
        expect(resources.folder.get).toHaveBeenCalledWith("Parent-Folder-ID");
	});

});

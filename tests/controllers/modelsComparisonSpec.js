import {mock} from '../_globalMock';

describe('Controller: modelsComparisonCtrl', function () {

	var scope, controller, resources, window, stateParams, $rootScope, stateHandler, $q;

    mock.init();

	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
	}));

	beforeEach(inject(function (_$q_, $controller, _$rootScope_, _resources_, $window, $stateParams, _securityHandler_,_stateHandler_) {
		resources = _resources_;
        stateHandler = _stateHandler_;
		$rootScope = _$rootScope_;
		scope = _$rootScope_.$new();
		stateParams = $stateParams;
		window = $window;
        $q = _$q_;
        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));
        spyOn(resources.terminology, 'get').and.returnValue($q.when({id:'TG-ID', finalised:true, editable:false, classifiers:[{id:"CLS-ID"}]}));
        spyOn(resources.term, 'get').and.returnValue($q.when({id:'TM-ID', label:"Term1", domainType:"Term", terminology:"TG-ID", classifiers:[{id:"CLS-ID"}]}));

    }));

	function initController($controller){
		controller = $controller('modelsComparisonCtrl', {
			$scope: scope,
            stateHandler: stateHandler,
			$stateParams: stateParams,
			resources:resources,
			$window: window,
			$rootScope: $rootScope
		});
	}

    it('checkIfSwapNeeded checks if left/right models needs to be swapped',  inject(function ($controller) {
    	//Source is newer version of Target.................................
        scope.sourceModel = {
        	id: "sourceID",
            semanticLinks: [
				{linkType:"New Version Of", target:{id:"targetID"}}
			]
		};
        scope.targetModel = {
            id: "targetID",
         };

        initController($controller);
        scope.$digest();
        var result = scope.checkIfSwapNeeded();
        expect(result).toBeTruthy();


        //Target is superseded By Source...................................
        scope.sourceModel = {
            id: "sourceID",
        };
        scope.targetModel = {
            id: "targetID",
            semanticLinks: [
                {linkType:"Superseded By", target:{id:"sourceID"}}
            ]
        };
        scope.$digest();
        result = scope.checkIfSwapNeeded();
        expect(result).toBeTruthy();


        //No relation between them..........................................
        scope.sourceModel = {
            id: "sourceID",
        };
        scope.targetModel = {
            id: "targetID",
            semanticLinks: [
                {linkType:"Superseded By", target:{id:"sourceID2"}}
            ]
        };
        scope.$digest();
        result = scope.checkIfSwapNeeded();
        expect(result).toBeFalsy();
    }));

    it('swap swaps the left and right models and reloads their hierarchy',  inject(function ($controller) {
        scope.sourceModel = {id: "sourceID"};
        scope.targetModel = {id: "targetID"};

        initController($controller);
        scope.$digest();

        spyOn(scope,"runDiff").and.returnValue(true);
    	spyOn(scope,"loadModelTree").and.callFake(function (p) {
            if(p.id === "sourceID"){return $q.when([{id:"s1"}, {id:"s2"}]);}
            if(p.id === "targetID"){return $q.when([{id:"t1"}, {id:"t2"}]);}
        });

        scope.swap();
        scope.$digest();

        expect(scope.loadModelTree.calls.count()).toBe(2);
        expect(scope.loadModelTree.calls.all()[0].args[0].id).toEqual("targetID");
        expect(scope.loadModelTree.calls.all()[1].args[0].id).toEqual("sourceID");
        expect(scope.sourceModel.id).toEqual("targetID");
        expect(scope.targetModel.id).toEqual("sourceID");

        expect(scope.runDiff).toHaveBeenCalled();
    }));

    it('findDiffDataTypeChanges ',  inject(function ($controller) {
        scope.sourceModel = {id: "sourceID"};
        scope.targetModel = {id: "targetID"};

        initController($controller);
        scope.$digest();

        spyOn(scope,"runDiff").and.returnValue(true);
        spyOn(scope,"loadModelTree").and.callFake(function (p) {
            if(p.id === "sourceID"){return $q.when([{id:"s1"}, {id:"s2"}]);}
            if(p.id === "targetID"){return $q.when([{id:"t1"}, {id:"t2"}]);}
        });

        scope.swap();
        scope.$digest();

        expect(scope.loadModelTree.calls.count()).toBe(2);
        expect(scope.loadModelTree.calls.all()[0].args[0].id).toEqual("targetID");
        expect(scope.loadModelTree.calls.all()[1].args[0].id).toEqual("sourceID");
        expect(scope.sourceModel.id).toEqual("targetID");
        expect(scope.targetModel.id).toEqual("sourceID");

        expect(scope.runDiff).toHaveBeenCalled();
    }));
});
import {mock} from '../_globalMock';

describe('Controller: terminologyCtrl', function () {

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


        spyOn(resources.terminology, 'get').and.callFake(function(id, action, options) {
            if(action === "terms/search"){
                return $q.when({results:[
                        {id:1, label:"Term1", domainType:"Term"},
                        {id:2, label:"Term2", domainType:"Term"}
                    ],
                    count:2});
            }else{
                return $q.when({id:'T-ID'});
            }
        });

	}));

	function initController($controller){
		controller = $controller('terminologyCtrl', {
			$scope: scope,
            stateHandler: stateHandler,
			$stateParams: stateParams,
			resources:resources,
			$window: window,
			$rootScope: $rootScope
		});
	}

    it('will go to resourceNotFound, if terminology id is NOT provided, ',  inject(function ($controller) {
        spyOn(stateHandler, 'NotFound');
        stateParams.id = undefined;
        initController($controller);
        scope.$digest();
        expect(stateHandler.NotFound).toHaveBeenCalledWith({location: false});
    }));

    it('loads terminology',  inject(function ($controller) {
        stateParams.id = "T-ID";

        initController($controller);
        scope.$digest();

        expect(resources.terminology.get).toHaveBeenCalledWith(stateParams.id);
        expect(resources.terminology.get).toHaveBeenCalledTimes(1);

        expect(window.document.title).toBe("Terminology");

        expect(scope.terminology).toEqual({id:'T-ID', classifiers:[]});
        expect(scope.activeTab).toEqual({index:0, name:"properties"});

        expect(resources.terminology.get).toHaveBeenCalledWith("T-ID");
    }));


    it('fetch searched within Terms of the Terminology',  inject(function ($controller) {
        stateParams.id = "T-ID";

        initController($controller);
        scope.$digest();
        expect(scope.terminology).toBeDefined({id:'T-ID'});

        scope.fetch("SEARCH+TERM");
        scope.$digest();

        expect(resources.terminology.get).toHaveBeenCalledWith(stateParams.id, "terms/search", { queryStringParams: { search: "SEARCH%2BTERM", limit: 30, offset: 0}});
        expect(scope.searchTerm).toEqual("SEARCH+TERM");
    }));


    it('fetch searched within Terms of the Terminology and accepts offset & limit',  inject(function ($controller) {
        stateParams.id = "T-ID";

        initController($controller);
        scope.$digest();
        expect(scope.terminology).toBeDefined({id:'T-ID'});

        scope.fetch("SEARCH+TERM", 1 , 10);
        scope.$digest();

        expect(resources.terminology.get).toHaveBeenCalledWith(stateParams.id, "terms/search", { queryStringParams: Object({ search: "SEARCH%2BTERM", limit: 10, offset: 1}) });
        expect(scope.searchTerm).toEqual("SEARCH+TERM");
    }));


    it('onTermSelect loads the selected Term',  inject(function ($controller) {
        stateParams.id = "T-ID";

        initController($controller);
        scope.$digest();

        spyOn(stateHandler, 'NewWindow').and.returnValue($q.when(true));

        scope.onTermSelect({id:"TERM-ID", label:"TERM-LABEL", terminology:"P-TERMINOLOGY-ID"});
        scope.$digest();

        expect(stateHandler.NewWindow).toHaveBeenCalledWith("term",{terminologyId:"P-TERMINOLOGY-ID", id:"TERM-ID"});
    }));


    it('Save broadcast an event to $rootScope',  inject(function ($controller) {
        stateParams.id = "T-ID";
        initController($controller);
        scope.$digest();

        spyOn($rootScope, '$broadcast').and.returnValue($q.when(true));
        scope.Save({id:"T-ID", label:"NEW-LABEL"});
        scope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$elementDetailsUpdated', {id:"T-ID", label:"NEW-LABEL"});
    }));

});
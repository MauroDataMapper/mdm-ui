import {mock} from '../_globalMock';


describe('Controller: termCtrl', function () {

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
		controller = $controller('termCtrl', {
			$scope: scope,
            stateHandler: stateHandler,
			$stateParams: stateParams,
			resources:resources,
			$window: window,
			$rootScope: $rootScope
		});
	}

    it('will go to resourceNotFound, if term-id or terminologyId-id is NOT provided, ',  inject(function ($controller) {
        spyOn(stateHandler, 'NotFound');
        stateParams.terminologyId = "TG-ID";
        stateParams.id = undefined;
        initController($controller);
        scope.$digest();
        expect(stateHandler.NotFound).toHaveBeenCalledWith({location: false});


        stateParams.terminologyId = undefined;
        stateParams.id = "TM-ID";
        initController($controller);
        scope.$digest();
        expect(stateHandler.NotFound).toHaveBeenCalledWith({location: false});

    }));

    it('loads terminology & term',  inject(function ($controller) {
        stateParams.id = "TM-ID";
        stateParams.terminologyId = "TG-ID";

        initController($controller);
        scope.$digest();

        expect(resources.terminology.get).toHaveBeenCalledWith("TG-ID");
        expect(resources.term.get).toHaveBeenCalledWith("TG-ID", "TM-ID");


        expect(scope.terminology).toEqual({id:'TG-ID', finalised:true, editable:false, classifiers:[{id:"CLS-ID"}]});
        expect(scope.term).toEqual({id:'TM-ID', label:"Term1", domainType:"Term", terminology:"TG-ID", classifiers:[{id:"CLS-ID"}], finalised:true, editable:false, semanticLinks:undefined});
        expect(scope.activeTab).toEqual({index:0, name:"properties"});

        expect(window.document.title).toBe("Term");
    }));

    it('Save broadcast an event to $rootScope',  inject(function ($controller) {
        stateParams.id = "TM-ID";
        stateParams.terminologyId = "TG-ID";
        initController($controller);
        scope.$digest();

        spyOn($rootScope, '$broadcast').and.returnValue($q.when(true));
        scope.Save({id:"TM-ID", label:"NEW-LABEL"});
        scope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$elementDetailsUpdated', {id:"TM-ID", label:"NEW-LABEL"});
    }));

});
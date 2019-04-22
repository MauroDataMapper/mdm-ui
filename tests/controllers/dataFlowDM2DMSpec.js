import {mock} from '../_globalMock';


describe('Controller: dataFlowDM2DMCtrl', function () {

	var scope, controller, resources, $rootScope, $httpBackend, window, ngToast, $q, dataFlowHandler, $stateParams, stateHandler, securityHandler;

	mock.init();
	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
	}));

	beforeEach(inject(function (_$rootScope_, _resources_, _$httpBackend_, _ngToast_, $window, _$q_, _DM2DMDataFlowLightHandler_, _$stateParams_, _stateHandler_, _securityHandler_) {
		resources = _resources_;
        _$rootScope_.isLoggedIn = function () {
            return true;
        };
		scope = _$rootScope_.$new();
		$q = _$q_;
		$httpBackend = _$httpBackend_;
		$rootScope = _$rootScope_;
		window = $window;
		securityHandler = _securityHandler_;
		ngToast = _ngToast_;
        dataFlowHandler = _DM2DMDataFlowLightHandler_;
        $stateParams = _$stateParams_;
        stateHandler = _stateHandler_;

        $stateParams.id = "DM-ID";
	}));

  var fake = {
        dataFlowHandler: {
            zoom: function(z) {},
            drawDataFlows: function() {},
            updateTempPathId: function() {},
            updateDataFlow: function() {}
        },
        sourceDFs: [
            {
                id: "DF-ID-1",
                label: "DF-Label-1",
                source: {id: "DM-SOURCE-ID-1"},
                target: {id: "DM-ID"}
            }
        ],
        targetDFs: [
            {
                id: "DF-ID-2",
                label: "DF-Label-1",
                source: {id: "DM-ID"},
                target: {id: "DM-TARGET-ID-1"}
            },
            {
                id: "DF-ID-3",
                label: "DF-Label-1",
                source: {id: "DM-ID"},
                target: {id: "DM-TARGET-ID-2"}
            }
        ],
		allTree:[
            {id:"DM-ID-1", label:"DM-Label-1", deleted:false, type:"Data Asset"},
            {id:"DM-ID-2", label:"DM-Label-2", deleted:false, type:"Data Asset"},
            {id:"DM-ID-3", label:"DM-Label-3", deleted:false, type:"Data Asset"}
        ]
    };

	function initController($controller){

	    if(fake.dataFlowHandler){
	        $(fake.dataFlowHandler).off();
        }

        spyOn(securityHandler,'dataModelAccess').and.returnValue({
            showEdit: true,
            showPermission: true,
            showNewVersion: true,
            showFinalise: true,
            showDelete: true
        });


      spyOn(resources.importer,'get').and.returnValue($q.when([]));
      spyOn(resources.public,'get').and.returnValue($q.when([]));
      spyOn(resources.public,'dataFlowImportPlugins').and.returnValue($q.when([]));


        spyOn(resources.dataModel, 'get').and.callFake(function (id, action, options) {
            if(action === "dataFlows" && options.filters === "type=source") {
                return $q.when({count:fake.targetDFs.length, items:fake.targetDFs});
            }else if(action === "dataFlows" && options.filters === "type=target"){
                return $q.when({count:fake.sourceDFs.length, items:fake.sourceDFs});
			}
            return $q.when({id:"DM-ID",label:"DM-Label"});
        });
        spyOn(resources.tree, 'get').and.callFake(function () {
            return $q.when(fake.allTree);
        });
        spyOn(dataFlowHandler, 'getDM2DMDataFlowLightHandler').and.returnValue(fake.dataFlowHandler);
        spyOn(fake.dataFlowHandler, 'zoom');
        spyOn(fake.dataFlowHandler, 'drawDataFlows');

		controller = $controller('dataFlowDM2DMCtrl', {
			$scope: scope,
			resources:resources,
			ngToast: ngToast,
            dataFlowHandler: dataFlowHandler,
            $stateParams: $stateParams,
            stateHandler: stateHandler
		});
	}

	  it('updates the page title',  inject(function ($controller) {
		initController($controller);
		scope.$digest();
		expect(window.document.title).toBe("Dataflow");
	}));

    it('scope is initialized',  inject(function ($controller) {

        initController($controller);
        scope.$digest();

        expect(scope.dataFlowsMap['DF-ID-1']).toBeDefined();
        expect(scope.dataFlowsMap['DF-ID-2']).toBeDefined();
        expect(scope.dataFlowsMap['DF-ID-3']).toBeDefined();
        expect(scope.source).toEqual({id:"DM-ID",label:"DM-Label"});
        expect(scope.sourceTree).toEqual([{id:"DM-ID",label:"DM-Label"}]);
        expect(scope.allModels).toEqual({
            isRoot: true,
            children: fake.allTree
        });

        expect(resources.dataModel.get).toHaveBeenCalledWith("DM-ID", "dataFlows", {all:true, filters:"type=source"});
        expect(resources.dataModel.get).toHaveBeenCalledWith("DM-ID", "dataFlows", {all:true, filters:"type=target"});
        expect(resources.dataModel.get).toHaveBeenCalledWith("DM-ID");
        expect(resources.tree.get).toHaveBeenCalledWith();
        expect(dataFlowHandler.getDM2DMDataFlowLightHandler).toHaveBeenCalledWith(jasmine.any(jQuery),jasmine.any(jQuery),null, scope.accessHandler);
        expect(fake.dataFlowHandler.zoom).toHaveBeenCalledWith(1);

        expect(fake.dataFlowHandler.drawDataFlows).toHaveBeenCalledWith(scope.source, fake.targetDFs, fake.sourceDFs, 50);
    }));

    it('if id is not provided, then go to notFound page',  inject(function ($controller) {
        spyOn(stateHandler, 'NotFound');
        $stateParams.id = null;

        initController($controller);
        scope.$digest();

        expect(stateHandler.NotFound).toHaveBeenCalledWith({location:false});
    }));

    it('when dataFlowAdded triggers, it adds a dataFlow',  inject(function ($controller) {

        spyOn(fake.dataFlowHandler, 'updateTempPathId').and.returnValue();
        spyOn(fake.dataFlowHandler, 'updateDataFlow').and.returnValue();
        var savedDF = {
            id:"DF-SAVED-ID",
            label:"DF-SAVED-LABEL",
            description:"DF-SAVED-DESC"
        };
        spyOn(resources.dataFlow,"post").and.callFake(function () {return $q.when(savedDF)});
        initController($controller);
        scope.$digest();
        $(fake.dataFlowHandler).triggerHandler('dataFlowAdded', {
        	id:"DF-TEMP-ID",
            source:{id:"DM-ID-1"},
			target:{id:"DM-TARGET-ID-X"}
		});
        scope.$digest();

        expect(fake.dataFlowHandler.updateTempPathId).toHaveBeenCalledWith("DF-TEMP-ID", savedDF.id);
        expect(fake.dataFlowHandler.updateDataFlow).toHaveBeenCalledWith(savedDF.id, savedDF.id, savedDF.label, savedDF.description);
        expect(scope.dataFlowsMap['DF-SAVED-ID']).toEqual(savedDF);
    }));

    it('when dataFlowRemoved triggers, it removes the dataFlow',  inject(function ($controller) {
        spyOn(resources.dataFlow, "delete").and.callFake(function () {return $q.when({})});
        initController($controller);
        scope.$digest();

        $(fake.dataFlowHandler).triggerHandler('dataFlowRemoved', "DF-ID-2");
        scope.$digest();

        expect(resources.dataFlow.delete).toHaveBeenCalledWith("DM-TARGET-ID-1", "DF-ID-2");
        expect(scope.dataFlowsMap["DF-ID-2"]).toBeUndefined();
        expect(scope.dataFlowsMap["DF-ID-1"]).toBeDefined();
        expect(scope.dataFlowsMap["DF-ID-3"]).toBeDefined();
    }));

    it('when elementSelected triggers, proper action should be it removes the dataFlow',  inject(function ($controller) {
        spyOn(resources.dataFlow, "delete").and.callFake(function () {return $q.when({})});
        initController($controller);
        scope.$digest();

        $(fake.dataFlowHandler).triggerHandler('dataFlowRemoved', "DF-ID-2");
        scope.$digest();

        expect(resources.dataFlow.delete).toHaveBeenCalledWith("DM-TARGET-ID-1", "DF-ID-2");
        expect(scope.dataFlowsMap["DF-ID-2"]).toBeUndefined();
        expect(scope.dataFlowsMap["DF-ID-1"]).toBeDefined();
        expect(scope.dataFlowsMap["DF-ID-3"]).toBeDefined();
    }));

});

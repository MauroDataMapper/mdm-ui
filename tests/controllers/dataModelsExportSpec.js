import {mock} from '../_globalMock';


describe('Controller: dataModelsExportCtrl', function () {

	var scope, controller, resources, stateParams, window, state, $rootScope, stateHandler, $q, exportHandler, messageHandler ;

    mock.init();

	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
	}));

	beforeEach(inject(function (_$q_, $controller, _$rootScope_, _resources_, $window, $stateParams, _securityHandler_, _stateHandler_, _exportHandler_, _messageHandler_) {
		resources = _resources_;
		$rootScope = _$rootScope_;
		scope = _$rootScope_.$new();
		stateParams = $stateParams;
		window = $window;
        stateHandler = _stateHandler_;
        $q = _$q_;
        exportHandler = _exportHandler_;
        messageHandler = _messageHandler_;
        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));
        spyOn(resources.public, 'dataModelExporterPlugins').and.returnValue($q.when([
            {id:1, displayName:'XML'},
            {id:1, displayName:'EXCEL'},
        ]));
	}));

	function initController($controller){
		controller = $controller('dataModelsExportCtrl', {
			$scope: scope,
			$state: state,
			$stateParams: stateParams,
			resources:resources,
			$window: window,
            exportHandler: exportHandler,
		});
	}
    it('Controller loads all exporters',  inject(function ($controller) {
        initController($controller);
        scope.$digest();
        expect(scope.exportersList).toEqual([
            {id:1, displayName:'XML'},
            {id:1, displayName:'EXCEL'},
        ]);
        expect(resources.public.dataModelExporterPlugins).toHaveBeenCalledWith();
    }));


    it('exporterChanged updates the selected exporter',  inject(function ($controller) {
        //Spy on jQuery and make sure remove is called for removing the download link
        spyOn($.fn, 'remove').and.returnValue(true);

        initController($controller);
        scope.$digest();

        expect(scope.selectedExporterObj).toBeUndefined();
        scope.form.selectedExporterStr = '{"id":"1", "displayName":"XML"}';
        scope.exporterChanged();
        expect(scope.selectedExporterObj).toEqual({id:'1', displayName:'XML'});


        scope.form.selectedExporterStr = '';
        scope.exporterChanged();
        expect(scope.selectedExporterObj).toEqual(null);

        expect($("#exportFileDownload a").remove).toHaveBeenCalled();
    }));


    it('reset initials all scope values',  inject(function ($controller) {
        //Spy on jQuery and make sure remove is called for removing the download link
        spyOn($.fn, 'remove').and.returnValue(true);

        initController($controller);
        scope.$digest();
        scope.reset();

        expect(scope.step).toEqual(1);
        expect(scope.selectedDataModels).toEqual(null);
        expect(scope.selectedExporter).toEqual(null);
        expect(scope.defaultModels).toEqual([]);

        expect($("#exportFileDownload a").remove).toHaveBeenCalled();
    }));

    it('export creates download link properly',  inject(function ($controller) {
        //Spy on jQuery and make sure remove is called for removing the download link
        spyOn($.fn, 'remove').and.returnValue(true);
        spyOn($.fn, 'append').and.returnValue(true);

        spyOn(exportHandler, "exportDataModel").and.returnValue($q.when({
            fileBlob: {},
            fileName: "uploadedFile.file"
        }));

        spyOn(exportHandler, "createBlobLink").and.returnValue($("<a></a>"));
        spyOn(messageHandler, "showSuccess").and.returnValue();

        initController($controller);
        scope.$digest();

        scope.selectedExporterObj = {id:'1', displayName:'XML'};
        scope.selectedDataModels = [
            {id:1, label:"DM1", domainType:"DataModel"},
            {id:2, label:"DM2", domainType:"DataModel"}
        ];
        scope.export();
        scope.$digest();

        expect(scope.exportedFileIsReady).toBeTruthy();
        expect(scope.processing).toBeFalsy();
        expect(exportHandler.exportDataModel).toHaveBeenCalledWith([
            {id:1, label:"DM1", domainType:"DataModel"},
            {id:2, label:"DM2", domainType:"DataModel"}
        ], {id:'1', displayName:'XML'});
        expect(exportHandler.createBlobLink).toHaveBeenCalledWith({}, "uploadedFile.file");

        expect($("#exportFileDownload").append).toHaveBeenCalled();
        expect($("#exportFileDownload a").remove).toHaveBeenCalled();

        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Model(s) exported successfully.');


    }));

    it('export shows proper error message if export fails',  inject(function ($controller) {
        //Spy on jQuery and make sure remove is called for removing the download link
        spyOn($.fn, 'remove').and.returnValue(true);

        spyOn(exportHandler, "exportDataModel").and.returnValue($q.reject({error:"error"}));
        spyOn(messageHandler, "showError").and.returnValue();

        initController($controller);
        scope.$digest();

        scope.selectedExporterObj = {id:'1', displayName:'XML'};
        scope.selectedDataModels = [
            {id:1, label:"DM1", domainType:"DataModel"},
            {id:2, label:"DM2", domainType:"DataModel"}
        ];
        scope.export();
        scope.$digest();

        expect(scope.exportedFileIsReady).toBeFalsy();
        expect(scope.processing).toBeFalsy();
        expect(exportHandler.exportDataModel).toHaveBeenCalledWith([
            {id:1, label:"DM1", domainType:"DataModel"},
            {id:2, label:"DM2", domainType:"DataModel"}
        ], {id:'1', displayName:'XML'});

        expect($("#exportFileDownload a").remove).toHaveBeenCalled();
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem exporting the Data Model(s).', {error:"error"});

    }));
});

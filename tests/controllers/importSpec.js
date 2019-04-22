import {mock} from '../_globalMock';
describe('Controller: importCtrl', function () {

	var scope, controller, resources, $rootScope, $httpBackend, window, ngToast, $q, messageHandler, stateHandler;

    mock.init();

	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
	}));
	beforeEach(inject(function ($window, _$rootScope_, _resources_, _messageHandler_, _$httpBackend_, _$q_, _stateHandler_) {
		scope = _$rootScope_.$new();
		resources = _resources_;
		$httpBackend = _$httpBackend_;
		$rootScope = _$rootScope_;
		$q = _$q_;
		window = $window;
        messageHandler = _messageHandler_;
        stateHandler = _stateHandler_;
	}));

    var importers = [
        {
                displayName: "JSON Importer",
                name: "JSONImport",
                namespace: "ox.softeng.metadatacatalogue.spi.json",
                paramClassType: "ox.softeng.metadatacatalogue.spi.json.JSONImportParameters",
                version: "0.1",
                knownMetadataKeys: [],
                pluginType:"DataModelImporter"
        }
    ];

    var importerGroup = [
        {
            name:"DataModel",
            parameters:[
                {
                    description: "The file containing the JSON to be imported",
                    displayName: "JSON File",
                    name: "importFile",
                    type: "File"
                },
                {
                    description: "Label of new Data Model",
                    displayName: "Data Model name",
                    name: "dataModelName",
                    optional: true,
                    type: "String"
                },
                {
                    description: "Whether the new model is to be marked as finalised",
                    displayName: "Finalised",
                    name: "finalised",
                    type: "Boolean"
                },

                {
                    description: "Folder Name",
                    displayName: "Folder Name",
                    name: "folderId",
                    type: "Folder"
                },
                {
                    description: "Database Password",
                    displayName: "Database Password",
                    name: "dbPassword",
                    type: "Password"
                },
                {
                    description: "Database Port",
                    displayName: "Database Port",
                    name: "Database Port",
                    type: "Integer"
                },
                {
                    description: "Please Select a DataModel",
                    displayName: "DataModel",
                    name: "A DataModel",
                    type: "DataModel"
                },
                {
                    description: "Full description for Data Model",
                    displayName: "Full description",
                    name: "dataModelFullDescription",
                    optional: true,
                    type: "Text"
                },
            ]
        }
    ];


    var formOptionsMap = {
        "Integer":"number",
        "String":"text",
        "Password":"password",
        "Boolean":"checkbox",
        "File": "file"
    };

	function initController ($controller) {
		var getResourceSpy = spyOn(resources.public, 'dataModelImporterPlugins').and.returnValue($q.when(importers));

		controller = $controller('importCtrl', {
            $window: window,
			$scope: scope,
            resources: resources,
			ngToast: ngToast
		});

		expect(resources.public.dataModelImporterPlugins).toHaveBeenCalledWith(undefined);
		expect(resources.public.dataModelImporterPlugins).toHaveBeenCalledTimes(1);

		return getResourceSpy;
	}

	it('Initialized correctly',  inject(function ($controller) {
		initController($controller, []);
		scope.$digest();

		expect(window.document.title).toBe("Import");
        expect(scope.selectedImporterGroups).toEqual([]);
        expect(scope.importers).toEqual(importers);
        expect(scope.step).toEqual("1");
        expect(scope.formOptionsMap).toEqual(formOptionsMap);
	}));


    it('ImporterChanged should load the importer parameters',  inject(function ($controller) {
        initController($controller, []);
        scope.$digest();

        spyOn(resources.importer, 'get').and.returnValue($q.when({importer:importers[0], parameterGroups:importerGroup }));


        scope.selectedImporterStr = JSON.stringify(importers[0]);
        scope.importerChanged();
        scope.$digest();



        expect(scope.selectedImporterObj).toEqual(importers[0]);
        expect(scope.selectedImporterGroups.length).toEqual(1);


        expect(scope.selectedImporterGroups[0].parameters[0]).toEqual({
            description: "The file containing the JSON to be imported",
            displayName: "JSON File",
            name: "importFile",
            type: "File",
			optional: false,
			value:''
        });

        expect(scope.selectedImporterGroups[0].parameters[1]).toEqual({
            description: "Label of new Data Model",
            displayName: "Data Model name",
            name: "dataModelName",
            optional: true,
            type: "String",
			value:''
        });

        //as it's a Boolean param, we must mark it as Optional=true and also value=false
        expect(scope.selectedImporterGroups[0].parameters[2]).toEqual({
            description: "Whether the new model is to be marked as finalised",
			displayName: "Finalised",
            name: "finalised",
            type: "Boolean",
            optional: true,
            value: false
        });

        expect(scope.selectedImporterGroups[0].parameters[3]).toEqual({
            description: "Folder Name",
            displayName: "Folder Name",
            name: "folderId",
            type: "Folder",
            optional: false,
            value:''
        });

        expect(scope.selectedImporterGroups[0].parameters[4]).toEqual({
            description: "Database Password",
            displayName: "Database Password",
            name: "dbPassword",
            type: "Password",
            optional: false,
            value:''
        });

        expect(scope.selectedImporterGroups[0].parameters[5]).toEqual({
            description: "Database Port",
            displayName: "Database Port",
            name: "Database Port",
            type: "Integer",
            optional: false,
            value:''
        });

        expect(scope.selectedImporterGroups[0].parameters[6]).toEqual({
            description: "Please Select a DataModel",
            displayName: "DataModel",
            name: "A DataModel",
            type: "DataModel",
            optional: false,
            value:''
        });

        expect(scope.selectedImporterGroups[0].parameters[7]).toEqual({
            description: "Full description for Data Model",
            displayName: "Full description",
            name: "dataModelFullDescription",
            optional: true,
            type: "Text",
            value:''
        });



        expect(scope.step).toEqual("2");

        var action =
            "parameters" + "/" +
            importers[0].namespace + "/" +
            importers[0].name + "/" +
            importers[0].version;
        expect(resources.importer.get).toHaveBeenCalledWith(action);
        expect(resources.importer.get).toHaveBeenCalledTimes(1);

    }));


    it('StartImport shows the proper success message if import process completes successfully',  inject(function ($controller) {

        initController($controller, []);
        scope.$digest();


        spyOn(resources.importer, 'get').and.returnValue($q.when({importer:importers[0], parameterGroups:importerGroup }));
        spyOn(resources.dataModel, 'import').and.returnValue($q.when({}));

        scope.selectedImporterStr = JSON.stringify(importers[0]);
        scope.importerChanged();
        scope.$digest();

        scope.selectedImporterStr    = JSON.stringify(importers[0]);
        scope.importerChanged();

        scope.selectedImporterGroups[0].parameters[1].value = "MyModelName";
        scope.selectedImporterGroups[0].parameters[2].value = true;
        scope.selectedImporterGroups[0].parameters[3].value = "Password";
        scope.selectedImporterGroups[0].parameters[4].value = 123456;
        scope.selectedImporterGroups[0].parameters[5].value = [
            {
                id:"FOLDER-ID",
                label:"FOLDER-NAME",
            }
        ];
        scope.selectedImporterGroups[0].parameters[6].value = [
            {
                id:"DATA-MODEL-ID",
                label:"DATA-MODEL-NAME",
            }
        ];
        scope.selectedImporterGroups[0].parameters[7].value = "A long text...";

        scope.startImport();

        expect(scope.selectedImporterObj).toEqual(importers[0]);

        expect(scope.selectedImporterGroups[0].parameters[0]).toEqual({
            description: "The file containing the JSON to be imported",
            displayName: "JSON File",
            name: "importFile",
            type: "File",
            optional: false,
            value: ''
        });

        var namespace = scope.selectedImporterObj.namespace;
        var name      = scope.selectedImporterObj.name;
        var version   = scope.selectedImporterObj.version;
        var url = namespace + "/" + name + "/" + version ;

        expect(resources.dataModel.import).toHaveBeenCalledWith(url, scope.formData);
        expect(scope.importingInProgress).toEqual(true);
    }));

    it('StartImport shows the proper success message when import returns multiple dataModels',  inject(function ($controller) {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn(stateHandler,"Go").and.returnValue({});
        spyOn($rootScope,"$broadcast").and.returnValue({});

        initController($controller, []);
        scope.$digest();

        spyOn(resources.importer, 'get').and.returnValue($q.when({importer:importers[0], parameterGroups:importerGroup }));
        spyOn(resources.dataModel, 'import').and.returnValue($q.when({
            items:[
                {id:888, label:'A-DataModel-Label-1'},
                {id:999, label:'A-DataModel-Label-2'}
            ],
            count:2
        }));

        scope.selectedImporterStr    = JSON.stringify(importers[0]);
        scope.importerChanged();
        scope.$digest();

       scope.selectedImporterGroups[0].parameters[1].value = "MyModelName";
       scope.selectedImporterGroups[0].parameters[2].value = true;
       scope.selectedImporterGroups[0].parameters[3].value = "Password";
       scope.selectedImporterGroups[0].parameters[4].value = 123456;
        scope.selectedImporterGroups[0].parameters[5].value = [
            {
                id:"FOLDER-ID",
                label:"FOLDER-NAME",
            }
        ];
        scope.selectedImporterGroups[0].parameters[6].value = [
            {
                id:"DATA-MODEL-ID",
                label:"DATA-MODEL-NAME",
            }
        ];
        scope.selectedImporterGroups[0].parameters[7].value = "A long text...";

        scope.startImport();
        scope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$reloadDataModels');
        expect(scope.importingInProgress).toBeFalsy();
        expect(scope.importCompleted).toBeTruthy();
        expect(scope.importResult).toEqual({
            items:[
                {id:888, label:'A-DataModel-Label-1'},
                {id:999, label:'A-DataModel-Label-2'}
            ],
            count:2
        });

        expect(messageHandler.showSuccess).toHaveBeenCalledWith("Data Model(s) imported successfully");
        expect(stateHandler.Go).toHaveBeenCalledTimes(0);
    }));


    it('StartImport shows the proper success message when import returns ONE dataModel',  inject(function ($controller) {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn(stateHandler,"Go").and.returnValue({});
        spyOn($rootScope,"$broadcast").and.returnValue({});

        initController($controller, []);
        scope.$digest();

        spyOn(resources.importer, 'get').and.returnValue($q.when({importer:importers[0], parameterGroups:importerGroup }));
        spyOn(resources.dataModel, 'import').and.returnValue($q.when({
            items:[{id:888, label:'A-DataModel-Label-1'}],
            count:1
        }));

        scope.selectedImporterStr    = JSON.stringify(importers[0]);
        scope.importerChanged();
        scope.$digest();

        scope.selectedImporterGroups[0].parameters[1].value = "MyModelName";
        scope.selectedImporterGroups[0].parameters[2].value = true;
        scope.selectedImporterGroups[0].parameters[3].value = "Password";
        scope.selectedImporterGroups[0].parameters[4].value = 123456;
        scope.selectedImporterGroups[0].parameters[5].value = [
            {
                id:"FOLDER-ID",
                label:"FOLDER-NAME",
            }
        ];
        scope.selectedImporterGroups[0].parameters[6].value = [
            {
                id:"DATA-MODEL-ID",
                label:"DATA-MODEL-NAME",
            }
        ];
        scope.selectedImporterGroups[0].parameters[7].value = "A long text...";

        scope.startImport();
        scope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('$reloadDataModels');
        expect(scope.importingInProgress).toBeFalsy();
        expect(scope.importCompleted).toBeTruthy();
        expect(scope.importResult).toEqual({
            items:[{id:888, label:'A-DataModel-Label-1'}],
            count:1
        });

        expect(messageHandler.showSuccess).toHaveBeenCalledWith("Data Model(s) imported successfully");
        expect(stateHandler.Go).toHaveBeenCalledWith("datamodel", {id: 888}, {reload: true, location: true});
    }));
});

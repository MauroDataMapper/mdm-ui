import {mock} from '../_globalMock';


describe('Controller: modelsCtrl', function () {

    var scope, controller, resources, stateParams, window, state, $rootScope, stateHandler, $q, userSettingsHandler, messageHandler;

    var folders = [
        {
            id:"FD-ID-1",
            label:"FD-LABEL-1",
            domainType:"Folder",
            children:[
                {id:"FD-ID-11",label:"FD-LABEL-11",domainType:"Folder", children:[]},
                {id:"DM-ID-11",label:"DM-LABEL-11",domainType:"Folder", children:[]}
            ]

        },
        {
            id:"FD-ID-2",
            label:"FD-LABEL-2",
            domainType:"Folder",
            children:[
                {id:"DM-ID-21",label:"DM-LABEL-21",domainType:"Folder", children:[]}
            ]
        }
    ];
    var classifiers  = {
        count:2,
        items:[
            {id:"CF-ID-1",label:"CF-LABEL-1",domainType:"Classifier"},
            {id:"CF-ID-2",label:"CF-LABEL-2",domainType:"Classifier"}
        ]
    };

    var childrenDataClasses = [
        {id:"DC-1", domainType:"DataClass"},
        {id:"DC-2", domainType:"DataClass"},
    ];

    var terms = [
        {id:"TM-1", terminology:"TG-ID", domainType:"Term"},
        {id:"TM-2", terminology:"TG-ID", domainType:"Term"},
    ];

    mock.init();

    beforeEach(inject(function (_$httpBackend_) {
        _$httpBackend_.whenGET('views/home.html').respond(200, '');
    }));

    beforeEach(inject(function (_$q_, $controller, _$rootScope_, _resources_, $window, $stateParams, _securityHandler_, _stateHandler_, _userSettingsHandler_, _messageHandler_) {
        resources = _resources_;
        _$rootScope_.isLoggedIn = function () {
            return true;
        };
        $rootScope = _$rootScope_;
        scope = _$rootScope_.$new();
        stateParams = $stateParams;
        window = $window;
        stateHandler = _stateHandler_;
        $q = _$q_;
        userSettingsHandler = _userSettingsHandler_;
        messageHandler = _messageHandler_;

        spyOn(_securityHandler_, 'isValidSession').and.returnValue($q.when(true));
    }));

    function initController2($controller) {
        spyOn(resources.tree, "get").and.callFake(function (id) {
            if(!id) {
                return $q.when(folders);
            }else if(id === "search/A-SEARCH-TERM"){
                return $q.when(folders);
            }
            else{
                return $q.when(childrenDataClasses);
            }
        });
        spyOn(resources.classifier, "get").and.returnValue($q.when(classifiers));

        spyOn(resources.terminology, "get").and.returnValue($q.when(terms));

        controller = $controller('modelsCtrl', {
            $scope: scope,
            $state: state,
            $stateParams: stateParams,
            resources: resources,
            $window: window
        });
    }


    it('If user is logged-in, set search options', inject(function ($controller) {
        spyOn(userSettingsHandler,"get").and.callFake(function(name){
            if(name === "includeSupersededDocModels"){return false;}
            if(name === "showSupersededModels"){return true;}
            if(name === "showDeletedModels"){return true;}
        });
        spyOn($rootScope, "isLoggedIn").and.returnValue(true);

        initController2($controller);
        scope.$digest();

        expect(scope.includeSupersededDocModels).toEqual(false);
        expect(scope.showSupersededModels).toEqual(true);
        expect(scope.showDeletedModels).toEqual(true);

        expect(userSettingsHandler.get.calls.argsFor(0)).toEqual(["includeSupersededDocModels"]);
        expect(userSettingsHandler.get.calls.argsFor(1)).toEqual(["showSupersededModels"]);
        expect(userSettingsHandler.get.calls.argsFor(2)).toEqual(["showDeletedModels"]);
    }));

    it('Initialised correctly', inject(function ($controller) {
        initController2($controller);
        scope.$digest();
        expect(window.document.title).toEqual('Models');

        expect(resources.tree.get).toHaveBeenCalled();
        expect(resources.classifier.get).toHaveBeenCalled();

        expect(scope.allClassifiers).toEqual(classifiers.items);
        expect(scope.allModels).toEqual({children:folders, isRoot:true});
        expect(scope.filteredModels).toEqual({children:folders, isRoot:true});
    }));


    it('onCompareTo changes the state to the selected Data Model', inject(function ($controller) {
        spyOn(stateHandler, "NewWindow").and.returnValue({});
        initController2($controller);
        scope.$digest();
        scope.onCompareTo({id: "SDM-ID", domainType: "DataModel"}, {id: "TDM-ID", domainType: "DataModel"});
        scope.$digest();
        expect(stateHandler.NewWindow).toHaveBeenCalledWith("modelscomparison", {
            sourceId: "SDM-ID",
            targetId: "TDM-ID",
        });

        scope.onCompareTo({id: "SDM-ID", domainType: "DataModel"});
        scope.$digest();
        expect(stateHandler.NewWindow).toHaveBeenCalledWith("modelscomparison", {
            sourceId: "SDM-ID",
            targetId: null,
        });
    }));

    it('loadModelsToCompare loads all models that have "Superseded By" or"New Version Of" link with the selected model', inject(function ($controller) {
        initController2($controller);
        scope.$digest();

        spyOn(resources.dataModel, "get").and.returnValue($q.when({items:[
            {linkType:"Refines",        source:{id:"DM-ID"}, target:{id:"tDM-ID1"}},
            {linkType:"Superseded By",  source:{id:"DM-ID"}, target:{id:"tDM-ID2"}},
            {linkType:"New Version Of", source:{id:"DM-ID"}, target:{id:"tDM-ID3"}}
        ]}));

        scope.loadModelsToCompare({id: "DM-ID", domainType: "DataModel"}).then(function (result) {
            expect(result).toEqual([{id:"tDM-ID2"}, {id:"tDM-ID3"}]);
        });
        scope.$digest();
        expect(resources.dataModel.get).toHaveBeenCalledWith("DM-ID", "semanticLinks", {filters: "all=true"});
    }));


    it('onAddFolder adds folder to the root', inject(function ($controller) {
        initController2($controller);
        scope.$digest();

        spyOn(messageHandler, "showSuccess").and.returnValue(true);
        spyOn(resources.folder, "post").and.returnValue($q.when({id:"new-FD-ID", label:"new-FD-LABEL"}));
        spyOn(stateHandler, "Go").and.returnValue(true);

        scope.onAddFolder();
        scope.$digest();

        expect(resources.folder.post).toHaveBeenCalledWith(null, null, {resource: {}});
        expect(scope.allModels.children.length).toEqual(3);
        expect(scope.allModels.children[2]).toEqual({id:"new-FD-ID", label:"new-FD-LABEL", domainType:"Folder"});

        expect(scope.filteredModels.children.length).toEqual(3);
        expect(scope.filteredModels.children[2]).toEqual({id:"new-FD-ID", label:"new-FD-LABEL", domainType:"Folder"});

        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Folder created successfully.');
        expect(stateHandler.Go).toHaveBeenCalledWith("Folder", {id: "new-FD-ID", edit:true});
    }));

    it('onAddFolder adds folder as child folder to another folder', inject(function ($controller) {
        initController2($controller);
        scope.$digest();

        spyOn(messageHandler, "showSuccess").and.returnValue(true);
        spyOn(resources.folder, "post").and.returnValue($q.when({id:"new-FD-ID", label:"new-FD-LABEL"}));
        spyOn(stateHandler, "Go").and.returnValue(true);

        var parentFolder = {id:"parent-FD-ID", domainType: "Folder"};
        scope.onAddFolder(null, parentFolder);
        scope.$digest();

        expect(resources.folder.post).toHaveBeenCalledWith("parent-FD-ID", "folders", {resource: {}});
        expect(parentFolder.children.length).toEqual(1);
        expect(parentFolder.children[0]).toEqual({id:"new-FD-ID", label:"new-FD-LABEL", domainType:"Folder"});

        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Folder created successfully.');
        expect(stateHandler.Go).toHaveBeenCalledWith("Folder", {id: "new-FD-ID", edit:true});
    }));

    it('onAddFolder shows error message if creating a new folder fails', inject(function ($controller) {
        initController2($controller);
        scope.$digest();

        spyOn(messageHandler, "showError").and.returnValue(true);
        spyOn(resources.folder, "post").and.returnValue($q.reject({error:"Error-Detail"}));

        scope.onAddFolder();
        scope.$digest();

        expect(resources.folder.post).toHaveBeenCalledWith(null, null, {resource: {}});
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem creating the Folder.', {error:"Error-Detail"});
    }));


    it('toggleFilters updates userSetting if user is logged in', inject(function ($controller) {
        initController2($controller);
        scope.$digest();

        spyOn($rootScope,"isLoggedIn").and.returnValue(true);
        spyOn(userSettingsHandler,"update").and.returnValue(true);

        scope.showSupersededModels = true;
        scope.showDeletedModels = true;
        scope.toggleFilters("showSupersededModels");

        expect(scope.showSupersededModels).toBe(false);
        expect(scope.showDeletedModels).toBe(true);

        expect(userSettingsHandler.update.calls.count()).toEqual(2);
        expect(userSettingsHandler.update.calls.argsFor(0)).toEqual(["showSupersededModels", false]);
        expect(userSettingsHandler.update.calls.argsFor(1)).toEqual(["showDeletedModels", true]);

    }));


    it('toggleFilters DOES NOT save userSetting if user is not logged in', inject(function ($controller) {
        initController2($controller);
        scope.$digest();

        spyOn($rootScope,"isLoggedIn").and.returnValue(false);
        spyOn(userSettingsHandler,"update").and.returnValue(true);

        scope.showSupersededModels = true;
        scope.showDeletedModels = true;
        scope.toggleFilters("showSupersededModels");

        expect(scope.showSupersededModels).toBe(false);
        expect(scope.showDeletedModels).toBe(true);

        expect(userSettingsHandler.update.calls.count()).toEqual(0);
    }));

    it('$reloadClassifiers event reloads classifier', inject(function ($controller) {
        initController2($controller);
        scope.$digest();

        $rootScope.$broadcast("$reloadClassifiers");
        scope.$digest();

        expect(resources.classifier.get).toHaveBeenCalledTimes(2);
    }));


    it('onNodeClick changes the state to the selected Data Model', inject(function ($controller) {
        spyOn(stateHandler, "Go").and.returnValue({});
        initController2($controller);
        scope.$digest();
        scope.onNodeClick({id: "Model-ID1", label: "Model-Label", domainType: "DataModel"});
        scope.$digest();
        expect(stateHandler.Go).toHaveBeenCalledWith("DataModel", {
            id: "Model-ID1",
            edit: false,
            dataModelId: undefined,
            dataClassId: undefined,
            terminologyId: undefined
        });
    }));

    it('classifierTreeOnSelect changes the state to the selected Classifier', inject(function ($controller) {
        spyOn(stateHandler, "Go").and.returnValue({});
        initController2($controller);
        scope.$digest();

        scope.classifierTreeOnSelect(null, {
            id: "Classifier-ID1",
            label: "Classifier-Label",
            domainType: "Classification"
        });
        scope.$digest();
        expect(stateHandler.Go).toHaveBeenCalledWith("classification", {id: "Classifier-ID1"})
    }));

    it('onAddChildDataClass changes the state for adding a new Data Class', inject(function ($controller) {
        spyOn(stateHandler, "Go").and.returnValue({});
        initController2($controller);
        scope.$digest();
        scope.onAddChildDataClass(null,
            {
                id: "DataClass-ID1",
                dataModel: "DataModel-ID1",
                label: "DataClass-Label",
                domainType: "DataClass"
            });
        scope.$digest();
        expect(stateHandler.Go).toHaveBeenCalledWith("NewDataClass",
            {
                grandParentDataClassId:undefined,
                parentDataModelId: "DataModel-ID1",
                parentDataClassId: "DataClass-ID1"
            });
    }));

    it('onAddChildDataElement changes the state for adding a new Data Element', inject(function ($controller) {
        spyOn(stateHandler, "Go").and.returnValue({});
        initController2($controller);
        scope.$digest();

        scope.onAddChildDataElement(null,
            {
                id: "DataClass-ID1",
                dataModel: "DataModel-ID1",
                label: "DataElement-Label",
                domainType: "DataElement"
            });
        scope.$digest();

        expect(stateHandler.Go).toHaveBeenCalledWith("NewDataElement",
            {
                grandParentDataClassId: null,
                parentDataModelId: "DataModel-ID1",
                parentDataClassId: "DataClass-ID1"
            });
    }));

    it('search for DataModel Tree', inject(function ($controller) {
        initController2($controller);

        scope.formData = { filterCriteria: "A-SEARCH-TERM"};
        scope.search();
        scope.$digest();

        expect(resources.tree.get).toHaveBeenCalledWith(null, "search/A-SEARCH-TERM");
        expect(scope.allModels).toEqual({children: folders, isRoot: true});
        expect(scope.filteredModels).toEqual({children: folders, isRoot: true});
        expect(scope.searchText).toEqual("A-SEARCH-TERM");
    }));

    it('search for DataModel Tree with Empty term', inject(function ($controller) {
        initController2($controller);

        scope.formData = { filterCriteria: ""};
        scope.search();
        scope.$digest();

        expect(resources.tree.get).toHaveBeenCalledWith();
        expect(scope.allModels).toEqual({children: folders, isRoot: true});
        expect(scope.filteredModels).toEqual({children: folders, isRoot: true});
        expect(scope.searchText).toEqual("");
    }));

    it('filterClassifications filters classifier locally', inject(function ($controller) {
        spyOn($rootScope, "$broadcast").and.returnValue({});

        initController2($controller);
        scope.formData = {
            ClassificationFilterCriteria: "CLASSIFIER-FILTER"
        };
        scope.$digest();
        scope.filterClassifications();

        expect($rootScope.searchCriteria).toEqual("CLASSIFIER-FILTER");
        expect($rootScope.$broadcast).toHaveBeenCalledWith('$highlightText-classifiers', {filterCriteria: "CLASSIFIER-FILTER"});
        expect($rootScope.$broadcast).toHaveBeenCalledWith('$highlightText-models', {filterCriteria: ""});
    }));


    it('toggleFilterMenu show/hides the filter', inject(function ($controller) {
        initController2($controller);
        scope.$digest();
        scope.toggleFilterMenu();
        scope.$digest();
        expect(scope.showFilters).toBeTruthy();
    }));



    it('Models tab 0-level loads all folders', inject(function ($controller) {
        initController2($controller);
        scope.$digest();

        spyOn(scope, "reloadTree").and.returnValues(true);
        scope.levels.folders();
        scope.$digest();

        expect(scope.levels.current).toEqual(0);
        expect(scope.reloadTree).toHaveBeenCalled();
    }));


    it('Models tab 1-level loads data model into the TreeView', inject(function ($controller) {
        initController2($controller);
        scope.$digest();

        scope.levels.focusedElement({id:"DM-ID", domainType:"DataModel"});
        scope.$digest();

        expect(scope.levels.currentFocusedElement.children).toEqual(childrenDataClasses);
        expect(scope.levels.currentFocusedElement.open).toEqual(true);
        expect(scope.levels.currentFocusedElement.selected).toEqual(true);
        var curModel  = {
            "children": [{
                id:"DM-ID",
                domainType:"DataModel",
                children: childrenDataClasses,
                open: true,
                selected: true
            }],
            isRoot: true
        };

        expect(scope.filteredModels).toEqual(curModel);
        expect(resources.tree.get).toHaveBeenCalledWith("DM-ID");
    }));


    it('Models tab 1-level loads terminology into the TreeView', inject(function ($controller) {
        initController2($controller);
        scope.$digest();

        scope.levels.focusedElement({id:"TG-ID", domainType:"Terminology"});
        scope.$digest();

        expect(scope.levels.currentFocusedElement.children).toEqual(terms);
        expect(scope.levels.currentFocusedElement.open).toEqual(true);
        expect(scope.levels.currentFocusedElement.selected).toEqual(true);
        var curModel  = {
            "children": [{
                id:"TG-ID",
                domainType:"Terminology",
                children: terms,
                open: true,
                selected: true
            }],
            isRoot: true
        };

        expect(scope.filteredModels).toEqual(curModel);
        expect(resources.terminology.get).toHaveBeenCalledWith("TG-ID", "tree");
    }));

    it('LoadFolders gets query parameters from UserSetting if user is logged in', inject(function ($controller) {
        spyOn($rootScope, "isLoggedIn").and.returnValue(true);
        spyOn(userSettingsHandler,"get").and.callFake(function(name){
            if(name === "includeSupersededDocModels"){return false;}
            if(name === "showSupersededModels"){return true;}
            if(name === "showDeletedModels"){return true;}
        });

        initController2($controller);
        scope.$digest();
        scope.loadFolders();

        var options = {
            queryStringParams: {
                includeDocumentSuperseded: false,
                includeModelSuperseded: true,
                includeDeleted: true
            }
        };
        expect(resources.tree.get).toHaveBeenCalledWith(null, null, options);
    }));

});

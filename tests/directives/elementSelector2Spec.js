import {mock} from '../_globalMock';

describe('Directive: elementSelector2', function () {

    var scope, $rootScope, element, securityHandler, resources, $q,$httpBackend, ngToast;

    var currentUser = {
        firstName: "userFirstName",
        lastName: "userLastName"
    };

    mock.init();
    beforeEach(angular.mock.module('./elementSelector2.html'));
    beforeEach(angular.mock.module('./foldersTree2.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./mcInfiniteScrollList.html'));
    beforeEach(angular.mock.module('./modelSelectorTree.html'));
    beforeEach(angular.mock.module('./modelPath.html'));

    beforeEach(inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('views/home.html').respond(200, '');
    }));

    beforeEach(inject(function ($compile, _$rootScope_, _securityHandler_, _resources_, _$q_,_ngToast_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        securityHandler = _securityHandler_;
        resources = _resources_;
        $q = _$q_;
        ngToast= _ngToast_;
        spyOn(securityHandler, 'getCurrentUser').and.returnValue(currentUser);
    }));

    function init($compile, validTypesToSelect){
        scope.validTypesToSelect = validTypesToSelect;
        element = angular.element('<element-selector-2 valid-types-to-select="validTypesToSelect"></element-selector-2>');
        $compile(element)(scope);
    }

    it('for Folder Only', inject(function ($compile) {
        spyOn(resources.folder, 'get').and.returnValue($q.when({
            items: [{id:1,domainType:'Folder'}],
            count:1
        }));

        init($compile, ['Folder']);
        scope.$digest();

        var isolateScope = element.isolateScope();
        expect(isolateScope.formData.selectedType).toEqual('Folder') ;
        expect(isolateScope.formData.step).toEqual(1) ;
        expect(isolateScope.rootNode.children).toBeDefined();
        expect(isolateScope.rootNode.isRoot).toBeTruthy();
        expect(resources.folder.get).toHaveBeenCalled();
    }));


    it('for DataModel Only', inject(function ($compile) {
        spyOn(resources.tree, 'get').and.returnValue($q.when([]));

        init($compile, ['DataModel']);
        scope.$digest();

        var isolateScope = element.isolateScope();
        expect(isolateScope.formData.selectedType).toEqual('DataModel') ;
        expect(isolateScope.formData.step).toEqual(1) ;
        expect(isolateScope.rootNode.children).toBeDefined();
        expect(isolateScope.rootNode.isRoot).toBeTruthy();
        expect(resources.tree.get).toHaveBeenCalled();
    }));

    it('for DataClass Only', inject(function ($compile) {
        spyOn(resources.tree, 'get').and.returnValue($q.when([]));

        init($compile, ['DataClass']);
        scope.$digest();

        var isolateScope = element.isolateScope();
        expect(isolateScope.formData.selectedType).toEqual('DataClass') ;
        expect(isolateScope.formData.step).toEqual(1) ;
        expect(isolateScope.rootNode).toBeDefined();
        expect(isolateScope.rootNode.children).toBeDefined();
        expect(isolateScope.rootNode.isRoot).toBeTruthy();
        expect(resources.tree.get).toHaveBeenCalled();
    }));

    it('for Term Only', inject(function ($compile) {
        spyOn(resources.terminology, 'get').and.returnValue($q.when({
            items :[{id:"TG-ID"}]
        }));

        init($compile, ['Term']);
        scope.$digest();

        var isolateScope = element.isolateScope();
        expect(isolateScope.formData.selectedType).toEqual('Term') ;
        expect(isolateScope.formData.step).toEqual(1) ;
        expect(isolateScope.terminologies).toBeDefined();
        expect(resources.terminology.get).toHaveBeenCalled();
    }));

    it('onTerminologySelect sets current context', inject(function ($compile) {
        spyOn(resources.terminology, 'get').and.returnValue($q.when({items :[]}));

        init($compile, ['Term']);
        scope.$digest();

        var isolateScope = element.isolateScope();
        isolateScope.onTerminologySelect({id:"TG-ID"});

        expect(isolateScope.formData.currentContext).toEqual({id:"TG-ID"}) ;
    }));

    it('onTerminologySelect re-runs the search if treeSearchText is set', inject(function ($compile) {
        spyOn(resources.terminology, 'get').and.returnValue($q.when({items :[]}));

        init($compile, ['Term']);
        scope.$digest();

        var isolateScope = element.isolateScope();
        isolateScope.formData.startFetching = 0;
        isolateScope.formData.treeSearchText = "A-SEARCH-TERM";
        isolateScope.onTerminologySelect({id:"TG-ID"});

        expect(isolateScope.formData.currentContext).toEqual({id:"TG-ID"}) ;
        expect(isolateScope.formData.startFetching).toEqual(1) ;
    }));

    it('onContextSelected sets current context', inject(function ($compile) {
        spyOn(resources.tree, 'get').and.returnValue($q.when([]));

        init($compile, ['DataModel']);
        scope.$digest();

        var isolateScope = element.isolateScope();
        isolateScope.formData.startFetching = 0;
        isolateScope.onContextSelected([{id:"DM-ID"}]);

        expect(isolateScope.formData.currentContext).toEqual({id:"DM-ID"}) ;
    }));


    it('onContextSelected re-runs the search if treeSearchText is set', inject(function ($compile) {
        spyOn(resources.tree, 'get').and.returnValue($q.when([]));

        init($compile, ['DataModel']);
        scope.$digest();

        var isolateScope = element.isolateScope();
        isolateScope.formData.startFetching = 0;
        isolateScope.formData.treeSearchText = "A-SEARCH-TERM";
        isolateScope.onContextSelected([{id:"DM-ID"}]);

        expect(isolateScope.formData.currentContext).toEqual({id:"DM-ID"});
        expect(isolateScope.formData.startFetching).toEqual(1);
    }));


    it('onSearchResultSelect rejects the selected element if it is in notAllowedToSelectIds list', inject(function ($compile) {
        spyOn(resources.tree, 'get').and.returnValue($q.when([]));

        init($compile, ['DataModel']);
        scope.$digest();

        var isolateScope = element.isolateScope();
        isolateScope.dialogue = $( "<div>Fake Dialogue</div>" ).dialog({});
        isolateScope.onSearchResultSelect({id:"DM-ID"}, {preventDefault: function () {}, stopPropagation : function () {}});
        expect($(isolateScope.dialogue).data("selectedElement")).toEqual({ id: 'DM-ID' });
        $(isolateScope.dialogue).remove();


        isolateScope = element.isolateScope();
        isolateScope.dialogue = $( "<div>Fake Dialogue</div>" ).dialog({});
        isolateScope.notAllowedToSelectIds = ["DM-ID", "DC-ID"];
        isolateScope.onSearchResultSelect({id:"DM-ID"}, {preventDefault: function () {}, stopPropagation : function () {}});
        expect($(isolateScope.dialogue).data("selectedElement")).toBeUndefined();
        $(isolateScope.dialogue).remove();
    }));

    it('onNodeInTreeSelect rejects the selected element if it is in notAllowedToSelectIds list', inject(function ($compile) {
        spyOn(resources.tree, 'get').and.returnValue($q.when([]));

        init($compile, ['DataModel']);
        scope.$digest();

        var isolateScope = element.isolateScope();
        isolateScope.dialogue = $( "<div>Fake Dialogue</div>" ).dialog({});
        isolateScope.onNodeInTreeSelect({id:"DM-ID", domainType:"DataModel"});
        expect($(isolateScope.dialogue).data("selectedElement")).toEqual({ id: 'DM-ID', domainType:"DataModel" });
        $(isolateScope.dialogue).remove();


        isolateScope = element.isolateScope();
        isolateScope.dialogue = $( "<div>Fake Dialogue</div>" ).dialog({});
        isolateScope.notAllowedToSelectIds = ["DM-ID", "DC-ID"];
        isolateScope.onNodeInTreeSelect({id:"DM-ID", domainType:"DataModel"});
        expect($(isolateScope.dialogue).data("selectedElement")).toBeUndefined();
        $(isolateScope.dialogue).remove();
    }));


    it('fetch retrieves all DataTypes for a DataModel if no search criteria specified', inject(function ($compile) {
        spyOn(resources.dataModel, 'get').and.returnValue($q.when([]));
        spyOn(resources.tree, 'get').and.returnValue($q.when([]));
        init($compile, ['DataType']);
        scope.$digest();

        var isolateScope = element.isolateScope();

        isolateScope.formData.treeSearchText = "";
        isolateScope.formData.currentContext = { id:"Selected-DM-ID", domainType: "DataModel" };
        isolateScope.formData.selectedType   = "DataType";
        isolateScope.fetch(30, 10);

        var options = {
            pageSize: 30,
            pageIndex:10*30,
            sortBy: "label",
            sortType: "asc"
        };

        expect(resources.dataModel.get).toHaveBeenCalledWith("Selected-DM-ID", "dataTypes", options);
    }));

    it('fetch retrieves all DataElements for a DataClass if no search criteria specified', inject(function ($compile) {
        spyOn(resources.dataClass, 'get').and.returnValue($q.when([]));
        spyOn(resources.tree, 'get').and.returnValue($q.when([]));
        init($compile, ['DataElement']);
        scope.$digest();

        var isolateScope = element.isolateScope();

        isolateScope.formData.treeSearchText = "";
        isolateScope.formData.currentContext = { domainType: "DataClass", id:"Selected-DC-ID", dataModel:"Selected-DM-ID" };
        isolateScope.formData.selectedType   = "DataElement";
        isolateScope.fetch(30, 10);

        var options = {
            pageSize: 30,
            pageIndex:10*30,
            sortBy: "label",
            sortType: "asc"
        };

        expect(resources.dataClass.get).toHaveBeenCalledWith("Selected-DM-ID", null, "Selected-DC-ID", "dataElements", options);
    }));

    it('fetch retrieves all Terms for a Terminology if no search criteria specified', inject(function ($compile) {
        spyOn(resources.terminology, 'get').and.returnValue($q.when([]));
        spyOn(resources.tree, 'get').and.returnValue($q.when([]));
        init($compile, ['DataElement']);
        scope.$digest();

        var isolateScope = element.isolateScope();

        isolateScope.formData.treeSearchText = "";
        isolateScope.formData.currentContext = { domainType: "Terminology", id:"Selected-Terminology-ID" };
        isolateScope.formData.selectedType   = "Term";
        isolateScope.fetch(30, 10);

        var options = {
            pageSize: 30,
            pageIndex:10*30,
        };

        expect(resources.terminology.get).toHaveBeenCalledWith("Selected-Terminology-ID", "terms", options);
    }));

});
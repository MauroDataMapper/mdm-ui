import {mock} from '../_globalMock';

describe('Directive: linkSuggestion', function () {

    var scope, element, resources, $q, $rootScope, $compile, securityHandler, $httpBackend;

    mock.init();

    beforeEach(angular.mock.module('./contentTable.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./linkSuggestion.html'));
    beforeEach(angular.mock.module('./modelSelectorTree.html'));
    beforeEach(angular.mock.module('./modelPath.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./foldersTree2.html'));

    beforeEach(inject(function (_$compile_,_$rootScope_, _resources_, _$httpBackend_, _$q_, _securityHandler_) {
        $rootScope = _$rootScope_;
        resources = _resources_;
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $q = _$q_;
        securityHandler = _securityHandler_;

        $httpBackend.expect("GET", $rootScope.backendURL + '/tree/').respond([]);
        $httpBackend.whenGET('views/home.html').respond(200, '');


    }));

    function init(newScope){
        scope = $rootScope.$new();

        angular.merge(scope, newScope);

        var htmlTemp =
            ['<link-suggestion ',
                'source-data-model-id="sourceDMId"',
                'source-data-class-id="sourceDCId"',
                'source-data-element-id="sourceDEId"',
                'target-data-model-id="targetDMId"></link-suggestion>'].join("");

        element = angular.element(htmlTemp);
        $compile(element)(scope);


        $httpBackend.expect("GET", $rootScope.backendURL + '/tree/').respond([]);
    }

    it("Init correctly for source Data Model", function () {
        init({
            sourceDMId:'S-DM-ID',
        });

        spyOn(resources.dataModel, 'get').and.returnValue($q.when({id:'S-DM-ID', domainType:"DataModel"}));
        spyOn(securityHandler, 'dataModelAccess').and.returnValue({showEdit: true});

        scope.$digest();

        expect(resources.dataModel.get).toHaveBeenCalledWith("S-DM-ID");
        expect(securityHandler.dataModelAccess).toHaveBeenCalled();

        var isolateScope = element.isolateScope();
        expect(isolateScope.model.sourceEditable).toBe(true);
        expect(isolateScope.model.loadingSource).toBe(false);
    });

    it("Init correctly for source Data Element", function () {
        init({
            sourceDMId:'S-DM-ID',
            sourceDCId:'S-DC-ID',
            sourceDEId:'S-DE-ID',
        });

        spyOn(resources.dataElement, "get").and.returnValue($q.when({id:'S-DE-ID', domainType:"DataElement", dataModel:"S-DM-ID", dataClass:"S-DC-ID"}));
        spyOn(securityHandler, 'dataModelAccess').and.returnValue({showEdit: true});

        scope.$digest();

        expect(resources.dataElement.get).toHaveBeenCalledWith("S-DM-ID", "S-DC-ID", "S-DE-ID");
        expect(securityHandler.dataModelAccess).toHaveBeenCalled();

        var isolateScope = element.isolateScope();
        expect(isolateScope.model.sourceEditable).toBe(true);
        expect(isolateScope.model.loadingSource).toBe(false);
    });

    it("Suggest gets suggestions when source is a Data Model", function () {
        init({});
        scope.$digest();

        var links = [
            {sourceDataElement:{id:'S-DE-1', domainType:"DataElement"}, results:[{id:'T-DE-1', domainType:"DataElement"},{id:'T-DE-2', domainType:"DataElement"}]},
            {sourceDataElement:{id:'S-DE-2', domainType:"DataElement"}, results:[{id:'T-DE-3', domainType:"DataElement"},{id:'T-DE-4', domainType:"DataElement"}]},
        ];
        spyOn(resources.dataModel, "get").and.returnValue($q.when({links: links}));

        var isolateScope = element.isolateScope();
        isolateScope.model.source = {id:'S-DM-ID', domainType:'DataModel'};
        isolateScope.model.target = {id:'T-DM-ID', domainType:'DataModel'};

        isolateScope.suggest();
        scope.$digest();

        var linksAfter = [
            {sourceDataElement:{id:'S-DE-1', domainType:"DataElement"}, results:[{id:'T-DE-1', domainType:"DataElement"},{id:'T-DE-2', domainType:"DataElement"}], selectedTarget:{id:'T-DE-1', domainType:"DataElement"}},
            {sourceDataElement:{id:'S-DE-2', domainType:"DataElement"}, results:[{id:'T-DE-3', domainType:"DataElement"},{id:'T-DE-4', domainType:"DataElement"}], selectedTarget:{id:'T-DE-3', domainType:"DataElement"}},
        ];
        expect(resources.dataModel.get).toHaveBeenCalledWith("S-DM-ID", "suggestLinks/T-DM-ID");
        expect(isolateScope.model.suggestions).toEqual(linksAfter);
        expect(isolateScope.model.totalSuggestionLinks).toEqual(links.length);
        expect(isolateScope.model.processing).toEqual(false);

    });

    it("Suggest gets suggestions when source is a Data Element", function () {
        init({});
        scope.$digest();

        var links = {sourceDataElement:{id:'S-DE-1', domainType:"DataElement"}, results:[{id:'T-DE-1', domainType:"DataElement"},{id:'T-DE-2', domainType:"DataElement"}]};
        spyOn(resources.dataElement, "get").and.returnValue($q.when(links));

        var isolateScope = element.isolateScope();
        isolateScope.model.source = {id:'S-DE-ID', dataModel:'S-DM-ID', dataClass:'S-DC-ID',  domainType:'DataElement'};
        isolateScope.model.target = {id:'T-DM-ID', domainType:'DataModel'};

        isolateScope.suggest();
        scope.$digest();

        var linksAfter = [{sourceDataElement:{id:'S-DE-1', domainType:"DataElement"}, results:[{id:'T-DE-1', domainType:"DataElement"},{id:'T-DE-2', domainType:"DataElement"}], selectedTarget:{id:'T-DE-1', domainType:"DataElement"}}];
        expect(resources.dataElement.get).toHaveBeenCalledWith("S-DM-ID", "S-DC-ID", "S-DE-ID","suggestLinks/T-DM-ID");
        expect(isolateScope.model.suggestions).toEqual(linksAfter);
        expect(isolateScope.model.totalSuggestionLinks).toEqual(1);
        expect(isolateScope.model.processing).toEqual(false);

    });

    it("IgnoreSuggestion removes suggestion from the list", function (done) {
        init({});
        scope.$digest();

        var links = [
            {sourceDataElement:{id:'S-DE-1', domainType:"DataElement"}, results:[{id:'T-DE-1', domainType:"DataElement"},{id:'T-DE-2', domainType:"DataElement"}]},
            {sourceDataElement:{id:'S-DE-2', domainType:"DataElement"}, results:[{id:'T-DE-3', domainType:"DataElement"},{id:'T-DE-4', domainType:"DataElement"}]},
        ];
        spyOn(resources.dataModel, "get").and.returnValue($q.when({links: links}));

        var isolateScope = element.isolateScope();
        isolateScope.model.source = {id:'S-DM-ID', domainType:'DataModel'};
        isolateScope.model.target = {id:'T-DM-ID', domainType:'DataModel'};

        isolateScope.suggest();
        scope.$digest();

        expect(isolateScope.mcDisplayRecords.length).toBe(2);

        isolateScope.ignoreSuggestion(0);
        scope.$digest();

        setTimeout(function() {
            expect(isolateScope.model.suggestions.length).toBe(1);
            done();
        }, 300);

    });

    it("approveSuggestion approves the specific suggestion from the list", function (done) {
        init({});
        scope.$digest();

        var links = [
            {sourceDataElement:{id:'S-DE-1', domainType:"DataElement"}, results:[{id:'T-DE-1', domainType:"DataElement"},{id:'T-DE-2', domainType:"DataElement"}]},
            {sourceDataElement:{id:'S-DE-2', domainType:"DataElement"}, results:[{id:'T-DE-3', domainType:"DataElement"},{id:'T-DE-4', domainType:"DataElement"}]},
        ];
        spyOn(resources.dataModel, "get").and.returnValue($q.when({links: links}));

        var isolateScope = element.isolateScope();
        isolateScope.model.source = {id:'S-DM-ID', domainType:'DataModel'};
        isolateScope.model.target = {id:'T-DM-ID', domainType:'DataModel'};

        isolateScope.suggest();
        scope.$digest();

        spyOn(resources.catalogueItem, "post").and.returnValue($q.when({}));

        isolateScope.approveSuggestion(0, {selectedTarget:{dataElement:{id:'T-DE-1', domainType:"DataElement"}}});

        scope.$digest();

        setTimeout(function() {
            expect(isolateScope.model.suggestions.length).toBe(1);
            done();
        }, 300);

    });

});

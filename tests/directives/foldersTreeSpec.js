import {mock} from '../_globalMock';

describe('Directive: foldersTree2', function () {

    var scope, $rootScope, element, $httpBackend, $compile, resources, $q;


    mock.init();
    beforeEach(angular.mock.module('./foldersTree2.html'));


    var rootNode = {
        "children": [

        ],
        isRoot: true
    };

    beforeEach(inject(function (_$httpBackend_, _$compile_, _$rootScope_, _resources_, _$q_) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('views/home.html').respond(200, '');
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $compile = _$compile_;
        resources = _resources_;
        $q = _$q_;
    }));

    function init() {
        scope.rootNode = angular.copy(rootNode);
        element = angular.element('<folders-tree-2 node="rootNode"></folders-tree-2>');
        $compile(element)(scope);
    }

    it('loadModelTree loads children of an element',  function () {
        init();
        scope.$digest();
        var isolateScope = element.isolateScope();

        spyOn(resources.tree, 'get').and.returnValues($q.when([]));
        isolateScope.loadModelTree({domainType:"DataModel", id:"DM-ID"});
        expect(resources.tree.get).toHaveBeenCalledWith("DM-ID");

        spyOn(resources.terminology, 'get').and.returnValues($q.when([]));
        isolateScope.loadModelTree({domainType:"Terminology", id:"TG-ID"});
        expect(resources.terminology.get).toHaveBeenCalledWith("TG-ID", "tree");

        spyOn(resources.term, 'get').and.returnValues($q.when([]));
        isolateScope.loadModelTree({domainType:"Term", terminology:"TG-ID", id:"TM-ID"});
        expect(resources.term.get).toHaveBeenCalledWith("TG-ID", "TM-ID", "tree");

    });

});
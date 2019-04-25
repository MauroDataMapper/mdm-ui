import {mock} from '../_globalMock';

describe('Directive: annotationList', function () {

    var scope, $rootScope, element, securityHandler, resources, $q,$httpBackend, messageHandler;

    var parent = {
        id: "P-DM-ID",
        label: "P-DM-Label"
    };
    var currentUser = {
        firstName: "userFirstName",
        lastName: "userLastName"
    };

    mock.init();
    beforeEach(angular.mock.module('./annotationList.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));

    beforeEach(inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('views/home.html').respond(200, '');
    }));

    beforeEach(inject(function ($compile, _$rootScope_, _securityHandler_, _resources_, _$q_,_messageHandler_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        securityHandler = _securityHandler_;
        resources = _resources_;
        $q = _$q_;
        messageHandler= _messageHandler_;

        scope.parent = angular.copy(parent);
        scope.mcDisplayRecords = [];

        element = angular.element('<annotation-list parent="parent"></annotation-list>');
        $compile(element)(scope);

        spyOn(securityHandler, 'getCurrentUser').and.returnValue(currentUser);
    }));


    it('loads annotations from backend service', function () {
        spyOn(resources.facets, 'get').and.callFake(function() {
            return $q.when([]);
        });
        var options = {
            pageSize: 10,
            pageIndex:1,
            sortBy: "label",
            sortType:"asc",
            filters: "label=A"
        };
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.annotationFetch(options.pageSize, options.pageIndex, options.sortBy, options.sortType, options.filters);
        expect(resources.facets.get).toHaveBeenCalledWith("P-DM-ID", "annotations", options);
    });

    it('add method adds a new empty record', function () {
        spyOn(resources.facets, 'get').and.callFake(function() {
            return $q.when([]);
        });
        var newRecord = {
            id: "",
            label: "",
            description: "",
            createdBy:{
                firstName:'',
                lastName:'',
                organisation:'',
                emailAddress:''
            },
            edit: {
                id: "",
                label: "",
                description: ""
            },
            inEdit: true,
            isNew: true
        };
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.mcDisplayRecords = [];
        isolateScope.add();
        expect(isolateScope.mcDisplayRecords).toEqual([newRecord]);
    });


    it('saveParent method saves the parent in the backend', function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn(resources.facets, 'get').and.callFake(function () {return $q.when([])});
        spyOn(resources.facets, 'post').and.callFake(function() {
            return $q.when({id:"NEW"});
        });
        scope.$digest();
        var isolateScope = element.isolateScope();
        var record = {
            edit: {
                label: "LABEL",
                description: "DESC"
            }
        };
        isolateScope.saveParent(record);
        scope.$digest();
        expect(resources.facets.post).toHaveBeenCalledWith("P-DM-ID", "annotations", {resource:record.edit});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Comment saved successfully.');
    });


    it('addChild method adds a child comment to a parent comment', function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn(resources.facets, 'get').and.callFake(function () {return $q.when([])});
        spyOn(resources.facets, 'post').and.callFake(function() {
            return $q.when({id:"NEW", description:"SAVED-A CHILD TEXT"});
        });
        scope.$digest();
        var isolateScope = element.isolateScope();
        var annotation = {
            id:"P-AN-ID",
            newChildText:"A CHILD TEXT"
        };
        isolateScope.addChild(annotation);
        scope.$digest();

        expect(resources.facets.post).toHaveBeenCalledWith("P-DM-ID", "annotations/P-AN-ID/annotations", {resource:{description:"A CHILD TEXT"}});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Comment saved successfully.');
        expect(annotation.childAnnotations.length).toBe(1);
        expect(annotation.childAnnotations[0].description).toBe("SAVED-A CHILD TEXT");
    });

});
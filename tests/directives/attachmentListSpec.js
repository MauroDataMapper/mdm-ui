import {mock} from '../_globalMock';

describe('Directive: attachmentList', function () {

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
    beforeEach(angular.mock.module('./attachmentList.html'));
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

        element = angular.element('<attachment-List parent="parent"></attachment-List>');
        $compile(element)(scope);

        spyOn(securityHandler, 'getCurrentUser').and.returnValue(currentUser);
    }));


    it('attachmentFetch loads attachments from backend service', function () {
        spyOn(resources.facets, 'get').and.returnValue($q.when([{id:"Attachment1"},{id:"Attachment2"}]));
        var options = {
            pageSize: 10,
            pageIndex:1,
            sortBy: "label",
            sortType:"asc",
            filters: undefined
        };
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.attachmentFetch(10, 1, "label", "asc");
        expect(resources.facets.get).toHaveBeenCalledWith("P-DM-ID", "referenceFiles", options);
    });


    it('add will add a new empty row in the grid', function () {
        spyOn(resources.facets, 'get').and.returnValue($q.when([]));
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.mcDisplayRecords = [];
        isolateScope.add();
        var newRecord = {
            id: "",
            fileName: "",
            edit: {
                id: "",
                fileName: "",
                formData: new FormData()
            },
            inEdit: true,
            isNew: true
        };
        expect(isolateScope.mcDisplayRecords).toEqual([newRecord]);
    });

    it('cancelEdit removes the new record ', function () {
        spyOn(resources.facets, 'get').and.returnValue($q.when([]));
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.mcDisplayRecords = [
            {id:"temp-First-Record", isNew:true},
            {id:"temp-Second-Record", isNew:false},
        ];
        isolateScope.cancelEdit(isolateScope.mcDisplayRecords[0], 0);
        expect(isolateScope.mcDisplayRecords).toEqual([{id:"temp-Second-Record", isNew:false}]);
    });

    it('getFile extracts fileName from file input', function () {
        spyOn(resources.facets, 'get').and.returnValue($q.when([]));
        spyOn(document, 'getElementById').and.returnValue({files:[{content:"FILE-CONTENT"}]});
        scope.$digest();
        var isolateScope = element.isolateScope();
        var value = isolateScope.getFile("input-name");
        expect(value).toEqual({content:"FILE-CONTENT"});
        expect(document.getElementById).toHaveBeenCalledWith("input-name");
    });


    it('save passes(saves) uploaded file to the server', function () {
        spyOn(resources.facets, 'get').and.returnValue($q.when([]));
        spyOn(resources.facets, 'attachReferenceFile').and.returnValue($q.when({id:"FILE-GUID"}));
        spyOn(messageHandler, "showSuccess").and.returnValue(true);

        scope.$digest();
        var isolateScope = element.isolateScope();
        spyOn(isolateScope, "getFile").and.returnValue("FILE-CONTENT");
        isolateScope.mcTableHandler={fetchForDynamic:function () {}};

        var formData = { id:"FormData", append: function() {} };
        spyOn(formData, "append").and.returnValue(true);

        isolateScope.save({
            edit: {
                fileName: "",
                id: "",
                formData: formData
            }
        }, 0);
        scope.$digest();

        expect(resources.facets.attachReferenceFile).toHaveBeenCalledWith("P-DM-ID", formData);
        expect(formData.append).toHaveBeenCalledWith("file", "FILE-CONTENT");
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Attachment uploaded successfully.');
    });

    it('save shows proper error message if the backend throws an exception', function () {
        spyOn(resources.facets, 'get').and.returnValue($q.when([]));
        spyOn(resources.facets, 'attachReferenceFile').and.returnValue($q.reject({error: "ERROR"}));
        spyOn(messageHandler, "showError").and.returnValue(true);

        scope.$digest();
        var isolateScope = element.isolateScope();
        spyOn(isolateScope, "getFile").and.returnValue("FILE-CONTENT");
        isolateScope.mcTableHandler={fetchForDynamic:function () {}};

        var formData = { id:"FormData", append: function() {} };
        spyOn(formData, "append").and.returnValue(true);

        isolateScope.save({
            edit: {
                fileName: "",
                id: "",
                formData: formData
            }
        }, 0);
        scope.$digest();

        expect(resources.facets.attachReferenceFile).toHaveBeenCalledWith("P-DM-ID", formData);
        expect(formData.append).toHaveBeenCalledWith("file", "FILE-CONTENT");
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem saving the attachment.', {error: "ERROR"});
    });


    it('download returns path to the attached file', function () {
        spyOn(resources.facets, 'get').and.returnValue($q.when([]));
        spyOn(resources.facets, 'downloadLinkReferenceFile').and.returnValue("LINK-TO-FILE");
        scope.$digest();
        var isolateScope = element.isolateScope();
        var value = isolateScope.download({id:"FILE-ID"});

        expect(value).toEqual("LINK-TO-FILE");
        expect(resources.facets.downloadLinkReferenceFile).toHaveBeenCalledWith('P-DM-ID', 'FILE-ID' );
    });


    it('delete deletes the attached file', function () {
        spyOn(resources.facets, 'get').and.returnValue($q.when([]));
        spyOn(resources.facets, 'delete').and.returnValue($q.when(true));
        spyOn(messageHandler, "showSuccess").and.returnValue(true);

        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.delete({id:"FILE-GUID"});
        scope.$digest();

        expect(resources.facets.delete).toHaveBeenCalledWith("P-DM-ID", "referenceFiles/FILE-GUID");
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Attachment deleted successfully.');
    });


    it('delete shows proper message if server throws an exception', function () {
        spyOn(resources.facets, 'get').and.returnValue($q.when([]));
        spyOn(resources.facets, 'delete').and.returnValue($q.reject({error:"ERROR"}));
        spyOn(messageHandler, "showError").and.returnValue(true);

        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.delete({id:"FILE-GUID"});
        scope.$digest();

        expect(resources.facets.delete).toHaveBeenCalledWith("P-DM-ID", "referenceFiles/FILE-GUID");
        expect(messageHandler.showError).toHaveBeenCalledWith("There was a problem deleting the attachment.", {error:"ERROR"});
    });

});
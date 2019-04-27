import {mock} from '../_globalMock';

describe('Directive: codeSetTermsTable', function () {

    var scope, $rootScope, element, securityHandler, resources, $q,$httpBackend, messageHandler, elementSelectorDialogue;

    var codeSet = {
        id: "CODE-SET-ID",
        label: "COD-SET-LABEL",
        terms:[
            {id:"T-ID1", code:"T-LABEL1", domainType: "Term"},
            {id:"T-ID2", code:"T-LABEL2", domainType: "Term"},
            {id:"T-ID3", code:"T-LABEL3", domainType: "Term"},
        ]
    };
    var currentUser = {
        firstName: "userFirstName",
        lastName: "userLastName"
    };

    mock.init();
    beforeEach(angular.mock.module('./codeSetTermsTable.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./profilePicture.html'));
    beforeEach(angular.mock.module('./markdownTextArea.html'));
    beforeEach(angular.mock.module('./elementAlias.html'));
    beforeEach(angular.mock.module('./multipleTermsSelector.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./mcInfiniteScrollList.html'));
    beforeEach(angular.mock.module('./mcPagedList.html'));


    beforeEach(inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('views/home.html').respond(200, '');
    }));

    beforeEach(inject(function ($compile, _$rootScope_, _securityHandler_, _resources_, _$q_,_messageHandler_, _elementSelectorDialogue_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        securityHandler = _securityHandler_;
        resources = _resources_;
        $q = _$q_;
        messageHandler= _messageHandler_;
        elementSelectorDialogue = _elementSelectorDialogue_;

        scope.codeSet = angular.copy(codeSet);

        element = angular.element('<code-set-terms-table code-set="codeSet"></code-set-terms-table>');
        $compile(element)(scope);

        spyOn(resources.codeSet, 'get').and.callFake(function() {
            return $q.when(codeSet);
        });

        spyOn(securityHandler, 'getCurrentUser').and.returnValue(currentUser);
    }));


    it('loads codeSet and its terms from backend service', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();
        expect(resources.codeSet.get).toHaveBeenCalledWith("CODE-SET-ID",'terms', Object({ pageSize: 20, pageIndex: 0, sortBy: null, sortType: '', filters: '' }) );
    });

    xit('add method opens element selector dialogue for selecting and adding a Term', function () {
        spyOn(elementSelectorDialogue, 'open').and.callFake(function() {
            return $q.when({id:"T-ID4", code:"T-LABEL4", domainType: "Term"});
        });
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.add();
        scope.$digest();
        expect(elementSelectorDialogue.open).toHaveBeenCalledWith(['Term']);
        expect(isolateScope.mcDisplayRecords[0]).toEqual({id:"T-ID4", code:"T-LABEL4", domainType: "Term"});
    });


    xit('delete method deletes a term from terms list successfully', function () {
        spyOn(resources.codeSet, 'delete').and.returnValue($q.when(true));
        spyOn(messageHandler, 'showSuccess').and.returnValue(true);

        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.delete({id:"T-ID1", code:"T-LABEL1", domainType: "Term"}, 0);
        spyOn(isolateScope.mcTableHandler, 'fetchForDynamic').and.returnValue(true);
        scope.$digest();

        expect(resources.codeSet.delete).toHaveBeenCalledWith("CODE-SET-ID", "terms/T-ID1");
        expect(messageHandler.showSuccess).toHaveBeenCalledWith("Term removed successfully.");
        expect(isolateScope.mcTableHandler.fetchForDynamic).toHaveBeenCalled();
        expect(isolateScope.mcDisplayRecords.length).toEqual(2);
    });


    it('delete method shows proper error message if it fails to delete the term', function () {
        spyOn(resources.codeSet, 'delete').and.returnValue($q.reject({error:"An-ERROR"}));
        spyOn(messageHandler, 'showError').and.returnValue(true);

        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.delete({id:"T-ID1", code:"T-LABEL1", domainType: "Term"}, 0);
        scope.$digest();

        expect(resources.codeSet.delete).toHaveBeenCalledWith("CODE-SET-ID", "terms/T-ID1");
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem removing the term.', {error:"An-ERROR"});
    });

});
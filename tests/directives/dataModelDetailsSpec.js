'use strict';

describe('Directive: dataModelDetails', function () {

    var scope, element, resources, messageHandler, $q, $httpBackend, securityHandler, $rootScope, exportHandler, confirmationModal, stateHandler;

    mock.init();

    beforeEach(module('views/directives/modelPath.html'));
    beforeEach(module('views/directives/editableFormButtons.html'));
    beforeEach(module('views/directives/dataModelDetails.html'));
    beforeEach(module('views/directives/elementClassifications.html'));
    beforeEach(module('views/directives/mcPagedList.html'));
    beforeEach(module('views/directives/allLinksInPagedList.html'));
    beforeEach(module('views/directives/userAccessNew.html'));
    beforeEach(module('views/directives/groupAccessNew.html'));
    beforeEach(module('views/directives/mcSelect2.html'));
    beforeEach(module('views/directives/mcTable/mcTableButton.html'));
    beforeEach(module('views/directives/mcTable/mcTablePagination.html'));
    beforeEach(module('views/directives/moreDescription.html'));
    beforeEach(module('views/directives/elementAlias.html'));
    beforeEach(module('views/directives/shareWith.html'));
    beforeEach(module('views/directives/markdownTextArea.html'));


    beforeEach(inject(function ($compile,_$httpBackend_,_$rootScope_, _resources_, _messageHandler_, _$q_, _securityHandler_ ,_exportHandler_ ,_confirmationModal_, _stateHandler_) {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        resources = _resources_;
        messageHandler = _messageHandler_;
        $q = _$q_;
        securityHandler = _securityHandler_;
        exportHandler = _exportHandler_;
        confirmationModal = _confirmationModal_;
        stateHandler = _stateHandler_;

        $httpBackend.whenGET('views/home.html').respond(200, '');
        $httpBackend.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);

        $rootScope.isAdmin = function () {
            return true;
        };

        scope = $rootScope.$new();
        scope.mcModelObject = {
            domainType:"DataModel",
            id: "DataModel-id",
            label: "ALabel",
            lastUpdated:1450344938815,
            description:"ADescription",
            type:"DataSet",
            classifiers:[
                {id:"1"},
                {id:"2"}
            ],
            aliases:["A", "B"]
        };
        element = angular.element('<datamodel-details mc-model-object="mcModelObject"></datamodel-details>');
        $compile(element)(scope);
        //Loads all semanticLinks
        spyOn(resources.catalogueItem, 'get').and.callFake(function() {return $q.when([]);});
        spyOn(resources.dataModel, 'get').and.callFake(function() {return $q.when([]);});
        spyOn(securityHandler, 'isValidSession').and.callFake(function() {return $q.when(true);});
        spyOn(resources.public, 'dataModelExporterPlugins').and.returnValue($q.when([{id:1},{id:2}]));
        spyOn(securityHandler,'dataModelAccess').and.returnValue({
            showEdit: true,
            showPermission: true,
            showNewVersion: true,
            showFinalise: true,
            showDelete: true
        });
    }));

    it("formBeforeSave passes values to the backend", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn(resources.dataModel, 'put').and.returnValue($q.resolve({}));
        scope.mcModelObject.description = "A new Desc";
        scope.mcModelObject.organisation = "A new organisation";
        scope.mcModelObject.author = "A new Author";
        scope.$digest();
        //var isolateScope = element.isolateScope();
        scope.editableForm.$data.description = "A new Desc";
        scope.formBeforeSave();
        scope.$digest();
        var resource = {
            id: "DataModel-id",
            label: "ALabel",
            description: "A new Desc",
            author: "A new Author",
            organisation:"A new organisation",
            domainType: "DataModel",
            type:"DataSet",
            classifiers: [{id: "1"}, {id: "2"}],
            aliases:["A", "B"]
        };
        expect(resources.dataModel.put).toHaveBeenCalledWith(scope.mcModelObject.id, null, {resource:resource});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Model updated successfully.');
    });

    it("Failure in save will show messageHandler error message", function () {
        spyOn(messageHandler, 'showError').and.returnValue({});
        spyOn(resources.dataModel, 'put').and.returnValue($q.reject({error:"ERROR"}));
        scope.mcModelObject.description = "A new Desc";
        scope.mcModelObject.organisation = "A new organisation";
        scope.mcModelObject.author = "A new Author";
        scope.$digest();
        // var isolateScope = element.isolateScope();
        scope.editableForm.$data.description = "A new Desc";
        scope.formBeforeSave();
        scope.$digest();
        var resource = {
            id: "DataModel-id",
            label: "ALabel",
            description: "A new Desc",
            author: "A new Author",
            organisation:"A new organisation",
            domainType: "DataModel",
            type:"DataSet",
            classifiers: [{id: "1"}, {id: "2"}],
            aliases:["A", "B"]
        };
        expect(resources.dataModel.put).toHaveBeenCalledWith(scope.mcModelObject.id, null, {resource:resource});
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem updating the Data Model.', {error:"ERROR"});
    });


    it("export starts the export process", function () {
        spyOn(exportHandler, 'exportDataModel').and.returnValue($q.when({fileName:"ABC.json", fileBlob:[0,1,0,1]}));
        spyOn(exportHandler, 'createBlobLink').and.returnValue(document.createElement('a'));

        scope.$digest();
        // var controllerScope = element.isolateScope();
        scope.export({id:1});
        scope.$digest();

        expect(scope.processing).toBe(false);
        expect(exportHandler.exportDataModel).toHaveBeenCalledWith([scope.mcModelObject], {id:1});
        expect(exportHandler.createBlobLink).toHaveBeenCalledWith([0,1,0,1], "ABC.json");
    });


    it("soft delete will mark the model as deleted if user is admin", function () {
        spyOn($rootScope, 'isAdmin').and.returnValue(true);
        spyOn(resources.dataModel, 'delete').and.returnValue($q.when({}));
        spyOn(stateHandler, "reload").and.returnValue({});
        spyOn($rootScope, '$broadcast').and.returnValue({});

        scope.$digest();
        //var controllerScope = element.isolateScope();
        scope.delete();
        scope.$digest();

        expect($rootScope.isAdmin).toHaveBeenCalledWith();
        expect($rootScope.$broadcast).toHaveBeenCalledWith('$reloadFoldersTree');
        expect(stateHandler.reload).toHaveBeenCalledWith();
        expect(resources.dataModel.delete).toHaveBeenCalledWith("DataModel-id", null, null);
    });


    it("permanent delete will delete the model permanently if user is admin", function () {
        spyOn($rootScope, 'isAdmin').and.returnValue(true);
        spyOn(resources.dataModel, 'delete').and.returnValue($q.when({}));
        spyOn(stateHandler, "Go").and.returnValue({});
        spyOn($rootScope, '$broadcast').and.returnValue({});

        scope.$digest();
        //var controllerScope = element.isolateScope();
        scope.delete(true);
        scope.$digest();

        expect($rootScope.isAdmin).toHaveBeenCalledWith();
        expect($rootScope.$broadcast).toHaveBeenCalledWith('$reloadFoldersTree');
        expect(stateHandler.Go).toHaveBeenCalledWith("allDataModel", {reload: true, location: true});
        expect(resources.dataModel.delete).toHaveBeenCalledWith("DataModel-id", null, "permanent=true");
    });

});




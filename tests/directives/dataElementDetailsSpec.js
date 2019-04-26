import {mock} from '../_globalMock';

describe('Directive: datElementDetails', function () {

    var scope, element, resources, messageHandler, $q, $httpBackend, securityHandler, $rootScope;

    mock.init();

    beforeEach(angular.mock.module('./modelPath.html'));
    beforeEach(angular.mock.module('./editableFormButtons.html'));
    beforeEach(angular.mock.module('./dataElementDetails.html'));
    beforeEach(angular.mock.module('./elementClassifications.html'));
    beforeEach(angular.mock.module('./mcPagedList.html'));
    beforeEach(angular.mock.module('./allLinksInPagedList.html'));
    beforeEach(angular.mock.module('./elementDataType.html'));
    beforeEach(angular.mock.module('./moreDescription.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./elementAlias.html'));
    beforeEach(angular.mock.module('./newDataTypeInline.html'));
    beforeEach(angular.mock.module('./enumerationList.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./modelSelectorTree.html'));
    beforeEach(angular.mock.module('./foldersTree2.html'));
    beforeEach(angular.mock.module('./markdownTextArea.html'));
    beforeEach(angular.mock.module('./enumerationListWithCategory.html'));

    beforeEach(inject(function ($compile,_$httpBackend_,_$rootScope_, _resources_, _messageHandler_, _$q_, _securityHandler_) {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        resources = _resources_;
        messageHandler = _messageHandler_;
        $q = _$q_;
        securityHandler = _securityHandler_;

        $httpBackend.whenGET('views/home.html').respond(200, '');
        $httpBackend.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);

        scope = $rootScope.$new();
        scope.currentDataElement = {
            domainType:"DataElement",
            id: "DataElement-id",
            label: "ALabel",
            lastUpdated:1450344938815,
            description:"ADescription",
            editable: true,
            dataType:{
                id: "DT-ID",
                label:"DT-LABEL",
                domainType: "PrimitiveType",
                dataModel:"DM-1",
            },
            breadcrumbs:[
                {"id":19, "label":"ParentDataModel"},
                {"id":637,"label":"ParentDataClass"}
            ],
            classifiers:[
                {id:"1"},
                {id:"2"}
            ],
            aliases:["A", "B"]
        };
        scope.mcParentDataModel = {
            id:"P-DM-ID",
            editable:true
        };
        scope.mcParentDataClass = {
            id:"P-DC-ID"
        };
        element = angular.element('<mc-data-element-details mc-data-element="currentDataElement" mc-parent-data-model="mcParentDataModel" mc-parent-data-class="mcParentDataClass"></mc-data-element-details>');
        $compile(element)(scope);

        spyOn(resources.catalogueItem, 'get').and.callFake(function() {return $q.when([]);});
    }));

    it("should check if user has writableAccess or not", function () {
        spyOn(securityHandler, 'showIfRoleIsWritable').and.returnValue(true);
        scope.$digest();
        expect(securityHandler.showIfRoleIsWritable).toHaveBeenCalledWith(scope.currentDataElement);
    });

    it("formBeforeSave passes values to the backend", function () {
        spyOn(messageHandler, 'showSuccess').and.returnValue({});
        spyOn(resources.dataElement, 'put').and.returnValue($q.resolve({}));
        scope.currentDataElement.label  = "A new Label";
        scope.currentDataElement.description = "A new Desc";
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.editableForm.$data.description = "A new Desc";
        isolateScope.formBeforeSave();
        scope.$digest();
        var resource =
            {
                id: "DataElement-id",
                label: "A new Label",
                description: "A new Desc",
                domainType: "DataElement",
                dataType:{id: "DT-ID"},
                classifiers: [{id: "1"}, {id: "2"}],
                aliases:["A", "B"],
                minMultiplicity: null,
                maxMultiplicity: null
            };
        expect(resources.dataElement.put).toHaveBeenCalledWith(scope.mcParentDataModel.id, scope.mcParentDataClass.id, scope.currentDataElement.id, null, {resource:resource});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Element updated successfully.');
    });

    it("Failure in save will show messageHandler error message", function () {
        spyOn(messageHandler, 'showError').and.returnValue({});
        spyOn(resources.dataElement, 'put').and.returnValue($q.reject({error: "ERROR"}));
        scope.currentDataElement.label  = "A new Label";
        scope.currentDataElement.description = "A new Desc";
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.editableForm.$data.description = "A new Desc";
        isolateScope.formBeforeSave();
        scope.$digest();
        var resource =
            {
                id: "DataElement-id",
                label: "A new Label",
                description: "A new Desc",
                domainType: "DataElement",
                dataType:{id: "DT-ID"},
                classifiers: [{id: "1"}, {id: "2"}],
                aliases:["A", "B"],
                minMultiplicity: null,
                maxMultiplicity: null
            };
        expect(resources.dataElement.put).toHaveBeenCalledWith(scope.mcParentDataModel.id, scope.mcParentDataClass.id, scope.currentDataElement.id, null, {resource:resource});
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem updating the Data Element.', {error: "ERROR"});
    });

    it("Save passes multiplicities values to the backend", function () {
        spyOn(resources.dataElement, 'put').and.returnValue($q.resolve({aliases:["A", "B"]}));

        var testCases = [
            {input:{min:"0", max:"1"}, output:{min:0, max:1}},
            {input:{min:"0", max:"2"}, output:{min:0, max:2}},
            {input:{min:"0", max:"-1"},output:{min:0, max:-1}},
            {input:{min:"1", max:"5"}, output:{min:1, max:5}},
            {input:{min:"1", max:"*"}, output:{min:1, max:-1}},
            {input:{min:"0", max:"*"}, output:{min:0, max:-1}},
            {input:{min:"",  max:""},  output:{min:null, max:null}},
            {input:{min:null,max:null},  output:{min:null, max:null}}
        ];

        for(var i = 0; i < testCases.length;i++) {
            scope.currentDataElement.minMultiplicity = testCases[i].input.min;
            scope.currentDataElement.maxMultiplicity = testCases[i].input.max;
            scope.$digest();

            var resource =
                {
                    id: "DataElement-id",
                    label: "ALabel",
                    description:"ADescription",
                    domainType: "DataElement",
                    dataType:{id: "DT-ID"},
                    classifiers: [{id: "1"}, {id: "2"}],
                    aliases:["A", "B"],
                    minMultiplicity : testCases[i].output.min,
                    maxMultiplicity : testCases[i].output.max
                };

            var controllerScope = element.isolateScope();
            controllerScope.editableForm.$data.description = "ADescription";
            controllerScope.formBeforeSave();
            expect(resources.dataElement.put).toHaveBeenCalledWith(scope.mcParentDataModel.id, scope.mcParentDataClass.id, scope.currentDataElement.id, null, {resource:resource});
        }
    });

});
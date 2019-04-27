import {mock} from '../_globalMock';

describe('Directive: newDataTypeInline', function () {

    var scope, $rootScope, element, securityHandler, resources, $q,$httpBackend, ngToast;

    var parentDataModel = {
        id: "P-DM-ID",
        label: "P-DM-Label"
    };

    var model = {
        label:"",
        description:"",
        metadata: [],
        domainType: "PrimitiveType",
        enumerationValues: [],
        classifiers: [],
    };

    mock.init();
    beforeEach(angular.mock.module('./newDataTypeInline.html'));
    beforeEach(angular.mock.module('./modelPath.html'));
    beforeEach(angular.mock.module('./elementClassifications.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./modelSelectorTree.html'));
    beforeEach(angular.mock.module('./enumerationList.html'));
    beforeEach(angular.mock.module('./foldersTree2.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./enumerationListWithCategory.html'));



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


        scope.parentDataModel = angular.copy(parentDataModel);
        scope.model = angular.copy(model);

        element = angular.element('<new-data-type-inline parent-data-model="parentDataModel" model="model" parent-scope-handler="parentScopeHandler"></new-data-type-inline>');
        $compile(element)(scope);

        spyOn(resources.terminology, 'get').and.callFake(function() {return $q.when([]);});

    }));


    it('validate PrimitiveType', function () {
        scope.model.label = "";
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.validate();
        expect(isolateScope.isValid).toBeFalsy();

        scope.model.label = "ALabel";
        scope.model.domainType = "PrimitiveType";
        scope.$digest();
        isolateScope = element.isolateScope();
        isolateScope.validate();
        expect(isolateScope.isValid).toBeTruthy();
    });



    it('validate EnumerationType', function () {
        scope.model.label = "ALabel";
        scope.model.domainType = "EnumerationType";
        scope.$digest();
        var isolateScope = element.isolateScope();
        expect(isolateScope.isValid).toBeFalsy();

        scope.model.label = "ALabel";
        scope.model.domainType = "EnumerationType";
        scope.model.enumerationValues = [
            {id:"GUID1", key:"key1", val:"value1"}
        ];
        scope.$digest();
        isolateScope = element.isolateScope();
        isolateScope.validate();
        expect(isolateScope.isValid).toBeTruthy();

    });

    it('validate ReferenceType', function () {

        spyOn(resources.tree, 'get').and.callFake(function() {return $q.when([]);});

        scope.model.label = "ALabel";
        scope.model.domainType = "ReferenceType";
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.validate();
        expect(isolateScope.isValid).toBeFalsy();

        scope.model.label = "ALabel";
        scope.model.domainType = "ReferenceType";
        scope.$digest();
        isolateScope = element.isolateScope();
        isolateScope.onDataClassSelect([{id:"DC-ID", label:"DC-Label"}]);
        isolateScope.validate();
        expect(isolateScope.isValid).toBeTruthy();
    });

    it('validate TerminologyType', function () {
        scope.model.label = "ALabel";
        scope.model.domainType = "TerminologyType";
        scope.$digest();
        var isolateScope = element.isolateScope();
        expect(isolateScope.isValid).toBeFalsy();

        scope.model.label = "ALabel";
        scope.model.domainType = "TerminologyType";
        scope.$digest();
        isolateScope = element.isolateScope();
        isolateScope.onTerminologySelect({id:"TG-ID", label:"TG-Label"});
        isolateScope.validate();
        expect(isolateScope.isValid).toBeTruthy();
    });

    it('It broadcasts any changes in the main model', function () {
        spyOn($rootScope, '$broadcast').and.callThrough();

        scope.parentScopeHandler = $rootScope;
        scope.model.label = "Sth-New";
        scope.$digest();
        var isolateScope = element.isolateScope();
        //apiCallEnd is fired
        expect($rootScope.$broadcast).toHaveBeenCalledWith('newDataTypeInlineUpdated', {model:isolateScope.model, isValid:isolateScope.isValid});

    });


});
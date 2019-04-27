import {mock} from '../_globalMock';

describe('Directive: elementClassifications', function () {

    var scope, $rootScope, element, securityHandler, resources, $q,$httpBackend, ngToast;

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

        scope.selectedClassifiers = [];

        element = angular.element('<element-classifications classifications="selectedClassifiers" editable="true"></element-classifications>');
        $compile(element)(scope);

        spyOn(resources.classifier, 'get').and.callFake(function() {return $q.when([]);});

    }));


    it('loads all classifications', function () {
        scope.$digest();
        expect(resources.classifier.get).toHaveBeenCalledWith(null, null, {all:true});
    });

    // it('select adds a classification', function () {
    //     scope.$digest();
    //     var isolateScope = element.isolateScope();
    //     isolateScope.select({id:"CID1", label:"CLabel1"});
    //     isolateScope.select({id:"CID1", label:"CLabel1"});
    //     isolateScope.select({id:"CID2", label:"CLabel2"});
    //     expect(scope.selectedClassifiers.length).toEqual(2);
    //     expect(scope.selectedClassifiers).toEqual([
    //         {id:"CID1", label:"CLabel1"},
    //         {id:"CID2", label:"CLabel2"}
    //     ]);
    //
    // });


});
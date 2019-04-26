import {mock} from '../_globalMock';

describe('Directive: ContentTable', function () {

    var scope, element, resources, $q, $rootScope, $compile, stateHandler, userSettingsHandler;

    mock.init();

    beforeEach(angular.mock.module('./contentTable.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./moreDescription.html'));
    beforeEach(angular.mock.module('./allLinksInPagedList.html'));
    beforeEach(angular.mock.module('./mcPagedList.html'));
    beforeEach(angular.mock.module('./elementDataType.html'));
    beforeEach(angular.mock.module('./contentTableButtons.html'));
    beforeEach(angular.mock.module('./moreDescription.html'));

    beforeEach(inject(function (_$compile_,_$rootScope_, _resources_, _ngToast_, _$q_, _stateHandler_, _userSettingsHandler_) {
        $rootScope = _$rootScope_;
        resources = _resources_;
        $q = _$q_;
        $compile = _$compile_;
        stateHandler = _stateHandler_;

        scope = $rootScope.$new();
        scope.parentDataModel      = {id: "DM-ID",    domainType:"DataModel"};
        scope.grandParentDataClass = {id: "GP-DC-ID", domainType:"DataClass"};
        scope.parentDataClass      = {id: "DC-ID",    domainType:"DataClass"};

        userSettingsHandler = _userSettingsHandler_;
        spyOn(userSettingsHandler,'get').and.callFake(function (prm) {
            if(prm === "countPerTable"){
                return 20;
            }
        });

        element = angular.element('<content-table parent-data-model="parentDataModel" grand-parent-data-class="grandParentDataClass" parent-data-class="parentDataClass"></content-table>');
        $compile(element)(scope);
    }));

    xit("calls proper endpoint for loading content", function () {
        spyOn(resources.dataClass,'get').and.returnValue($q.resolve({}));
        scope.$digest();
        var options = { pageSize: 20, pageIndex: 0, sortBy: undefined, sortType: undefined, filters: '' };
        expect(resources.dataClass.get).toHaveBeenCalledWith(scope.parentDataModel.id, null, scope.parentDataClass.id, "content", options);
    });


    it("newDataClass redirects to New DataClass page", function () {
        spyOn(resources.dataClass,'get').and.returnValue($q.resolve({}));
        spyOn(stateHandler, "Go").and.returnValue({});
        scope.$digest();
        var isolateScope = element.isolateScope();

        isolateScope.newDataClass();
        scope.$digest();

        expect(stateHandler.Go).toHaveBeenCalledWith("NewDataClass", {
            parentDataModelId: scope.parentDataModel.id,
            parentDataClassId: scope.parentDataClass.id,
            grandParentDataClassId: scope.grandParentDataClass.id
        });
    });


    it("newDataElement redirects to New DataElement page", function () {
        spyOn(resources.dataClass,'get').and.returnValue($q.resolve({}));
        spyOn(stateHandler, "Go").and.returnValue({});
        scope.$digest();
        var isolateScope = element.isolateScope();

        isolateScope.newDataElement();
        scope.$digest();

        expect(stateHandler.Go).toHaveBeenCalledWith("NewDataElement", {
            parentDataModelId: scope.parentDataModel.id,
            parentDataClassId: scope.parentDataClass.id,
            grandParentDataClassId: scope.grandParentDataClass.id});
    });

    it("should handle Add button show/hide based on parent DataModel editable status", function () {
        spyOn(resources.dataClass,'get').and.returnValue($q.resolve({}));
        scope.parentDataModel.editable = false;
        scope.$digest();
        expect(element.find("div#addContent").length).toBe(0);

        scope.parentDataModel.editable = true;
        scope.$digest();
        expect(element.find("div#addContent").length).toBe(1);
    });

});
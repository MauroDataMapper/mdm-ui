import {mock} from '../_globalMock';

describe('Directive: History', function () {

    var scope, element, resources, $q, $rootScope, $compile, userSettingsHandler;

    mock.init();

    beforeEach(angular.mock.module('./history.html'));
    beforeEach(angular.mock.module('./profilePicture.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));

    beforeEach(inject(function (_$compile_,_$rootScope_, _resources_, _ngToast_, _$q_ , _userSettingsHandler_) {
        $rootScope = _$rootScope_;
        resources = _resources_;
        $q = _$q_;
        $compile = _$compile_;

        userSettingsHandler = _userSettingsHandler_;
        spyOn(userSettingsHandler,'get').and.callFake(function (prm) {
            if(prm === "countPerTable"){
                return 20;
            }
        });


    }));

    function init(parentType) {
        scope = $rootScope.$new();
        scope.parent = {
            id: "ID"
        };
        scope.parentType = parentType;
        element = angular.element('<history parent="parent" parent-type="parentType"></history>');
        $compile(element)(scope);
    }

    it("calls proper endpoint for loading dataModel", function () {
        spyOn(resources.dataModel,'get').and.returnValue($q.resolve({}));
        init("DataModel");
        scope.$digest();
        var options = { pageSize: 20, pageIndex: 0, sortBy: null, sortType: '', filters: '' };
        expect(resources.dataModel.get).toHaveBeenCalledWith("ID", "edits", options);
    });

    it("calls proper endpoint for loading classifier", function () {
        spyOn(resources.classifier,'get').and.returnValue($q.resolve({}));
        init("Classifier");
        scope.$digest();
        var options = { pageSize: 20, pageIndex: 0, sortBy: null, sortType: '', filters: '' };
        expect(resources.classifier.get).toHaveBeenCalledWith("ID", "edits", options);
    });

    it("calls proper endpoint for loading classifier", function () {
        spyOn(resources.userGroup,'get').and.returnValue($q.resolve({}));
        init("UserGroup");
        scope.$digest();
        var options = { pageSize: 20, pageIndex: 0, sortBy: null, sortType: '', filters: '' };
        expect(resources.userGroup.get).toHaveBeenCalledWith("ID", "edits", options);
    });


    it("calls dataModel endpoint when parentType not defined", function () {
        spyOn(resources.dataModel,'get').and.returnValue($q.resolve({}));
        init();
        scope.$digest();
        var options = { pageSize: 20, pageIndex: 0, sortBy: null, sortType: '', filters: '' };
        expect(resources.dataModel.get).toHaveBeenCalledWith("ID", "edits", options);
    });


});
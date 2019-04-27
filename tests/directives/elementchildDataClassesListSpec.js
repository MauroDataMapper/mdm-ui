import {mock} from '../_globalMock';

describe('Directive: elementChildDataClassesList', function () {

	var scope, element, $httpBackend, controller, resources, $q, ngToast, userSettingsHandler;

	//add main module
	mock.init();

	//Load required templates
	beforeEach(angular.mock.module('./elementChildDataClassesList.html'));
    beforeEach(angular.mock.module('./editableFormButtons.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./allLinksInPagedList.html'));
    beforeEach(angular.mock.module('./moreDescription.html'));
    beforeEach(angular.mock.module('./mcPagedList.html'));
    beforeEach(angular.mock.module('./elementChildDataClassesListButtons.html'));

	beforeEach(inject(function ($rootScope, $compile,_$httpBackend_,_$rootScope_, _resources_, _$q_, _ngToast_, _userSettingsHandler_) {

		$rootScope = _$rootScope_;
		$httpBackend = _$httpBackend_;
        resources = _resources_;
        $q = _$q_;
        ngToast = _ngToast_;

		$httpBackend.whenGET('views/home.html').respond(200, '');

		//Create and initialize the scope
		scope = $rootScope.$new();
		scope.dataModel = {
			id:"DM-ID",
			label:"DM-Label",
            domainType:"DataModel",
            type:"DataSet"
		};


        userSettingsHandler = _userSettingsHandler_;
        spyOn(userSettingsHandler,'get').and.callFake(function (prm) {
            if(prm === "countPerTable"){
                return 20;
            }
        });

		element = angular.element('<element-child-data-classes-list parent-data-model="dataModel" parent-data-class="{id:null}" mc-data-class="{id:null}" type = "\'dynamic\'"></element-child-data-classes-list>');
		$compile(element)(scope);
        controller = element.controller;
    }));

    it("should call the right endpoint for loading dataClasses of a dataModel when its type is dynamic", function () {
        spyOn(resources.dataModel, "get").and.returnValue($q.when({
            items:[
                {id:1, label:"DC1-Label", domainType:"DataClass"},
                {id:2, label:"DC2-Label", domainType:"DataClass"}]
        }));

        scope.$digest();
        scope = element.isolateScope() || element.scope();

        var options = {
            pageSize: 20,
            pageIndex: 0,
            sortBy: null,
            sortType: '',
            filters: ''
        };
        expect(resources.dataModel.get).toHaveBeenCalledWith("DM-ID", "dataClasses", options)
    });

    xit("should hide Add button when parent DataModel is not editable", function () {
        spyOn(resources.dataModel, "get").and.returnValue($q.when({
            items:[
                {id:1, label:"DC1-Label", domainType:"DataClass"},
                {id:2, label:"DC2-Label", domainType:"DataClass"}]
        }));

        scope.dataModel.finalised = false;
        scope.dataModel.editable  = false;
        scope.$digest();
        expect(element.find("button#addDataClass").length).toBe(0);
        expect(element.find("button.dataClassEditButton").length).toBe(0);
    });

    xit("should show Add button when parent DataModel is editable", function () {
        spyOn(resources.dataModel, "get").and.returnValue($q.when({
            items:[
                {id:1, label:"DC1-Label", domainType:"DataClass"},
                {id:2, label:"DC2-Label", domainType:"DataClass"}]
        }));
        scope.dataModel.finalised = false;
        scope.dataModel.editable = true;
        scope.$digest();
        expect(element.find("button#addDataClass").length).toBe(1);
        expect(element.find("button.dataClassEditButton").length).toBe(2);//two dataClass rows
    });

});
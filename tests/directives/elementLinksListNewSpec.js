import {mock} from '../_globalMock';

describe('Directive: elementLinksListNew', function () {

	var scope, element, $httpBackend, controller, resources, $q, ngToast, userSettingsHandler;

	//add main module
	mock.init();

	//Load required templates
	beforeEach(angular.mock.module('./elementLinksListNew.html'));
    beforeEach(angular.mock.module('./editableFormButtons.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./modelPath.html'));

	beforeEach(inject(function ($rootScope, $compile,_$httpBackend_,_$rootScope_, _resources_, _$q_, _ngToast_, _userSettingsHandler_) {

		$rootScope = _$rootScope_;
		$httpBackend = _$httpBackend_;
        resources = _resources_;
        $q = _$q_;
        ngToast = _ngToast_;

		$httpBackend.whenGET('views/home.html').respond(200, '');

		//Create and initialize the scope
		scope = $rootScope.$new();
		scope.parent = {
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


        element = angular.element('<element-links-list-new parent="parent" type="\'dynamic\'"></element-links-list-new>');
		$compile(element)(scope);
        controller = element.controller;
    }));

    it("should call the right endpoint for loading semanticLinks when its type is dynamic", function () {
        spyOn(resources.catalogueItem, "get").and.returnValue($q.when({
            items:[
                {id:1, source:{id:"DM2-ID", domainType:"DataModel", breadcrumbs:[{id:"DM-ID"}]}},
                {id:2, source:{id:"DM2-ID", domainType:"DataModel", breadcrumbs:[{id:"DM-ID"}]}}]
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
        expect(resources.catalogueItem.get).toHaveBeenCalledWith("DM-ID", "semanticLinks", options)

    });


    // it("fetch searches in all catalogue elements", function () {
    //     spyOn(resources.catalogueItem, "post").and.callFake(function (id, action) {
    //         if(action === "search"){
    //             return $q.when({
    //                 results:[{id:1},{id:2},{id:3}],
    //                 count:100
    //             });
    //         }
    //     });
    //     spyOn(resources.catalogueItem, "get").and.callFake(function (id, action) {
    //         return $q.when({
    //             items:[
    //                 {id:1, source:{id:"DM2-ID", domainType:"DataModel", breadcrumbs:[{id:"DM-ID"}]}},
    //                 {id:2, source:{id:"DM2-ID", domainType:"DataModel", breadcrumbs:[{id:"DM-ID"}]}}]
    //         })
    //     });
    //
    //     scope.$digest();
    //     scope = element.isolateScope() || element.scope();
    //
    //     scope.fetch("SEARCH-TEXT", 9, 20);
    //     var options = {
    //         resource: {
    //             searchTerm: "SEARCH-TEXT",
    //             limit: 20,
    //             offset: 9,
    //             domainTypes: ["DataModel","DataClass"],
    //             labelOnly: true
    //         }
    //     };
    //     expect(resources.catalogueItem.post).toHaveBeenCalledWith(null, "search", options);
    //
    //     scope.fetch("SEARCH-TEXT2");
    //     options = {
    //         resource: {
    //             searchTerm: "SEARCH-TEXT2",
    //             limit: 30,
    //             offset: 0,
    //             domainTypes: ["DataModel","DataClass"],
    //             labelOnly: true
    //         }
    //     };
    //     expect(resources.catalogueItem.post).toHaveBeenCalledWith(null, "search", options);
    // })

});
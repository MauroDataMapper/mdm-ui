import {mock} from '../_globalMock';


describe('Directive: mcDataSetMetadata', function () {

	var scope, element;
	var $httpBackend, securityHandler, resources, $q;

	mock.init();

	beforeEach(angular.mock.module('./dataSetMetadata.html'));
	beforeEach(angular.mock.module('./modelPath.html'));
	beforeEach(angular.mock.module('./editableFormButtons.html'));
	beforeEach(angular.mock.module('./dataSetMetadata.html'));
	beforeEach(angular.mock.module('./mcSelect2.html'));
    beforeEach(angular.mock.module('./mcTableButton.html'));
    beforeEach(angular.mock.module('./mcTablePagination.html'));
    beforeEach(angular.mock.module('./moreDescription.html'));
    beforeEach(angular.mock.module('./markdownTextArea.html'));

	beforeEach(inject(function (_$httpBackend_) {
		$httpBackend = _$httpBackend_;
		$httpBackend.whenGET('views/home.html').respond(200, '');
	}));


	beforeEach(inject(function ($rootScope, $compile, _securityHandler_, _resources_,_$q_) {
		scope = $rootScope.$new();
        securityHandler = _securityHandler_;
        resources = _resources_;
        $q = _$q_;
		scope.parent = {id:"P-DM-ID"};
		element = angular.element('<mc-data-set-metadata parent="parent" type="\'dynamic\'"></mc-data-set-metadata>');
		$compile(element)(scope);
		//Loads all namespaces
        spyOn(resources.metadata.namespaces, 'get').and.callFake(function() {return $q.when([]);});
	}));

	it("loads all default namespaces", function () {
        spyOn(resources.facets, 'get').and.callFake(function() {return $q.when([]);});
        scope.$digest();
        expect(resources.metadata.namespaces.get).toHaveBeenCalledWith();
    });

    it("metadataFetch loads metadata dynamically", function () {
        var options = {
            pageSize: 10,
            pageIndex:1,
            sortBy: "label",
            sortType:"asc",
            filters: "label=A"
        };
        spyOn(resources.facets, 'get').and.callFake(function() {return $q.when([]);});
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.metadataFetch(options.pageSize, options.pageIndex, options.sortBy, options.sortType, options.filters);
        expect(resources.facets.get).toHaveBeenCalledWith("P-DM-ID", "metadata", options);
    });


});
import {mock} from '../_globalMock';

describe('Directive: elementDataType', function () {

	//add main module
	mock.init();
	var scope, element;
	var $httpBackend;

	//Load the main directive ('elementDataType')
	beforeEach(angular.mock.module('./elementDataType.html'));


	beforeEach(inject(function (_$httpBackend_) {
		$httpBackend = _$httpBackend_;
		$httpBackend.whenGET('views/home.html').respond(200, '');
	}));


	beforeEach(inject(function ($rootScope, $compile) {
		scope = $rootScope.$new();
		scope.elementDataType = {};
		element = angular.element('<element-data-type element-data-type="elementDataType"></element-data-type>');
		$compile(element)(scope);
		scope.$digest();
	}));


	it("SimpleType details should be displayed", function () {
		//Create and initialize the scope
		scope.elementDataType = {
			type : "Primitive",
		    dataTypeId: "1",
		    label:"SimpleDataType",

		};
		scope.$digest();

		//simpleType should be visible
		expect(element.find("a.dataTypePrimitive > span.ng-binding").length).toBe(1);
		//EnumerationType should be hidden
		expect(element.find("a.dataTypeEnumeration").length).toBe(1);
		//simpleType label should be assigned
		expect((element.find("a.dataTypePrimitive > span.ng-binding")[0]).innerHTML).toBe("SimpleDataType");

		//it should not show ..more link
		expect(scope.showMoreIcon).toBeFalsy();
	});


    it("EnumType details should be displayed", function () {
        //Create and initialize the scope
        scope.elementDataType = {
            id:"DT-ID",
            label: "DT-Label",
            description:"DT-Desc",
            domainType:"EnumerationType",
            enumerationValues: [
                {
                    "id":  "Enum-Key11",
                    "key": "Enum-Key11",
                    "value": "Enum-Value11",
					category: "category1"
                },
                {
                    "id":  "Enum-Key12",
                    "key": "Enum-Key12",
                    "value": "Enum-Value12",
                    category: "category1"
                },
                {
                    "id":  "Enum-Key21",
                    "key": "Enum-Key21",
                    "value": "Enum-Value21",
                    category: "category2"
                },
                {
                    "id":  "Enum-Key22",
                    "key": "Enum-Key22",
                    "value": "Enum-Value22",
                    category: "category2"
                }
            ],
        };
        scope.$digest();
        var isolateScope = element.isolateScope();

        expect(isolateScope.categories).toEqual([
            {key: "category1", value: "category1"},
            {key: "category2", value: "category2"}
		]);


		angular.forEach(isolateScope.allRecords, function (record) {
			delete record.$$hashKey;
        });
        expect(isolateScope.allRecords).toEqual([
            {id: "Enum-Key11", key: "Enum-Key11", value: "Enum-Value11", category: "category1"},
            {id: "Enum-Key12", key: "Enum-Key12", value: "Enum-Value12", category: "category1"},
        	{id: "Enum-Key21", key: "Enum-Key21", value: "Enum-Value21", category: "category2"},
        	{id: "Enum-Key22", key: "Enum-Key22", value: "Enum-Value22", category: "category2"}
        ]);
        expect(isolateScope.enumsCount).toBe(4);
        expect(isolateScope.hasCategory).toBeTruthy();



        angular.forEach(isolateScope.allRecordsWithGroups, function (record) {
            delete record.$$hashKey;
        });
        expect(isolateScope.allRecordsWithGroups).toEqual([
			{id: "category1", category: "category1", isCategoryRow: true},
			{id: "Enum-Key11", key: "Enum-Key11", value: "Enum-Value11", category: "category1"},
			{id: "Enum-Key12", key: "Enum-Key12", value: "Enum-Value12", category: "category1"},
			{id: "category2", category: "category2", isCategoryRow: true},
			{id: "Enum-Key21", key: "Enum-Key21", value: "Enum-Value21", category: "category2"},
			{id: "Enum-Key22", key: "Enum-Key22", value: "Enum-Value22", category: "category2"},
	    ]);

    });


});
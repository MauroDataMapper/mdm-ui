import {mock} from '../_globalMock';

describe('Directive: dataTypeDetails', function () {
	var scope, element , resources, exportHandler, messageHandler, $q, $httpBackend, securityHandler, $rootScope ;

	mock.init();
	beforeEach(angular.mock.module('./modelPath.html'));
	beforeEach(angular.mock.module('./editableFormButtons.html'));
	beforeEach(angular.mock.module('./dataTypeDetails.html'));
	beforeEach(angular.mock.module('./elementDataType.html'));
    beforeEach(angular.mock.module('./mcPagedList.html'));
    beforeEach(angular.mock.module('./allLinksInPagedList.html'));
    beforeEach(angular.mock.module('./moreDescription.html'));
    beforeEach(angular.mock.module('./elementAlias.html'));
    beforeEach(angular.mock.module('./markdownTextArea.html'));
    beforeEach(angular.mock.module('./elementClassifications.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));


	beforeEach(inject(function ($compile, _$httpBackend_, _$rootScope_, _resources_, _exportHandler_, _messageHandler_, _$q_, _securityHandler_) {
		$rootScope = _$rootScope_;
		$httpBackend = _$httpBackend_;
		resources = _resources_;
		exportHandler = _exportHandler_;
        messageHandler = _messageHandler_;
		$q = _$q_;
        securityHandler = _securityHandler_;

		$httpBackend.whenGET('views/home.html').respond(200, '');
		$httpBackend.whenGET('views/directives/elementClassifications.html').respond(200, '');
        $httpBackend.expect("GET", $rootScope.backendURL + '/classifiers/?&all=true').respond([]);

        //as classification directive loads all classifiers, we need to mock its call here
    }));

	describe('PrimitiveType', function () {
		beforeEach(inject(function ($rootScope, $compile) {
			scope = $rootScope.$new();
			scope.currentDataType = {
                id:"DT-ID",
                label: "DT-Label",
                description:"DT-Desc",
				domainType:"PrimitiveType",
				classifiers:[
					{id:"1"},
					{id:"2"}
				],
        aliases:["A", "B"]
			};
			scope.mcParentDataModel = {id:"P-DM-ID"};

            element = angular.element('<datatype-details mc-data-type-object="currentDataType" mc-parent-data-model="mcParentDataModel"></datatype-details>');
			$compile(element)(scope);

            spyOn(resources.catalogueItem, 'get').and.callFake(function() {return $q.when([]);});
        }));

		it("should check if user has writableAccess or not", function () {
            spyOn(securityHandler, 'showIfRoleIsWritable').and.returnValue(true);
			scope.$digest();
			expect(securityHandler.showIfRoleIsWritable).toHaveBeenCalledWith(scope.currentDataType);
		});


        it("save passes the values to the backend", function () {
            spyOn(messageHandler, 'showSuccess');
            spyOn(resources.dataType, "put").and.returnValue($q.when({}));
            scope.currentDataType = {
                id:"DT-ID",
                label: "DT-Label-NEW",
                description:"DT-Desc-NEW",
                domainType:"PrimitiveType",
                classifiers:[
                    {id:"3"},
                    {id:"4"}
                ],
                aliases:["A", "B"],
            };
            scope.$digest();
            var isolateScope = element.isolateScope();
            isolateScope.editableForm.$data.description = "DT-Desc-NEW";
            isolateScope.formBeforeSave();
            scope.$digest();
            var resource = {
                id:"DT-ID",
                label: "DT-Label-NEW",
                description:"DT-Desc-NEW",
                domainType:"PrimitiveType",
                classifiers:[
                    {id:"3"},
                    {id:"4"}
                ],
                aliases:["A", "B"],
            };
            expect(resources.dataType.put).toHaveBeenCalledWith(scope.mcParentDataModel.id, 'DT-ID', null, {resource:resource});
            expect(messageHandler.showSuccess).toHaveBeenCalledWith('Data Type updated successfully.');
        });

        it("save shows proper error message if it fails to save values to the backend", function () {
            spyOn(messageHandler, 'showError');
            spyOn(resources.dataType, "put").and.returnValue($q.reject({}));
            scope.currentDataType = {
                id:"DT-ID",
                label: "DT-Label-NEW",
                description:"DT-Desc-NEW",
                domainType:"PrimitiveType",
                classifiers:[
                    {id:"3"},
                    {id:"4"}
                ],
                aliases:["A", "B"],
            };
            scope.$digest();
            var isolateScope = element.isolateScope();
            isolateScope.editableForm.$data.description = "DT-Desc-NEW";
            isolateScope.formBeforeSave();
            scope.$digest();
            var resource = {
                id:"DT-ID",
                label: "DT-Label-NEW",
                description:"DT-Desc-NEW",
                domainType:"PrimitiveType",
                classifiers:[
                    {id:"3"},
                    {id:"4"}
                ],
                aliases:["A", "B"],
            };
            expect(resources.dataType.put).toHaveBeenCalledWith(scope.mcParentDataModel.id, 'DT-ID', null, {resource:resource});
            expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem updating the Data Type.',{});

        });

	});

	describe('EnumerationType', function () {
		beforeEach(inject(function ($rootScope, $compile, _$httpBackend_, _$rootScope_, _resources_, _exportHandler_, _ngToast_, _$q_) {
			scope = $rootScope.$new();
			scope.currentDataType = {
                id:"DT-ID",
                label: "DT-Label",
                description:"DT-Desc",
                domainType:"EnumerationType",
				enumerationValues: [
					{
						"id":  "Enum-Key1",
						"key": "Enum-Key1",
						"value": "Enum-Value1"
					},
					{
                        "id":  "Enum-Key2",
                        "key": "Enum-Key2",
                        "value": "Enum-Value2"
					},
					{
                        "id":  "Enum-Key3",
                        "key": "Enum-Key3",
                        "value": "Enum-Value3"
					}
				],
			    classifiers:[
					{id:"1"},
					{id:"2"}
				],
          aliases:["A", "B"],
			};
            scope.mcParentDataModel = {id:"P-DM-ID"};

            element = angular.element('<datatype-details mc-data-type-object="currentDataType" mc-parent-data-model="mcParentDataModel"></datatype-details>');
			$compile(element)(scope);

            spyOn(resources.catalogueItem, 'get').and.callFake(function() {return $q.when([]);});
		}));

        it("should check if user has writableAccess or not", function () {
            spyOn(securityHandler, 'showIfRoleIsWritable').and.returnValue(true);
            scope.$digest();
            expect(securityHandler.showIfRoleIsWritable).toHaveBeenCalledWith(scope.currentDataType);
        });

	});

	describe('ReferenceType', function () {
		beforeEach(inject(function ($rootScope, $compile, _$httpBackend_, _$rootScope_, _resources_, _exportHandler_, _ngToast_, _$q_) {
			scope = $rootScope.$new();
			scope.currentDataType = {
				id:"DT-ID",
				label: "DT-Label",
                description:"DT-Desc",
                domainType:"ReferenceType",
				referenceClass: {
					"id": "Ref-DC-ID",
					"domainType": "DataClass",
					"label": "Ref-DC-Label",
					"description": "Ref-DC-Desc"
				},
                classifiers: [
					{id:"1"},
					{id:"2"}
				],
          aliases:["A", "B"]
            };
            scope.mcParentDataModel = {id:"P-DM-ID"};

            element = angular.element('<datatype-details mc-data-type-object="currentDataType" mc-parent-data-model="mcParentDataModel"></datatype-details>');
			$compile(element)(scope);

            spyOn(resources.catalogueItem, 'get').and.callFake(function() {return $q.when([]);});
		}));

        it("should check if user has writableAccess or not", function () {
            spyOn(securityHandler, 'showIfRoleIsWritable').and.returnValue(true);
            scope.$digest();
            expect(securityHandler.showIfRoleIsWritable).toHaveBeenCalledWith(scope.currentDataType);
        });
	});

});
import {mock} from '../_globalMock';

describe('Directive: mcEnumerationListWithCategory', function () {

    var scope, $rootScope, element, securityHandler, resources, $q, $httpBackend, validator, messageHandler, userSettingsHandler;

    var parent = {
        id: "DT-ID",
        label: "DT-Label",
        dataModel: "DM-ID",
        enumerationValues: [
            {id:"1", key:'A1', value:'A1', category:'category1', index:0},
            {id:"2", key:'A2', value:'A2', category:'category1', index:1},
            {id:"3", key:'A3', value:'A3', category:'category1', index:2},
            {id:"4", key:'A4', value:'A4', category:'category1', index:3},

            {id:"5", key:'B1', value:'B1', category:'category2', index:4},
            {id:"6", key:'B2', value:'B2', category:'category2', index:5},

            {id:"7", key:'C1', value:'C1', category:null, index:6},
        ]
    };


    var defaultDisplayItems = [
        {id: "category1", category: "category1", isCategoryRow: true},
        {id: "1", key: "A1", value: "A1", category: "category1", index: 0},
        {id: "2", key: "A2", value: "A2", category: "category1", index: 1},
        {id: "3", key: "A3", value: "A3", category: "category1", index: 2},
        {id: "4", key: "A4", value: "A4", category: "category1", index: 3},
        {id: "category2", category: "category2", isCategoryRow: true},
        {id: "5", key: "B1", value: "B1", category: "category2", index: 4},
        {id: "6", key: "B2", value: "B2", category: "category2", index: 5},
        {id: null, category: null, isCategoryRow: true},
        {id: "7", key: "C1", value: "C1", category: null, index: 6},
    ];


    mock.init();
    beforeEach(angular.mock.module('./enumerationListWithCategory.html'));
    beforeEach(angular.mock.module('./mcSelect2.html'));

    beforeEach(inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('views/home.html').respond(200, '');
    }));

    beforeEach(inject(function ($compile, _$rootScope_, _securityHandler_, _resources_, _$q_, _validator_, _messageHandler_, _userSettingsHandler_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        securityHandler = _securityHandler_;
        resources = _resources_;
        $q = _$q_;
        validator = _validator_;
        messageHandler = _messageHandler_;
        userSettingsHandler = _userSettingsHandler_;

        userSettingsHandler = _userSettingsHandler_;
        spyOn(userSettingsHandler,'get').and.callFake(function (prm) {
            if(prm === "countPerTable"){
                return 20;
            }
        });


        scope.parent = angular.copy(parent);
        scope.mcDisplayRecords = [];

        element = angular.element('<mc-enumeration-list-with-category parent="parent" type="\'static\'"  enumeration-values="parent.enumerationValues"></mc-enumeration-list-with-category>');
        $compile(element)(scope);
    }));


    it('creates enum list with category correctly', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();
        expect(isolateScope.allRecordsWithGroups).toEqual(defaultDisplayItems);
    });

    it('showRecords creates proper pagination', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();

        isolateScope.pageSize = 5;
        isolateScope.currentPage = 0;
        isolateScope.showRecords(parent.enumerationValues);
        var displayItems = [
            {id: "category1", category: "category1", isCategoryRow: true},
            {id: "1", key: "A1", value: "A1", category: "category1", index: 0},
            {id: "2", key: "A2", value: "A2", category: "category1", index: 1},
            {id: "3", key: "A3", value: "A3", category: "category1", index: 2},
            {id: "4", key: "A4", value: "A4", category: "category1", index: 3},
            {id: "category2", category: "category2", isCategoryRow: true},
            {id: "5", key: "B1", value: "B1", category: "category2", index: 4},
        ];
        expect(isolateScope.displayItems).toEqual(displayItems);
        expect(isolateScope.enumsCount).toEqual(7);
        expect(isolateScope.hasCategory).toEqual(true);

        var categories = [
            {key: "category1", value: "category1"},
            {key: "category2", value: "category2"}
        ];
        expect(isolateScope.categories).toEqual(categories);
        expect(isolateScope.disableNext).toEqual(false);
        expect(isolateScope.disablePrev).toEqual(true);

    });

    it('showRecords creates proper pagination in next pages', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();

        isolateScope.pageSize = 5;
        isolateScope.currentPage = 1;
        isolateScope.showRecords(parent.enumerationValues);
        var displayItems = [
            {id: "6", key: "B2", value: "B2", category: "category2", index: 5},
            {id: null, category: null, isCategoryRow: true},
            {id: "7", key: "C1", value: "C1", category: null, index: 6}
        ];
        expect(isolateScope.displayItems).toEqual(displayItems);
        expect(isolateScope.disableNext).toEqual(true);
        expect(isolateScope.disablePrev).toEqual(false);
    });

    it('showRecords sorts records based on category name', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();

        isolateScope.sortType = "desc";
        isolateScope.showRecords(parent.enumerationValues);
        var displayItems = [
            {id: "category2", category: "category2", isCategoryRow: true},
            {id: "5", key: "B1", value: "B1", category: "category2", index: 4},
            {id: "6", key: "B2", value: "B2", category: "category2", index: 5},
            {id: "category1", category: "category1", isCategoryRow: true},
            {id: "1", key: "A1", value: "A1", category: "category1", index: 0},
            {id: "2", key: "A2", value: "A2", category: "category1", index: 1},
            {id: "3", key: "A3", value: "A3", category: "category1", index: 2},
            {id: "4", key: "A4", value: "A4", category: "category1", index: 3},
            {id: null, category: null, isCategoryRow: true},
            {id: "7", key: "C1", value: "C1", category: null, index: 6},
        ];
        expect(isolateScope.displayItems).toEqual(displayItems);


        isolateScope.sortType = "asc";
        isolateScope.showRecords(parent.enumerationValues);
        displayItems = [
            {id: "category1", category: "category1", isCategoryRow: true},
            {id: "1", key: "A1", value: "A1", category: "category1", index: 0},
            {id: "2", key: "A2", value: "A2", category: "category1", index: 1},
            {id: "3", key: "A3", value: "A3", category: "category1", index: 2},
            {id: "4", key: "A4", value: "A4", category: "category1", index: 3},
            {id: "category2", category: "category2", isCategoryRow: true},
            {id: "5", key: "B1", value: "B1", category: "category2", index: 4},
            {id: "6", key: "B2", value: "B2", category: "category2", index: 5},
            {id: null, category: null, isCategoryRow: true},
            {id: "7", key: "C1", value: "C1", category: null, index: 6},
        ];
        expect(isolateScope.displayItems).toEqual(displayItems);
    });

    it('showRecords handles next/prev buttons correctly', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.pageSize = 5;

        isolateScope.currentPage = 0;
        isolateScope.showRecords(parent.enumerationValues);
        expect(isolateScope.disableNext).toEqual(false);
        expect(isolateScope.disablePrev).toEqual(true);
        expect(isolateScope.displayItems.length).toEqual(7);


        isolateScope.currentPage = 1;
        isolateScope.showRecords(parent.enumerationValues);
        expect(isolateScope.disableNext).toEqual(true);
        expect(isolateScope.disablePrev).toEqual(false);
        expect(isolateScope.displayItems.length).toEqual(3);

    });




    it('startToMove adds its index in startindex property when moving starts', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();
        var ui = {
            item:{
                index: function () {
                    return 1;
                }
            }
        };
        isolateScope.startToMove({}, ui);
        expect($(ui.item).data("startindex")).toEqual(1);
    });


    it('stopMoving does not move if source and target index are the same', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();
        spyOn(isolateScope, "updateOrder").and.returnValue(true);

        var ui = {
            item:{
                index: function () {
                    //new Position
                    return 1;
                },
                attr: function (name) {
                    switch (name){
                        case "id":
                            return "GUID-12345";
                        case "data-isNew":
                            return false;
                    }
                },
                data: function (name) {
                    switch (name){
                        case "startindex":
                            return 1;
                    }
                }
            }
        };
        var event = {
            preventDefault: function () {}
        };

        isolateScope.startToMove({}, ui);
        //old position is one
        $(ui.item).data("startindex", 1);
        isolateScope.stopMoving(event, ui);
        expect(isolateScope.updateOrder).not.toHaveBeenCalled();
    });


    it('stopMoving finds new index and new category properly when move in between elements of a new category', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();

        spyOn(isolateScope, "updateOrder").and.returnValue(true);


        var parentCategoryRow =  {
            attr: function (name) {
                switch (name){
                    case "data-isCategoryRow":
                        return "true";
                }
            },
        };

        var prev =  {
            attr: function (name) {
                switch (name){
                    case "data-category":
                        return "category2";
                    case "data-index":
                        return 4;
                    case "data-isCategoryRow":
                        return "";
                }
            },
            length: 1,
            prev: function () {
                return parentCategoryRow;
            }
        };

        var next =  {
            attr: function (name) {
                switch (name){
                    case "data-category":
                        return "category2";
                    case "data-index":
                        return 5;
                    case "data-isCategoryRow":
                        return "";
                }
            }
        };

        var ui = {
            item:{
                index: function () {
                    //new Position
                    return 5;
                },
                attr: function (name) {
                    switch (name){
                        case "id":
                            return "GUID-12345";
                        case "data-isNew":
                            return false;
                    }
                },
                data: function (name) {
                    switch (name){
                        case "startindex":
                            return 1;
                    }
                },
                prev: function () {
                    return prev;
                },
                next: function () {
                    return next;
                }
            }
        };
        var event = {
            preventDefault: function () {}
        };

        isolateScope.startToMove({}, ui);

        //old location
        $(ui.item).data("startindex", 1);

        isolateScope.stopMoving(event, ui);

        expect(isolateScope.updateOrder).toHaveBeenCalledWith("GUID-12345", 5, "category2");
    });

    it('stopMoving finds new index and new category properly when move on top of the new category', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();

        spyOn(isolateScope, "updateOrder").and.returnValue(true);

        var prev =  {
            attr: function (name) {
                switch (name){
                    case "data-category":
                        return "category2";
                    case "data-index":
                        return 4;
                    case "data-isCategoryRow":
                        return "true";
                }
            },
            length: 1,
        };

        var next =  {
            attr: function (name) {
                switch (name){
                    case "data-category":
                        return "category2";
                    case "data-index":
                        return 4;
                    case "data-isCategoryRow":
                        return "";
                }
            }
        };

        var ui = {
            item:{
                index: function () {
                    //new Position
                    return 4;
                },
                attr: function (name) {
                    switch (name){
                        case "id":
                            return "GUID-12345";
                        case "data-isNew":
                            return false;
                    }
                },
                data: function (name) {
                    switch (name){
                        case "startindex":
                            return 1;
                    }
                },
                prev: function () {
                    return prev;
                },
                next: function () {
                    return next;
                }
            }
        };
        var event = {
            preventDefault: function () {}
        };

        isolateScope.startToMove({}, ui);

        //old location
        $(ui.item).data("startindex", 1);

        isolateScope.stopMoving(event, ui);

        expect(isolateScope.updateOrder).toHaveBeenCalledWith("GUID-12345", 4, "category2");
    });

    
    it('groupSortClicked handles group sort', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();
        expect(isolateScope.sortType).toEqual("");

        isolateScope.groupSortClicked();
        expect(isolateScope.sortType).toEqual("desc");

        isolateScope.groupSortClicked();
        expect(isolateScope.sortType).toEqual("asc");

        isolateScope.groupSortClicked();
        expect(isolateScope.sortType).toEqual("");
    });

    it('Add creates a new empty record', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.add();

        var newRecord = {
            key: "",
            value: "",
            category: null,
            edit: {
                id: "",
                key: "",
                value: "",
                category: "",
            },
            inEdit: true,
            isNew: true
        };

        expect(isolateScope.displayItems[0].id.indexOf("temp-")).toBe(0);
        delete isolateScope.displayItems[0].id;
        expect(isolateScope.displayItems[0]).toEqual(newRecord);
    });

    it('Validate checks if a record is valid', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();

        var record = {edit:{ key:"A1", value:"A1"}};
        expect(isolateScope.validate(record)).toBeFalsy();
        expect(record.edit.errors['key']).toEqual("Key already exists");

        record = {edit:{ key:"", value:"A1"}};
        expect(isolateScope.validate(record)).toBeFalsy();
        expect(record.edit.errors['key']).toEqual("Key can't be empty!");

        record = {edit:{ key:"AX", value:""}};
        expect(isolateScope.validate(record)).toBeFalsy();
        expect(record.edit.errors['value']).toEqual("Value can't be empty!");

        record = {edit:{ key:"AX", value:"Ax"}};
        expect(isolateScope.validate(record)).toBeTruthy();
        expect(record.edit.errors).toBeUndefined();

    });

    it('confirmDeleteClicked deletes row in clientSide mode', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.clientSide = true;

        isolateScope.confirmDeleteClicked({id:"1"});
        expect(isolateScope.allRecords[0].id).toEqual("2");
    });


    it('confirmDeleteClicked deletes row in serverSide mode', function () {
        spyOn(resources.enumerationValues, "delete").and.returnValue($q.when(true));
        spyOn(messageHandler, "showSuccess").and.returnValue(true);
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.clientSide = false;

        spyOn(isolateScope, "reloadRecordsFromServer").and.returnValue($q.when([]));

        isolateScope.confirmDeleteClicked({id:"1"});
        scope.$digest();

        expect(resources.enumerationValues.delete).toHaveBeenCalledWith(parent.dataModel, parent.id, "1");
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Enumeration deleted successfully.');
        expect(isolateScope.reloadRecordsFromServer).toHaveBeenCalled();
    });


    it('reloadRecordsFromServer loads all records from server', function () {
        spyOn(resources.dataType, "get").and.returnValue($q.when([]));
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.reloadRecordsFromServer();
        scope.$digest();

        expect(resources.dataType.get).toHaveBeenCalledWith(parent.dataModel, parent.id);
    });


    it('saveClicked saves a NEW record in clientSide mode', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.clientSide = true;

        var record = {id:"temp-123", edit:{key:"Key1234", value:"Value1234", category:"newCategory"}};
        isolateScope.saveClicked(record);
        expect(isolateScope.allRecords.length).toEqual(8);
        expect(record.inEdit).toBeFalsy();
        expect(record.key).toEqual("Key1234");
        expect(record.value).toEqual("Value1234");
        expect(record.category).toEqual("newCategory");
    });

    it('saveClicked updates an existing record in clientSide mode', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.clientSide = true;

        var record = {id:"1", edit:{key:"Key1234", value:"Value1234", category:"newCategory"}};
        isolateScope.saveClicked(record);
        expect(isolateScope.allRecords.length).toEqual(7);
        expect(record.inEdit).toBeFalsy();
        expect(record.isNew).toBeFalsy();
        expect(record.key).toEqual("Key1234");
        expect(record.value).toEqual("Value1234");
        expect(record.category).toEqual("newCategory");
        expect(record.id).toEqual("1");
    });


    it('saveClicked updates an existing record in serverSide mode', function () {
        spyOn(resources.enumerationValues, "put").and.returnValue($q.when(true));
        spyOn(messageHandler, "showSuccess").and.returnValue(true);
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.clientSide = false;

        spyOn(isolateScope, "reloadRecordsFromServer").and.returnValue($q.when([]));

        var record = {id:"1", edit:{key:"Key1234", value:"Value1234", category:"newCategory"}};
        isolateScope.saveClicked(record);
        scope.$digest();

        var resource = {key:"Key1234", value:"Value1234", category:"newCategory"};
        expect(resources.enumerationValues.put).toHaveBeenCalledWith(parent.dataModel, parent.id, "1", null, {resource:resource});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Enumeration updated successfully.');
        expect(isolateScope.reloadRecordsFromServer).toHaveBeenCalled();

        expect(record.key).toEqual("Key1234");
        expect(record.value).toEqual("Value1234");
        expect(record.category).toEqual("newCategory");
    });


    it('saveClicked adds a NEW record in serverSide mode', function () {
        spyOn(resources.enumerationValues, "post").and.returnValue($q.when(true));
        spyOn(messageHandler, "showSuccess").and.returnValue(true);
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.clientSide = false;

        spyOn(isolateScope, "reloadRecordsFromServer").and.returnValue($q.when([]));

        var record = {id:"temp-123", edit:{key:"Key1234", value:"Value1234", category:"newCategory"}};
        isolateScope.saveClicked(record);
        scope.$digest();

        var resource = {key:"Key1234", value:"Value1234", category:"newCategory"};
        expect(resources.enumerationValues.post).toHaveBeenCalledWith(parent.dataModel, parent.id, {resource:resource});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Enumeration saved successfully.');
        expect(isolateScope.reloadRecordsFromServer).toHaveBeenCalled();
    });


    it('updateOrder moves the row to a new location in the same category in clientSide mode', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.clientSide = true;
        isolateScope.updateOrder("1", 2, "category1");
        var expected = [
            {id: "2", key: "A2", value: "A2", category: "category1", index: 1},
            {id: "1", key: "A1", value: "A1", category: "category1", index: 2},
            {id: "3", key: "A3", value: "A3", category: "category1", index: 3},
            {id: "4", key: "A4", value: "A4", category: "category1", index: 4},
            {id: "5", key: "B1", value: "B1", category: "category2", index: 5},
            {id: "6", key: "B2", value: "B2", category: "category2", index: 6},
            {id: "7", key: "C1", value: "C1", category: null, index: 7}
        ];
        expect(isolateScope.allRecords).toEqual(expected);

        isolateScope.updateOrder("1", 7, "category1");
        expected = [
            {id: "2", key: "A2", value: "A2", category: "category1", index: 1},
            {id: "3", key: "A3", value: "A3", category: "category1", index: 2},
            {id: "4", key: "A4", value: "A4", category: "category1", index: 3},
            {id: "5", key: "B1", value: "B1", category: "category2", index: 4},
            {id: "6", key: "B2", value: "B2", category: "category2", index: 5},
            {id: "1", key: "A1", value: "A1", category: "category1", index: 6},
            {id: "7", key: "C1", value: "C1", category: null, index: 7},
        ];
        expect(isolateScope.allRecords).toEqual(expected);
    });


    it('updateOrder moves the row to a new location in a different category in clientSide mode', function () {
        scope.$digest();
        var isolateScope = element.isolateScope();
        isolateScope.clientSide = true;
        isolateScope.updateOrder("1", 6, "category2");
        var expected = [
            {id: "2", key: "A2", value: "A2", category: "category1", index: 1},
            {id: "3", key: "A3", value: "A3", category: "category1", index: 2},
            {id: "4", key: "A4", value: "A4", category: "category1", index: 3},
            {id: "5", key: "B1", value: "B1", category: "category2", index: 4},
            {id: "6", key: "B2", value: "B2", category: "category2", index: 5},
            {id: "1", key: "A1", value: "A1", category: "category2", index: 6},
            {id: "7", key: "C1", value: "C1", category: null, index: 7},
        ];
        expect(isolateScope.allRecords).toEqual(expected);
    });


    it('updateOrder moves the row to a new location in a different category in serverSide mode', function () {
        spyOn(resources.enumerationValues, "put").and.returnValue($q.when(true));
        spyOn(messageHandler, "showSuccess").and.returnValue(true);
        scope.$digest();
        var isolateScope = element.isolateScope();
        spyOn(isolateScope, "reloadRecordsFromServer").and.returnValue($q.when([]));

        isolateScope.clientSide = false;
        isolateScope.updateOrder("1", 6, "category2");
        scope.$digest();

        var resource = {index:6, category:"category2"};
        expect(resources.enumerationValues.put).toHaveBeenCalledWith(parent.dataModel, parent.id, "1", null, {resource:resource});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith('Enumeration updated successfully.');
        expect(isolateScope.reloadRecordsFromServer).toHaveBeenCalled();
    });


});
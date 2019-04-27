import {mock} from '../_globalMock';

describe('Directive: userDetails', function () {

	var scope, element, $httpBackend, securityHandler, resources, $q;

	//add main module
	mock.init();

	// var resources;
	// beforeEach(function() {
	// 	module(function($provide) {
	// 		resources = { };
	// 		$provide.value('resources', resources);
	// 	});
	// });

	beforeEach(angular.mock.module('./editableFormButtons.html'));
	beforeEach(angular.mock.module('./userDetails.html'));


	beforeEach(inject(function ($rootScope, $compile,_$httpBackend_,_$rootScope_, _securityHandler_, _resources_, _$q_) {

		$rootScope = _$rootScope_;
		$httpBackend = _$httpBackend_;
        securityHandler = _securityHandler_;
        resources = _resources_;
        $q = _$q_;

		$httpBackend.whenGET('views/home.html').respond(200, '');
		//as classification directive loads all classifiers, we need to mock its call here
		$httpBackend.expect("GET", $rootScope.backendURL + '/classifier/all').respond([]);

		//Create and initialize the scope
		scope = $rootScope.$new();

		var currentDate = new Date();
		scope.user = {
			firstName: 'Joe',
			lastName: 'Bloggs',
			role: 'registered',
			emailAddress: 'user@website.com',
			organisation: 'Some Hospital Trust',
			organisationRole: 'Technician',
			lastUpdated: currentDate,
			passwordUpdated: new Date().setDate(currentDate.getDate()-3)
		};

		element = angular.element('<user-details user="user"></user-details>');
		$compile(element)(scope);

	}));

	it("should check if user has writableAccess or not", function () {
		var s = $q;
		spyOn(securityHandler, 'showIfRoleIsWritable').and.returnValue(true);
		scope.$digest();
		expect(securityHandler.showIfRoleIsWritable).toHaveBeenCalledWith(scope.user);
	});


	it("if user is a readonly, then edit button should be hidden", function () {
		//the user does not have Writable access
		spyOn(securityHandler, 'showIfRoleIsWritable').and.returnValue(false);
		scope.$digest();
		expect(element.find("[show-if-role-is-writable]").is(":hidden")).toBe(true); //expect edit row to be hidden as user does NOT have writable access
	});



	it("should assign all the properties properly into the UI", function () {
		scope.$digest();
		expect((element.find("h4")[0]).innerHTML).toBe("user@website.com");
		// expect((element.find(".panel-body em")[0]).innerHTML).toMatch(/^Last Login:/);
		expect((element.find("span[editable-text='user.firstName']")[0]).innerHTML).toBe("Joe");
		expect((element.find("span[editable-text='user.lastName']")[0]).innerHTML).toBe("Bloggs");
		expect((element.find("span[editable-text='user.organisation']")[0]).innerHTML).toBe("Some Hospital Trust");
		// expect((element.find("span[editable-text='user.organisationRole']")[0]).innerHTML).toBe("Technician");
	});

	it("clicking on edit will make first/last name, organisation and organisation role editable", function () {
		scope.$digest();
		//When click on edit button
		element.find("button:has('i.editButton')").click();

		//Then
		//first name should be Editable
		expect(element.find("span.editable-wrap input.editable-input[name='firstName']").length).toBe(1);
		expect(element.find("span.editable-wrap input.editable-input[name='lastName']").length).toBe(1);
		expect(element.find("span.editable-wrap input.editable-input[name='organisation']").length).toBe(1);
		// expect(element.find("span.editable-wrap input.editable-input[name='organisationRole']").length).toBe(1);

		//save and cancel buttons should be displayed
		expect(element.find("button:has('i.saveButton')").hasClass('ng-hide')).toBe(false);
		expect(element.find("button:has('i.cancelButton')").hasClass('ng-hide')).toBe(false);
	});


	it("checks an email address exists", function () {
        spyOn(resources.catalogueUser, 'get').and.returnValue($q.when(false));
		scope.$digest();
		var controller = element.controller('userDetails');
		controller.checkEmailExists('nonexisting@email.com').then(function (exists) {
			expect(exists).toBe(false);
			return controller.checkEmailExists('existing@email.com');
		}).then(function () {
			expect(exists).toBe(true);
			done();
		});
        expect(resources.catalogueUser.get).toHaveBeenCalledWith(null, "userExists/nonexisting@email.com");
        expect(resources.catalogueUser.get).toHaveBeenCalledTimes(1);
	});
});
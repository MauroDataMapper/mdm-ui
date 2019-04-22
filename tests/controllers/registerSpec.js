import {mock} from '../_globalMock';

describe('Controller: registerCtrl', function () {

	var scope, controller, resources, $rootScope, $httpBackend, window, ngToast, $q, stateHandler, messageHandler;

    mock.init();
	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
	}));

	beforeEach(inject(function (_$rootScope_, _$httpBackend_, _ngToast_, $window, _$q_, _stateHandler_, _resources_, _messageHandler_) {
		$q = _$q_;
		scope = _$rootScope_.$new();
		$httpBackend = _$httpBackend_;
		$rootScope = _$rootScope_;
		window = $window;
		ngToast = _ngToast_;
        stateHandler =_stateHandler_;
        resources=_resources_;
        messageHandler = _messageHandler_;
	}));

	function initController($controller){
		controller = $controller('registerCtrl', {
			$scope: scope,
			resources:resources,
			ngToast: ngToast
		});
	}

	it('updates the page title',  inject(function ($controller) {
		initController($controller);
		scope.$digest();
		expect(window.document.title).toBe('Register new account');
		expect(scope.user).toBeDefined();
	}));

    it('should not validate the form if mandatory fields are not provided',  inject(function ($controller) {
        initController($controller);
        scope.$digest();
		var testCases = [
			{emailAddress: "",        firstName: "A", lastName: "A", organisation: "A", userRole: "Administrator", password: "123456", confirmPassword:"123456"},
			{emailAddress: "A@A.com", firstName: "",  lastName: "A", organisation: "A", userRole: "Administrator", password: "123456", confirmPassword:"123456"},
			{emailAddress: "A@A.com", firstName: "A", lastName: "",  organisation: "A", userRole: "Administrator", password: "123456", confirmPassword:"123456"},
			{emailAddress: "A@A.com", firstName: "A", lastName: "A", organisation: "A", userRole: "Administrator", password: "", confirmPassword:"123456"},
			{emailAddress: "A@A.com", firstName: "A", lastName: "A", organisation: "A", userRole: "Administrator", password: "123456", confirmPassword:""},
			{emailAddress: "A@A.com", firstName: "A", lastName: "A", organisation: "A", userRole: "Administrator", password: "123456", confirmPassword:"A-DIF-PASS"},
			{emailAddress: "A@A.com", firstName: "A", lastName: "A", organisation: "A", userRole: "Administrator", password: "123", confirmPassword:"123"}
		];
		angular.forEach(testCases, function (testCase) {
			scope.user = testCase;
			var result = scope.validate();
			expect(result).toBeFalsy();
		});
    }));

	it('save passes the registration detail and pass details to the server',  inject(function ($controller) {
		initController($controller);
        scope.user = {
            emailAddress: "A@A.com",
            firstName: "A",
            lastName: "B",
            organisation: "Org",
            userRole: "Administrator",
            password: "12345",
            confirmPassword:"12345"
        };
        scope.$digest();
        spyOn(resources.catalogueUser,'post').and.callFake(function() {return $q.when({id:'NEWLY-CREATED-USER'});});

        scope.save();

        scope.$digest();
        expect(resources.catalogueUser.post).toHaveBeenCalledWith(null, null, {resource:scope.user});
        expect(scope.confirmed).toBeTruthy();
        expect(scope.processing).toBeFalsy();
    }));

    it('save handles errors in the registration form',  inject(function ($controller) {
        spyOn(messageHandler,"showError").and.returnValue({});
        initController($controller);
        scope.user = {
            emailAddress: "A@A.com",
            firstName: "A",
            lastName: "B",
            organisation: "Org",
            userRole: "Administrator",
            password: "12345",
            confirmPassword:"12345"
        };
        spyOn(resources.catalogueUser,'post').and.callFake(function(id,uid,options) {
           return $q.reject({ status:422, data:{errors:[
                       {
                           message: "Property [emailAddress] with value [user1@user1.com] must be unique",
                       }
                   ]}});
        });

        scope.$digest();
        scope.save();
        scope.$digest();
        expect(resources.catalogueUser.post).toHaveBeenCalledWith(null, null, {resource:scope.user});
        expect(scope.processing).toBeFalsy();

        var error = {
            status: 422,
            data:{
                errors:[{message: "Property [emailAddress] with value [user1@user1.com] must be unique"}]
            }
        };
        expect(messageHandler.showError).toHaveBeenCalledWith('There was a problem creating the account.', error);

    }));

});

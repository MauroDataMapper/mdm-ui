import {mock} from '../_globalMock';

describe('Controller: homeCtrl', function () {

	var scope, controller, resources, $rootScope, window, $q, modalHandler, securityHandler, stateHandler;

    mock.init();

	beforeEach(inject(function ($window, _$rootScope_, _resources_, _$q_, _modalHandler_, _securityHandler_, _stateHandler_) {
		scope = _$rootScope_.$new();
		$rootScope = _$rootScope_;
		$q = _$q_;
		window = $window;
        securityHandler = _securityHandler_;
        modalHandler = _modalHandler_;
        stateHandler = _stateHandler_;

        $rootScope.simpleViewSupport = false;
	}));


	function initController ($controller) {
		controller = $controller('homeCtrl', {
            $window: window,
			$scope: scope,
            resources: resources,
            securityHandler: securityHandler
		});
	}

	it('Initialized correctly',  inject(function ($controller) {
		initController($controller, []);
		scope.$digest();
        expect(scope.login).toBeDefined();
        expect(scope.logout).toBeDefined();
	}));

    it('Redirects to change password if user logged in for the first time',  inject(function ($controller) {
        spyOn(modalHandler, 'prompt').and.returnValue($q.when({
			id:"USER-ID",
            needsToResetPassword: true
        }));
        spyOn($rootScope, '$broadcast').and.returnValue({});

        initController($controller, []);
        scope.login();
        scope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('userLoggedIn', {goTo: "appContainer.userArea.changePassword"});
    }));

    it('Redirects to home page if session is not expired',  inject(function ($controller) {
        spyOn(modalHandler, 'prompt').and.returnValue($q.when({
			id:"USER-ID"
        }));
        spyOn($rootScope, '$broadcast').and.returnValue({});

        spyOn(securityHandler, 'getLatestURL').and.returnValue(undefined);
        initController($controller, []);
        scope.login();
        scope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('userLoggedIn', {goTo:  "appContainer.mainApp.twoSidePanel.catalogue.allDataModel"});
    }));

    it('Redirects to latest saved page if session is expired',  inject(function ($controller) {
        spyOn(modalHandler, 'prompt').and.returnValue($q.when({
            id:"USER-ID"
        }));
        spyOn($rootScope, '$broadcast').and.returnValue({});
        spyOn(stateHandler, 'CurrentWindow').and.returnValue({});

        spyOn(securityHandler, 'getLatestURL').and.returnValue("www.latestURL.com");
        spyOn(securityHandler, 'removeLatestURL').and.callThrough();

        initController($controller, []);
        scope.login();
        scope.$digest();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('userLoggedIn');
        expect(stateHandler.CurrentWindow).toHaveBeenCalledWith("www.latestURL.com");
        expect(securityHandler.removeLatestURL).toHaveBeenCalledWith();
    }));


    it('Show user profile picture if the user is logged in',  inject(function ($controller) {
        spyOn(securityHandler, 'isLoggedIn').and.returnValue(true);
        spyOn(securityHandler, 'getCurrentUser').and.returnValue({
            id: "userId",
            firstName: "userFirstName",
            lastName: "userLastName",
            role: "administrator",
        });

        initController($controller, []);
        scope.$digest();

        expect(scope.profile).toEqual({
            id: "userId",
            firstName: "userFirstName",
            lastName: "userLastName",
            role: "administrator",
        });

    }));


});

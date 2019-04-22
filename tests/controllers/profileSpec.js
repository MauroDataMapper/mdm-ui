import {mock} from '../_globalMock';

describe('Controller: profileCtrl', function () {

	var scope, controller, resources, $rootScope, $httpBackend, window, messageHandler, profileData, $q, $cookies;

    mock.init();
	beforeEach(inject(function (_$httpBackend_) {
		_$httpBackend_.whenGET('views/home.html').respond(200, '');
	}));

	beforeEach(inject(function (_$rootScope_, _resources_, _$httpBackend_, $window, _$q_, _$cookies_, _messageHandler_) {
		resources = _resources_;
		scope = _$rootScope_.$new();
		$httpBackend = _$httpBackend_;
		$rootScope = _$rootScope_;
		window = $window;
		$q = _$q_;
        $cookies = _$cookies_;
        messageHandler = _messageHandler_;
		profileData = {
			id: 'CU-ID',
			firstName: 'CU-FirstName',
			lastName: 'CU-LastName',
			role: 'CU-Role',
			emailAddress: 'CU-Email@CU.com',
			organisation: 'CU-Organisation',
            jobTitle: 'CU-OrganisationRole'
		};
	}));

	function initController($controller){
        spyOn(resources.catalogueUser, 'get').and.returnValue($q.when(profileData));
        spyOn($cookies, 'get').and.returnValue("CU-ID");

		controller = $controller('profileCtrl', {
			$scope: scope,
			resources:resources,
            messageHandler: messageHandler,
			profileData: profileData
		});
        expect(resources.catalogueUser.get).toHaveBeenCalledWith("CU-ID");
        expect(resources.catalogueUser.get).toHaveBeenCalledTimes(1);
	}

	it('updates the page title',  inject(function ($controller) {
		initController($controller);
		scope.$digest();
		expect(window.document.title).toBe("Profile");
		expect(scope.imageVersion).toEqual(1);
	}));

	it('will initialize the profile object in the page',  inject(function ($controller) {
		initController($controller);
		scope.$digest();

		expect(scope.profile).toEqual(jasmine.objectContaining({
            id: 'CU-ID',
            firstName: 'CU-FirstName',
            lastName: 'CU-LastName',
            role: 'CU-Role',
            emailAddress: 'CU-Email@CU.com',
            organisation: 'CU-Organisation',
            jobTitle: 'CU-OrganisationRole'
		}));
	}));

	it('will update the profile image on save', inject(function ($controller) {
        spyOn(messageHandler, 'showSuccess');
		spyOn(resources.catalogueUser, "put").and.returnValue($q.when({}));

		initController($controller);
		scope.$digest();
		//upload the image
        scope.cropped = {
            image: {name:"ImageObj"},
            thumbnail: {name:"thumbnail"}
        };
		scope.savePicture();
        scope.$digest();

        var imageData = { thumb: {name:"thumbnail"}, full: {name:"ImageObj"}, type: 'png' };
		expect(resources.catalogueUser.put).toHaveBeenCalledWith("CU-ID", "image", {resource:imageData});
		expect(messageHandler.showSuccess).toHaveBeenCalledWith("User profile image updated successfully.");
		expect(messageHandler.showSuccess).toHaveBeenCalledTimes(1);
		expect(scope.cropped).toEqual(null);
	}));

    it('will update the profile details on save', inject(function ($controller) {
        spyOn(messageHandler, 'showSuccess');
        spyOn(resources.catalogueUser, "put").and.returnValue($q.when({}));

        initController($controller);
        scope.$digest();

        angular.extend(scope.profile, {
            firstName: 'CU-FirstName-Updated',
            lastName: 'CU-LastName-Updated',
            organisation: 'CU-Organisation-Updated',
            jobTitle: 'CU-OrganisationRole-Updated'
        });
        scope.$digest();
        scope.onAfterSave();
        scope.$digest();

        var resource = {
        	id:"CU-ID",
            firstName: 'CU-FirstName-Updated',
            lastName: 'CU-LastName-Updated',
            organisation: 'CU-Organisation-Updated',
            jobTitle: 'CU-OrganisationRole-Updated'
		};
        expect(resources.catalogueUser.put).toHaveBeenCalledWith("CU-ID", null, {resource:resource});
        expect(messageHandler.showSuccess).toHaveBeenCalledWith("User details updated successfully.");
        expect(messageHandler.showSuccess).toHaveBeenCalledTimes(1);
    }));

    it('will remove the picture image', inject(function ($controller) {
        spyOn(messageHandler, 'showSuccess');
        spyOn(resources.catalogueUser, "delete").and.returnValue($q.when({}));

        initController($controller);
        scope.$digest();
        scope.removeProfileImage();
        scope.$digest();
        expect(resources.catalogueUser.delete).toHaveBeenCalledWith("CU-ID", "image");
        expect(messageHandler.showSuccess).toHaveBeenCalledWith("User profile image removed successfully.");
        expect(messageHandler.showSuccess).toHaveBeenCalledTimes(1);
        expect(scope.imageVersion).toBe(2);
    }));

});

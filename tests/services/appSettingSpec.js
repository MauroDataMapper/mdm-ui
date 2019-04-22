import '../_globalMock';


describe('Provider: appSettingProvider', function () {


    beforeEach(angular.mock.module('controllers'));
    beforeEach(angular.mock.module('ng'));
    beforeEach(angular.mock.module('ngMock'));
    beforeEach(angular.mock.module('ui.router'));

	var provider;
	beforeEach(angular.mock.module('services', function(appSettingProvider) {
		provider = appSettingProvider;
	}));

	it("provider 'add' inserts the new app setting into the mapping", inject(function() {
		expect(provider).toBeDefined();

		provider.add("showLoginDialogue","true");
		provider.add("checkForSecurity","false");

		expect(provider.getSettings()).toBeDefined();
		expect(provider.getSettings()["showLoginDialogue"]).toBe("true");
		expect(provider.getSettings()["checkForSecurity"]).toBe("false");
	}));

	it("provider 'add' replaces the already added setting in the mapping", inject(function() {
		expect(provider).toBeDefined();

		provider.add("showLoginDialogue","true");
		provider.add("showLoginDialogue","XYZ");

		expect(provider.getSettings()["showLoginDialogue"]).toBe("XYZ");
	}));
});


describe('App: appSetting', function () {


    beforeEach(angular.mock.module('controllers'));
    beforeEach(angular.mock.module('ng'));
    beforeEach(angular.mock.module('ngMock'));
    beforeEach(angular.mock.module('ui.router'));

	//add stateRoleAccess module and add a number of state and their access roles
	beforeEach(angular.mock.module('services', function(appSettingProvider) {
		appSettingProvider.add("showLogin",true);
		appSettingProvider.add("checkSecurity",false);
	}));

	var appSetting;
	beforeEach(inject(function (_appSetting_) {
		appSetting = _appSetting_;
	}));

	it("appSetting factory returns the requested app setting", inject(function() {
		expect(appSetting).toBeDefined();
		expect(appSetting.get("showLogin")).toBe(true);
		expect(appSetting.get("checkSecurity")).toBe(false);
	}));

});
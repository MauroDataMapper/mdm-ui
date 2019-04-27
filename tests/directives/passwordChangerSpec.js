import {mock} from '../_globalMock';

describe('Directive: passwordChanger', function () {

	var scope, element;
	var support = { onAfterSave: function () {} };
	var requireOldPassword = false;

	//add main module
	mock.init();

	//Load the main directive ('passwordChanger')
    beforeEach(angular.mock.module('./passwordChanger.html'));
    beforeEach(angular.mock.module('./passwordStrenghtometer.html'));

	beforeEach(inject(function ($rootScope, $compile,_$rootScope_) {
		$rootScope = _$rootScope_;
		scope = $rootScope.$new();

		scope.data = {};
		scope.support = support;
		scope.requireOldPassword = requireOldPassword;

		element = angular.element('<password-changer pwc-data="data" pwc-on-after-save="support.onAfterSave" pwc-require-old-password="requireOldPassword"></password-changer>');
		$compile(element)(scope);
	}));

	describe('using the template that doesn\'t require an old password', function () {
		it("should check if HTML is loaded correctly", function () {
			scope.$digest();
			expect(element.find("input[ng-model=\"data.newPassword\"]").length).toBe(1);
			expect(element.find("input[ng-model=\"data.confirm\"]").length).toBe(1);
		});

		xit("should check if save point triggers correctly", function () {
			debugger
			scope.$digest();
			expect(element.find("button").is(':disabled')).toBe(true);
			var pass = 'Abcdefgh123';
			var wrongPass = '123Abcdefgh';
			scope.data.newPassword = pass;
			scope.data.confirm = wrongPass;
			scope.$digest();
			expect(element.find("button").is(':disabled')).toBe(true);
			scope.data.confirm = pass;
			scope.$digest();
			expect(element.find("button").is(':disabled')).toBe(false);
		});
	});

	describe('using the template that requires an old password', function () {
		beforeAll(function () {
			requireOldPassword = true;
		});

		it("should check if HTML is loaded correctly", function () {
			scope.$digest();
			expect(element.find("input[ng-model=\"data.oldPassword\"]").length).toBe(1);
			expect(element.find("input[ng-model=\"data.newPassword\"]").length).toBe(1);
			expect(element.find("input[ng-model=\"data.confirm\"]").length).toBe(1);
		});

		xit("should check if save point triggers correctly", function () {
            debugger
			scope.$digest();
			expect(element.find("button").is(':disabled')).toBe(true);
			var oldPass = '123Abcdefgh';
			var pass = 'Abcdefgh123';
			scope.data.oldPassword = pass;
			scope.data.newPassword = pass;
			scope.data.confirm = pass;
			scope.$digest();
			expect(element.find("button").is(':disabled')).toBe(true);
			scope.data.oldPassword = oldPass;
			scope.$digest();
			expect(element.find("button").is(':disabled')).toBe(false);
		});
	});
});
angular.module('directives').directive('passwordChanger', [
	function () {
		return {
			restrict: 'E',
			templateUrl: './passwordChanger.html',
			scope: {
				onAfterSave: '=pwcOnAfterSave',
				data: '=pwcData',
				requireOldPassword: '=?pwcRequireOldPassword',
				oldPasswordError: '=?pwcOldPasswordError'
			}
		}
	}
]);
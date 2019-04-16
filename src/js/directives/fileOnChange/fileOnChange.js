angular.module('directives').directive('fileOnChange', function() {
	return {
		restrict: 'A',
		scope: {
			onChangeHandler: '=fileOnChange'
		},
		link: function (scope, element) {
			element.bind('change', scope.onChangeHandler);
		}
	};
});
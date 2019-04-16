angular.module('directives').directive('equals', function() {
	return {
		require: "ngModel",
		link: function(scope, element, attrs, ngModel) {
			var notEquals = attrs.notEquals !== undefined;

			ngModel.$validators.equals = function(modelValue) {
				if (notEquals) {
					return modelValue !== attrs.equals;
				}
				return modelValue === attrs.equals;
			};

			attrs.$observe("equals", function() {
				ngModel.$validate();
			});
		}
	};
})
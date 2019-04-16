angular.module('directives').directive('dropDownList', function () {
	return{
		restrict: 'E',
		scope: {
			selectedElement: "=",
			allElements: "=",
			name:"@",
			onSelect: "&"
		},
		templateUrl: './dropDownList.html',
		link: function (scope, element, attrs) {

		}
	};
});

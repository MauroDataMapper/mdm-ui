angular.module('directives').directive('markdown',
	function ($window, $compile, markdownParser) {
		return {
			restrict: 'AE',
			scope: { markdown: '=', renderType: '=' },
			link: function (scope, element) {
				scope.$watch('markdown', function (markdownText) {
					if (markdownText) {
						var html = markdownParser.parse(markdownText, scope.renderType);

						if(scope.renderType === "text"){
						 	html = "<p>"+html+"</p>";
						}
						element.html($compile(html)(scope));
					}
				});
			}
		};
	}
);

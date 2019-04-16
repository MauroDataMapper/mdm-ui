angular.module('directives').directive('moreDescription', function($compile, userSettingsHandler, $filter, $rootScope, markdownParser) {
	return{
		restrict: 'E',
		replace: true,
		scope:{
			description: "@",
			length:"="
		},
        templateUrl: './moreDescription.html',
		link: function(scope, element, attrs){
			scope.maxLength = 60;
			if(scope.length !== undefined){
                scope.maxLength = scope.length;
			}

			scope.showMore  = userSettingsHandler.get("expandMoreDescription");
			var createShortDescription = function(){
                var desc = markdownParser.parse(scope.description, "text");
				if (desc && desc.length > scope.maxLength) {
					var subStr = desc.substring(0, scope.maxLength);
					var lastIndexOf = subStr.lastIndexOf(" ");
					subStr = subStr.substring(0, lastIndexOf);
					return subStr + "...";
				}else{
					return desc;
				}
			};
             scope.$watch('description', function (newValue, oldValue, scp) {
                 scp.shortDesc = createShortDescription();
                 scp.fullDesc  = markdownParser.parse(scope.description, "html");
			 });
             scope.toggle = function () {
                 scope.showMore = !scope.showMore;
             };
		}
	};
});
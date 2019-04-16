angular.module('directives').directive('showIfRoleIsWritable', function(securityHandler) {
	return{
		restrict: 'A',
		scope:{
			mcElement:"="
		},
 		link: function(scope, element, attrs){

			scope.$watch('mcElement', function (newValue, oldValue, scope) {
				//if the newValue is available, 'showIfRoleIsWritable' will check against that to make sure the element
				//has the right access. 
					var show = securityHandler.showIfRoleIsWritable(newValue);
					if(!show){
						element.hide();
						return
					}
			});
		}
	};
});
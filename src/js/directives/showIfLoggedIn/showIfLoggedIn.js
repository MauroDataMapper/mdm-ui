angular.module('directives').directive('showIfLoggedIn', function() {
	return{
		restrict: 'A',
 		link: function(scope, element, attrs){

			var checkIfLoggedIn = function(){
				if(securityHandler.isLoggedIn()){
					element.removeClass("hideForSecurity");
				}else{
					element.addClass("hideForSecurity");
				}
			};

			checkIfLoggedIn();

			scope.$on("userLoggedIn",function(){
				checkIfLoggedIn();
			});

			scope.$on("userLoggedOut",function(){
				checkIfLoggedIn();
			});

		}
	};
});
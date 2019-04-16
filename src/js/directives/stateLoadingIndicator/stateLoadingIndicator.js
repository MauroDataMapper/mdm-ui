angular.module('directives').directive('stateLoadingIndicator', function ($rootScope) {
	return{
		restrict: 'E',
		template: '<a ng-show="false" style="font-size: 26px;"><i class="fa fa-refresh fa-spin stateLoadingSpinner" ></i></a>',
 		link: function (scope, element, attrs) {
			scope.isStateLoading = false;

			$rootScope.$on('apiCallStart',function(){
				scope.isStateLoading = true;
			});

			$rootScope.$on('apiCallEnd',function(){
				scope.isStateLoading = false;
			});

			$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
				scope.isStateLoading = true;
			});

			$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
				scope.isStateLoading = false;
			});
			
			$rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams, error){
				scope.isStateLoading = false;
			});

			$rootScope.$on('$stateNotFound',function(event, unfoundState, fromState, fromParams){
				scope.isStateLoading = false;
			});
		}
	};
});
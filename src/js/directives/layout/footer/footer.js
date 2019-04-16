angular.module('directives').directive('mcFooter', function () {
	return{
		restrict: 'A',
		replace:true,
		templateUrl: './footer.html',
		link: function(scope, element, attrs){},
        controller: function($scope, $rootScope){
            $scope.year = new Date().getFullYear();

            $scope.showWikiLink = true;
            if($rootScope.simpleViewSupport && !$rootScope.isLoggedIn()){
                $scope.showWikiLink = false;
			}

			$scope.showYouTrackLink = true;
            if($rootScope.simpleViewSupport && !$rootScope.isLoggedIn()){
                $scope.showYouTrackLink = false;
            }

		}
	};
});







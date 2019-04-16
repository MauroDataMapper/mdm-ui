angular.module('directives').directive('termsTable', function () {
	return{
		restrict: 'E',
		scope: {
            terminology: "=",
            loadingData:"="
		},
		templateUrl: './termsTable.html',

		link: function(scope, element, attrs){

		},
		controller: function($scope, resources, contextSearchHandler, $timeout){

		    $timeout(function () {
                jQuery("table.mcTable tr.mcTableFilter input").trigger("focus");
            });

            $scope.contentFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
                var options = {
                    pageSize: pageSize,
                    pageIndex:pageIndex,
                    sortBy: sortBy,
                    sortType:sortType,
                    filters: filters
                };

                //if filter provided, then call search endpoint
                if(filters){
                    $scope.searchTerm = filters.replace("code=","");
                    return contextSearchHandler.search($scope.terminology, $scope.searchTerm, pageSize, pageIndex, ["Term"]);
                }

                return resources.terminology.get($scope.terminology.id, "terms", options);
            };


		}
	};
});
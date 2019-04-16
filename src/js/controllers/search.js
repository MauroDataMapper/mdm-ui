angular.module('controllers').controller('searchCtrl', function ($scope, resources, restHandler, $window) {

		$window.document.title = "Search";

        // var str = [
			// "<div>",
			// 	"<div><span style='border: 1px dotted darkgray'>storm~2</span> will return results containing \"storms\" or \"sturm\"</div>",
			// 	"<br><div><span style='border: 1px dotted darkgray'>gel + (cancer | rare)</span> will return results containing \"gel and either cancer or rare\"</div>",
			// 	"<br><div><span style='border: 1px dotted darkgray'>patient demographic</span> will return results containing the words \"patient\" or \"demographic\"</div>",
			// "</div>"].join("");
        //
        //
        // function createCache() {
			// //if the cache does NOT exist, then create it
			// if (!CacheFactory.get('searchResult')) {
			// 	//Create the cache
			// 	CacheFactory.createCache('searchResult', {
			// 		maxAge: 2 * 60 * 1000, // Items added to this cache expire after 2 minutes
			// 		deleteOnExpire: 'aggressive' // Items will be deleted from this cache when they expire
			// 	});
			// 	$scope.fromCache  = false;
			// 	$scope.showResult = false;
			// } else {
			// 	//if cache already exists, then load the cache (criteria and the search result)
			// 	var searchResult = CacheFactory.get('searchResult');
			// 	$scope.searchCriteria = searchResult.get("searchCriteria");
			// 	$scope.searchInput = searchResult.get("searchCriteria");
			// 	$scope.limit = searchResult.get("limit");
			// 	$scope.after = searchResult.get("after");
			// 	$scope.advancedFrm  = searchResult.get("advancedFrm");
        //         $scope.advancedSearch = searchResult.get("advancedSearch");
        //         $scope.fromCache = true;
			// 	$scope.search();
			// }
        // };
        //
        // function updateCache() {
			// var searchResultCache = CacheFactory.get('searchResult');
			// if (searchResultCache) {
			// 	searchResultCache.put('searchCriteria', $scope.searchCriteria);
			// 	searchResultCache.put('limit', $scope.limit);
			// 	searchResultCache.put('after', $scope.after);
			// 	searchResultCache.put('advancedFrm', $scope.advancedFrm);
			// 	searchResultCache.put('advancedSearch', $scope.advancedSearch);
			// }
        // };
        //
        //
        // $scope.loadHelp = function () {
        //     helpDialogueHandler.open("Search_Help", { my: "right top", at: "bottom", of: jQuery("#helpButton") });
        // };

	});

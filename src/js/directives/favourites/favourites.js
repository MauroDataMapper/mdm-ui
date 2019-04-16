angular.module('directives').directive('favourites', function ($state, resources) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            onFavouriteClick: "=",
            onFavouriteDbClick: "=",
        },
        templateUrl: './favourites.html',
        link: function (scope, iElement, iAttrs, ctrl) {

        },

        controller: function ($scope, messageHandler, favouriteHandler, $q, elementTypes) {

            $scope.favourites = [];
            $scope.formData = {
                filterCriteria:""
            };

            $scope.loadFavourites = function () {
                $scope.reloading = true;
                var promises = [];
                $scope.allFavourites = favouriteHandler.get();

                var domainTypes = elementTypes.getBaseTypes();

                angular.forEach($scope.allFavourites, function (favourite) {
                    var resourceName = domainTypes[favourite.domainType].resourceName;
                    //make sure we have a resource name for it
                    if(!resources[resourceName]){return;}
                    
                    promises.push(resources[resourceName].get(favourite.id));
                });

                $q.all(promises).then(function (results) {
                    var index = 0;
                    angular.forEach(results, function (result) {
                        $scope.allFavourites[index] = result;
                        index++;
                    });
                    $scope.reloading = false;
                    $scope.favourites = $scope.filter(angular.copy($scope.allFavourites),  $scope.formData.filterCriteria);
                });
            };
            $scope.loadFavourites();


            $scope.filter = function(allFavourites, text){
                var i = allFavourites.length -1;
                while(i >= 0){
                    if(allFavourites[i].label.trim().toLowerCase().indexOf(text.trim().toLowerCase()) === -1){
                        allFavourites.splice(i,1);
                    }
                    i--;
                }
                return allFavourites;
            };

            $scope.nodeClick = function ($event, favourite) {
                $scope.click($event, favourite);
            };

            $scope.nodeDbClick = function ($event, favourite) {
                $scope.click($event, favourite);
            };

            $scope.click = function ($event, favourite) {
                favourite.selected = !favourite.selected;

                if ($scope.selectedFavourite) {
                    $scope.selectedFavourite.selected = false;
                }
                $scope.selectedFavourite = favourite;

                if ($scope.onFavouriteDbClick) {
                    $scope.onFavouriteDbClick(favourite);
                }
            };

            function dataModelContextMenu(favourite) {
                var subMenu = [
                    ['Remove from Favourites',
                        function ($itemScope, $event) {
                            favouriteHandler.remove(favourite).then(function (result) {
                                //don't reload explicitly as "favourites" event handles that
                                //$scope.loadFavourites();
                            });
                        }
                    ]
                ];
                return subMenu;
            }

            $scope.menuOptions = [];
            $scope.rightClick = function (favourite) {
                if (favourite.domainType === "DataModel") {
                    $scope.menuOptions = dataModelContextMenu(favourite);
                }
            };


            $scope.onSearchInputKeyDown = function($event){
                $scope.search();
            };

            $scope.search = function(){
                $scope.favourites = $scope.filter(angular.copy($scope.allFavourites),  $scope.formData.filterCriteria);
            };

            $scope.$on("favourites", function (event, action, dataModel) {
                $scope.loadFavourites();
            });

        }
    };
});

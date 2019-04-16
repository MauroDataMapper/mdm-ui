angular.module('directives').directive('mcInfiniteScrollList', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            startFetching: "=",
            fetchInitially: "=",

            fetchMethod: "=",
            pageSize:"=",
            height:"="
        },
        templateUrl: './mcInfiniteScrollList.html',

        link: function (scope, element, attrs, ctrl, transclude) {


            angular.element(element).find(".itemsHolder").bind('scroll', function(event){
                var div = jQuery(this);

                if(scope.busy){
                    return;
                }
                // console.log( (div.scrollTop() + div.height() + 400)  +">="+ div[0].scrollHeight);

                if(div.scrollTop() + div.height() + 400  >= div[0].scrollHeight){

                    if(!scope.busy && scope.allItems.length < scope.totalCount ){
                        scope.fetch();
                    }
                }
            });
        },
        controller: function ($element, $scope, $q, $transclude) {

            $scope.init = function () {
                $scope.offset = 0;
                $scope.allItems = [];
                $scope.totalCount = 0;
                $element.find("div.displayItems").children().remove();
            };


            $scope.$watch('startFetching', function (newValue, oldValue, scope) {
                if(newValue !== 0 && newValue !== undefined){
                    $scope.init();
                    $scope.fetch();
                }
            });


            $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };


            $scope.fetch = function () {
                $scope.busy = true;
                $scope.safeApply();
                $scope.fetchMethod($scope.pageSize, $scope.offset).then(function (result) {
                    $scope.totalCount = result.count;
                    $scope.pageSize   = result.pageSize;
                    $scope.offset     = result.offset;

                    $scope.busy = false;
                    $scope.safeApply();

                    $scope.allItems= $scope.allItems.concat(result.items);
                    $scope.addToUI(result.items);
                }, function (error) {
                    $scope.busy = false;
                    $scope.safeApply();
                });

            };

            if($scope.fetchInitially) {
                $scope.fetch();
            }


            $scope.addToUI = function (items) {
                for(var i = 0;items && i < items.length;i++){
                    $transclude(function(transEl, transScope) {
                        transScope.$item = items[i];
                        $element.find("div.displayItems").append(transEl);
                    });
                }
            };


        }
    };
});

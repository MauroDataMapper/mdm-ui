angular.module('directives').directive('mcPagedList', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            type:"=",//static,dynamic
            name:"=",
            mcTitle:"=",

            items: "=",//when it's 'type=static'
            fetchMethod: "=",//when it's 'type=dynamic'
            pageSize:"=",
            editBtnTooltip:"=",
            editBtnText:"=",

            doNotDisplayTitle:"="
        },
        templateUrl: './mcPagedList.html',
        link: function (scope, element, attrs, ctrl, transclude) {

        },
        controller: function ($element, $scope, $q, $transclude) {

            $scope.currentPage = 0;
            $scope.disablePrev = false;
            $scope.disableNext = false;

            $scope.addToUI = function () {
                $element.find("div.displayItems").children().remove();

                if($scope.type === 'static'){
                    var start = $scope.pageSize * $scope.currentPage;
                    for(var i = start; i < start + $scope.pageSize && i < $scope.total;i++){
                        var item = $scope.displayItems[i];
                        $transclude(function(transEl, transScope) {
                            transScope.$item = item;
                            $element.find("div.displayItems").append(transEl);
                        });
                    }
                }else{
                    for(var i = 0;$scope.displayItems && i < $scope.displayItems.length;i++){
                        var item = $scope.displayItems[i];
                        $transclude(function(transEl, transScope) {
                            transScope.$item = item;
                            $element.find("div.displayItems").append(transEl);
                        });
                    }
                }


                $scope.disableNext = false;
                var pageCount = Math.floor($scope.total / $scope.pageSize);
                var lastPage  = Math.floor($scope.total % $scope.pageSize) > 0 ? 1 : 0;
                if($scope.currentPage + 1  >= pageCount + lastPage){
                    $scope.disableNext = true;
                }

                $scope.disablePrev = false;
                if($scope.currentPage === 0){
                    $scope.disablePrev = true;
                }
            };


            $scope.fetchData = function () {
                var offset = $scope.currentPage * $scope.pageSize;
                $scope.fetchMethod(offset, $scope.pageSize).then(function (result) {
                    $scope.total = result.count;
                    $scope.displayItems = angular.copy(result.items);
                    if ($scope.total < $scope.pageSize) {
                        $scope.disablePrev = true;
                        $scope.disableNext = true;
                        $scope.currentPage = 0;
                    }
                    $scope.addToUI();
                })
            };

            $scope.$watch("items.length", function (newValue, oldVAlue, scope) {
                if($scope.type === 'static') {
                    if (newValue != null && newValue !== undefined) {
                        $scope.total = $scope.items.length;
                        $scope.displayItems = angular.copy($scope.items);

                        if ($scope.total < $scope.pageSize) {
                            $scope.disablePrev = true;
                            $scope.disableNext = true;
                            $scope.currentPage = 0;
                        }
                        $scope.addToUI();
                    }
                }
            });

            $scope.$watch("type", function (newValue, oldVAlue, scope) {
                if($scope.type === 'dynamic') {
                    $scope.fetchData();
                }else if($scope.type === 'static') {
                    if (newValue != null && newValue !== undefined) {
                        $scope.total = $scope.items.length;
                        $scope.displayItems = angular.copy($scope.items);

                        if ($scope.total < $scope.pageSize) {
                            $scope.disablePrev = true;
                            $scope.disableNext = true;
                            $scope.currentPage = 0;
                        }
                        $scope.addToUI();
                    }
                }
            });

            $scope.next = function () {
                var pageCount = Math.floor($scope.total / $scope.pageSize);
                var lastPage  = Math.floor($scope.total % $scope.pageSize)>0 ? 1 : 0;
                if($scope.currentPage + 1  >= pageCount + lastPage){
                    return;
                }
                $scope.currentPage = $scope.currentPage + 1;

                if($scope.type === 'static'){
                    $scope.addToUI();
                }else{
                    $scope.fetchData();
                }

            };

            $scope.prev = function () {
                if ($scope.currentPage === 0) {
                    return;
                }
                $scope.currentPage = $scope.currentPage - 1;

                if($scope.type === 'static') {
                    $scope.addToUI();
                }else{
                    $scope.fetchData();
                }
            };

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

        }
    };
});







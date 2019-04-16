angular.module("directives").directive('allLinksInPagedList', function () {
    return {
        restrict: 'E',
        scope: {
            parent: "=",
            showDescription:"=",
            showNoLinksMessage:"=",
            showLoadingSpinner:"=",
        },
        templateUrl: './allLinksInPagedList.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope, $q, $timeout) {

            $scope.mcLinks = {
                refines: [],
                doesNotRefine: [],
                from: [],
                total: 0
            };

            $scope.$watch('parent', function (newValue, oldValue, scope) {
                if (newValue !== null && newValue !== undefined && newValue.id) {
                    if((!$scope.parent.semanticLinks) || $scope.parent.semanticLinks && $scope.parent.semanticLinks.length === 0){
                        $scope.loading = false;
                        $scope.safeApply();
                        return;
                    }
                    $scope.loading = true;
                    $scope.safeApply();
                    $scope.loadLinks().then(function () {
                        $scope.loading = false;
                        $scope.safeApply();
                    });
                }
            });


            $scope.loadLinks = function () {
                //as we just hand static mode
                //if we want to show the spinner while rendering the UI, use $timeout
                //otherwise just return the result and do not wait
                if($scope.showLoadingSpinner){
                    var deferred = $q.defer();
                    $timeout(function(){
                        var result = $scope.loadLinksStatic();
                        deferred.resolve(result);
                    });
                    return deferred.promise;
                }else{
                    var result = $scope.loadLinksStatic();
                    return $q.when(result);
                }
            };

            $scope.loadLinksStatic = function () {
                $scope.linkTypes = [];
                $scope.allLinksMap = {};
                $scope.total = 0;

                if(!$scope.parent.semanticLinks){
                    return;
                }
                angular.forEach($scope.parent.semanticLinks, function (link) {
                    if(!$scope.allLinksMap[link.linkType]){
                        $scope.allLinksMap[link.linkType] = {
                            linkType: link.linkType,
                            count:0,
                            links:[]
                        };
                        $scope.linkTypes.push(link.linkType);
                    }
                    $scope.allLinksMap[link.linkType].links.push(link);
                    $scope.allLinksMap[link.linkType].count++;
                    $scope.total++;
                });
            };



            // $scope.fetchNotRefined = function (pageIndex, pageSize) {
            //     var options = {
            //         pageSize: pageSize,
            //         pageIndex:pageIndex,
            //         filters: "type=source&linkType=Does Not Refine"
            //     };
            //     var deferred = $q.defer();
            //     resources.catalogueItem.get($scope.parent.id,"semanticLinks",options).then(function (result) {
            //         if(result.count !== 0){
            //             $scope.mcLinks.total++;
            //         }
            //         deferred.resolve(result);
            //     }, function (error) {
            //         deferred.reject(error);
            //     });
            //     return deferred.promise;
            // };
            // $scope.fetchRefines = function (pageIndex, pageSize) {
            //     var options = {
            //         pageSize: pageSize,
            //         pageIndex:pageIndex,
            //         filters: "type=source&linkType=Refines"
            //     };
            //     var deferred = $q.defer();
            //     resources.catalogueItem.get($scope.parent.id,"semanticLinks",options).then(function (result) {
            //         if(result.count !== 0){
            //             $scope.mcLinks.total++;
            //         }
            //         deferred.resolve(result);
            //     }, function (error) {
            //         deferred.reject(error);
            //     });
            //     return deferred.promise;
            // };
            // $scope.fetchFrom = function (pageIndex, pageSize) {
            //     if ($scope.parent.domainType !== "DataModel") {
            //         return $q.when({items:[], count:0});
            //     }
            //     var options = {
            //         pageSize: pageSize,
            //         pageIndex:pageIndex,
            //         filters: "type=target"
            //     };
            //     var deferred = $q.defer();
            //     resources.dataModel.get($scope.parent.id, "dataFlows", options).then(function (result) {
            //         if(result.count !== 0){
            //             $scope.mcLinks.total++;
            //         }
            //         deferred.resolve(result);
            //     }, function (error) {
            //         deferred.reject(error);
            //     });
            //     return deferred.promise;
            // };
            // $scope.loadLinksDynamic = function () {
            //     var promises = [];
            //     promises.push(resources.catalogueItem.get($scope.parent.id,"semanticLinks?type=source&linkType=Refines",{}));
            //     promises.push(resources.catalogueItem.get($scope.parent.id,"semanticLinks?type=source&linkType=Does Not Refine",{}));
            //     if ($scope.parent.domainType === "DataModel") {
            //         promises.push(resources.dataModel.get($scope.parent.id,"dataFlows",{filters: "type=target"}));
            //     }
            //
            //     $q.all(promises).then(function (results) {
            //         angular.forEach(results[0].items, function (link) {
            //             $scope.mcLinks.refines.push(link);
            //             $scope.mcLinks.total++;
            //         });
            //         angular.forEach(results[1].items, function (link) {
            //             $scope.mcLinks.doesNotRefine.push(link);
            //             $scope.mcLinks.total++;
            //         });
            //
            //         if ($scope.parent.domainType === "DataModel") {
            //             var dataFlowMap = {};
            //             angular.forEach(results[2].items, function (dataFlow) {
            //                 if (!dataFlowMap[dataFlow.source.id]) {
            //                     dataFlowMap[dataFlow.source.id] = dataFlow.source;
            //                     $scope.mcLinks.from.push(dataFlow);
            //                     $scope.mcLinks.total++;
            //                 }
            //             });
            //         }
            //     });
            // };

            $scope.safeApply = function(fn) {
                var phase = this.$root.$$phase;
                if(phase === '$apply' || phase === '$digest') {
                    if(fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };
        }
    };
});







angular.module('directives').directive('multipleTermsSelector', function ($state, resources) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            onAddButtonClick: "=",
            hideAddButton:"=",

            onSelectedTermsChange:"=",
        },
        templateUrl: './multipleTermsSelector.html',
        link: function (scope, iElement, iAttrs, ctrl) {
            scope.loadTerminologies();
        },

        controller: function ($scope, securityHandler, $q, resources, contextSearchHandler) {

            $scope.selectorSection = {
                terminologies:[],
                selectedTerminology:null,
                selectedTerms:{},
                selectedTermsArray:[],
                selectedTermsCount:0,
                termSearchText:"",
                startFetching:0,
                searchResultPageSize:20,
                searchResultOffset: 0 ,
                searchResult: [],

                searchResultDisplayedSoFar:0,
                searchResultTotal :0,
                loading:false
            };



            $scope.loadTerminologies = function(){
                resources.terminology.get(null, null, {all:true}).then(function (data) {
                    $scope.selectorSection.terminologies = data.items;
                }, function (error) {});
            };
            $scope.onTerminologySelect = function (terminology) {
                $scope.selectorSection.selectedTerminology = terminology;
                $scope.selectorSection.startFetching++;
            };
            $scope.runTermSearch = function () {
                $scope.selectorSection.startFetching++;
            };
            $scope.loadAllTerms = function (terminology, pageSize, offset) {
                var deferred = $q.defer();
                $scope.selectorSection.searchResultOffset = offset;

                var options = {
                    pageSize: pageSize,
                    pageIndex: offset * pageSize,
                };

                $scope.selectorSection.loading = true;
                $scope.safeApply();
                resources.terminology.get(terminology.id, "terms", options).then(function (result) {
                    //make check=true if element is already selected
                    angular.forEach(result.items, function (item) {
                        item.terminology = terminology;
                        if($scope.selectorSection.selectedTerms[item.id]){
                            item.checked = true;
                        }
                    });

                    $scope.selectorSection.searchResult = result.items;

                    $scope.calculateDisplayedSoFar(result);

                    $scope.selectorSection.loading = false;
                    $scope.safeApply();
                    deferred.resolve({
                        items: result.items,
                        count: result.count,
                        offset: offset + 1,
                        pageSize: $scope.selectorSection.searchResultPageSize
                    });
                }, function (error) {
                    $scope.selectorSection.loading = false;
                });
                return deferred.promise;
            };
            $scope.fetch = function (pageSize, offset) {
                if($scope.selectorSection.termSearchText.length === 0 && $scope.selectorSection.selectedTerminology){
                    //load all elements if possible(just all DataTypes for DataModel and all DataElements for a DataClass)
                    return $scope.loadAllTerms($scope.selectorSection.selectedTerminology,pageSize, offset);
                }else {
                    var deferred = $q.defer();
                    $scope.selectorSection.searchResultOffset = offset;
                    $scope.loading = true;
                    //$scope.safeApply();

                    var position = offset * $scope.selectorSection.searchResultPageSize;

                    contextSearchHandler.search($scope.selectorSection.selectedTerminology, $scope.selectorSection.termSearchText, $scope.selectorSection.searchResultPageSize, position, ["Term"]).then(function (result) {
                        $scope.selectorSection.searchResult = result.items;
                        //make check=true if element is already selected
                        angular.forEach(result.items, function (item) {
                            item.terminology = $scope.selectorSection.selectedTerminology;
                            if($scope.selectorSection.selectedTerms[item.id]){
                                item.checked = true;
                            }
                        });

                        $scope.calculateDisplayedSoFar(result);
                        $scope.loading = false;
                        deferred.resolve({
                            items: result.items,
                            count: result.count,
                            offset: offset + 1,
                            pageSize: $scope.selectorSection.searchResultPageSize
                        });

                    }, function (error) {
                        $scope.loading = false;
                    });
                    return deferred.promise;
                }
            };
            $scope.calculateDisplayedSoFar = function(result){
                $scope.selectorSection.searchResultTotal = result.count;
                if (result.count >= $scope.selectorSection.searchResultPageSize) {
                    var total = ($scope.selectorSection.searchResultOffset + 1) * $scope.selectorSection.searchResultPageSize;
                    if (total >= result.count) {
                        $scope.selectorSection.searchResultDisplayedSoFar = result.count;
                    } else {
                        $scope.selectorSection.searchResultDisplayedSoFar = total;
                    }
                } else {
                    $scope.selectorSection.searchResultDisplayedSoFar = result.count;
                }
            };
            $scope.termToggle = function($item){
                if($item.checked) {
                    $scope.selectorSection.selectedTerms[$item.id] = $item;
                    $scope.selectorSection.selectedTermsArray.push($item);
                    $scope.selectorSection.selectedTermsCount++;
                }else{
                    var i = $scope.selectorSection.selectedTermsArray.length - 1;
                    while(i >= 0){
                        if($scope.selectorSection.selectedTermsArray[i].id === $item.id){
                            $scope.selectorSection.selectedTermsArray.splice(i,1);
                        }
                        i--;
                    }

                    delete $scope.selectorSection.selectedTerms[$item.id];
                    $scope.selectorSection.selectedTermsCount--;
                }

                if($scope.onSelectedTermsChange){
                    $scope.onSelectedTermsChange($scope.selectorSection.selectedTermsArray);
                }
            };
            $scope.removeTerm = function($item){
                var i = $scope.selectorSection.selectedTermsArray.length - 1;
                while(i >= 0){
                    if($scope.selectorSection.selectedTermsArray[i].id === $item.id){
                        $scope.selectorSection.selectedTermsArray.splice(i,1);
                    }
                    i--;
                }
                angular.forEach($scope.selectorSection.searchResult, function (item) {
                    if(item.id === $item.id){
                        if(item.checked) {
                            item.checked = false;
                        }
                        return;
                    }
                });

                delete $scope.selectorSection.selectedTerms[$item.id];
                $scope.selectorSection.selectedTermsCount--;

                if($scope.onSelectedTermsChange){
                    $scope.onSelectedTermsChange($scope.selectorSection.selectedTermsArray);
                }
            };
            $scope.addSelectedTerms = function(terms){
                if($scope.onAddButtonClick){
                    $scope.onAddButtonClick(terms);
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

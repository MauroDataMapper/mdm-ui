angular.module('directives').directive('elementSelector', function ($state, resources) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            selected: "=",
            dialogue: "=",

            validTypesToSelect:"="
        },
        templateUrl: './elementSelector.html',

        link: function (scope, iElement, iAttrs, ctrl) {

            scope.findView();

        },

        controller: function ($scope, securityHandler, $q, resources) {

            $scope.formData = {
                searchText:"",
                treeSearchText:""
            };
            $scope.validTypesToSelectStr = "";
            angular.forEach($scope.validTypesToSelect, function (element, index) {
                $scope.validTypesToSelectStr = $scope.validTypesToSelectStr + element;
                if(index < $scope.validTypesToSelect.length - 1){
                    $scope.validTypesToSelectStr += ", ";
                }
            });


            $scope.findView = function(){
                $scope.showOnlyTerminology = false;
                $scope.showContextSearch   = false;

                if($scope.validTypesToSelect.length === 1 && $scope.validTypesToSelect.indexOf("Term") !== -1){
                    $scope.showOnlyTerminology = true;
                    $scope.currentTerminology  = null;
                    $scope.loadTerminologies();
                    return;
                } else if(_.intersection($scope.validTypesToSelect, ["DataElement", "DataType"]).length >  0){
                    $scope.showContextSearch = true;
                    $scope.loadAllFolders();
                }else{

                    //this is the default one for "DataMode" & "DataClass"
                    $scope.loadAllFolders();
                }

            };


            $scope.loadAllFolders  = function(){
                $scope.reloading = true;
                resources.tree.get().then(function (data) {
                    $scope.folders = {
                        "children": data,
                        isRoot: true
                    };
                    $scope.reloading = false;
                }, function () {
                    $scope.reloading = false;
                });
            };


            $scope.loadTerminologies = function(){
                $scope.reloading = true;
                resources.terminology.get().then(function (data) {
                    $scope.terminologies = data.items;
                    $scope.reloading = false;
                }, function () {
                    $scope.reloading = false;
                });
            };

            $scope.onTerminologySelect = function (terminology) {
                $scope.currentTerminology = terminology;
            };


            $scope.searchInTree = function(){
                $scope.reloading = true;
                $scope.allModels = [];
                resources.tree.get(null, "search/" + $scope.formData.treeSearchText).then(function (result) {
                    $scope.reloading = false;
                    $scope.folders = {
                        "children": result,
                        isRoot: true
                    };
                });
            };

            $scope.onNodeDbClick = function (node) {
                if($scope.validTypesToSelect.indexOf(node.domainType) === -1){
                    return;
                }
                //close the dialogue if it exists
                if($scope.dialogue) {
                    $($scope.dialogue).dialog("close");
                }
            };

            $scope.onNodeClick = function (node) {
                if(!$scope.showTabs){return;}
                $scope.selected = node;
            };

            $scope.checkIfNeedsContextSearch = function () {

            };

            $scope.contextSearch = function () {
                // $scope.formData.searchText
                // searchWithinHandler.search
            };

            $scope.termSearch = function () {

            }


            $scope.fectTerm = function (text, offset, limit) {
                var deferred = $q.defer();

                limit = limit ? limit : 30;
                offset = offset ? offset : 0;

                $scope.searchTerm = text;
                resources.terminology.get($scope.terminology.id, "terms/search", {
                    queryStringParams: {
                        search:  encodeURIComponent(text),
                        limit: limit,
                        offset: offset,
                    }
                }).then(function (result) {
                    deferred.resolve({
                        results: result.items,
                        count: result.count,
                        limit: limit,
                        offset: offset
                    });
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            };


        }
    };
});

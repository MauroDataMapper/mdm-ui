angular.module('directives').directive('elementSelector2', function ($state, resources) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            dialogue: "=",

            validTypesToSelect:"=",
            notAllowedToSelectIds:"="
        },
        templateUrl: './elementSelector2.html',

        link: function (scope, iElement, iAttrs, ctrl) {

        },

        controller: function ($scope, securityHandler, $q, resources, contextSearchHandler) {

            $scope.hideOptions = {};
            $scope.formData = {
                selectedType:"",
                step:0,
                currentContext: null,

                searchResult: null,
                searchResultTotal: null,
                searchResultPageSize: 40,
                searchResultOffset: 0,
                searchResultDisplayedSoFar: 0,

                treeSearchText:"",
                startFetching:0,
                inSearchMode: false
            };

            $scope.$watch('validTypesToSelect', function (newValue, oldValue, scope) {

                if(newValue){
                    if($scope.validTypesToSelect.length === 1){
                        $scope.showPrevBtn = false;
                        $scope.onElementTypeSelect($scope.validTypesToSelect[0]);
                    }else{
                        $scope.hideOptions['Folder']    = $scope.validTypesToSelect.indexOf("Folder") === -1 ;
                        $scope.hideOptions['DataModel'] = $scope.validTypesToSelect.indexOf("DataModel") === -1 ;
                        $scope.hideOptions['DataClass'] = $scope.validTypesToSelect.indexOf("DataClass") === -1 ;
                        $scope.hideOptions['DataElement'] = $scope.validTypesToSelect.indexOf("DataElement") === -1 ;
                        $scope.hideOptions['DataType'] = $scope.validTypesToSelect.indexOf("DataType") === -1 ;
                        $scope.hideOptions['Term'] = $scope.validTypesToSelect.indexOf("Term") === -1 ;
                        $scope.showPrevBtn = true;
                    }
                }else{
                    $scope.showPrevBtn = true;
                }
            });

            $scope.onElementTypeSelect = function(selectedType){
                $scope.formData.selectedType = selectedType;
                $scope.formData.step = 1;

                $scope.reLoad();
            };

            $scope.reLoad = function(){
                if(['DataModel', 'DataClass'].indexOf($scope.formData.selectedType) !== -1 ) {
                    $scope.loadAllDataModels();
                }

                if($scope.formData.selectedType === "Folder"){
                    $scope.loadAllFolders();
                }

                if($scope.formData.selectedType === "Term"){
                    $scope.loadTerminologies();
                }
            };

            $scope.previousStep = function(){
                $scope.formData.step = 0;
                $scope.formData.currentContext = null;
                $scope.formData.treeSearchText = "";
            };

            $scope.loadAllDataModels  = function(){
                $scope.reloading = true;
                resources.tree.get().then(function (data) {
                    $scope.rootNode = {
                        "children": data,
                        isRoot: true
                    };
                    $scope.reloading = false;
                }, function () {
                    $scope.reloading = false;
                });
            };

            $scope.loadAllFolders = function () {
                $scope.loading = true;
                resources.folder.get().then(function (data) {
                    $scope.loading = false;
                    $scope.rootNode = {
                        children: data.items,
                        isRoot: true
                    };
                }, function (error) {
                    $scope.loading = false;
                });
            };

            $scope.loadTerminologies = function(){
                $scope.reloading = true;
                resources.terminology.get(null, null, {all:true}).then(function (data) {
                    if($scope.notAllowedToSelectIds && $scope.notAllowedToSelectIds.length > 0){
                        var i = data.items.length - 1 ;
                        while(i >= 0){
                           var found =  _.find($scope.notAllowedToSelectIds, function(terminologyId) {
                                return terminologyId === data.items[i].id;
                            });

                            if(found){
                                data.items.splice(i, 1);
                            }
                            i--;
                        }
                    }
                    $scope.terminologies = data.items;

                    $scope.reloading = false;
                }, function () {
                    $scope.reloading = false;
                });
            };

            $scope.onTerminologySelect = function (terminology) {
                $scope.formData.currentContext = terminology;

                // if($scope.formData.treeSearchText.trim() !== ""){
                    $scope.formData.startFetching++;
                //}
            };

            $scope.onContextSelected = function(element){
                if(element && element.length > 0){
                    $scope.formData.currentContext = element[0];
                }else {
                    $scope.formData.currentContext = null;
                }

                //if($scope.formData.treeSearchText.length > 0){
                    $scope.runContextSearch();
                //}
            };

            $scope.runContextSearch = function(){
                $scope.formData.startFetching++;
                $scope.safeApply();
            };


            $scope.loadAllDataElements = function (dataClass, pageSize, pageIndex) {
                var options = {
                    pageSize: pageSize,
                    pageIndex:pageIndex * pageSize,
                    sortBy: "label",
                    sortType:"asc"
                };
                return resources.dataClass.get(dataClass.dataModel, null, dataClass.id, "dataElements", options);
            };

            $scope.loadAllDataTypes = function (dataModel, pageSize, pageIndex) {
                var options = {
                    pageSize: pageSize,
                    pageIndex:pageIndex * pageSize,
                    sortBy: "label",
                    sortType: "asc"
                };
                return  resources.dataModel.get(dataModel.id, "dataTypes", options);
            };

            $scope.loadAllTerms = function (terminology, pageSize, pageIndex) {
                var options = {
                    pageSize: pageSize,
                    pageIndex:pageIndex * pageSize,
                };
                return  resources.terminology.get(terminology.id, "terms", options);
            };

            $scope.loadAllContextElements = function(currentContext, selectedType, pageSize, offset){

                if(currentContext.domainType === "DataClass" && selectedType === "DataElement"){
                    var deferred = $q.defer();
                    $scope.formData.searchResultOffset = offset;

                    $scope.loading = true;
                    $scope.safeApply();
                    $scope.loadAllDataElements(currentContext, pageSize, offset).then(function (result) {

                        $scope.loading = false;
                        $scope.formData.searchResult = result.items;
                        $scope.calculateDisplayedSoFar(result);
                        deferred.resolve({
                            items: result.items,
                            count: result.count,
                            offset: offset + 1,
                            pageSize: $scope.formData.searchResultPageSize
                        });

                    });
                    return deferred.promise;
                } else if(currentContext.domainType === "DataModel" && selectedType === "DataType"){
                    var deferred = $q.defer();
                    $scope.formData.searchResultOffset = offset;

                    $scope.loading = true;
                    $scope.safeApply();
                    $scope.loadAllDataTypes(currentContext, pageSize, offset).then(function (result) {

                        $scope.loading = false;
                        $scope.formData.searchResult = result.items;
                        $scope.calculateDisplayedSoFar(result);
                        deferred.resolve({
                            items: result.items,
                            count: result.count,
                            offset: offset + 1,
                            pageSize: $scope.formData.searchResultPageSize
                        });

                    });
                    return deferred.promise;
                }else if(currentContext.domainType === "Terminology" && selectedType === "Term"){
                    var deferred = $q.defer();
                    $scope.formData.searchResultOffset = offset;

                    $scope.loading = true;
                    $scope.safeApply();
                    $scope.loadAllTerms(currentContext, pageSize, offset).then(function (result) {

                        $scope.loading = false;
                        $scope.formData.searchResult = result.items;
                        $scope.calculateDisplayedSoFar(result);
                        deferred.resolve({
                            items: result.items,
                            count: result.count,
                            offset: offset + 1,
                            pageSize: $scope.formData.searchResultPageSize
                        });

                    });
                    return deferred.promise;
                }
                return $q.when({
                    items: [],
                    count: 0
                });

            };

            $scope.calculateDisplayedSoFar = function(result){
                $scope.formData.searchResultTotal = result.count;

                if (result.count >= $scope.formData.searchResultPageSize) {
                    var total = ($scope.formData.searchResultOffset + 1) * $scope.formData.searchResultPageSize;
                    if (total >= result.count) {
                        $scope.formData.searchResultDisplayedSoFar = result.count;
                    } else {
                        $scope.formData.searchResultDisplayedSoFar = total;
                    }

                } else {
                    $scope.formData.searchResultDisplayedSoFar = result.count;
                }
            };

            $scope.fetch = function (pageSize, offset) {

                if($scope.formData.treeSearchText.length === 0 && $scope.formData.currentContext){
                    //load all elements if possible(just all DataTypes for DataModel and all DataElements for a DataClass)
                    return $scope.loadAllContextElements($scope.formData.currentContext, $scope.formData.selectedType, pageSize, offset);
                }else {

                    var deferred = $q.defer();
                    $scope.formData.searchResultOffset = offset;

                    $scope.loading = true;
                    $scope.safeApply();

                    var position = offset * $scope.formData.searchResultPageSize;

                    contextSearchHandler.search($scope.formData.currentContext, $scope.formData.treeSearchText, $scope.formData.searchResultPageSize, position, [$scope.formData.selectedType]).then(function (result) {
                        $scope.formData.searchResult = result.items;
                        $scope.calculateDisplayedSoFar(result);
                        $scope.loading = false;
                        deferred.resolve({
                            items: result.items,
                            count: result.count,
                            offset: offset + 1,
                            pageSize: $scope.formData.searchResultPageSize
                        });

                    }, function (error) {
                        $scope.loading = false;
                    });
                    return deferred.promise;
                }
            };

            $scope.onSearchResultSelect = function ($item, $event) {
                $event.preventDefault();
                $event.stopPropagation();

                var found = false;
                if($scope.notAllowedToSelectIds && $scope.notAllowedToSelectIds.length > 0){
                    angular.forEach($scope.notAllowedToSelectIds, function (notAllowedId) {
                        if($item.id === notAllowedId){
                            found = true;
                        }
                    });
                }
                if(found){
                    return;
                }


                $($scope.dialogue).data("selectedElement", $item);

                //close the dialogue if it exists
                if($scope.dialogue) {
                    $($scope.dialogue).dialog("close");
                }
            };

            $scope.onNodeInTreeSelect = function (node) {
                if($scope.formData.selectedType !== node.domainType){
                    return;
                }

                var found = false;
                if($scope.notAllowedToSelectIds && $scope.notAllowedToSelectIds.length > 0){
                    angular.forEach($scope.notAllowedToSelectIds, function (notAllowedId) {
                        if(node.id === notAllowedId){
                            found = true;
                        }
                    });
                }
                if(found){
                    return;
                }

                $($scope.dialogue).data("selectedElement", node);

                //close the dialogue if it exists
                if($scope.dialogue) {
                    $($scope.dialogue).dialog("close");
                }
            };

            $scope.searchInTree = function(treeSearchDomainType){

                if($scope.formData.treeSearchText.trim().length === 0){
                    $scope.formData.inSearchMode = false;
                    $scope.reLoad();
                    return;
                }
                $scope.formData.inSearchMode = true;
                $scope.reloading = true;
                $scope.allModels = [];

                var options = {
                    queryStringParams :{
                        domainType: treeSearchDomainType
                    }
                };

                resources.tree.get(null, "search/" + $scope.formData.treeSearchText, options).then(function (result) {
                    $scope.reloading = false;
                    $scope.rootNode = {
                        "children": result,
                        isRoot: true
                    };
                });
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

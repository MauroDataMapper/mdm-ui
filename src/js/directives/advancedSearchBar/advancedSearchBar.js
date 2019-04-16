
angular.module("directives").directive('advancedSearchBar', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            parent: "=",
            showRestrictTo: "=",
            showDomainTypes: "=",
            placeholder: "=",

            defaultCriteria:"=",
            defaultPageIndex:"=",
            defaultOffset:"=",
            defaultPageSize:"=",

            doNotDisplayModelPathStatus:"=",
            doNotOpenLinkInNewWindow:"=",

            onChange: "="
        },
        templateUrl: './advancedSearchBar.html',

        link: function (scope, iElement, iAttrs, ctrl) {

            $(iElement).find("#searchInput").trigger("focus");

        },

        controller: ['$scope', 'helpDialogueHandler', 'contextSearchHandler', 'elementTypes', function ($scope, helpDialogueHandler, contextSearchHandler, elementTypes) {

            $scope.formData = {
                showSearchResult : false,
                labelOnly:false,
                exactMatch: false,
                selectedDomainTypes : {
                    DataModel: false,
                    DataClass: false,
                    DataElement: false,
                    DataType: false,
                    EnumerationValue: false
                },
                classifiers:[],

                lastDateUpdatedFrom: null,
                lastDateUpdatedTo: null,

                createdFrom: null,
                createdTo: null,
            };

            $scope.allDataTypes = elementTypes.getAllDataTypesMap();
            $scope.context = $scope.parent;
            $scope.placeHolderText = $scope.placeholder ? $scope.placeholder : "Search for...";

            if($scope.defaultCriteria && $scope.defaultCriteria.length > 0){
                $scope.pageSize      = ($scope.defaultPageSize  && parseInt($scope.defaultPageSize)) ?   parseInt($scope.defaultPageSize) : null;
                $scope.pageIndex     = ($scope.defaultPageIndex && parseInt($scope.defaultPageIndex)) ?  parseInt($scope.defaultPageIndex) : 0;
                $scope.defaultOffset = ($scope.defaultOffset    && parseInt($scope.defaultOffset)) ?     parseInt($scope.defaultOffset) : 0;
                $scope.searchInput = $scope.defaultCriteria;
                $scope.formData.showSearchResult = true;
            }else{
                $scope.searchInput = "";
            }

            $scope.$watch("searchInput", function (newValue, oldVAlue, scope) {
                if (!newValue || (newValue && newValue.trim().length === 0)) {
                    $scope.formData.showSearchResult = false;
                    if($scope.mcTableHandler) {
                        $scope.mcTableHandler.fetchForDynamic();
                    }
                    return;
                }
                $scope.formData.showSearchResult = true;
                if($scope.mcTableHandler) {
                    $scope.mcTableHandler.fetchForDynamic();
                }
            });

            if ($scope.showDomainTypes) {
                $scope.hideDM = ($scope.showDomainTypes.indexOf("DataModel") === -1);
                $scope.hideDC = ($scope.showDomainTypes.indexOf("DataClass") === -1);
                $scope.hideDE = ($scope.showDomainTypes.indexOf("DataElement") === -1);
                $scope.hideDT = ($scope.showDomainTypes.indexOf("DataType") === -1);
                $scope.hideEV = ($scope.showDomainTypes.indexOf("EnumerationValue") === -1);
            }

            $scope.toggleAdvancedSearch = function () {
                $scope.advancedSearch = !$scope.advancedSearch;
                // $scope.parentElementScope.$broadcast("advanced-search-" + name + "-opened", {isOpen: $scope.advancedSearch});
            };

            $scope.loadHelp = function () {
                helpDialogueHandler.open("Search_Help", {my: "right top", at: "bottom", of: jQuery("#helpButton")});
            };

            $scope.fetch = function (pageSize, offset) {
                if(!$scope.formData.showSearchResult){
                    return $.when({count:0, items:[]});
                }
                var filterDataTypes = [];
                if($scope.formData.selectedDomainTypes.DataModel){
                    filterDataTypes.push("DataModel");
                }
                if($scope.formData.selectedDomainTypes.DataClass){
                    filterDataTypes.push("DataClass");
                }
                if($scope.formData.selectedDomainTypes.DataElement){
                    filterDataTypes.push("DataElement");
                }
                if($scope.formData.selectedDomainTypes.DataType){
                    filterDataTypes.push("DataType");
                }
                if($scope.formData.selectedDomainTypes.EnumerationValue){
                    filterDataTypes.push("EnumerationValue");
                }

                var searchText = $scope.searchInput;
                if($scope.formData.exactMatch){
                    if(searchText[0] !== "\""){
                        searchText = "\""+searchText;
                    }
                    if(searchText[searchText.length - 1 ] !== "\""){
                        searchText = searchText + "\"";
                    }
                }

                if($scope.onChange){
                    $scope.onChange({
                        pageIndex: (offset / pageSize) + 1,
                        pageSize:  pageSize,
                        offset:    offset,
                        criteria: $scope.searchInput,
                        filterDataTypes:filterDataTypes
                    });
                }


                var classifiersNames = [];
                angular.forEach($scope.formData.classifiers, function (classifier) {
                    classifiersNames.push(classifier.label);
                });


                return contextSearchHandler.search(
                    $scope.context,
                    searchText,
                    pageSize,
                    offset,
                    filterDataTypes,
                    $scope.formData.labelOnly, null, classifiersNames, null,
                    $scope.lastDateUpdatedFrom, $scope.lastDateUpdatedTo,
                    $scope.createdFrom, $scope.createdTo
                );
            };

            $scope.search = function(resetPageIndex) {
                if($scope.searchInput.trim().length !== 0){

                    if(resetPageIndex){
                        $scope.pageIndex = 1;
                    }
                    $scope.mcTableHandler.fetchForDynamic();
                }
            };

            $scope.onContextSelected = function (selected) {
                $scope.context = null;
                if(selected && selected.length>0){
                    $scope.context = selected[0];
                }

                $scope.search(true);
            };

            $scope.onClassifierChange = function (selectedValue, record) {
                $scope.search(true);
            };

            $scope.onLastUpdatedSelect = function (from, to) {
                $scope.lastDateUpdatedFrom = from;
                $scope.lastDateUpdatedTo = to;
                $scope.search(true);
            };

            $scope.onCreatedSelect = function (from, to) {
                $scope.createdFrom = from;
                $scope.createdTo = to;
                $scope.search(true);
            };

        }]
    };
});

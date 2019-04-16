'use strict';

angular.module('controllers').controller('simpleViewFilterCtrl', function ($window, $scope, resources, stateHandler, $cookies, windowHandler, $rootScope, contextSearchHandler, $q, validator) {
        $window.document.title = "Filter Data Models";


        if(!$rootScope.simpleViewSupport){
            stateHandler.Go("home");
            return;
        }

        $scope.filter = {
            diabetes:""
        };
        $scope.allDataModels  = [];
        $scope.filteredDataModels  = [];
        $scope.allClassifiers = [];
        $scope.filters = {};
        $scope.selectedFilters = {};
        $scope.filtersCount = 0;
        $scope.isSmallScreen = false;
        $scope.showFilterItems = false;

        $scope.refreshSearch = false;
        $scope.searchInput = null;

        $scope.submittedForm = {
            interested: false,
            needsAdvice: false,

            selectedDataModels:[],
            selectedDataModelsMap:{},
        };


        $scope.applyAffix = function(){
            $('div.simpleViewResultElement').affix({
                offset: {
                    top: 70,
                }
            });
        };
        $scope.isSmallScreen = windowHandler.isSmallScreen();
        //apply affix if we are NOT in mobile mode
        if(!$scope.isSmallScreen) {
            $scope.applyAffix();
        }

        $scope.onResize = function(){
            $scope.isSmallScreen = windowHandler.isSmallScreen();

            if($scope.isSmallScreen){
                //disable affix on right pane
                $('div.simpleViewResultElement')
                    .removeClass("affix")
                    .removeClass("affix-top")
                    .removeClass("affix-bottom")
                    .removeData("bs.affix");
                $(window).off('.affix');

            }else{
                $scope.applyAffix();
            }
            $scope.safeApply();
        };
        jQuery(window).on('resize', function(){
           $scope.onResize();
        });
        $scope.$on('$destroy', function () {
            jQuery(window).off('resize');
        });
        $scope.toggleFilterItems = function(){
            if($scope.isSmallScreen){
                $scope.showFilterItems = !$scope.showFilterItems;
            }
        };



        $scope.$watch('searchInput', function (newValue, oldValue, scope) {
            if(newValue === null){return;}
            $scope.filterUpdated();
        });


        $scope.initFilters = function () {
            angular.forEach($scope.allClassifiers, function (classifier) {
                var parts = classifier.label.split(":");
                if (parts && parts.length === 2) {
                    var name = parts[0].trim();
                    var value = parts[1].trim();

                    if (!$scope.filters[name]) {
                        $scope.filters[name] = {
                            label: name,
                            values: [],
                        };
                        $scope.filtersCount++;
                    }
                    $scope.filters[name].values.push({
                        label: classifier.label,
                        displayLabel: value,
                        checked: true,
                    });
                }
            });
        };

       $scope.loadClassifiers = function(){
           resources.classifier.get(null, null, { all: true }).then(function (result) {
               $scope.allClassifiers = result.items;

               $scope.initFilters();

               var selectedModels = $scope.readCookies();
               //rebuild the simpleViewLink
               angular.forEach(selectedModels, function (dataModel) {
                     dataModel.simpleViewLink = stateHandler.getURL("simpleviewelement",{id:dataModel.id, domainType:"DataModel"});
               });
               angular.copy(selectedModels, $scope.submittedForm.selectedDataModels);


               $scope.submittedForm.selectedDataModelsMap = {};
               angular.forEach($scope.submittedForm.selectedDataModels, function (dataModel) {
                   $scope.submittedForm.selectedDataModelsMap[dataModel.id] = dataModel;
               });

           });
       };
        $scope.loadClassifiers();


        $scope.filterUpdated = function(event, filter, value){

            if(filter && value) {
                angular.forEach($scope.filters[filter.label].values, function (v) {
                    if (v.label === value.label) {
                        v.checked = value.checked;
                        return;
                    }
                });
            }


            $scope.refreshSearch = true;

            //on filter change, then reload the table content
            if ($scope.mcTableHandler) {
                $scope.mcTableHandler.fetchForDynamic();
            }
        };

        $scope.searchInputUpdated = function(){
            $scope.refreshSearch = true;

            //on search input changed, then reload the table content
            if ($scope.mcTableHandler) {
                $scope.mcTableHandler.fetchForDynamic();
            }
        };



        $scope.dataModelsFetch = function (pageSize, offset) {
            var classifierFilter = $scope.buildClassifierFilerForServerSearch();

            var deferred = $q.defer();

            if($scope.refreshSearch){
                offset = 0;
                $scope.refreshSearch = false;
            }

            //Load all DataModels
            if(classifierFilter.length === 0){
                resources.dataModel.get(null, null).then(function (result) {

                    var index = 0;
                    angular.forEach(result.items, function (item) {
                        item.simpleViewLink = stateHandler.getURL("simpleviewelement",{id:item.id, domainType:"DataModel"});
                        var pictNum = index % 5;
                        item.picture = "../../images/simpleView/orgs/" + pictNum + ".png";
                        item.showMoreDetails = false;
                        index++;
                    });

                    $scope.resultCount = result.count;
                    deferred.resolve({
                        items:result.items,
                        count: result.count,
                    });
                }, function (error) {
                    deferred.reject(error);
                });

            }else{

                //var pageIndex = (offset / pageSize) + 1;
                var searchTerm = validator.isEmpty($scope.searchInput) ? null : $scope.searchInput;
                contextSearchHandler.search(null, searchTerm, pageSize,  offset, ["DataModel"], false,[],[], classifierFilter).then(function (result) {

                    var index = 0;
                    angular.forEach(result.items, function (item) {
                        item.simpleViewLink = stateHandler.getURL("simpleviewelement",{id:item.id, domainType:"DataModel"});
                        var pictNum = index % 5;
                        item.picture = "../../images/simpleView/orgs/" + pictNum + ".png";
                        item.showMoreDetails = false;
                        index++;
                    });

                    $scope.resultCount = result.count;
                    deferred.resolve({
                        items:result.items,
                        count: result.count,
                    });
                }, function (error) {
                    deferred.reject(error);
                });
            }

            return deferred.promise;
        };

        $scope.buildClassifierFilerForServerSearch = function(){
            var classifierFilter = [];
            for (var name in $scope.filters) {
                var orFiler = [];
                angular.forEach($scope.filters[name].values, function (value) {
                    if(value.checked) {
                        orFiler.push(value.label);
                    }
                });
                if(orFiler.length > 0){
                    classifierFilter.push(orFiler);
                }
            }
            return classifierFilter;
        };




        $scope.addDataModelToBasket = function(event, $item){
            var found = false;
            angular.forEach($scope.submittedForm.selectedDataModels, function (element) {
                if(element.id === $item.id){
                    found = true;
                    return;
                }
            });
            if(!found){
                $scope.submittedForm.selectedDataModels.push({
                    id: $item.id,
                    label: $item.label,
                    simpleViewLink: $item.simpleViewLink
                });
                $scope.updateCookies();

                $scope.submittedForm.selectedDataModelsMap = {};
                angular.forEach($scope.submittedForm.selectedDataModels, function (dataModel) {
                    $scope.submittedForm.selectedDataModelsMap[dataModel.id] = dataModel;
                });

            }

            event.stopPropagation();
            event.preventDefault();
        };

        $scope.removeDataModelFromBasket = function($event, selectedDataModel){
            var index = -1;
            angular.forEach($scope.submittedForm.selectedDataModels, function (element, i) {
                if(element.id === selectedDataModel.id){
                    index = i;
                    return;
                }
            });
            if(index !== -1){
                $scope.submittedForm.selectedDataModels.splice(index, 1);
                $scope.updateCookies();

                $scope.submittedForm.selectedDataModelsMap = {};
                angular.forEach($scope.submittedForm.selectedDataModels, function (dataModel) {
                    $scope.submittedForm.selectedDataModelsMap[dataModel.id] = dataModel;
                });
            }
        };

        $scope.updateCookies = function() {
            var dms = [];
            angular.forEach($scope.submittedForm.selectedDataModels, function (dataModel) {
                dms.push({
                    id: dataModel.id,
                    label: dataModel.label,
                    simpleViewLink: dataModel.simpleViewLink
                });
            });
            //Keep username for 100 days
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 100);
            $cookies.put('selectedDataModels', JSON.stringify(dms), {'expires': expireDate});
        };


        $scope.searchInputKeyPress = function(event){
            if (event.which === 13) {
                $scope.filterUpdated();
            }
        };


        $scope.readCookies = function() {
            var selectedStr = $cookies.get('selectedDataModels') || "[]";
            return JSON.parse(selectedStr);
        };


        $scope.showMoreDetails = function (item) {
            item.showMoreDetails = !item.showMoreDetails;
            if(!item.showMoreDetails){return;}

            $scope.createModelDetailTables(item);
        };


        $scope.createModelDetailTables = function(item){
            item.moreDetailsTable = {
                "Context of data collected": null,
                "Extraction / data collection": null,

                "Type of data": null,
                "Coverage": null,
                "Geography": null,
                "Duration": null,

                "Volumes": null,
                "Events": null,
                "Granularity": null,

                "Access": null,
                "Consent": null,
                "Coding": null,
            };

            resources.facets.get(item.id, "metadata", {all: true}).then(function(result){
                angular.forEach(result.items, function(metadata){
                    if(metadata.namespace === "ox.softeng.metadatacatalogue.dataloaders.hdf"){
                        if(item.moreDetailsTable[metadata.key] !== undefined){
                            item.moreDetailsTable[metadata.key] = metadata.value;
                        }
                    }
                });
            });
        };


        $scope.submitRequest = function(){
            stateHandler.Go("appContainer.simpleApp.submission");
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

    });


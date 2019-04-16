angular.module('directives').directive('mcTable', function () {
    return {
        restrict: 'E',
        scope:{
            mcRecordType: '=', //static dynamic
            mcFetchMethod: '=',
            mcOriginalRecords: '=mcRecords',
            mcDisplayRecords: '=',
            mcStaticLoadingInProgress: '=',
            name:"=",
            mcPageSizeInput: '=',
            mcPageSizesInput: '=',
            mcPageNumber: '=',
            mcRecordCount: '=',
            mcTableHandler: '=',
            mcHideFilterIcon: '=',
            mcHasCheckbox: '=',
            mcOnFetchCalled: '=',
            mcShowFilterInputs: "="
        },

        link: function (scope, element, attrs) {
            scope.showFilter = false;
            scope.sortBy   = null;
            scope.sortType = "";
            scope.headers = [];


            scope.debounce = function (func, wait, immediate) {
                var timeout;
                return function() {
                    var context = this, args = arguments;
                    var later = function() {
                        timeout = null;
                        if (!immediate) func.apply(context, args);
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func.apply(context, args);
                };
            };

            scope.handleCount = function () {
                var tableTitle = $(element).find("div.mcTableTitle > span.title");
                var span = $('<span class="badge element-count ng-binding" style="margin:0px 3px;" aria-hidden="false"></span>');
                $(tableTitle).append(span);
            };

            scope.handleFilterIcon = function () {

                if($(element).find("tr.mcTableFilter").length === 0){
                    return
                }

                var tableTitle = $(element).find("div.mcTableTitle > span.title");
                var filterIcon = $('<i class="fa fa-filter themeColor" style="cursor: pointer;margin-left: 2px;"></i>');

                //Hide filter row
                $(element).find("tr.mcTableFilter").hide();

                filterIcon.on("click", function () {
                    scope.showFilter = !scope.showFilter;
                    $(element).find("tr.mcTableFilter").toggle();
                    if(scope.showFilter){
                        filterIcon.removeClass("themeColor");
                        filterIcon.addClass("filterIcon");
                    }else{
                        filterIcon.addClass("themeColor");
                        filterIcon.removeClass("filterIcon");
                    }
                });
                $(tableTitle).append(filterIcon);


                if(scope.mcShowFilterInputs){
                    scope.showFilter = true;
                    $(element).find("tr.mcTableFilter").toggle();
                    filterIcon.removeClass("themeColor");
                    filterIcon.addClass("filterIcon");
                }
            };


            scope.updateCount = function (count) {
                var span = $(element).find("div.mcTableTitle > span.title > span.badge");
                if(count == null || count == 0){
                    span.hide();
                }else {
                    span.show();
                    span.text(count);
                }
            };
            scope.handleColumns = function () {
                var index = 0;
                //find all columns
                $(element).find("thead tr.mcTableHeader th").each(function (i, th) {



                    if(scope.mcHasCheckbox){
                        if($(th).attr("checkboxAll")){
                            var checkboxAll = $(th).find("input.checkboxAll");
                            checkboxAll.on("change", function () {
                                if(this.checked === true) {
                                   angular.forEach(scope.mcDisplayRecords, function (mcDisplayRecord) {
                                       mcDisplayRecord.checked = true;
                                   });
                                }else if(this.checked === false) {
                                    angular.forEach(scope.mcDisplayRecords, function (mcDisplayRecord) {
                                        mcDisplayRecord.checked = false;
                                    });
                                }
                                scope.safeApply();
                            });
                        }
                    }

                    var header = {
                        index:index,
                        el: $(th),
                        title: $(th).text().trim()	,
                        column: $(th).attr("columnName") || "column"+i,
                        sortable: $(th).attr("sortable") == "true"  ? true : false,
                        filterable: $(th).attr("filterable") == "true" ? true : false,
                        type: $(th).attr("columnType")!=undefined ? $(th).attr("columnType") : "string",
                        filter: ""
                    };
                    scope.headers[header.column] = header;
                    index++;

                    if(header.sortable) {
                        $(th).append('<i class="fa fa-sort icon graySort" aria-hidden="true"></i>');
                        $(th).data("mc", header);
                        $(th).on("click", function (event) {
                            var mc = $(this).data("mc");
                            for (var header in scope.headers) {
                                if (scope.headers.hasOwnProperty(header)) {
                                    if(scope.headers[header].sortable){
                                        scope.headers[header].el.find("i.icon").remove();
                                        scope.headers[header].el.append('<i class="fa fa-sort icon graySort" aria-hidden="true"></i>');
                                    }
                                }
                            }
                            scope.sortBy = mc.column;
                            if (scope.sortType == "") {
                                $(this).find("i.icon").remove();
                                $(this).append('<i class="fa fa-sort-desc icon blackSort" aria-hidden="true"></i>');
                                scope.sortType = "asc";
                            } else if (scope.sortType == "asc") {
                                $(this).find("i.icon").remove();
                                $(this).append('<i class="fa fa-sort-asc icon blackSort" aria-hidden="true"></i>');
                                scope.sortType = "desc";
                            } else if (scope.sortType == "desc") {
                                $(this).find("i.icon").remove();
                                $(this).append('<i class="fa fa-sort icon graySort" aria-hidden="true"></i>');
                                scope.sortType = "";
                            }
                            

                            scope.mcPageNumber = 1;
                            scope.applyFilter(); //filteredRecords
                            scope.sort();        //sortedRecords
                            scope.pagedList();   //mcDisplayRecords
                            scope.safeApply();
                        });
                    }

                    
                    if(header.filterable) {
                        var filterTD = $($(th).parent("tr").parent("thead").find("tr.mcTableFilter td")[header.index]);
                        //it's an input filter
                        if(filterTD.find("input").length > 0){
                            filterTD.find("input").data("mc", header);

                            filterTD.find("input").on("keyup", scope.debounce(function (event) {
                                var header = $(this).data("mc");
                                scope.headers[header.column].filter = $(this).val();
                                scope.mcPageNumber = 1;

                                if(scope.mcRecordType == "static"){
                                    scope.applyFilter(); //filteredRecords
                                    scope.sort();  //sortedRecords
                                    scope.pagedList();   //mcDisplayRecords
                                    scope.safeApply();
                                }else{
                                    scope.fetchForDynamic();
                                }

                            },500));
                            // filterTD.find("input").on("keyup", function (event) {
                            //     var header = $(this).data("mc");
                            //     scope.headers[header.column].filter = $(this).val();
                            //     scope.mcPageNumber = 1;
                            //
                            //     if(scope.mcRecordType == "static"){
                            //         scope.applyFilter(); //filteredRecords
                            //         scope.sort();  //sortedRecords
                            //         scope.pagedList();   //mcDisplayRecords
                            //         scope.safeApply();
                            //     }else{
                            //         scope.fetchForDynamic();
                            //     }
                            //
                            // })
                        }else if(filterTD.find("select").length > 0){
                            filterTD.find("select").data("mc", header);



                            filterTD.find("select").on("change", scope.debounce(function (event) {
                                var header = $(this).data("mc");
                                scope.headers[header.column].filter = $(this).val();
                                scope.mcPageNumber = 1;

                                if(scope.mcRecordType == "static"){
                                    scope.applyFilter(); //filteredRecords
                                    scope.sort();  //sortedRecords
                                    scope.pagedList();   //mcDisplayRecords
                                    scope.safeApply();
                                }else{
                                    scope.fetchForDynamic();
                                }
                            }, 500));


                            // filterTD.find("select").on("change", function (event) {
                            //     var header = $(this).data("mc");
                            //     scope.headers[header.column].filter = $(this).val();
                            //     scope.mcPageNumber = 1;
                            //
                            //     if(scope.mcRecordType == "static"){
                            //         scope.applyFilter(); //filteredRecords
                            //         scope.sort();  //sortedRecords
                            //         scope.pagedList();   //mcDisplayRecords
                            //         scope.safeApply();
                            //     }else{
                            //         scope.fetchForDynamic();
                            //     }
                            // })
                        }
                    }

                });

                $(element).find("thead tr.mcTableHeader th")

            };
            

            
            scope.handleColumns();

            scope.handleCount();
            scope.updateCount(null);

            scope.handleFilterIcon();

            scope.$watch('mcStaticLoadingInProgress', function (newValue, oldValue, scope) {
                scope.handleSpinner(element, scope.mcStaticLoadingInProgress, true);
            });

        },
        controller: function ($scope, $element, userSettingsHandler) {

            //---------------------------------------------------------------------------------------
            //If pageSize and pageSizes are not provided explicitly, load them from UserSettings
            if($scope.mcPageSizeInput){
                $scope.mcPageSize = $scope.mcPageSizeInput;
            }else{
                $scope.mcPageSize  = parseInt(userSettingsHandler.get("countPerTable"));
            }
            if($scope.mcPageSizesInput){
                $scope.mcPageSizes = $scope.mcPageSizesInput;
            }else{
                $scope.mcPageSizes = userSettingsHandler.get("counts");
            }

            if($scope.mcPageNumber == null || $scope.mcPageNumber === undefined){
                $scope.mcPageNumber = 1;
            }
            //---------------------------------------------------------------------------------------

            $scope.mcTableHandler = $scope;


            $scope.getAbsoluteIndex = function(index){
                return (($scope.mcPageNumber-1) * $scope.mcPageSize) + index;
            };

            $scope.handleSpinner = function (element, loading, showFakeRows) {
                var tableContainer  = $(element).find("div.mcTableContainer");
                var tablePagination = $(element).find("div.paginationContainer");


                var table = $(tableContainer).find("table");
                var tbody = $(tableContainer).find("table tbody");
                var paginationContainer = $(element).find("div.paginationContainer");

                if(loading == true){
                    var spinner =
                        '<div class="spinner" style="position: absolute;top:0;left: 0;background-color: grey;width:100%;height: 100%;opacity: 0.2;">'+
                        '</div>'+
                        '<div class="spinner" style="position: absolute;top:0;left: 0;background-color: transparent;width:100%;height: 100%;">'+
                        '<div style="position: absolute;top:30%;left:40%;">'+
                        '<a style="font-size: 75px;color: #205081;">'+
                        '<i class="fa fa-refresh fa-spin"></i>'+
                        '</a>'+
                        '</div>'+
                        '</div>';

                        if(showFakeRows){
                            $(tbody).hide();
                            $(paginationContainer).hide();
                            var fakeBody = $("<tbody class='fakeBody'></tbody>");
                            for (var i = 0; i < $scope.mcPageSize; i++) {
                                var fakeRow = $("<tr class='fakeRow'></tr>");
                                //show some fake rows
                                for (var header in $scope.headers) {
                                    if ($scope.headers.hasOwnProperty(header)) {
                                        fakeRow.append($("<td style='height: 30px;'><div style='line-height: 20px;'></div></td>"));
                                    }
                                }
                                fakeBody.append(fakeRow);
                            }
                            table.append(fakeBody);
                        }
                        $(tablePagination).find("li").addClass('disabled');
                        tableContainer.append($(spinner));
                }
                else{
                    $(tablePagination).find("li").removeClass('disabled');
                    $(tableContainer).find("div.spinner").remove();
                    if(showFakeRows){
                        $(table).find("tbody.fakeBody").remove();
                        $(tbody).show();
                        $(paginationContainer).show();
                    }
                }
            };



            $scope.getFilterValues = function () {
                var filterStr = "";
                for (var h in $scope.headers) {
                    if ($scope.headers.hasOwnProperty(h)) {
                        if($scope.headers[h].filterable && $scope.headers[h].filter.trim().length > 0){
                            filterStr += $scope.headers[h].column+"="+$scope.headers[h].filter+"&";
                        }
                    }
                }
                if(filterStr.length>0){
                    filterStr = filterStr.slice(0, - 1)
                }
                return filterStr;
            };


            $scope.firstFetch = true;
            $scope.fetchForDynamic = function(){

                $scope.handleSpinner($element, true, $scope.firstFetch);
                var offset = $scope.mcPageSize * ($scope.mcPageNumber-1);
                var filters = $scope.getFilterValues();
                var r = $scope.mcFetchMethod($scope.mcPageSize, offset, $scope.sortBy, $scope.sortType, filters);
                r.then(function (data) {
                    
                    $scope.handleSpinner($element, false, $scope.firstFetch);
                    $scope.firstFetch = false;

                    $scope.totalItemCount   = data.count;
                    $scope.mcDisplayRecords = data.items;

                    //$scope.handleCheckbox();
                    if($($element).find("input.checkboxAll")) {
                        $($element).find("input.checkboxAll").prop('checked', false);
                    }

                    if($scope.mcOnFetchCalled){
                        $scope.mcOnFetchCalled(data);
                    }
                    $scope.pagedList();   //mcDisplayRecords
                    $scope.safeApply();
                },function (error) {
                    $scope.handleSpinner($element, false, $scope.firstFetch);
                });
            };

            $scope.$watch('mcOriginalRecords.length', function (newValue, oldValue, scope) {
                if(scope.mcRecordType == 'static') {
                    $scope.applyFilter(); //filteredRecords
                    $scope.sort();        //sortedRecords
                    $scope.pagedList();   //mcDisplayRecords
                    $scope.safeApply();
                }
            });

            //if it's dynamic, then call fetch
            if($scope.mcRecordType == 'dynamic'){

                $scope.fetchForDynamic();
            }

            // $scope.handleCheckbox = function () {
            //     if($scope.mcHasCheckbox){
            //         angular.forEach($scope.mcDisplayRecords, function (mcDisplayRecord, index) {
            //             $scope.$watch('mcDisplayRecords['+index+'].checked', function (newValue, oldValue, scope) {
            //                 if(newValue === true){
            //                     $scope.showDeleteAllButton = true;
            //                 }else if (newValue === false){
            //                     $scope.showDeleteAllButton = false;
            //                     angular.forEach($scope.mcDisplayRecords, function (record) {
            //                         if(record.checked === true){
            //                             $scope.showDeleteAllButton = true;
            //                             return;
            //                         }
            //                     });
            //                 }
            //             });
            //         });
            //
            //     }
            // };

            $scope.applyFilter = function () {
                if ($scope.mcRecordType == "static") {
                    var records = angular.copy($scope.mcOriginalRecords);
                    for (var header in $scope.headers) {
                        if ($scope.headers.hasOwnProperty(header)) {
                            var filter = $scope.headers[header].filter;
                            var column = $scope.headers[header].column;

                            if (filter && filter.length > 0) {
                                records = records.filter(function (item) {
                                    if ((item[column] + "").toLowerCase().indexOf((filter + "").toLowerCase()) == -1) {
                                        return false;
                                    }
                                    return true;
                                });
                            }
                        }
                    }
                    $scope.filteredRecords = angular.copy(records);
                }else{

                }
            };

            $scope.sort = function () {
                if($scope.mcRecordType == 'static'){
                    if($scope.sortType == "" || !$scope.sortBy){
                        $scope.sortedRecords = angular.copy($scope.filteredRecords);
                        return;
                    }
                    $scope.sortedRecords = angular.copy($scope.filteredRecords);
                    $scope.sortedRecords.sort(function (a, b) {

                        if ($scope.headers[$scope.sortBy].type == "number") {
                            if($scope.sortBy.indexOf('.') != -1){
                                a = parseInt($scope.sortBy.split('.').reduce(function(obj,i) {return obj[i]}, a));
                                b = parseInt($scope.sortBy.split('.').reduce(function(obj,i) {return obj[i]}, b));
                            }else{
                                a = parseInt(a[$scope.sortBy]);
                                b = parseInt(b[$scope.sortBy]);
                            }
                            return $scope.sortType == "asc" ? a - b : b - a
                        }
                        else if ($scope.headers[$scope.sortBy].type == "string") {
                            if($scope.sortBy.indexOf('.') != -1){
                                a = $scope.sortBy.split('.').reduce(function(obj,i) {return obj[i]}, a).trim().toLowerCase();
                                b = $scope.sortBy.split('.').reduce(function(obj,i) {return obj[i]}, b).trim().toLowerCase();
                            }else{
                                a = (a[$scope.sortBy] + "").trim().toLowerCase();
                                b = (b[$scope.sortBy] + "").trim().toLowerCase();
                            }
                            var result = 0;
                            if (a > b) {
                                result = 1;
                            } else if (a < b) {
                                result = -1;
                            }
                            return $scope.sortType == "asc" ? result : -result;
                        }
                    });
                }else{
                    $scope.fetchForDynamic();
                }
            };

            $scope.pagedList = function () {
                if ($scope.mcRecordType == 'static') {

                    $scope.totalItemCount =  $scope.sortedRecords == null ? 0 : $scope.sortedRecords.length;

                    $scope.pageCount = $scope.totalItemCount > 0 ? Math.ceil($scope.totalItemCount / $scope.mcPageSize) : 0;


                    $scope.hasPreviousPage = $scope.mcPageNumber > 1;
                    $scope.hasNextPage = $scope.mcPageNumber < $scope.pageCount;


                    $scope.isFirstPage = $scope.mcPageNumber == 1;
                    $scope.isLastPage = $scope.mcPageNumber >= $scope.pageCount;


                    $scope.firstItemOnPage = ($scope.mcPageNumber - 1) * $scope.mcPageSize + 1;
                    $scope.numberOfLastItemOnPage = $scope.firstItemOnPage + $scope.mcPageSize - 1;


                    $scope.lastItemOnPage = $scope.numberOfLastItemOnPage > $scope.totalItemCount
                        ? $scope.totalItemCount
                        : $scope.numberOfLastItemOnPage;

                    $scope.updateCount($scope.sortedRecords.length);
                    $scope.mcDisplayRecords = $scope.sortedRecords.slice().splice($scope.firstItemOnPage - 1, $scope.mcPageSize);


                    $scope.pages = [];
                    if ($scope.pageCount > 7) {

                        if ($scope.isFirstPage || $scope.mcPageNumber < 7) {
                            for (var i = 0; i < 7; i++) {
                                $scope.pages.push(i + 1);
                            }
                            $scope.pages.push("...");
                            $scope.pages.push($scope.pageCount);
                        } else if ($scope.isLastPage || $scope.mcPageNumber > $scope.pageCount - 5) {
                            $scope.pages.push(1);
                            $scope.pages.push("...");
                            for (var i = $scope.pageCount - 5; i <= $scope.pageCount; i++) {
                                $scope.pages.push(i);
                            }
                        } else {

                            $scope.pages.push(1);
                            $scope.pages.push("...");


                            $scope.pages.push($scope.mcPageNumber - 1);
                            $scope.pages.push($scope.mcPageNumber);
                            $scope.pages.push($scope.mcPageNumber + 1);


                            $scope.pages.push("...");
                            $scope.pages.push($scope.pageCount);
                        }

                    } else {
                        for (var i = 0; i < $scope.pageCount; i++) {
                            $scope.pages.push(i + 1);
                        }
                    }
                }
                else if ($scope.mcRecordType == 'dynamic') {

                    

                    $scope.pageCount = $scope.totalItemCount > 0 ? Math.ceil($scope.totalItemCount / $scope.mcPageSize) : 0;

                    $scope.hasPreviousPage = $scope.mcPageNumber > 1;
                    $scope.hasNextPage = $scope.mcPageNumber < $scope.pageCount;


                    $scope.isFirstPage = $scope.mcPageNumber == 1;
                    $scope.isLastPage = $scope.mcPageNumber >= $scope.pageCount;


                    $scope.firstItemOnPage = ($scope.mcPageNumber - 1) * $scope.mcPageSize + 1;
                    $scope.numberOfLastItemOnPage = $scope.firstItemOnPage + $scope.mcPageSize - 1;


                    $scope.lastItemOnPage = $scope.numberOfLastItemOnPage > $scope.totalItemCount
                        ? $scope.totalItemCount
                        : $scope.numberOfLastItemOnPage;

                    $scope.updateCount($scope.totalItemCount);


                    $scope.pages = [];
                    if ($scope.pageCount > 7) {

                        if ($scope.isFirstPage || $scope.mcPageNumber < 7) {
                            for (var i = 0; i < 7; i++) {
                                $scope.pages.push(i + 1);
                            }
                            $scope.pages.push("...");
                            $scope.pages.push($scope.pageCount);
                        } else if ($scope.isLastPage || $scope.mcPageNumber > $scope.pageCount - 5) {
                            $scope.pages.push(1);
                            $scope.pages.push("...");
                            for (var i = $scope.pageCount - 5; i <= $scope.pageCount; i++) {
                                $scope.pages.push(i);
                            }
                        } else {

                            $scope.pages.push(1);
                            $scope.pages.push("...");


                            $scope.pages.push($scope.mcPageNumber - 1);
                            $scope.pages.push($scope.mcPageNumber);
                            $scope.pages.push($scope.mcPageNumber + 1);


                            $scope.pages.push("...");
                            $scope.pages.push($scope.pageCount);
                        }

                    } else {
                        for (var i = 0; i < $scope.pageCount; i++) {
                            $scope.pages.push(i + 1);
                        }
                    }
                }
            };


            this.getScope = function () {
                return $scope;
            };

            this.pageSizeClicked = function (selectedPageSize) {
                $scope.mcPageSize = selectedPageSize;
                $scope.mcPageNumber = 1;
                if($scope.mcRecordType == 'static') {
                    $scope.pagedList();
                }else{
                    $scope.fetchForDynamic();
                }
            };


            this.nextPage = function () {
                if ($scope.isLastPage) {
                    return;
                }
                $scope.mcPageNumber = $scope.mcPageNumber + 1;
                this.selectPage($scope.mcPageNumber);
            };

            this.previousPage = function () {
                if ($scope.isFirstPage) {
                    return;
                }
                $scope.mcPageNumber = $scope.mcPageNumber - 1;
                this.selectPage($scope.mcPageNumber);
            };


            this.selectPage = function(page){
                if (page == "...") {
                    return;
                }
                
                $scope.mcPageNumber = page;
                if($scope.mcRecordType == 'static') {
                    $scope.pagedList();
                }else{
                    $scope.fetchForDynamic();
                }
            };



            $scope.safeApply = function(fn) {
                var phase = $scope.$root.$$phase;
                if(phase == '$apply' || phase == '$digest') {
                    if(fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    $scope.$apply(fn);
                }
            };
        }
    };
});





angular.module('directives').directive('mcTablePagination', function () {
    return {
        restrict: 'E',
        require: '^mcTable',
        scope:{
            displayRecords: '='
        },
        templateUrl: './mcTablePagination.html',
        link: function (scope, element, attrs, mcTableCtrl) {

            scope.safeApply = function(fn) {
                var phase = scope.$root.$$phase;
                if(phase == '$apply' || phase == '$digest') {
                    if(fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    scope.$apply(fn);
                }
            };

            scope.$watch('displayRecords', function (newValue, oldValue, scope) {
                scope.loadParentScope();
            });


            scope.loadParentScope = function () {
                var parentScope = mcTableCtrl.getScope();
                scope.mcDisplayRecords  = parentScope.mcDisplayRecords;
                scope.mcOriginalRecords = parentScope.mcOriginalRecords;
                scope.sortedRecords = parentScope.sortedRecords;

                scope.pages = parentScope.pages;
                scope.mcPageSize = parentScope.mcPageSize;
                scope.mcPageSizes = parentScope.mcPageSizes;
                scope.mcPageNumber = parentScope.mcPageNumber;
                scope.totalItemCount = parentScope.totalItemCount;
                scope.pageCount = parentScope.pageCount;
                scope.hasPreviousPage = parentScope.hasPreviousPage;
                scope.hasNextPage = parentScope.hasNextPage;
                scope.isFirstPage = parentScope.isFirstPage;
                scope.isLastPage = parentScope.isLastPage;
                scope.firstItemOnPage = parentScope.firstItemOnPage;
                scope.numberOfLastItemOnPage = parentScope.numberOfLastItemOnPage;
                scope.lastItemOnPage = parentScope.lastItemOnPage;
                scope.totalItemCount = parentScope.totalItemCount;
                scope.numberOfLastItemOnPage = parentScope.numberOfLastItemOnPage;
                scope.pages = parentScope.pages;
                scope.safeApply();
            };


            scope.pageSizeClicked = function (selectedPageSize) {
                mcTableCtrl.pageSizeClicked(selectedPageSize);
                scope.loadParentScope();
            };

            scope.nextPage = function () {
                mcTableCtrl.nextPage();
                scope.loadParentScope();
            };

            scope.previousPage = function () {
                mcTableCtrl.previousPage();
                scope.loadParentScope();
            };

            scope.selectPage = function(page){
                mcTableCtrl.selectPage(page);
                scope.loadParentScope();
            };


            scope.loadParentScope();

        }
        // controller: ['$scope', '$rootScope', 'resources', function ($scope, $rootScope, resources) {
        //     
        // }]
    };
});


angular.module('directives').directive('mcTableButton', function () {
    return {
        restrict: 'E',
        require: '^mcTable',
        templateUrl: './mcTableButton.html',
        scope: {
            record:"=",
            index:"=",
            hideDelete:"=",
            hideEdit:"=",
            save:"&",
            cancelEdit:"&",
            onEdit:"&",
            delete:"&",
            validate:"&"
        },
        link: function (scope, element, attrs, mcTableCtrl) {

            if(scope.save) {
                scope.save = scope.save();
            }

            if(scope.delete) {
                scope.delete = scope.delete();
            }

            if(scope.validate) {
                scope.validate = scope.validate();
            }

            if(scope.cancelEdit) {
                scope.cancelEdit = scope.cancelEdit();
            }

            if(scope.onEdit){
                scope.onEdit = scope.onEdit();
            }

        },
        controller: function ($scope) {

            $scope.saveClicked = function (record, index) {
                if(!$scope.validate){
                    $scope.save(record, index);
                    return;
                }
                if($scope.validate(record, index)){
                    $scope.save(record, index);
                    return;
                }
            };

            $scope.editClicked = function (record, index) {
                record.inEdit=true;
                record.edit= angular.copy(record);
                if($scope.onEdit){
                    $scope.onEdit(record, index);
                }

                $scope.safeApply();
            };

            $scope.editCancelled = function (record, index) {
                record.inEdit=undefined;
                record.edit=undefined;

                if($scope.cancelEdit){
                    $scope.cancelEdit(record, index);
                }
                $scope.safeApply();
            };

            $scope.deleteClicked = function (record, index) {
                record.inDelete=true;
                $scope.safeApply();
            };

            $scope.deleteCancelled = function (record, index) {
                record.inDelete=undefined;
                $scope.safeApply();
            };

            $scope.deleteApproved = function (record, index) {
                if($scope.delete) {
                    $scope.delete(record, index);
                }
            };

            $scope.safeApply = function(fn) {
                var phase = $scope.$root.$$phase;
                if(phase == '$apply' || phase == '$digest') {
                    if(fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    $scope.$apply(fn);
                }
            };
        }
    }
});


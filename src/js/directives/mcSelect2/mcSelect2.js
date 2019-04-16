angular.module('directives').directive('mcSelect2', function ($document, validator) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            valueType: "=", //static, dynamic
            multiSelect:"=", // true, false
            staticValues: "=",
            showAllStaticValues: "=",
            width: "=",
            record: "=",

            hasError:"=",
            minInputLength:"=",

            defaultValue: "=",

            idProperty: "=",
            displayProperty: "=",
            searchProperty: "=",

            onSelect: "&",
            onTextUpdated: "&",
            loadDynamicValues: "&",
            acceptTypedInput: "=",
            processing:"=",
            loadAllOnClick:"=",
            defaultPlaceholder:"=",
            doNotCloseOnSelect: "=",
            extraCssClass:"="
        },
        templateUrl: './mcSelect2.html',
        link: function (scope, element, attrs, ctrl, transclude) {
            scope.pagination = {
                offset:-1,
                count:0
            };
            scope.showCaret = true;
            var width = "200px";
            if (scope.width) {
                width = scope.width;
            }
            scope.inputStyle = {"width": width, 'padding':'6px 40px 6px 12px'};
            scope.holderStyle = {"width": width, 'background-color':'#FFF'};

            scope.setDefaultValue = function () {
                if(scope.defaultValue){

                    if(scope.multiSelect === true){
                        scope.selectedValue =  scope.defaultValue;
                    }else{
                        //if it is an object
                        if(typeof scope.defaultValue === 'object'){
                            scope.selectedValue =  scope.defaultValue;
                            var value = validator.getProperty(scope.selectedValue, scope.displayProperty);
                            scope.inputText = value;//scope.selectedValue[scope.displayProperty];
                        }else{
                            //if it is not an object, create a default object for it
                            scope.inputText = scope.defaultValue;
                            scope.selectedValue = {};
                            scope.selectedValue[scope.idProperty] = -1;
                            scope.selectedValue[scope.searchProperty] = scope.inputText;
                        }
                    }
                }
            };

            scope.setDefaultValue();

            scope.onClick = function (event) {

                if(scope.processing){
                    return;
                }

                //if clicking on input
                if (jQuery(event.target).is(jQuery(element).find("#input")) ||
                    jQuery(event.target).is(jQuery(element).find("i.mcSelect2"))) {

                    if(scope.valueType === "static"){
                        //load all values
                        scope.displayValues = angular.copy(scope.staticValues);
                        //clear the input
                        //angular.element(element).find("#input").val("");
                        angular.element(element).find("#input").trigger("focus");

                        scope.addToUI();
                        scope.show = true;
                        event.stopPropagation();
                    }else{
                        //clear the input
                        //angular.element(element).find("#input").val("");
                        angular.element(element).find("#input").trigger("focus");
                        scope.showCaret = false;
                        angular.element(element).find("#input").attr("placeholder", (scope.defaultPlaceholder ? scope.defaultPlaceholder : "Search..."));

                        if(scope.loadAllOnClick) {
                            scope.inputText = "";
                            scope.textUpdated();
                        }
                    }

                } else {

                    scope.showCaret = true;
                    angular.element(element).find("#input").attr("placeholder",(scope.defaultPlaceholder ? scope.defaultPlaceholder : ""));

                    if(scope.multiSelect === true){
                        //clear the input
                        scope.inputText = "";
                        angular.element(element).find("#input").val("");
                        scope.show = false;
                    }else {
                        //if we have selected element, show it
                        if (scope.selectedValue && scope.selectedValue[scope.idProperty] !== -1) {
                            var value = validator.getProperty(scope.selectedValue, scope.displayProperty);
                            angular.element(element).find("#input").val(value);
                        } else if( scope.acceptTypedInput === true && scope.inputText.trim().length !== 0 ){

                            angular.element(element).find("#input").val(scope.inputText);
                        }else{
                            //clear the input
                            scope.inputText = "";
                            angular.element(element).find("#input").val("");
                        }
                        scope.show = false;
                    }
                }
                scope.safeApply();
            };

            $document.on('click', scope.onClick);
            scope.$on('$destroy', function () {
                $document.off('click', scope.onClick);
            });

            scope.onInputKeyDown = function(event) {
                //if Escape is pressed, then close the div
                if(event.keyCode === 27){
                    scope.show = false;
                    scope.safeApply();
                }else if(event.keyCode === 40){ //down arrow key
                    if(scope.displayValues && scope.displayValues.length === 0){
                        return false;
                    }

                    var elements = jQuery(jQuery(element).find(".mcSelectItem"));
                    var currentElement = jQuery(jQuery(element).find(".mcSelectItem.current"));

                    if(currentElement.length > 0){
                        var nextElement = jQuery(currentElement).next(".mcSelectItem");
                        if(nextElement.length === 0){
                            return
                        }
                        jQuery(currentElement).removeClass("current");
                        nextElement.addClass("current");

                        var elPosition = scope.elementPositionInHolder(nextElement);
                        var elHeight = nextElement.outerHeight();
                        var holderHeight = jQuery(element).find("div.mcSelectHolder").height();

                        if(elPosition + elHeight > holderHeight){
                            jQuery(element).find("div.mcSelectHolder").scrollTop(elPosition);
                        }

                    }else{
                        jQuery(elements[0]).addClass("current");
                    }
                }else if(event.keyCode === 38){ //UP arrow key
                    if(scope.displayValues && scope.displayValues.length === 0){
                        return false;
                    }

                    var elements = jQuery(jQuery(element).find(".mcSelectItem"));
                    var currentElement = jQuery(jQuery(element).find(".mcSelectItem.current"));

                    if(currentElement.length > 0){
                        var prevElement = jQuery(currentElement).prev(".mcSelectItem");
                        if(prevElement.length === 0){
                            return
                        }
                        jQuery(currentElement).removeClass("current");
                        prevElement.addClass("current");

                        var elPosition = scope.elementPositionInHolder(prevElement);
                        var holderScrollTop = jQuery(element).find("div.mcSelectHolder").scrollTop();

                        if(elPosition < holderScrollTop){
                            jQuery(element).find("div.mcSelectHolder").scrollTop(elPosition);
                        }

                    }else{
                        jQuery(elements[0]).addClass("current");
                    }
                } else if (event.keyCode === 13){
                    var currentElement = jQuery(jQuery(element).find(".mcSelectItem.current"));
                    var value = jQuery(currentElement).data("mc");
                    scope.onElementSelect(value);
                    scope.show = false;
                }
            };

            scope.elementPositionInHolder = function (el) {
                var fromTop = 0;
                var allPreviousElements = jQuery(el).prevAll(".mcSelectItem");
                angular.forEach(allPreviousElements,function (prev) {
                    fromTop += jQuery(prev).height() + 10; //10: [3(padding) + 2(margin)]*2(up and bottom)
                });
                return fromTop;
            };

            //Bind mcSelectHolder scroll event for loading more when in dynamic mode
            //https://stackoverflow.com/a/33906942/3426603
            angular.element(element).find(".mcSelectHolder").bind('scroll', function(event){
               var div = jQuery(this);
                //console.log(div.scrollTop()+' + '+ div.height()+' = '+ (div.scrollTop() +  div.height())   +' _ '+ div[0].scrollHeight  );
                //if(div.scrollTop() + div.height() == div[0].scrollHeight){
                //loadMore when getting 300px from bottom of the scrollable div
                if(div.scrollTop() + div.height() + 300  >= div[0].scrollHeight){
                    //console.log('bottom found');
                    scope.loadMore();
                }
            });
        },
        controller: function ($element, $scope, $q, $transclude) {


            $scope.$watch("defaultValue", function (newVal, oldVal, scope) {
                if (newVal !== undefined && newVal != null){
                    $scope.setDefaultValue();
                }
            });


            if ($scope.multiSelect === true) {
                //we expect defaultValue to be an array
                if (!Array.isArray($scope.defaultValue) && $scope.defaultValue) {
                    $scope.defaultValue = [$scope.defaultValue];
                }
            } else {
                $scope.selectedValue = $scope.defaultValue;
            }

            $scope.loadingDynamicData = false;
            $scope.inputText = "";
            $scope.displayValues = angular.copy($scope.staticValues);
            $scope.show = $scope.showAllStaticValues;
            if ($scope.onSelect) {
                $scope.onSelect = $scope.onSelect();
            }

            if ($scope.onTextUpdated) {
                $scope.onTextUpdated = $scope.onTextUpdated();
            }

            if ($scope.loadDynamicValues) {
                $scope.loadDynamicValues = $scope.loadDynamicValues();
            }

            $scope.onElementSelect = function (selectedElement) {
                if($scope.multiSelect == true) {
                    $scope.selectedValue = $scope.selectedValue || [];
                    //if it doesn't exist, then add it
                    var found = false;
                    for (var i = 0; i < $scope.selectedValue.length && !found; i++) {
                        if(selectedElement[$scope.idProperty] === $scope.selectedValue[i][$scope.idProperty]){
                            found = true;
                        }
                    }
                    if(!found){
                        $scope.selectedValue.push(selectedElement);
                    }
                }else{
                    $scope.selectedValue = selectedElement;
                }

                if ($scope.onSelect) {
                    $scope.onSelect($scope.selectedValue, $scope.record);
                }

            };

            $scope.textUpdated = function () {
                if ($scope.onTextUpdated) {
                    $scope.onTextUpdated($scope.inputText,  $scope.record);
                }

                $scope.pagination = {
                    offset:-1,
                    count:0
                };

                var searchText = $scope.inputText;

                if($scope.minInputLength && $scope.inputText.trim().length < $scope.minInputLength){
                    searchText = "";
                }

                $scope.filterValues(searchText).then(function (result) {
                    $scope.show = true;
                    $scope.displayValues = result;

                    $scope.addToUI();


                    if ($scope.acceptTypedInput) {
                        var selected = {};
                        selected[$scope.searchProperty] = $scope.inputText;
                        if ($scope.idProperty) {
                            selected[$scope.idProperty] = -1;
                        }
                        $scope.onElementSelect(selected);
                    }
                    $scope.safeApply();
                });
            };

            $scope.filterValues = function (inputValue) {
                var found = [];
                var deferred = $q.defer();

                if ($scope.valueType === "static") {
                    if (inputValue.trim().length === 0) {
                        deferred.resolve($scope.staticValues);
                    }
                    angular.forEach($scope.staticValues, function (staticValue) {
                        if (staticValue[$scope.searchProperty].toLowerCase().indexOf(inputValue.toLowerCase()) > -1) {
                            found.push(staticValue);
                        }
                    });
                    deferred.resolve(found);
                }else  if ($scope.valueType === "dynamic") {
                    if ((inputValue && inputValue.trim().length === 0) || !$scope.loadDynamicValues) {
                        deferred.resolve([]);
                        return deferred.promise;
                    }


                    var loadAll = false;
                    if(!inputValue && $scope.loadAllOnClick){
                        loadAll = true;
                    }

                    var query;
                    if(loadAll){
                        query = $scope.loadDynamicValues(inputValue, loadAll);
                    }else{
                        query = $scope.loadDynamicValues(inputValue);
                    }


                    $scope.loadingDynamicData = true;
                    query.then(function (result) {

                        if(result.offset != null && result.offset !== undefined){
                            $scope.pagination.offset = result.offset;
                        }

                        if(result.limit != null && result.limit !== undefined){
                            $scope.pagination.limit = result.limit;
                        }

                        if(result.count != null && result.count !== undefined){
                            $scope.pagination.count = result.count;
                        }

                        deferred.resolve(result.results);
                        $scope.loadingDynamicData = false;
                    }, function (error) {
                        $scope.loadingDynamicData = false;
                    });

                }
                return deferred.promise;
            };

            $scope.loadMore = function () {
                //if dynamic and is not loading
                //if it's loading, so do not load it again
                if ($scope.valueType === "dynamic" && $scope.loadingDynamicData === false){

                    // console.log("In loadMore");

                    var loadedSoFar = $scope.pagination.offset + $scope.pagination.limit;
                    if(loadedSoFar > 0 && $scope.pagination.count <= loadedSoFar){
                        return;
                    }

                    var inputValue = $scope.inputText;
                    $scope.loadingDynamicData = true;
                    $scope.safeApply();

                    $scope.pagination.offset += $scope.pagination.limit;

                    // console.log("loadMore......");
                    $scope.loadDynamicValues(inputValue, $scope.pagination.offset).then(function (result) {
                        // console.log("done");
                        $scope.pagination.limit = result.limit;
                        $scope.pagination.count = result.count;

                        //append to $scope.displayValues
                        $scope.displayValues = $scope.displayValues.concat(result.results);
                        $scope.appendToUI(result.results);
;
                        $scope.loadingDynamicData = false;
                        $scope.safeApply();
                    }, function (error) {
                        $scope.loadingDynamicData = false;
                        $scope.safeApply();
                    })
                }
            };

            $scope.remove = function (event, element) {
                if($scope.processing){
                    return;
                }

                if($scope.multiSelect){
                    var found = false;
                    for (var i = 0; i < $scope.selectedValue.length && !found; i++) {
                        if(element[$scope.idProperty] === $scope.selectedValue[i][$scope.idProperty]){
                            $scope.selectedValue.splice(i,1);
                            break;
                        }
                    }
                    if ($scope.onSelect) {
                        $scope.onSelect($scope.selectedValue, $scope.record);
                    }
                }else{
                    $scope.selectedValue = null;
                    $scope.inputText = "";
                    angular.element($element).find("#input").val("");

                    if ($scope.onSelect) {
                        $scope.onSelect(null, $scope.record);
                    }
                }

                event.stopPropagation();
                return false;
            };

            $scope.addToUI = function () {
                $element.find("div.mcSelectHolder").children().remove();

                if(!$scope.displayValues){
                    return;
                }

                $scope.displayValues.forEach(function(value) {
                    $transclude(function(transEl, transScope) {
                        angular.element(transEl).addClass("mcSelectItem");
                        jQuery(transEl).data("mc",value);
                        angular.element(transEl).on("click", function (event) {

                            if($scope.doNotCloseOnSelect){
                                event.preventDefault();
                                event.stopPropagation();
                                $scope.show = true;
                            }else{
                                $scope.show = false;
                            }

                            $scope.onElementSelect(transScope.$item);
                            $scope.loadingDynamicData = false;
                            $scope.safeApply();
                        });
                        transScope.$item = value;
                        transScope.$inputText = $scope.inputText ? $scope.inputText.replace(/\"/g,"") : "";//remove any quote
                        $element.find("div.mcSelectHolder").append(transEl);
                    });
                });
            };

            $scope.appendToUI = function (items) {
                items.forEach(function(value) {
                    $transclude(function(transEl, transScope) {
                        angular.element(transEl).addClass("mcSelectItem");
                        jQuery(transEl).data("mc",value);
                        angular.element(transEl).on("click", function (event) {
                            if($scope.doNotCloseOnSelect){
                                event.preventDefault();
                                event.stopPropagation();
                                $scope.show = true;
                            }else{
                                $scope.show = false;
                            }
                            $scope.onElementSelect(transScope.$item);
                            $scope.loadingDynamicData = false;
                            $scope.safeApply();

                        });
                        transScope.$item = value;
                        transScope.$inputText = $scope.inputText ? $scope.inputText.replace(/\"/g,"") : "";//remove any quote
                        $element.find("div.mcSelectHolder").append(transEl);
                    });
                });
            };


            $scope.getDisplayValue = function (element, displayProperty) {
                if(element) {
                    return validator.getProperty(element, displayProperty);
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







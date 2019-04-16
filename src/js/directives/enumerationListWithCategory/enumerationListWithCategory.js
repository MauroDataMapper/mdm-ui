angular.module('directives').directive('mcEnumerationListWithCategory', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            parent: "=", //the parent dataType
            clientSide: "@", //if true, it should NOT pass values to the serve in save/update/delete/reOrder
            enumerationValues: "=",
            onUpdate: "="
        },
        templateUrl: './enumerationListWithCategory.html',
        link: function (scope, iElement, iAttrs, ctrl) {

            scope.applySortable = function () {

                var sortableApplied =  $(iElement).find("tbody.sortable").hasClass('ui-sortable');

                //do not use Order on client side mode for now
                if(scope.clientSide && sortableApplied){
                    $(iElement).find("tbody.sortable").hasClass('ui-sortable');
                    return;
                }


                $(iElement).find("tbody.sortable").sortable({
                    cursor: "move",
                    handle: 'i.handle',
                    classes: {
                        "ui-sortable": "highlight"
                    },
                    tolerance:"pointer",
                    cursorAt: { top:0, left: 0 },

                    containment: "tbody.sortable",

                    start: function (event, ui) {
                        scope.startToMove(event, ui);
                    },

                    stop: function(event, ui) {
                        scope.stopMoving(event, ui);
                    }
                });
            };


            scope.startToMove = function (event, ui) {
                $(ui.item).data("startindex", ui.item.index());
            };

            scope.stopMoving = function (event, ui) {
                //id of the dragged element
                var enumId   = ui.item.attr("id");
                //var index = ui.item.attr("data-index");
                //var category = ui.item.attr("data-category");
                var isNew = ui.item.attr("data-isNew");


                //new position of the dragged element
                var position = ui.item.index();
                //if start index is the same as target index
                var startIndex = ui.item.data("startindex");


                //if element is NOT moved to a new location
                if(startIndex === position){
                    event.preventDefault();
                    return false;
                }
                //if it is a new element (in edit mode), so do NOT move it
                if(isNew === "true"){
                    event.preventDefault();
                    return false;
                }

                //orderIndex of the dragged element
                //var orderIndex = ui.item.attr("data-orderIndex");
                // var itemOrder = $('tbody.sortable').sortable("toArray");
                // var allRows = $(iElement).find("tbody.sortable tr");
                //var sortType = scope.mcTableHandler.sortType

                //var indexOffset = scope.mcTableHandler.mcPageSize * (scope.mcTableHandler.mcPageNumber - 1);
                // scope.updateOrder(enumId, position+indexOffset);


                var prev = ui.item.prev("tr");
                var prevCategory = prev.attr("data-category");
                var prevIndex = prev.attr("data-index");
                var prevIsCategory = prev.attr("data-isCategoryRow");

                var next = ui.item.next("tr");
                var nextIndex = next.attr("data-index");
                var nextIsCategory = next.attr("data-isCategoryRow");


                if(prevIndex === undefined){
                    event.preventDefault();
                    return false;
                }


                var newPosition = 0;
                if(nextIsCategory === ""){
                    newPosition = parseInt(nextIndex);
                }else{
                    newPosition = parseInt(prevIndex)+1;
                }

                var newCategory = null;
                if(prevIsCategory === "true"){
                    newCategory = prevCategory;
                }else{
                    while(!newCategory && prev.length > 0){
                        prev = prev.prev("tr");
                        prevIsCategory = prev.attr("data-isCategoryRow");
                        if(prevIsCategory === "true"){
                            newCategory = prevCategory;
                        }
                    }
                }

                // if(newCategory !== category){
                //     event.preventDefault();
                //     return false;
                // }

                scope.updateOrder(enumId, newPosition, newCategory);
            };


        },

        controller: function ($scope, userSettingsHandler, securityHandler, $q, resources, messageHandler, validator) {


            $scope.currentPage = 0;
            $scope.pageSize    = userSettingsHandler.get("countPerTable");
            $scope.pageSizes = userSettingsHandler.get("counts");

            $scope.sortBy   = "group";
            $scope.sortType = "";


            $scope.$watch('enumerationValues', function (newValue, oldValue, scope) {
                if (newValue !== null && newValue !== undefined) {
                    $scope.showRecords(newValue);
                }
            });


            $scope.$watch('parent', function (newValue, oldValue, scope) {
                if (newValue !== null && newValue !== undefined) {
                    var access = securityHandler.elementAccess($scope.parent);
                    $scope.showEdit = access.showEdit;
                }
            });


            $scope.showRecords = function (values) {

                if (!values) {return;}

                $scope.categories = [];
                $scope.allRecords = [].concat(values);
                $scope.enumsCount = $scope.allRecords.length;
                $scope.hasCategory = false;
                for(var i = 0; i < $scope.allRecords.length; i++){
                    if($scope.allRecords[i] && $scope.allRecords[i].category){
                        $scope.hasCategory = true;
                        break;
                    }
                }
                var categories = _.groupBy($scope.allRecords, function(record){
                    if(record) {
                        return record.category;
                    }
                });

                var categoryNames = [];
                var hasEmptyCategory = false;
                for (var category in categories) {
                    if(category !== "null") {
                        categoryNames.push(category);
                    }else{
                        hasEmptyCategory = true;
                    }
                }

                if($scope.sortType === "asc"){
                    categoryNames = _.sortBy(categoryNames, function (i) { return i.toLowerCase();});
                }else if($scope.sortType === "desc"){
                    categoryNames = _.sortBy(categoryNames, function (i) { return i.toLowerCase();});
                    categoryNames = categoryNames.reverse();
                }


                if(hasEmptyCategory){
                    categoryNames.push("null");
                }

                $scope.allRecordsWithGroups = [];
                angular.forEach(categoryNames, function (category) {
                    categories[category] = _.sortBy(categories[category], 'index');

                    if(category!=="null") {
                        $scope.categories.push({key:category, value:category});
                    }

                    $scope.allRecordsWithGroups.push({
                        id: category !== "null" ? category : null,
                        category: category !== "null" ? category : null,
                        isCategoryRow:true
                    });
                    angular.forEach(categories[category], function (row) {
                        $scope.allRecordsWithGroups.push(row);
                    });
                }) ;

                $scope.displayItems = [];
                $scope.total = $scope.enumsCount;

                var start = $scope.pageSize * $scope.currentPage;
                var e = 0;
                var skippedCategories = 0;
                for(var i = 0; i < $scope.allRecordsWithGroups.length;i++) {

                    if(i < start+skippedCategories){

                        if($scope.allRecordsWithGroups[i].isCategoryRow){
                            skippedCategories++;
                        }
                        continue;
                    }

                    if($scope.allRecordsWithGroups[i].isCategoryRow){
                        $scope.displayItems.push($scope.allRecordsWithGroups[i]);
                        continue;
                    }

                    if(e < $scope.pageSize) {
                        $scope.displayItems.push($scope.allRecordsWithGroups[i]);
                        e++;
                    }else{
                        break;
                    }
                }

                // for(var e = start; e < start + $scope.pageSize && i < $scope.allRecordsWithGroups.length;i++) {
                //     $scope.displayItems.push($scope.allRecordsWithGroups[i]);
                //     if(!$scope.allRecordsWithGroups[i].isCategoryRow){
                //         e++;
                //     }
                // }


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

                $scope.safeApply();
            };


            $scope.next = function () {
                var pageCount = Math.floor($scope.total / $scope.pageSize);
                var lastPage  = Math.floor($scope.total % $scope.pageSize)>0 ? 1 : 0;
                if($scope.currentPage + 1  >= pageCount + lastPage){
                    return;
                }
                $scope.currentPage = $scope.currentPage + 1;
                $scope.showRecords($scope.allRecords);
            };
            $scope.prev = function () {
                if ($scope.currentPage === 0) {
                    return;
                }
                $scope.currentPage = $scope.currentPage - 1;
                $scope.showRecords($scope.allRecords);
            };
            $scope.pageSizeClicked = function(pageSize){
                $scope.pageSize = pageSize;
                $scope.currentPage = 0;
                $scope.showRecords($scope.allRecords);
            };

            $scope.groupSortClicked = function(){
                if($scope.sortType === "desc"){
                    $scope.sortType = "asc" ;
                }else if($scope.sortType === "asc"){
                    $scope.sortType = "" ;
                }else{
                    $scope.sortType = "desc" ;
                }
                $scope.showRecords($scope.allRecords);
            };


            $scope.add = function () {
                var newRecord = {
                    id: "temp-" + validator.guid(),
                    key: "",
                    value: "",
                    category: null,
                    edit: {
                        id: "",
                        key: "",
                        value: "",
                        category: "",
                    },
                    inEdit: true,
                    isNew: true
                };

                $scope.displayItems = [].concat([newRecord]).concat($scope.displayItems);
            };

            $scope.validate = function (record) {
                var isValid = true;
                record.edit.errors = [];

                if (record.edit['key'].trim().length === 0) {
                    record.edit.errors['key'] = "Key can't be empty!";
                    isValid = false;
                }
                if (record.edit['value'].trim().length === 0) {
                    record.edit.errors['value'] = "Value can't be empty!";
                    isValid = false;
                }
                for (var i = 0; i < $scope.allRecordsWithGroups.length; i++) {
                    if(!$scope.allRecordsWithGroups[i]){continue;}

                    if ( $scope.allRecordsWithGroups[i].isCategoryRow || record.id === $scope.allRecordsWithGroups[i].id ) {
                        continue;
                    }
                    if ( $scope.allRecordsWithGroups[i]['key'].toLowerCase().trim() === record.edit['key'].toLowerCase().trim()) {
                        record.edit.errors['key'] = "Key already exists";
                        isValid = false;
                    }
                }
                if (isValid) {
                    delete record.edit.errors;
                }
                return isValid;
            };



            $scope.editClicked = function (record) {
                record.edit = angular.copy(record);
                record.edit.errors = [];
                record.inEdit = true;
            };
            $scope.deleteClicked = function (record) {
                record.inDelete = true;
            };
            $scope.confirmDeleteClicked = function (record) {

                if ($scope.clientSide) {
                    var i = $scope.allRecords.length - 1;
                    while(i >= 0){
                        if($scope.allRecords[i].id === record.id){
                            $scope.allRecords.splice(i,1);
                        }
                        i--;
                    }
                    $scope.showRecords([].concat($scope.allRecords));
                }else{
                    resources.enumerationValues.delete($scope.parent.dataModel, $scope.parent.id , record.id)
                        .then(function () {
                            messageHandler.showSuccess('Enumeration deleted successfully.');
                            //reload all enums
                            $scope.reloadRecordsFromServer().then(function (data) {
                                $scope.showRecords(data);
                            });
                        })
                        .catch(function () {
                            messageHandler.showError('There was a problem deleting the enumeration.', error);
                        });
                }

            };
            $scope.cancelDeleteClicked = function (record) {
                record.inDelete = false;
            };
            $scope.cancelEditClicked = function (record, index) {
                if (record.isNew) {
                   $scope.allRecordsWithGroups.splice(index, 1);
                }
                record.inEdit = false;
            };
            $scope.saveClicked = function (record, index) {

                if(!$scope.validate(record)){
                    return;
                }
                var resource = {
                    key: record.edit.key,
                    value: record.edit.value,
                    category: record.edit.category,
                };
                //if clientSide is true, it should not pass details to the server
                //this is used in wizard for adding metadata items when creating a new model,class or element
                if($scope.clientSide){
                    record.key = resource.key;
                    record.value = resource.value;
                    record.category = resource.category;
                    record.inEdit = false;
                    record.isNew = false;

                    //New Record
                    if(record.id.indexOf("temp-") === 0) {
                        //find max index
                        var maxIndex = -1;
                        angular.forEach($scope.allRecords, function (item) {
                            if (item.index > maxIndex) {
                                maxIndex = item.index;
                            }
                        });
                        record.index = maxIndex + 1;
                        record.edit.index = maxIndex + 1;

                        var newRecs = [].concat($scope.allRecords);
                        newRecs.push(record);
                        $scope.showRecords(newRecs);
                    }

                    var allRecs = [].concat($scope.allRecords);
                    $scope.showRecords(allRecs);

                    if ($scope.onUpdate) {
                        $scope.onUpdate($scope.allRecords);
                    }
                    return;
                }

                //in edit mode, we save them here
                if (record.id && record.id.indexOf("temp-") !== 0) {
                    resources.enumerationValues.put($scope.parent.dataModel, $scope.parent.id , record.id, null,{resource:resource})
                        .then(function(result) {
                            if ($scope.afterSave) {
                                $scope.afterSave(resource);
                            }
                            record.key = resource.key;
                            record.value = resource.value;
                            record.category = resource.category;
                            record.inEdit = false;


                            $scope.reloadRecordsFromServer().then(function (data) {
                                $scope.showRecords(data);
                            });

                            messageHandler.showSuccess('Enumeration updated successfully.');
                        })
                        .catch(function (error) {
                            messageHandler.showError('There was a problem updating the enumeration.', error);
                        });

                } else {
                    resources.enumerationValues.post($scope.parent.dataModel, $scope.parent.id , {resource:resource})
                        .then(function(response){

                            $scope.reloadRecordsFromServer().then(function (data) {
                                $scope.showRecords(data);
                            });
                            messageHandler.showSuccess('Enumeration saved successfully.');
                        })
                        .catch(function (error) {
                            messageHandler.showError('There was a problem saving the enumeration.', error);
                        });
                }
            };

            $scope.onCategorySelect = function(selectedValue, record){
                if(selectedValue && selectedValue.key === -1){return;}
                record.category = selectedValue.key;
            };
            $scope.onCategoryTextUpdated = function(text, record){
                record.category = text;
            };



            $scope.reloadRecordsFromServer = function(){
                var deferred = $q.defer();

                resources.dataType.get($scope.parent.dataModel, $scope.parent.id).then(function (data) {
                    deferred.resolve(data.enumerationValues);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            };



            $scope.updateOrder = function (enumId, newPosition, newCategory) {

                if ($scope.clientSide) {

                    //sort it
                    var sorted = _.sortBy($scope.allRecords, 'index');

                    //find it & remove it
                    var index = 0 ;
                    angular.forEach(sorted, function (item, i) {
                        if(item.id === enumId){
                            index = i;
                        }
                    });

                    var foundRecords = sorted.splice(index, 1);
                    var record = {};
                    if(foundRecords && foundRecords.length > 0){
                        record = foundRecords[0];
                        record.category = newCategory;
                    }


                    var location = -1;
                    for(var i = 0; i < sorted.length && location === -1; i++) {
                        if( (i===0 && newPosition < sorted[i].index) ||
                            (sorted[i].index === newPosition) ||
                            (sorted[i].index < newPosition && i+1 < sorted.length && newPosition < sorted[i+1].index)){
                                record.index = newPosition;
                                // record[0].edit.index = newPosition;
                                sorted.splice(i, 0,record);
                                location = i;
                        }
                    }
                    for(var i = 0; i < sorted.length; i++) {
                        sorted[i].index = i+1;
                    }
                    $scope.showRecords(sorted);

                } else {

                    var resource = {
                        index: newPosition,
                        category: newCategory
                    };

                    resources.enumerationValues.put($scope.parent.dataModel, $scope.parent.id, enumId, null, {resource:resource}).then(function (result) {
                            $scope.reloadRecordsFromServer().then(function (data) {
                                $scope.showRecords(data);
                            });
                            messageHandler.showSuccess('Enumeration updated successfully.');
                        }).catch(function (error) {
                            messageHandler.showError('There was a problem updating the enumeration.', error);
                        });
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

            $scope.showRecords([]);

        }
    };
});
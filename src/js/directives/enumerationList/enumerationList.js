angular.module('directives').directive('mcEnumerationList', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            parent: "=", //the parent dataType

            type: "=", // static, dynamic

            enumerationValues: "=",// for static
            loadingData: "=",

            clientSide: "@" //if true, it should NOT pass values to the serve in save/update/delete
        },
        templateUrl: './enumerationList.html',
        link: function (scope, iElement, iAttrs, ctrl) {

            scope.applySortable = function () {

                var sortableApplied =  $(iElement).find("tbody.sortable").hasClass('ui-sortable');

                //do not use Order on client side mode for now
                if(scope.clientSide && sortableApplied){
                    $(iElement).find("tbody.sortable").hasClass('ui-sortable');
                    return;
                }

                //if table is in Sortable mode i.e a column is clicked for sort, DO NOT apply re-order drag/drop feature
                if(scope.mcTableHandler && scope.mcTableHandler.sortType !== "" && sortableApplied){
                    $(iElement).find("tbody.sortable").sortable("destroy");
                    return;
                }

                $(iElement).find("tbody.sortable").sortable({
                    cursor: "move",
                    handle: 'td.handle',
                    classes: {
                        "ui-sortable": "highlight"
                    },

                    placeholder: "sortable-placeholder",
                    containment: ".mcTableContainer",

                    start: function (event, ui) {
                        $(ui.item).data("startindex", ui.item.index());
                    },

                    stop: function( event, ui ) {
                        //id of the dragged element
                        var enumId = ui.item.attr("id");
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
                        if(enumId.indexOf("temp-") === 0){
                            event.preventDefault();
                            return false;
                        }

                        //orderIndex of the dragged element
                        //var orderIndex = ui.item.attr("data-orderIndex");
                        // var itemOrder = $('tbody.sortable').sortable("toArray");
                        // var allRows = $(iElement).find("tbody.sortable tr");
                        //var sortType = scope.mcTableHandler.sortType

                        var indexOffset = scope.mcTableHandler.mcPageSize * (scope.mcTableHandler.mcPageNumber - 1);
                        scope.updateOrder(enumId, position+indexOffset);
                    }
                });
            };

        },

        controller: function ($scope, securityHandler, $q, resources, messageHandler, validator) {

                if ($scope.type === 'static') {
                    $scope.loading = true;
                    $scope.records = [];

                    $scope.$watch('loadingData', function (newValue, oldValue, scope) {
                        if (newValue !== null && newValue !== undefined) {
                            $scope.loading = newValue;
                        }
                    });

                    $scope.$watch('enumerationValues', function (newValue, oldValue, scope) {
                        if (newValue !== null && newValue !== undefined) {
                            $scope.showRecords();
                        }
                    });

                }

                $scope.onEdit = function (record, index) {

                };

                $scope.showRecords = function () {
                    if ($scope.enumerationValues) {
                        $scope.records = [].concat($scope.enumerationValues);
                    }
                };

                $scope.validate = function (record) {
                    var isValid = true;
                    record.edit.errors = [];

                    if ($scope.type === 'static') {
                        if (record.edit['key'].trim().length === 0) {
                            record.edit.errors['key'] = "Key can't be empty!";
                            isValid = false;
                        }
                        if (record.edit['value'].trim().length === 0) {
                            record.edit.errors['value'] = "Value can't be empty!";
                            isValid = false;
                        }
                        for (var i = 0; i < $scope.records.length; i++) {
                            if ( record.id === $scope.records[i].id) {
                                continue;
                            }
                            if ($scope.records[i]['key'].toLowerCase().trim() === record.edit['key'].toLowerCase().trim()) {
                                record.edit.errors['key'] = "Key already exists";
                                isValid = false;
                            }
                        }
                        if (isValid) {
                            delete record.edit.errors;
                        }
                    }
                    // else {
                    //     if (record.edit['key'].trim().length === 0) {
                    //         record.edit.errors['key'] = "Key can't be empty!";
                    //         isValid = false;
                    //     }
                    //     if (record.edit['value'].trim().length === 0) {
                    //         record.edit.errors['value'] = "Value can't be empty!";
                    //         isValid = false;
                    //     }
                    //     //Call a backend service and see if it's duplicate
                    // }
                    return isValid;
                };

                $scope.add = function () {
                    var newRecord = {
                        id: "temp-" + validator.guid(),
                        key: "",
                        value: "",
                        edit: {
                            id: "",
                            key: "",
                            value: ""
                        },
                        inEdit: true,
                        isNew: true
                    };
                    if ($scope.type === 'static') {
                        $scope.records = [].concat([newRecord]).concat($scope.records);
                        return;
                    }
                    // if ($scope.type == 'dynamic') {
                    //     $scope.mcDisplayRecords = [].concat([newRecord]).concat($scope.mcDisplayRecords);
                    //     return;
                    // }

                };

                $scope.cancelEdit = function (record, index) {
                    if (record.isNew) {
                        if ($scope.type === 'static') {
                            $scope.records.splice(index, 1);
                        }
                        // if ($scope.type == 'dynamic') {
                        //     $scope.mcDisplayRecords.splice(index, 1);
                        // }
                    }
                };

                $scope.save = function (record, index) {
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
                        record.isNew  = false;
                        $scope.records[index] = record;
                        $scope.enumerationValues = $scope.records;
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
                                messageHandler.showSuccess('Enumeration updated successfully.');
                            })
                            .catch(function (error) {
                                messageHandler.showError('There was a problem updating the enumeration.', error);
                            });

                    } else {
                        resources.enumerationValues.post($scope.parent.dataModel, $scope.parent.id , {resource:resource})
							.then(function(response){
								record.id = response.id;
								record.key = response.key;
								record.value = response.value;
								record.category = response.category;
								record.inEdit = false;
								delete record.edit;

								if ($scope.type === 'static') {
									$scope.records[index] = record;
                                    messageHandler.showSuccess('Enumeration saved successfully.');
								}
							}).catch(function (error) {
                                messageHandler.showError('There was a problem saving enumeration.', error);
                        	});
                    }
                };


                $scope.delete = function (record, $index) {

                    if ($scope.clientSide) {
                        $scope.records.splice($index, 1);
                        return;
                    }

                    resources.enumerationValues.delete($scope.parent.dataModel, $scope.parent.id , record.id)
                        .then(function () {
                            if ($scope.type === 'static') {
                                $scope.records.splice($index, 1);
                                messageHandler.showSuccess('Enumeration deleted successfully.');
                            } else {
                                $scope.mcDisplayRecords.splice($index, 1);
                                messageHandler.showSuccess('Enumeration deleted successfully.');
                                $scope.mcTableHandler.fetchForDynamic();
                            }
                        })
                        .catch(function (error) {
                            messageHandler.showError('There was a problem deleting the enumeration.', error);
                        });
                };


                $scope.updateOrder = function (enumId, position) {
                    var options = {
                        queryStringParams: {
                            position: position
                        }
                    };

                    resources.enumerationValues.put($scope.parent.dataModel, $scope.parent.id , enumId, "order",options).then(function (result) {

                        //after updating the order on server side, we need to update the order of the element in mcTableHandler on client side as well
                        //in case we navigate to another page in the table so the order should have been updated on client side ................

                        //all records in the display
                        var records = $scope.mcTableHandler.sortedRecords;
                        //find the element index
                        var oldIndex = 0;
                        var newIndex = position;
                        angular.forEach(records, function (record, index) {
                            if(record.id === enumId){
                                oldIndex = index;
                            }
                        });
                        //remove the record from current location
                        var record = records.splice(oldIndex, 1);
                        //move it to the new location
                        records.splice(newIndex, 0, record[0]);
                        //.............................................................................................................................

                        messageHandler.showSuccess('Enumeration updated successfully.');
                    }, function (error) {
                        messageHandler.showError('There was a problem updating enumeration.', error);
                    });

                };

            }
    };
});
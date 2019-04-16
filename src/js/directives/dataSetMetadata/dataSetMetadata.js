angular.module('directives').directive('mcDataSetMetadata', function (helpDialogueHandler) {
    return{
        restrict: 'E',
        replace:true,
        scope: {
            parent: "=",
            parentType : "@",
            type: "=", // static, dynamic
            metaDataItems: "=",// for static
            loadingData:"=",

            clientSide : "@" //if true, it should NOT pass values to the serve in save/update/delete
        },
        templateUrl: './dataSetMetadata.html',
        link: function(scope, iElement, iAttrs, ctrl) {
        },

        controller: function($scope, securityHandler, $q, resources, messageHandler){
            $scope.namespaces = [];
            $scope.metadataKeys = [];
            $scope.loadNamespaces = function () {
                resources.metadata.namespaces.get().then(function (result) {
                    $scope.namespaces = result.filter(function(n) {
                        return n.defaultNamespace;
                    });
                });
            };

            $scope.access = securityHandler.elementAccess($scope.parent);

            if ($scope.type == 'dynamic') {
                $scope.loadNamespaces();
                $scope.metadataFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
                    var options = {
                        pageSize: pageSize,
                        pageIndex:pageIndex,
                        sortBy: sortBy,
                        sortType:sortType,
                        filters: filters
                    };
                    if(options.filters.indexOf("namespace") != -1){
                        options.filters = options.filters.replace("namespace","ns");
                    }
                    return resources.facets.get($scope.parent.id, "metadata", options);
                };
            }

            if ($scope.type == 'static') {
                $scope.loading = true;
                $scope.records = [];
                $scope.loadNamespaces();
                $scope.$watch('loadingData', function (newValue, oldValue, scope) {
                    if (newValue !== null && newValue !== undefined) {
                        $scope.loading = newValue;
                    }
                });
                $scope.$watch('metaDataItems', function (newValue, oldValue, scope) {
                    if (newValue !== null && newValue !== undefined) {
                        $scope.showRecords();
                    }
                });
            }


            $scope.onNamespaceSelect = function (select, record) {
                if(select){
                    record.edit['namespace'] = select['namespace'];
                    record['metadataKeys'] = [];
                    //now fill the 'metadataKeys'
                    for (var i = 0; i < $scope.namespaces.length; i++) {
                        if($scope.namespaces[i].namespace == select['namespace']){
                            record['metadataKeys'] =  $scope.namespaces[i].keys;
                            //create object for the keys as mcSelect2 expects objects with id
                            var id = 0;
                            record['metadataKeys'] = $scope.namespaces[i].keys.map(function (key) {
                                return {id:id++, key:key}
                            });
                            break;
                        }
                    }
                }else{
                    record.edit['namespace'] = '';
                    record['metadataKeys'] = [];
                }
            };

            $scope.onKeySelect = function (select, record) {
                if(select){
                    record.edit['key'] = select['key'];
                    //it is one of the default namespaces
                    if(select['id'] != -1){

                    }
                }else{
                    record.edit['key'] = '';
                }
            };

            $scope.onEdit = function (record, index) {
                //now fill the 'metadataKeys'
                for (var i = 0; i < $scope.namespaces.length; i++) {
                    if($scope.namespaces[i].namespace == record['namespace']){
                        record['metadataKeys'] =  $scope.namespaces[i].metadataKeys;
                        break;
                    }
                }
            };

            $scope.showRecords = function () {
                if($scope.metadata){
                    $scope.records = [].concat($scope.metadata);
                }
            };

            $scope.validate = function (record, index) {
                var isValid = true;
                record.edit.errors = [];

                if($scope.type == 'static') {
                    if (record.edit['key'].trim().length === 0) {
                        record.edit.errors['key'] = "Key can't be empty!";
                        isValid = false;
                    }
                    if (record.edit['value'].trim().length === 0) {
                        record.edit.errors['value'] = "Value can't be empty!";
                        isValid = false;
                    }
                    for (var i = 0; i < $scope.records.length; i++) {
                        if (i == index) {
                            continue;
                        }
                        if ($scope.records[i]['key'].toLowerCase().trim() === record.edit['key'].toLowerCase().trim() &&
                            $scope.records[i]['namespace'].toLowerCase().trim() === record.edit['namespace'].toLowerCase().trim()) {
                            record.edit.errors['key'] = "Key already exists";
                            isValid = false;
                        }
                    }
                    if (isValid) {
                        delete record.edit.errors;
                    }
                }else{
                    if (record.edit['key'].trim().length === 0) {
                        record.edit.errors['key'] = "Key can't be empty!";
                        isValid = false;
                    }
                    if (record.edit['value'].trim().length === 0) {
                        record.edit.errors['value'] = "Value can't be empty!";
                        isValid = false;
                    }
                    //Call a backend service and see if it's duplicate
                }
                return isValid;
            };

            $scope.add = function() {
                var newRecord = {
                    id:"",
                    namespace:"",
                    key:"",
                    value:"",
                    edit:{
                        id:"",
                        namespace:"",
                        key:"",
                        value:""
                    },
                    inEdit:true,
                    isNew:true
                };

                if($scope.type == 'static'){
                    $scope.records = [].concat([newRecord]).concat($scope.records);
                    return;
                }

                if($scope.type == 'dynamic'){
                    $scope.mcDisplayRecords = [].concat([newRecord]).concat($scope.mcDisplayRecords);
                    return;
                }

            };

            $scope.cancelEdit = function (record, index) {
                if(record.isNew){
                    if($scope.type == 'static'){
                        $scope.records.splice(index, 1);
                    }
                    if($scope.type == 'dynamic'){
                        $scope.mcDisplayRecords.splice(index, 1);
                    }
                }
            };

            $scope.save = function (record, index) {

                var resource = {
                    key:record.edit.key,
                    value: record.edit.value,
                    namespace: record.edit.namespace
                };

                //if clientSide is true, it should not pass details to the server
                //this is used in wizard for adding metadata items when creating a new model,class or element
                if($scope.clientSide){
                    record.namespace = resource.namespace;
                    record.key = resource.key;
                    record.value = resource.value;
                    record.inEdit = false;
                    record.isNew  = false;
                    $scope.records[index] = record;
                    $scope.metaDataItems = $scope.records;
                    return;
                }

                //in edit mode, we save them here
                if(record.id && record.id != ""){
                    resources.facets.put($scope.parent.id, "metadata", record.id, {resource:resource})
                        .then(function (result) {
                            if($scope.afterSave) {
                                $scope.afterSave(resource);
                            }

                            record.namespace = resource.namespace;
                            record.key = resource.key;
                            record.value = resource.value;
                            record.inEdit = false;
                            messageHandler.showSuccess('Property updated successfully.');
                        })
                        .catch(function (error) {
                            //duplicate namespace + key
                            if(error.status == 422){
                                record.edit.errors = [];
                                record.edit.errors['key'] = "Key already exists";
                                return;
                            }
                                messageHandler.showError('There was a problem updating the property.', error);
                        });
                }else{
                    resources.facets.post($scope.parent.id,"metadata", {resource:resource}).then(function(response) {
                        //after successfully saving the row, it if is a new row,then remove its newRow property
                        record.id = response.id;
                        record.namespace = response.namespace;
                        record.key = response.key;
                        record.value = response.value;
                        record.inEdit = false;
                        delete record.edit;

                        if($scope.type == 'static') {
                            $scope.records[index] = record;
                            messageHandler.showSuccess('Property saved successfully.');
                        }else{
                            $scope.mcDisplayRecords[index] = record;
                            messageHandler.showSuccess('Property saved successfully.');
                            $scope.mcTableHandler.fetchForDynamic();
                        }
                    }).catch(function (error) {
                        //duplicate namespace + key
                        if(error.status == 422){
                            record.edit.errors = [];
                            record.edit.errors['key'] = "Key already exists";
                            return;
                        }
                        messageHandler.showError('There was a problem saving property.', error);
                    });
                }
            };


            $scope.delete = function(record, $index){
                if($scope.clientSide){
                    $scope.records.splice($index, 1);
                    $scope.metaDataItems = $scope.records;
                    return;
                }
                resources.facets.delete($scope.parent.id, "metadata", record.id)
                    .then(function () {
                        if($scope.type == 'static') {
                            $scope.records.splice($index, 1);
                            messageHandler.showSuccess('Property deleted successfully.');
                        }else{
                            $scope.mcDisplayRecords.splice($index, 1);
                            messageHandler.showSuccess('Property deleted successfully.');

                            $scope.mcTableHandler.fetchForDynamic();
                        }
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem deleting the property.', error);
                    });
            };


            $scope.loadHelp = function (event) {
                helpDialogueHandler.open("Editing_properties", { my: "right top", at: "bottom", of: jQuery(event.target) });
            };

        }
    };
});
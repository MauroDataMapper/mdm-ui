angular.module('directives').directive('mcDataElementDetails', function () {
    return{
        restrict: 'E',
        replace: true,
        scope: {
            mcDataElement: "=",
            mcParentDataModel: "=",
            mcParentDataClass: "=",
            afterSave: "=",
            openEditForm:"="
        },
        templateUrl: './dataElementDetails.html',
        link: function(scope, element, attrs) {
        },
        controller: function($scope, resources, validator, $q, stateHandler, messageHandler) {

            $scope.parentScopeHandler = $scope;
            $scope.showNewInlineDataType = false;
            $scope.newInlineDataType = null;

            $scope.newlyAddedDataType = {
                label:"",
                description:"",

                metadata: [],
                domainType: "PrimitiveType",
                enumerationValues: [],
                classifiers: [],
            };
            $scope.toggleShowNewInlineDataType = function(){
                $scope.showNewInlineDataType = !$scope.showNewInlineDataType;
                $scope.errors = null;
            };
            //watch changes in newDataTypeInline
            $scope.$on("newDataTypeInlineUpdated", function(e, data) {
                $scope.inlineDataTypeValid = data.isValid;

                //this is the new DataType Details
                $scope.newInlineDataType = data.model;
                $scope.errors = null;
            });


            $scope.$watch('mcDataElement', function (newValue, oldValue, scope) {
                if (newValue) {
                    newValue.aliases = newValue.aliases || [];
                    newValue.editAliases = angular.copy(newValue.aliases);

                    //load its DataType if it's an Enumeration, load the enum details
                    if($scope.mcDataElement.dataType.domainType === "EnumerationType"){
                        resources.dataType.get($scope.mcDataElement.dataModel, $scope.mcDataElement.dataType.id).then(function(data){
                            $scope.mcDataElement.dataType = data;
                        });
                    }
                }
            });


            $scope.validateLabel = function(data){
                if (!data || (data && data.trim().length === 0)) {
                    return "DataElement name can not be empty";
                }
            };


            $scope.validateDataType = function(dataElement){
                if (!$scope.showNewInlineDataType && !dataElement.dataType) {
                        $scope.errors = $scope.errors || {};
                        $scope.errors.dataType = "DataType can not be empty";
                        return false;
                }

                if ($scope.showNewInlineDataType && !$scope.inlineDataTypeValid) {
                    $scope.errors = $scope.errors || {};
                    $scope.errors.dataType = "Please fill in all required values for the new Data Type";
                    return false;
                }
                return true;
            };

            $scope.fetchDataTypes = function (text, loadAll, offset, limit) {
                var deferred = $q.defer();
                var options = {
                    pageSize: limit ? limit : 30,
                    pageIndex:offset ? offset : 0,
                    sortBy: "label",
                    sortType: "asc",
                    filters:"label=" + text
                };

                if(loadAll){
                    delete options.filters;
                }
                resources.dataModel.get($scope.mcParentDataModel.id, "dataTypes", options)
                    .then(function (result) {
                        deferred.resolve({
                            results: result.items,
                            count: result.count,
                            limit: options.pageSize,
                            offset: options.pageIndex
                        });
                    }, function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            };

            $scope.onDataTypeSelect = function (dataType, model) {
                $scope.mcDataElement.dataType = dataType;
            };

            $scope.validateMultiplicity = function () {
                var min = "";
                if($scope.editableForm.$data.minMultiplicity != null && $scope.editableForm.$data.minMultiplicity != undefined){
                    min = $scope.editableForm.$data.minMultiplicity + "";
                }
                var max = "";
                if($scope.editableForm.$data.maxMultiplicity != null && $scope.editableForm.$data.maxMultiplicity != undefined){
                    max = $scope.editableForm.$data.maxMultiplicity + "";
                }
                var errorMessage = validator.validateMultiplicities(min, max);
                if(errorMessage){
                    $scope.editableForm.$setError( 'minMultiplicity', 'Error' );
                    return errorMessage
                }
            };


            $scope.validateMaxMultiplicity = function(data){
                return $scope.validateMultiplicity();
            };



            $scope.formBeforeSave = function() {


                $scope.errors = null;
                if(!$scope.validateDataType($scope.mcDataElement)){
                    return "Error in DataType Validation";
                }

                //true or undefined: local model will be updated and form will call aftersave
                //false: local model will not be updated and form will just close (e.g. you update local model yourself)
                //string: local model will not be updated and form will not close (e.g. server error)
                var dataType;
                if(!$scope.showNewInlineDataType){
                    dataType = {id: $scope.mcDataElement.dataType.id};
                }else{
                    dataType = $scope.newInlineDataType;
                }

                //We generally should run sth here and when we're sure we want to saved the values
                //we should call aftersave
                var d = $q.defer();
                var resource = {
                    id: $scope.mcDataElement.id,
                    label: $scope.editableForm.$data.label,
                    description: $scope.editableForm.$data.description,
                    domainType: $scope.mcDataElement.domainType,
                    aliases: $scope.mcDataElement.editAliases,
                    dataType: dataType,
                    classifiers: $scope.mcDataElement.classifiers.map(function (cls) {
                        return {id: cls.id};
                    })
                };


                resource.minMultiplicity = null;
                if(!validator.isEmpty($scope.editableForm.$data.minMultiplicity)){
                    if($scope.editableForm.$data.minMultiplicity == "*"){
                        $scope.editableForm.$data.minMultiplicity = "-1";
                    }
                    resource.minMultiplicity = parseInt($scope.editableForm.$data.minMultiplicity);
                }

                resource.maxMultiplicity = null;
                if(!validator.isEmpty($scope.editableForm.$data.maxMultiplicity)){
                    if($scope.editableForm.$data.maxMultiplicity == "*"){
                        $scope.editableForm.$data.maxMultiplicity = "-1";
                    }
                    resource.maxMultiplicity = parseInt($scope.editableForm.$data.maxMultiplicity);
                }


                resources.dataElement.put(
                    $scope.mcParentDataModel.id,
                    $scope.mcParentDataClass.id,
                    $scope.mcDataElement.id, null, {resource: resource})
                    .then(function (result) {
                        if($scope.afterSave) {
                            $scope.afterSave(resource);
                        }
                        $scope.mcDataElement.aliases =  angular.copy(result.aliases || []);
                        $scope.mcDataElement.editAliases =  angular.copy($scope.mcDataElement.aliases);

                        messageHandler.showSuccess('Data Element updated successfully.');
                        d.resolve();
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem updating the Data Element.', error);
                        d.resolve("error");
                    });
                return d.promise;
            };

            $scope.delete = function () {
                var dc = {
                    dataModelId: $scope.mcParentDataModel.id,
                    id: $scope.mcDataElement.breadcrumbs[$scope.mcDataElement.breadcrumbs.length - 1].id,
                    parentDataClassId: null
                };

                if($scope.mcDataElement.breadcrumbs.length > 2){
                    dc.parentDataClassId = $scope.mcDataElement.breadcrumbs[$scope.mcDataElement.breadcrumbs.length - 2].id;
                }

                resources.dataElement
                    .delete($scope.mcParentDataModel.id, $scope.mcParentDataClass.id, $scope.mcDataElement.id)
                    .then(function (result) {
                        messageHandler.showSuccess('Data Element deleted successfully.');
                        stateHandler.Go("DataClass", {dataModelId: dc.dataModelId , dataClassId: dc.parentDataClassId, id: dc.id  }, {reload: true, location: true});
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem deleting the Data Element.', error);
                    });
            };


            //send data on server after writing to local model
            $scope.formAfterSave = function() {
                //return "ERROR"
                //string: form will not close (e.g. server error)
                //not string: form will be closed
            };

            $scope.openEditClicked = function (formName) {
                if($scope.openEditForm){
                    $scope.openEditForm(formName);
                }
            };

            $scope.onCancelEdit = function () {
                $scope.mcDataElement.editAliases =  angular.copy($scope.mcDataElement.aliases);
            };



            // $scope.showAddElementToMarkdown = function () {
            //     var position = jQuery("span.xeditableTextArea").find("textarea").prop("selectionStart");
            //
            //     elementSelectorDialogue.open([], true).then(function (selectedElement) {
            //         if(!selectedElement){
            //             return;
            //         }
            //
            //         var markdonwLink = markdownParser.createMarkdownLink(selectedElement);
            //         var description = $scope.editableForm.$data.description.slice(0, position) + " " + markdonwLink + " " + $scope.editableForm.$data.description.slice(position);
            //         $scope.editableForm.$data.description = description;
            //         jQuery("span.xeditableTextArea").find("textarea").val(description);
            //
            //         $scope.safeApply();
            //     });
            // };
            // $scope.lastWasShiftKey = null;
            // $scope.descriptionKeyUp = function($event){
            //     $event.stopImmediatePropagation();
            //
            //     $scope.currentShiftKey = ($event.keyCode === 16);
            //
            //     if($scope.lastWasShiftKey && $scope.currentShiftKey){
            //         $scope.showAddElementToMarkdown();
            //         $scope.lastWasShiftKey = false;
            //         return;
            //     }
            //
            //     if($scope.currentShiftKey) {
            //         $scope.lastWasShiftKey = true;
            //     }else{
            //         $scope.lastWasShiftKey = false ;
            //     }
            //
            // };
            // $scope.safeApply = function (fn) {
            //     var phase = this.$root.$$phase;
            //     if (phase === '$apply' || phase === '$digest') {
            //         if (fn && (typeof(fn) === 'function')) {
            //             fn();
            //         }
            //     } else {
            //         this.$apply(fn);
            //     }
            // };
        }
    };
});
'use strict';
angular.module('controllers').controller('dataFlowCtrl',  function ($scope, $state, $stateParams, resources, $window, $q, elementTypes,dataFlowHandler, securityHandler, messageHandler, stateHandler) {
        $window.document.title = "Transformations";

        if (!$stateParams.id || !$stateParams.targetDataModel) {
            stateHandler.NotFound({location: false});
            return;
        }

        $scope.targetDataModel = $stateParams.targetDataModel;
        $scope.selectedElement = null;
        $scope.source = null;
        $scope.sourceTree = [];
        $scope.target = null;
        $scope.targetTree = [];
        $scope.dataFlow = null;

        $scope.targetTreeLoading = true;
        $scope.sourceTreeLoading = true;

        resources.dataFlow.get($stateParams.targetDataModel, $stateParams.id).then(function(data){
            
            $scope.dataFlow = data;
            //Show it's properties on left pane
            $scope.selectedElement = $scope.dataFlow;
            $scope.form = {};
            $scope.form.id = $scope.dataFlow.id;
            $scope.form.label = $scope.dataFlow.label;
            $scope.form.description = $scope.dataFlow.description;

            var promises = [];
            promises.push(resources.dataModel.get($scope.dataFlow.source.id));
            promises.push(resources.tree.get($scope.dataFlow.source.id));
            promises.push(resources.dataModel.get($scope.dataFlow.target.id));
            promises.push(resources.tree.get($scope.dataFlow.target.id));


            //if dataClass is provided
            if($stateParams.targetDataClass){
                if($stateParams.targetDataClass !== 'new'){
                    promises.push(resources.dataFlow.get($stateParams.targetDataModel, $scope.dataFlow.id, "/dataClassFlows/" + $stateParams.targetDataClass + "/dataFlowComponents",{filters:"all=true"}));
                }else{
                    promises.push($q.when({count:0, items:[]}));
                }
            }else{
                //Load all dataFlow components
                promises.push(resources.dataFlow.get($stateParams.targetDataModel, $scope.dataFlow.id, "dataFlowComponents",{filters:"all=true"}));
            }


            $q.all(promises).then(function (results) {
                $scope.source     = results[0];
                $scope.target     = results[2];
                $scope.access = securityHandler.elementAccess($scope.target);

                
                $scope.sourceTree = [$scope.source];
                $scope.source.hasChildren = results[1].length > 0;
                $scope.targetTree = [$scope.target];
                $scope.target.hasChildren = results[3].length > 0;
                $scope.isReadOnly = !securityHandler.showIfRoleIsWritable($scope.target);

                $scope.dataFlow.dataFlowComponents = results[4].items;

                $scope.dataFlowHandler =  dataFlowHandler.getDataFlowHandler(jQuery("div.designer"),jQuery("svg.designer"),$scope.isReadOnly);
                $scope.addDataFlowHandlerEventListeners();
                $scope.handleDirtyStatus();

                var positionsStr = $scope.dataFlow.diagramLayout || "";
                var positions = {};
                if(positionsStr.length > 0) {
                    positions = JSON.parse(positionsStr);
                }
                $scope.dataFlowHandler.drawDataFlow($scope.dataFlow, positions);

                $scope.targetTreeLoading = false;
                $scope.sourceTreeLoading = false;

                $($scope.dataFlowHandler).on('isReadOnly', function(event, message) {
                    messageHandler.showError("The resource is read-only!");
                    $scope.safeApply();
                });


            });
        });

        $scope.handleDirtyStatus = function () {
            window.addEventListener("beforeunload", function (e) {
                var confirmationMessage = "\o/";
                //if there are unSaved Transformations, then show the warning message
                var items = $scope.dataFlowHandler.getUnsavedTransformations();
                if(items && items.length > 0){
                    (e || window.event).returnValue = confirmationMessage; //Gecko + IE, Webkit, Safari, Chrome
                    return confirmationMessage;
                }
            });
        };

        $scope.upsertDataFlowComponent = function (link) {
            var t = link.transformation;
            var deferred = $q.defer();

            var sourceElements = [];
            var targetElements = [];
            angular.forEach(t.sourceLinks, function(sourceLink){
                sourceElements.push({ id:sourceLink.dataElementId });
            });
            angular.forEach(t.targetLinks, function(targetLink){
                targetElements.push({ id:targetLink.dataElementId });
            });
            var resource = {
                label: t.transformation.label,
                sourceElements: sourceElements,
                targetElements: targetElements
            };

            //It is not saved in DB yet! it's New
            if(!link.transformation.transformation.id){
                
                resources.dataFlow.post($scope.targetDataModel, $scope.dataFlow.id, "dataFlowComponents", {resource: resource}).then(function (result) {
                    link.transformation.transformation = result;
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
            }else{
                //It is saved in DB yet! just update it!

                var type = link.isTarget ? "target" : "source";
                var dataElementId = link.dataElementId;

                resources.dataFlow.put($scope.targetDataModel, $scope.dataFlow.id, "dataFlowComponents/" + t.transformation.id + "/" + type + "/" + dataElementId).then(function (result) {
                    link.transformation.transformation = result;
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
            }

            return deferred.promise;
        };

        $scope.removeDataFlowComponent = function (transformation) {
            var deferred = $q.defer();
            
            resources.dataFlow.delete($scope.targetDataModel, $scope.dataFlow.id, "dataFlowComponents/" + transformation.transformation.id).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        $scope.addDataFlowHandlerEventListeners = function() {

            //update the detail of the dataClass size change and save it in the userSettings.......
            $($scope.dataFlowHandler).on('dataClassResize', function(event, details) {
                $scope.updateUserSettings();
            });

            $($scope.dataFlowHandler).on('dataClassMove', function(event, details) {
                $scope.updateUserSettings();
            });

            $($scope.dataFlowHandler).on('transformationMove', function(event, details) {
                $scope.updateUserSettings();
            });
            //......................................................................................

            $($scope.dataFlowHandler).on('dataClassAdded', function(event, dataClass) {
                var uiDataClass = dataClass;
                var mcDataClass = uiDataClass.dataClass;
                var options = {sortType:'asc', sortBy:'label', all:true};
                resources.dataClass.get(mcDataClass.dataModel, null, mcDataClass.id, "dataElements", options).then(function(data){
                    for (var i = 0; i < data.items.length; i++) {
                        uiDataClass.addMCDataElement(data.items[i]);
                    }
                });
                return false;
            });

            $($scope.dataFlowHandler).on('linkAdded', function(event, link) {

                if(link.transformation.sourceLinks.length === 0){
                    messageHandler.showWarning(
                        "Each Transformation should have at least one Source element.<br>Please add a source element for '" + link.transformation.transformation.label+ ".'",
                        10000,
                        'text-left');
                        $scope.safeApply();
                        return;
                }

                if(link.transformation.targetLinks.length === 0){
                    messageHandler.showWarning(
                        "Each Transformation should have at least one Target element.<br>Please add a target element for '" + link.transformation.transformation.label+ ".'",
                        10000,
                        'text-left');
                    $scope.safeApply();
                    return;
                }

                $scope.upsertDataFlowComponent(link).then(function (result) {
                    messageHandler.showSuccess('Link added successfully.');
                    $scope.safeApply();
                }, function (error) {
                    messageHandler.showError("There was a problem adding the link.", error);
                    $scope.safeApply();
                });
            });

            $($scope.dataFlowHandler).on('linkRemoved', function(event, link) {

                if(link.transformation.sourceLinks.length === 0){
                    messageHandler.showWarning(
                        "Each Transformation should have at least one Source element.<br>Please add a source element for '" + link.transformation.transformation.label+ ".'",
                        10000,
                        'text-left');
                    $scope.safeApply();
                    return;
                }

                if(link.transformation.targetLinks.length === 0){
                    messageHandler.showWarning(
                        "Each Transformation should have at least one Target element.<br>Please add a target element for '" + link.transformation.transformation.label+ ".'",
                        10000,
                        'text-left');
                    $scope.safeApply();
                    return;
                }

                $scope.upsertDataFlowComponent(link).then(function (result) {
                    messageHandler.showSuccess('Link removed successfully.');
                    $scope.safeApply();
                }, function (error) {
                    messageHandler.showError("There was a problem removing the link.", error);
                    $scope.safeApply();
                });
            });

            $($scope.dataFlowHandler).on('transformationAdded', function(event, transformation) {

            });

            $($scope.dataFlowHandler).on('transformationRemoved', function(event, transformation) {

                //it's not saved in database
                if(!transformation.transformation.id){
                    messageHandler.showSuccess('Transformation removed successfully.');
                    $scope.safeApply();
                    return
                }

                $scope.removeDataFlowComponent(transformation).then(function (result) {
                    messageHandler.showSuccess('Transformation removed successfully.');
                    $scope.safeApply();
                }, function (error) {
                    messageHandler.showError("There was a problem removing the transformation.", error);
                    $scope.safeApply();
                });
            });

            $($scope.dataFlowHandler).on('dataFlowElementSelected', function(event, selectedElement) {
                if(selectedElement) {
                    $scope.selectedElement = selectedElement;
                    if($scope.selectedElement.type === "transformation"){
                        //fill its details in the properties form
                        $scope.form = {};
                        $scope.form.id = $scope.selectedElement.transformation.id;
                        $scope.form.label = $scope.selectedElement.transformation.label;
                        $scope.form.description = $scope.selectedElement.transformation.description;
                        $scope.form.visible = $scope.selectedElement.visible;
                    }else if($scope.selectedElement.type === "dataClass"){
                        //fill its details in the properties form
                        $scope.form = {};
                        $scope.form.id = $scope.selectedElement.dataClass.id;
                        $scope.form.label = $scope.selectedElement.dataClass.label;
                    }
                }else{
                    $scope.selectedElement = $scope.dataFlow;
                    $scope.form = {};
                    $scope.form.id = $scope.dataFlow.id;
                    $scope.form.label = $scope.dataFlow.label;
                    $scope.form.description = $scope.dataFlow.description;
                }
                $scope.safeApply();
            });
        };

        $scope.saveForm = function () {

            if($scope.selectedElement.type === "transformation"){
                //fill its details in the properties form
                $scope.selectedElement.transformation.label = $scope.form.label;
                $scope.selectedElement.transformation.description = $scope.form.description;
                $scope.selectedElement.visible = $scope.form.visible;

                if(!$scope.form.id){
                    $scope.selectedElement.updateTitle($scope.form.label);
                    $scope.safeApply();
                }else{

                    var resource = {
                        label:$scope.form.label,
                        description:$scope.form.description
                    };

                    resources.dataFlow.put($scope.targetDataModel, $scope.dataFlow.id, "dataFlowComponents/" + $scope.form.id, {resource:resource}).then(function (result) {
                        $scope.selectedElement.updateTitle($scope.form.label);
                        messageHandler.showSuccess('Transformation updated successfully.');
                        $scope.safeApply();
                    }, function (error) {
                        messageHandler.showError("There was a problem updating the transformation.", error);
                        $scope.safeApply();
                    });
                }

            }else if($scope.selectedElement.domainType === "DataFlow"){
                //fill its details in the properties form
                $scope.selectedElement.label = $scope.form.label;
                $scope.selectedElement.description = $scope.form.description;

                var rs = {
                    label: $scope.selectedElement.label,
                    description: $scope.selectedElement.description
                };

                resources.dataFlow.put($scope.targetDataModel, $scope.dataFlow.id, null, {resource:rs}).then(function (result) {
                    messageHandler.showSuccess('Dataflow updated successfully.');
                    $scope.safeApply();
                }, function (error) {
                    messageHandler.showError("There was a problem updating the dataflow.", error);
                    $scope.safeApply();
                });

            }
        };

        $scope.cancelForm = function () {
            if($scope.selectedElement.type === "transformation"){
                //fill its details in the properties form
                $scope.form = {};
                $scope.form.id = $scope.selectedElement.transformation.id;
                $scope.form.label = $scope.selectedElement.transformation.label;
                $scope.form.description = $scope.selectedElement.transformation.description;
                $scope.form.visible = $scope.selectedElement.visible;
            }

            if($scope.selectedElement.type === "dataFlow"){
                //fill its details in the properties form
                $scope.form = {};
                $scope.form.id = $scope.selectedElement.id;
                $scope.form.label = $scope.selectedElement.label;
                $scope.form.description = $scope.selectedElement.description;
            }
        };

        $scope.toggleTransformation = function(t){
            t.toggle();
        };

        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase === '$apply' || phase === '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        $scope.updateUserSettings = function () {
            if(!$scope.access.showEdit){
                return;
            }
            var details = $scope.dataFlowHandler.getElementPositions();
            var resource = {
                diagramLayout: JSON.stringify(details.positions)
            };
            resources.dataFlow.put($scope.targetDataModel, $scope.dataFlow.id, "diagramLayout", {resource:resource}).then(function (result) {
                //console.log("Diagram saved")
            }, function (error) {
                console.log("Error in saving the diagram layout", error);
            });
        }
	});

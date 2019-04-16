angular.module('directives').directive('jointDiagram5',  function (jointDiagramDirectedGraph, jointDiagramServiceRecursiveDataflow, jointDiagramServiceDC2DCDataFlow, elementTypes, $cookies, stateHandler, resources, $sce, modalHandler, messageHandler, confirmationModal, securityHandler, exportHandler, $q, userSettingsHandler) {
    return {
        restrict: 'E',
        scope: {
            mcElement: '=',
            hideExpand: '=',
            diagramName:'=',
            minHeight:'=',
            height: '=',
            width: '=',
            gridSize: '=',
            scale: '=',
            hideMaximize: '=',
            diagram: '=', // output
            onElementClick: "="
        },
        templateUrl: './jointDiagram5.html',
        link: function (scope, element, attrs) {
            scope.transformationRefresher = 0;
            scope.dataFlowChain = null;
            scope.dataFlowProcessing  = false;
            scope.exportedFileIsReady = false;
            scope.currentLevel = 0;
            scope.currentDataClass = null;
            scope.selectedDataFlow = null;
            scope.jointDiagramController = null;

            scope.defaultDiagramSettings =  {
                rankSep: 50,
                edgeSep: 50,
                nodeSep: 50,
                rankDir: "LR",
                scale:0.8
            };
            scope.diagramSettings =  angular.copy(scope.defaultDiagramSettings);

            scope.maximize = function(){
                var params = [
                    'height='+screen.height/2,
                    'width='+screen.width/2,
                    'resizable=yes',
                    'fullscreen=yes'
                ].join(',');
                stateHandler.NewWindow("dataFlowChain",{dataModelId:scope.mcElement.id});//, params);
            };

            scope.previous = function () {
                if (scope.currentLevel === 1) {
                    scope.selectedDF = null;
                    scope.currentLevel = 0;
                    scope.loadDM2DM();
                    return;
                }
                if (scope.currentLevel === 2) {
                    scope.currentLevel = 1;
                    scope.currentDataClass = null;
                    scope.loadDC2DC(scope.selectedDF);
                    return;
                }
            };

            scope.next = function () {
                if(scope.currentLevel === 2){return;}
                scope.currentLevel++;
                if(scope.currentLevel === 1){
                    scope.loadDC2DC(scope.selectedDF);
                    return;
                }
                if(scope.currentLevel === 2){
                    return;
                }
            };

            scope.onClick = function(event){
                if(scope.currentLevel === 0){
                    scope.selectedDF = null;
                    if(!event){
                        return;
                    }
                    var mcObject = event.model.attributes["mc"];
                    if(mcObject){
                        if(scope.currentLevel === 0 && mcObject.domainType === "DataFlow"){
                            scope.selectedDF = mcObject;
                            scope.safeApply();
                        }
                    }
                }
				if(scope.onElementClick){
					scope.onElementClick(event);
				}
            };

            scope.updateUserSettings = function(){
                var dataFlowDiagramsSetting = userSettingsHandler.get("dataFlowDiagramsSetting") || {};
                dataFlowDiagramsSetting[scope.mcElement.id] = scope.diagramSettings;

                userSettingsHandler.update("dataFlowDiagramsSetting", dataFlowDiagramsSetting);
                userSettingsHandler.saveOnServer().then(function () {});
            };

            scope.diagramSettingsUpdate = function(event){
                scope.jointDiagramController.layout(scope.diagramSettings.rankSep, scope.diagramSettings.edgeSep, scope.diagramSettings.nodeSep, scope.diagramSettings.rankDir);

               scope.updateUserSettings();

                if(event) {
                    event.stopPropagation();
                }
            };
            scope.diagramSettingsReset = function(event){
                scope.jointDiagramController.layout();

                scope.updateUserSettings();

                if(event) {
                    event.stopPropagation();
                }
            };



            scope.onDblClick = function(event){
                var mcObject = null;
                if(scope.currentLevel === 0){
                    scope.selectedDF = null;
                    if(!event){
                        return;
                    }
                    mcObject = event.model.attributes["mc"];
                    if(mcObject && mcObject.domainType === "DataFlow"){
                        scope.selectedDF = mcObject;
                        scope.currentLevel = 1;
                        scope.loadDC2DC(mcObject);
                    }
                }else if (scope.currentLevel === 1){
                    mcObject = event.model.attributes["mc"];
                    if(mcObject && mcObject.domainType === "DC2DCLink"){
                        scope.currentLevel = 2;
                        scope.currentDataClass = mcObject.source;
                        scope.loadTransformations(scope.selectedDF, mcObject.source);
                    }
                }
                if(scope.onElementClick){
                    scope.onElementClick(event);
                }
            };



            scope.zoomOut = function () {
                if(!scope.jointDiagramController){return}
                scope.diagramSettings.scale = scope.jointDiagramController.zoomOut();
                scope.updateUserSettings();
            };

            scope.zoomIn = function () {
                if(!scope.jointDiagramController){return}
                scope.diagramSettings.scale = scope.jointDiagramController.zoomIn();
                scope.updateUserSettings();
            };

            scope.resetZoom = function () {
                if(!scope.jointDiagramController){return}
                scope.diagramSettings.scale = scope.jointDiagramController.resetZoom();
                scope.updateUserSettings();
            };

            scope.refreshGraphDivHolder = function(){
                var deferred = $q.defer();
                setTimeout(function(){
                    jQuery("#jointDiagramHolder").remove();
                    var jointDiagramHolder = jQuery('<div id="jointDiagramHolder" style="position: relative"></div>');
                    jQuery("#holder").append(jointDiagramHolder);
                    return deferred.resolve(jointDiagramHolder[0]);
                }, 10);
                return deferred.promise;
            };

            scope.loadDM2DM = function(){
                jQuery("#jointDiagramHolder").remove();
                scope.loading = true;
                scope.editDataflowMode = false;
                resources.dataModel.get(scope.mcElement.id, "dataFlows").then(function (data) {
                    scope.dataFlowChain = data;
                    scope.noDF = false;
                    if(data && data.count === 0){
                        scope.noDF = true;
                    }
                    scope.refreshGraphDivHolder().then(function (jointDiagramHolder) {
                        var graph = jointDiagramDirectedGraph.createDM2DMGraph(data.items, scope.mcElement);
                        scope.jointDiagramController = jointDiagramDirectedGraph.build(jointDiagramHolder, null, graph.adjacencyList, graph.nodes, graph.links, scope.onClick, scope.onDblClick, scope.diagramSettings.scale, scope.width, scope.height, scope.diagramSettings.rankSep, scope.diagramSettings.edgeSep, scope.diagramSettings.nodeSep, scope.diagramSettings.rankDir);
                        scope.loading = false;
                        scope.safeApply();
                    });
                });
            };
            scope.loadDC2DC = function(df){
                jQuery("#jointDiagramHolder").remove();
                scope.loading = true;
                scope.selectedDF = df;
                resources.dataModel.get(scope.mcElement.id, "dataFlows/"+df.id+"/dataClassFlows").then(function (data) {
                    scope.noDF = false;
                    if(data && data.count === 0){
                        scope.noDF = true;
                    }
                    scope.refreshGraphDivHolder().then(function (jointDiagramHolder) {
                        var graph = jointDiagramDirectedGraph.createDC2DCGraph(data.items, scope.mcElement);
                        scope.jointDiagramController = jointDiagramDirectedGraph.build(jointDiagramHolder, null, graph.adjacencyList, graph.nodes, graph.links, scope.onClick, scope.onDblClick, 0.8, scope.width, scope.height);
                        scope.loading = false;
                        scope.safeApply();
                    });
                });
            };
            scope.loadTransformations = function(df, dc){
                scope.targetDataModel =  df.target;
                scope.targetDataClass =  dc;
                scope.dataFlowId = df.id;
                scope.transformationRefresher++;
                jQuery("#jointDiagramHolder").remove();
                scope.safeApply();
            };


            scope.init = function(){
                var dataFlowDiagramsSetting = userSettingsHandler.get("dataFlowDiagramsSetting");
                if(dataFlowDiagramsSetting && dataFlowDiagramsSetting[scope.mcElement.id]){
                    scope.diagramSettings = dataFlowDiagramsSetting[scope.mcElement.id];
                }

                scope.expandLink = stateHandler.getURL('diagram', {id: scope.mcElement.id});
                scope.access = securityHandler.elementAccess(scope.mcElement);
                scope.loadDM2DM();
            };


            scope.$watch('mcElement', function (newValue, oldValue, scope) {
                if (!newValue) {return;}

                scope.init();
            });

            scope.edit = function () {
                if(scope.currentLevel === 0) {
                    stateHandler.NewWindow("dataFlowDM2DM", {id: scope.mcElement.id});
                }else if(scope.currentLevel === 1){
                    stateHandler.NewWindow("dataFlowTransformation",
                        {
                            id: scope.selectedDF.id,
                            targetDataModel: scope.mcElement.id
                        });
                }
            };

            scope.reload = function () {
                if (scope.currentLevel === 0) {
                    scope.loadDM2DM();
                }
                if (scope.currentLevel === 1) {
                    scope.loadDC2DC(scope.selectedDF);
                }
                if (scope.currentLevel === 2) {
                    scope.loadTransformations(scope.selectedDF, scope.currentDataClass);
                }
            };

            scope.addDF = function(){
                var modalInstance = modalHandler.prompt("newDataflowModalForm", {
                    dataModel: scope.mcElement
                });
                modalInstance.then(function (result) {
                    if(result && result.success){
                        if(scope.currentLevel === 0){
                            scope.loadDM2DM();
                        }
                    }
                });
            };

            scope.deleteDF = function () {
                if(!scope.selectedDF){
                   return;
                }

                confirmationModal.open("Dataflow", "Are you sure you want to delete this Dataflow?")
                    .then(function (result) {
                        if(result.status !== "ok"){
                            return;
                        }
                        var dataFlow = scope.selectedDF;
                        resources.dataFlow.delete(dataFlow.target.id, dataFlow.id).then(function (result) {
                            messageHandler.showSuccess('Dataflow removed successfully.');
                            scope.selectedDF = null;
                            scope.refreshGraphDivHolder();
                            scope.loadDM2DM();
                        },function (error) {
                            messageHandler.showError('There was a problem deleting the dataflow.', error);
                        });
                    });
            };

            scope.editDF = function () {
                if(!scope.selectedDF){
                    return;
                }
                scope.editDataflowMode = true;

                jQuery("#jointDiagramHolder").remove();
                var jointDiagramHolder = jQuery('<div id="jointDiagramHolder" style="position: relative"></div>');
                jQuery("#holder").append(jointDiagramHolder);

                element.find("#editDataflowPanel").draggable({
                    // handle: ".modal-header"
                });
            };

            scope.editTransformation = function(){
                stateHandler.NewWindow("dataFlowTransformation",
                    {
                        id: scope.dataFlowId,
                        targetDataModel: scope.targetDataModel.id,
                        targetDataClass: scope.targetDataClass.id
                    });
            };


            scope.closeEditDataflow = function () {
                scope.refreshGraphDivHolder();
                scope.loadDM2DM();
                scope.editDataflowMode = false;
                scope.selectedDF = null;
            };

            scope.addTransformation = function () {
                var dataflow  = scope.selectedDF;
                stateHandler.NewWindow("dataFlowTransformation",
                    {
                        id: dataflow.id,
                        targetDataModel: dataflow.target.id,
                        targetDataClass: 'new'
                    });
            };


            scope.loadExporterList = function () {
                scope.exportersList = [];
                securityHandler.isValidSession().then(function (result) {
                    if (result === false) {
                        return;
                    }
                    resources.public.dataFlowExporterPlugins().then(function (result) {
                        scope.exportersList = result;
                    },function(error){
                        messageHandler.showError('There was a problem loading exporters list.', error);
                    });
                });
            };
            scope.loadExporterList();

            scope.loadImporters = function(){
                resources.public.dataFlowImportPlugins().then(function (result) {
                    scope.importersList = result;
                },function(error){
                    messageHandler.showError('Can not load importers!', error);
                });
            };
            scope.loadImporters();

            scope.export = function (exporter) {
                scope.dataFlowProcessing = true;
                scope.exportedFileIsReady = false;

                var dfList = [];
                angular.forEach(scope.dataFlowChain.items, function (dataflow) {
                    if(dataflow.source.id === scope.mcElement.id || dataflow.target.id === scope.mcElement.id){
                        dfList.push(dataflow);
                    }
                });

                var promise = exportHandler.exportDataFlows(scope.mcElement, dfList, exporter);
                promise.then(function (result) {
                    scope.exportedFileIsReady = true;

                    var aLink = exportHandler.createBlobLink(result.fileBlob, result.fileName);
                    //remove if any link exists
                    jQuery("#exportDataFlowFileDownload a").remove();
                    jQuery("#exportDataFlowFileDownload").append(jQuery(aLink)[0]);

                    scope.dataFlowProcessing = false;
                },function(error){
                    scope.dataFlowProcessing = false;
                });
            };

            scope.openImportDialogue = function (importer) {
                scope.selectedImporter = importer;
                jQuery("#dataFlowImportFile").trigger("click");
            };


            scope.getDMAccessDetails = function(dm){
                var deferred = $q.defer();
                //load target dataModel
                resources.dataModel.get(dm.id).then(function(data){
                    var access = securityHandler.elementAccess(data);
                    deferred.resolve(access);
                },function () {
                    deferred.resolve(false);
                });
                return deferred.promise;
            };

            scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };
        },
        controller: function ($scope, resources, messageHandler) {

            $scope.import = function (ev) {
                jQuery("#exportDataFlowFileDownload a").remove();
                $scope.dataFlowProcessing = true;
                var file = ev.currentTarget.files[0];
                if(!file){ return; }

                var formData = new FormData();
                formData.append("importFile", file);

                var namespace = $scope.selectedImporter.namespace;
                var name = $scope.selectedImporter.name;
                var version = $scope.selectedImporter.version;

                resources.dataFlow.import($scope.mcElement.id, namespace + "/" + name + "/" + version, formData).then(function (result) {
                    $scope.dataFlowProcessing = false;
                    $scope.importResult = result;
                    messageHandler.showSuccess("Data Flow(s) imported successfully");
                    $scope.loadDM2DM();
                    jQuery("#dataFlowImportFormReset").trigger("click");
                }, function (error) {
                    $scope.dataFlowProcessing = false;
                    messageHandler.showError("Error in import process", error);
                    jQuery("#dataFlowImportFormReset").trigger("click");
                });
            };

        }
    };
});







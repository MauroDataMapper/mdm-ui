angular.module('directives').directive('jointDiagram4', function (jointDiagramServiceRecursiveDataflow, jointDiagramServiceDC2DCDataFlow, stateHandler, elementTypes, $cookies, resources, $sce, modalHandler, messageHandler, confirmationModal, securityHandler, exportHandler, $q) {
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
        templateUrl: './jointDiagram4.html',
        link: function (scope, element, attrs) {

            scope.transformationRefresher = 0;

            scope.dataFlowChain = null;
            scope.dataFlowProcessing  = false;
            scope.exportedFileIsReady = false;


            scope.currentLevel = 0;
            scope.currentDF = null;
            scope.currentDataClass = null;

            scope.selectedDataFlow = null;


            scope.$watch('mcElement', function (newValue, oldValue, scope) {
                if (newValue !== null) {
                    scope.access = securityHandler.elementAccess(scope.mcElement);
                }
            });


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
                    scope.selectedDataFlow = null;
                    scope.currentDF = null;
                    scope.currentLevel = 0;
                    scope.loadChainDataflow();
                    return;
                }
                if (scope.currentLevel === 2) {
                    scope.currentLevel = 1;
                    scope.currentDataClass = null;
                    scope.loadDC2DCDataflow(scope.currentDF);
                    return;
                }
            };

            scope.next = function () {
                if(scope.currentLevel === 2){return;}
                scope.currentLevel++;
                if(scope.currentLevel === 1){
                    scope.loadDC2DCDataflow(scope.currentDF);
                    return;
                }
                if(scope.currentLevel === 2){
                    return;
                }
            };

            function initEventHandlers() {
                scope.diagram = {
                    graph: null,
                    paper: null,
                    dragStartPosition: null,
                    graphScale: 1,
                    selectedCell: null
                };

                scope.diagram.graph = new joint.dia.Graph;
                scope.diagram.paper = new joint.dia.Paper({
                    el: jQuery(element[0]).find("div#jointDiagramHolder")[0],
                    width: scope.width,
                    height: scope.height,
                    gridSize: scope.gridSize,
                    model: scope.diagram.graph,
                    async: true, //display the diagram async
                    interactive: function(cellView) {
                        //https://stackoverflow.com/questions/37192811/make-only-links-interactive-in-joint-js
                        return !cellView.model.isLink();
                        // if (cellView.model.isLink()) {
                        //     return {
                        //         vertexAdd: false,
                        //         vertexRemove: false,
                        //         arrowheadMove: false,
                        //         // vertexMove: true
                        //     };
                        // }
                        // return false;
                    }
                });


                scope.diagram.paper.off('cell:highlight cell:unhighlight').on({
                    'cell:highlight': function(cellView, el, opt) {
                        scope.unHighlightCells(scope.diagram);
                        jQuery(cellView.$el).find("path.connection").addClass("mcLinkHighlight");
                    },
                    'cell:unhighlight': function(cellView, el, opt) {
                        jQuery(cellView.$el).find("path.connection").removeClass("mcLinkHighlight");
                    }
                });


                scope.diagram.paper.on("cell:mouseover", function (cellView, evt, x, y) {
                    //console.log("over")
                });

                scope.diagram.paper.on("cell:mouseout", function (cellView, evt, x, y) {
                    //console.log("out")
                });

                //add event handlers to interact with the diagram
                scope.diagram.paper.on('cell:pointerclick', function (cellView, evt, x, y) {
                    if(cellView.model.attributes['type'] === 'mcDFChain.Association2'){
                        scope.selectedDataFlow = cellView.model.dataflow;
                        scope.selectedDataFlow.domainType = "DataFlow";

                        scope.selectedDataFlow.editable = false;
                        scope.getDMAccessDetails(scope.selectedDataFlow.target).then(function (access) {
                            scope.selectedDataFlow.editable = access.showEdit;
                            scope.safeApply();
                        });

                        cellView.highlight();
                        scope.safeApply();
                    }

                    setTimeout(function () {
                        scope.elementClick(cellView);
                    }, 50);


                });

                scope.diagram.paper.on('blank:pointerclick', function (cellView, evt, x, y) {
                    if(scope.currentLevel === 0) {
                        scope.selectedDataFlow = null;
                        scope.currentDF = null;
                        scope.unHighlightCells(scope.diagram);
                        scope.safeApply();
                    }

                    scope.elementClick(null);
                });

                scope.diagram.paper.on('cell:pointerdblclick', function (cellView, evt, x, y) {

                    if(cellView.model.attributes['type'] === 'mcDFChain.Association2'){
                        if(scope.currentLevel === 0){
                            scope.currentDF = cellView.model.dataflow;
                            scope.currentLevel = 1;
                            scope.loadDC2DCDataflow(scope.currentDF);
                        }else if(scope.currentLevel === 1){
                            //nop
                        }

                    }else if(cellView.model.attributes['type'] === 'mcDataflowDC2DC.DataClass'){
                        scope.currentDataClass = cellView.model.attributes['dataClass'];
                        scope.currentLevel = 2;
                        // scope.targetDataModel =  scope.currentDF.target;
                        // scope.targetDataClass =  scope.currentDataClass;
                        // scope.dataFlowId = scope.currentDF.id;
                        // jQuery("#jointDiagramHolder").remove();
                        // scope.safeApply();
                        scope.loadTransformations(scope.currentDF, scope.currentDataClass);

                    }else if ( cellView.model.attributes['type'] === "mcDataflowDC2DC.Association2"){
                        scope.currentDataClass =  cellView.model.attributes['sourceDataClass'];
                        scope.currentLevel = 2;
                        // scope.targetDataModel =  scope.currentDF.target;
                        // scope.targetDataClass =  scope.currentDataClass;
                        // scope.dataFlowId = scope.currentDF.id;
                        // jQuery("#jointDiagramHolder").remove();
                        // scope.safeApply();
                        scope.loadTransformations(scope.currentDF, scope.currentDataClass);
                    }
                });


                scope.editTransformation = function(){

                    stateHandler.NewWindow("dataFlowTransformation",
                        {
                            id: scope.dataFlowId,
                            targetDataModel: scope.targetDataModel.id,
                            targetDataClass: scope.targetDataClass.id
                        });

                };

                scope.zoomOut = function () {
                    scope.diagram.graphScale -= 0.1;
                    paperScale(scope.diagram.graphScale, scope.diagram.graphScale);
                };

                scope.zoomIn = function () {
                    scope.diagram.graphScale += 0.1;
                    paperScale(scope.diagram.graphScale, scope.diagram.graphScale);
                };

                scope.resetZoom = function () {
                    scope.diagram.graphScale = 1;
                    paperScale(scope.diagram.graphScale, scope.diagram.graphScale);
                };


                scope.expand = function() {
                    if(scope.mcElement){
                        stateHandler.Go("diagram", {id: scope.mcElement.id}, {location: true});
                    }
                };


                scope.elementClick = function(UIElement){
                    scope.selectedElement = null;

                    if(UIElement && UIElement.model){
                        if(UIElement.model.attributes['type'] === 'mcDFChain.DataModel'){
                            scope.selectedElement = {
                                id: UIElement.model.attributes['mcData'].id,
                                label: UIElement.model.attributes['mcData'].label,
                                domainType: "DataModel"
                            };
                        }else if(UIElement.model.attributes['type'] === 'mcDFChain.Association2'){
                            if(scope.currentLevel === 0) {
                                scope.selectedElement = {
                                    id: UIElement.model.dataflow.id,
                                    label: UIElement.model.dataflow.label,
                                    domainType: "DataFlow"
                                };
                            }
                        }else if(UIElement.model.attributes['type'] === 'mcDataflowDC2DC.DataClass'){
                            scope.selectedElement = {
                                id: UIElement.model.attributes['dataClass'].id,
                                label: UIElement.model.attributes['dataClass'].label,
                                breadcrumbs: UIElement.model.attributes['dataClass'].breadcrumbs,
                                dataModel:UIElement.model.attributes['dataClass'].dataModel,
                                domainType: "DataClass"
                            };
                        }else if (UIElement.model.attributes['type'] === "mcDataflowDC2DC.Association2"){
                            scope.selectedElement =  null;
                        }
                    }else{
                        scope.selectedElement = UIElement;
                    }

                    if(scope.onElementClick){
                        scope.onElementClick(scope.selectedElement);
                    }

                    scope.safeApply();
                };

                ///Handle drag
                scope.diagram.paper.on('blank:pointerdown', function (event, x, y) {
                    var scale = V(scope.diagram.paper.viewport).scale();
                    scope.diagram.dragStartPosition = {x: x * scale.sx, y: y * scale.sy};
                });

                scope.diagram.paper.on('cell:pointerup blank:pointerup', function (cellView, x, y) {
                    scope.diagram.dragStartPosition = null;
                });

                jQuery(element[0]).mousemove(function (event) {
                    if (scope.diagram.dragStartPosition) {
                        scope.diagram.paper.setOrigin(
                            event.offsetX - scope.diagram.dragStartPosition.x,
                            event.offsetY - scope.diagram.dragStartPosition.y);
                    }
                });

            }

            function paperScale(sx, sy) {
                $cookies.put(scope.diagramName+'-scale', sx);
                if(scope.diagram && scope.diagram.paper) {
                    scope.diagram.paper.scale(sx, sy);
                }
            }


            scope.loadChainDataflow = function(){
                scope.loadingDiagram = true;
                scope.editDataflowMode = false;
                resources.dataModel.get(scope.mcElement.id, "dataFlows").then(function (data) {

                    scope.dataFlowChain = data;

                    scope.noDF = false;
                    if(data && data.count === 0){
                        scope.noDF = true;
                    }

                    var result = jointDiagramServiceRecursiveDataflow.drawDFChain(scope.mcElement, data);
                    scope.cells    = result.cells;
                    scope.rootCell = result.rootCell;

                    //create the expand link
                    scope.expandLink = stateHandler.getURL('diagram', {id: scope.mcElement.id});

                    //Due to the restriction that jointJs has, we need to remove th holder and build it again
                    //if the holder is hidden at the time of building the diagram, it will not show it in the UI!
                    jQuery("#jointDiagramHolder").remove();
                    var jointDiagramHolder = jQuery('<div id="jointDiagramHolder" style="position: relative"></div>');
                    jQuery("#holder").append(jointDiagramHolder);

                    setTimeout(function(){
                        initEventHandlers();

                        scope.diagram.graph.clear();
                        scope.diagram.graph.addCells(scope.cells);
                        //show the links behind the elements, not over
                        scope.cells.map(function (cell) {
                            if(cell.isLink()){
                                cell.toBack();
                            }
                        });



                        ///Highlight the rootCell
                        // scope.diagram.selectedCell = scope.diagram.paper.findViewByModel(scope.cells[0]);
                        // scope.diagram.selectedCell.highlight();


                        var currentScale = $cookies.get(scope.diagramName+'-scale');
                        if(currentScale){
                            scope.scale = parseFloat(currentScale);
                        }else {
                            scope.scale = 0.8;
                        }
                        scope.diagram.graphScale = scope.scale;
                        paperScale(scope.scale, scope.scale);
                        jointDiagramServiceRecursiveDataflow.reOrder(scope.diagram.graph);
                        scope.loadingDiagram = false;
                        scope.safeApply();
                    }, 1);
                });
            };

            scope.loadDC2DCDataflow = function(dataflow){
                scope.loadingDiagram = true;
                resources.dataModel.get(scope.mcElement.id, "dataFlows/"+dataflow.id+"/dataClassFlows").then(function (data) {

                    scope.noDF = false;
                    if(data && data.count === 0){
                        scope.noDF = true;
                    }

                    var result = jointDiagramServiceDC2DCDataFlow.drawDC2DC(dataflow, data);
                    scope.cells    = result.cells;
                    scope.rootCell = result.rootCell;

                    //create the expand link
                    scope.expandLink = stateHandler.getURL('diagram', {id: scope.mcElement.id});

                    //Due to the restriction that jointJs has, we need to remove th holder and build it again
                    //if the holder is hidden at the time of building the diagram, it will not show it in the UI!
                    jQuery("#jointDiagramHolder").remove();
                    var jointDiagramHolder = jQuery('<div id="jointDiagramHolder" style="position: relative"></div>');
                    jQuery("#holder").append(jointDiagramHolder);

                    setTimeout(function(){
                        initEventHandlers();

                        scope.diagram.graph.clear();
                        scope.diagram.graph.addCells(scope.cells);

                        //show the links behind the elements, not over
                        scope.cells.map(function (cell) {
                            if(cell.isLink()){
                                cell.toBack();
                            }
                        });

                        var currentScale = $cookies.get(scope.diagramName+'-scale');
                        if(currentScale){
                            scope.scale = parseFloat(currentScale);
                        }else {
                            scope.scale = 0.8;
                        }
                        scope.diagram.graphScale = scope.scale;
                        paperScale(scope.scale, scope.scale);
                        jointDiagramServiceDC2DCDataFlow.reOrder(scope.diagram.graph);
                        scope.loadingDiagram = false;
                        scope.safeApply();
                    }, 1);
                });
            };

            scope.loadTransformations = function(dataflow, dataClass){
                scope.targetDataModel =  dataflow.target;
                scope.targetDataClass =  dataClass;
                scope.dataFlowId = dataflow.id;
                scope.transformationRefresher++;

                jQuery("#jointDiagramHolder").remove();
                scope.safeApply();
            };

            scope.$watch('mcElement', function (newValue, oldValue, scope) {
                if (!newValue) {return;}
                scope.loadChainDataflow();
            });

            scope.edit = function () {
                if(scope.currentLevel === 0) {
                    stateHandler.NewWindow("dataFlowDM2DM", {id: scope.mcElement.id});
                }else if(scope.currentLevel === 1){
                    stateHandler.NewWindow("dataFlowTransformation",
                        {
                            id: scope.currentDF.id,
                            targetDataModel: scope.mcElement.id
                        });
                }
            };

            scope.reload = function () {
                if (scope.currentLevel === 0) {
                    scope.loadChainDataflow();
                }
                if (scope.currentLevel === 1) {
                    scope.loadDC2DCDataflow(scope.currentDF);
                }
                if (scope.currentLevel === 2) {
                    scope.loadTransformations(scope.currentDF, scope.currentDataClass);
                }
            };

            scope.addDataflow = function(){
                var modalInstance = modalHandler.prompt("newDataflowModalForm", {
                    dataModel: scope.mcElement
                });
                modalInstance.then(function (result) {
                    if(result && result.success){
                        if(scope.currentLevel === 0){
                            scope.loadChainDataflow();
                        }
                    }
                });
                // scope.diagram.selectedCell = scope.diagram.paper.findViewByModel(scope.cells[0]);
                // scope.diagram.selectedCell.highlight();
            };

            scope.deleteDataflow = function () {
                if(!scope.selectedDataFlow){
                   return;
                }

                confirmationModal.open("Dataflow", "Are you sure you want to delete this Dataflow?")
                    .then(function (result) {
                        if(result.status !== "ok"){
                            return;
                        }
                        var dataFlow = scope.selectedDataFlow;
                        resources.dataFlow.delete(dataFlow.target.id, dataFlow.id).then(function (result) {
                            messageHandler.showSuccess('Dataflow removed successfully.');
                            scope.selectedDataFlow = null;
                            scope.currentDF = null;
                            scope.loadChainDataflow();
                        },function (error) {
                            messageHandler.showError('There was a problem deleting the dataflow.', error);
                        });
                    });
            };

            scope.editDataflow = function () {
                if(!scope.selectedDataFlow){
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

            scope.closeEditDataflow = function () {
                scope.loadChainDataflow();
                scope.editDataflowMode = false;
                scope.selectedDataFlow = null;
            };


            scope.unHighlightCells = function(diagram){
                var cells = diagram.graph.getCells();
                angular.forEach(cells, function (cell) {
                    var cellView = diagram.paper.findViewByModel(cell);
                    jQuery(cellView.$el).find("path.connection").removeClass("mcLinkHighlight");
                });
            };


            scope.addTransformation = function () {
                var dataflow  = scope.currentDF;
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
                    $scope.loadChainDataflow();
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







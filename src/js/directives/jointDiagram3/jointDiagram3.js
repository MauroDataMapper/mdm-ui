angular.module('directives').directive('jointDiagram3', function (jointDiagramService3, $state, elementTypes, $cookies, stateHandler) {
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
            rootCell: '=',
            cells: '=',

            diagram: '=' // output
        },
        templateUrl: './jointDiagram3.html',
        link: function (scope, element, attrs) {

            scope.showSameAs = false;
            scope.showNotSameAs = false;
            scope.dataTypeReference = true;
            scope.loadingDiagram = true;
            function handleDragDrop() {
                //https://resources.jointjs.com/tutorials/joint/tutorials/hierarchy.html
                ////This will force a child cell to be bounded to its parent
                // scope.diagram.graph.on('change:position', function (cell) {
                //     var parentId = cell.get('parent');
                //     if (!parentId) return;
                //
                //     var parent = scope.diagram.graph.getCell(parentId);
                //     var parentBbox = parent.getBBox();
                //     var cellBbox = cell.getBBox();
                //
                //     if (parentBbox.containsPoint(cellBbox.origin()) &&
                //         parentBbox.containsPoint(cellBbox.topRight()) &&
                //         parentBbox.containsPoint(cellBbox.corner()) &&
                //         parentBbox.containsPoint(cellBbox.bottomLeft())) {
                //
                //         // All the four corners of the child are inside
                //         // the parent area.
                //         return;
                //     }
                //     // Revert the child position.
                //     cell.set('position', cell.previous('position'));
                // });

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

            function init() {



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
                    interactive: function(cellView, methodName) {
                        //if an element is NOT Interative, then do not Move it
                        if (cellView.model.get('isInteractive') === false) {
                            return false;
                        }
                        return true;
                    }
                });


                //add event handlers to interact with the diagram
                scope.diagram.paper.on('cell:pointerclick', function (cellView, evt, x, y) {

                    if(cellView.model.attributes['type'] == 'link'){
                        return
                    }

                    ////Handle Highlight and UnHighlight
                    // _.each(scope.diagram.graph.getElements(), function (element) {
                    //     var c = scope.diagram.paper.findViewByModel(element);
                    //     c.unhighlight();
                    // });
                    // scope.diagram.selectedCell = cellView;
                    // cellView.highlight();
                });

                scope.zoomOut = function () {
                    scope.diagram.graphScale -= 0.1;
                    paperScale(scope.diagram.graphScale, scope.diagram.graphScale);
                };

                scope.zoomIn = function () {
                    scope.diagram.graphScale += 0.1;
                    paperScale(scope.diagram.graphScale, scope.diagram.graphScale);
                };

                scope.resetZoom = function () {
                    scope.diagram.graphScale = 0.5;
                    paperScale(scope.diagram.graphScale, scope.diagram.graphScale);
                };

                scope.reOrder = function () {
                    jointDiagramService3.reOrder(scope.diagram.graph);
                };

                scope.showSameAsLinks = function () {
                    if(!scope.diagram.selectedCell){
                        return;
                    }
                    var cells = jointDiagramService3.showSameAsLinksSvg(scope.diagram.selectedCell);
                    scope.cells = scope.cells.concat(cells);
                };

                scope.showDataTypeReferenceLinks = function () {
                    if(!scope.dataTypeReference){
                        var el = jQuery(jQuery(element[0]).find("div#jointDiagramHolder")[0]);
                        el.find(".joint-type-mc-linktodatatype").hide();
                    }else{
                        var el = jQuery(jQuery(element[0]).find("div#jointDiagramHolder")[0]);
                        el.find(".joint-type-mc-linktodatatype").show();
                    }
                };

                scope.expand = function() {
                    if(scope.mcElement){
                        stateHandler.Go("diagram", {id: scope.mcElement.id}, {location: true});
                    }
                };

            }

            function paperScale(sx, sy) {
                $cookies.put(scope.diagramName+'-scale', sx);
                if(scope.diagram && scope.diagram.paper) {
                    scope.diagram.paper.scale(sx, sy);
                }
            }

            scope.$watch('cells', function (newValue, oldValue, scope) {

                if (newValue && newValue.length > 0) {
                    //create the expand link
                    scope.expandLink = stateHandler.getURL('diagram', {id: scope.mcElement.id});

                    scope.loadingDiagram = true;
                    //Due to the restriction that jointJs has, we need to remove th holder and build it again
                    //if the holder is hidden at the time of building the diagram, it will not show it in the UI!
                    jQuery("#jointDiagramHolder").remove();
                    var jointDiagramHolder = jQuery('<div id="jointDiagramHolder" style="position: relative"></div>');
                    jQuery("#holder").append(jointDiagramHolder);

                    setTimeout(function(){
                        init();
                        handleDragDrop();


                        scope.diagram.graph.clear();
                        scope.diagram.graph.addCells(scope.cells);

                        ////show the links behind the elements
                        // scope.cells.map(function (cell) {
                            // if(cell.isLink()){
                            //     cell.toBack();
                            // }
                        //});

                        ///Highlight the rootCell
                        // if (scope.rootCell) {
                        //     scope.diagram.selectedCell = scope.diagram.paper.findViewByModel(scope.rootCell);
                        //     scope.diagram.selectedCell.highlight();
                        // }

                        var currentScale = $cookies.get(scope.diagramName+'-scale');
                        if(currentScale){
                            scope.scale = parseFloat(currentScale);
                        }else {
                            scope.scale = 0.4;
                        }
                        scope.diagram.graphScale = scope.scale;
                        paperScale(scope.scale, scope.scale);
                        jointDiagramService3.reOrder(scope.diagram.graph);
                        scope.loadingDiagram = false;
                        scope.safeApply();
                    }, 1);

                }else{
                    jQuery("#jointDiagramHolder").remove();
                    scope.loadingDiagram = true;
                    scope.safeApply();
                }
            });

            // scope.$watch('scale', function (newValue, oldValue, scope) {
            //     if (newValue && scope.diagram) {
            //         scope.diagram.graphScale = newValue;
            //         paperScale(newValue, newValue);
            //     }
            // });


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
        controller: function ($scope) {

        }
    };
});







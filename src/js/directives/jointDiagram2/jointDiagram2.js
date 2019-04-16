angular.module('directives').directive('jointDiagram2', function (jointDiagramService2) {
    return {
        restrict: 'E',
        scope: {
            height: '=',
            width: '=',
            gridSize: '=',
            scale: '=',
            rootCell: '=',
            cells: '=',

            diagram: '=' // output
        },
        templateUrl: './jointDiagram2.html',
        link: function (scope, element, attrs) {

            init();
            handleDragDrop();

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
                scope.showSameAs = false;
                scope.showNotSameAs = false;

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
                    interactive: function(cellView, methodName) {
                        //if an element is NOT Interative, then do not Move it
                        if (cellView.model.get('isInteractive') === false) {
                            return false;
                        }
                        return true;
                    }
                });
            }

            function paperScale(sx, sy) {
                scope.diagram.paper.scale(sx, sy);
            }




            scope.$watch('cells', function (newValue, oldValue, scope) {
                if (newValue) {
                    scope.diagram.graph.addCells(scope.cells);
                    if (scope.rootCell) {
                        scope.diagram.selectedCell = scope.diagram.paper.findViewByModel(scope.rootCell);
                        scope.diagram.selectedCell.highlight();
                    }
                    //jointDiagramService2.reOrder(scope.diagram.graph);
                }
            });

            scope.$watch('scale', function (newValue, oldValue, scope) {
                if (newValue) {
                    scope.diagram.graphScale = newValue;
                    paperScale(newValue, newValue);
                }
            });


            //add event handlers to interact with the diagram
            scope.diagram.paper.on('cell:pointerclick', function (cellView, evt, x, y) {

                if(cellView.model.attributes['type'] == 'link'){
                    return
                }

                _.each(scope.diagram.graph.getElements(), function (element) {
                    var c = scope.diagram.paper.findViewByModel(element);
                    c.unhighlight();
                });
                scope.diagram.selectedCell = cellView;
                cellView.highlight();
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
                scope.diagram.graphScale = 1;
                paperScale(scope.diagram.graphScale, scope.diagram.graphScale);
            };

            scope.reOrder = function () {
                jointDiagramService2.reOrder(scope.diagram.graph);
            };

            scope.showSameAsLinks = function () {
                if(!scope.diagram.selectedCell){
                    return;
                }
                var cells = jointDiagramService2.showSameAsLinksSvg(scope.diagram.selectedCell);
                scope.cells = scope.cells.concat(cells);
            }

        },
        controller:  function ($scope) {

        }
    };
});







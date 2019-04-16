angular.module('directives').directive('jointDiagram', function (jointDiagramService) {
	return{
		restrict: 'E',
        scope: {
            height: '=',
            width: '=',
            gridSize: '=',
            diagram: '=',
            mcElement:'=',
            scale:'=',
            cells:'='
		},
		templateUrl: './jointDiagram.html',
		link: function(scope, element, attrs) {

		    scope.showSameAs = false;
            scope.showNotSameAs = false;

            scope.diagram = {
                graph: null,
                paper: null,
                dragStartPosition: null,
                rootMCElement: scope.mcElement,
                currentMCElement:null,
                cellView: null,
                graphScale: 1
            };

            scope.diagram.graph = new joint.dia.Graph;
            scope.diagram.paper = newDiagram(scope.height, scope.width, scope.gridSize, scope.diagram.graph, jQuery(element[0]));
            //createDataModel(scope.diagram.paper);

            scope.$watch('mcElement', function (newValue, oldValue, scope) {
                scope.diagram.mcElement = newValue;
                scope.diagram.currentMCElement = newValue;

                _.each(scope.diagram.graph.getElements(), function(element) {
                    var cellView =  scope.diagram.paper.findViewByModel(element);
                    cellView.model.set('selected', false);
                    if(cellView.model.get('mcElement').id == scope.diagram.currentMCElement.id){
                        cellView.model.set('selected', true);
                        scope.diagram.cellView = cellView;
                    }
                });
            });


            scope.$watch('cells', function (newValue, oldValue, scope) {
                if(newValue){
                    scope.diagram.graph.addCells(scope.cells);
                    jointDiagramService.reOrder(scope.diagram.graph);
                }
            });

            scope.$watch('scale', function (newValue, oldValue, scope) {
                if(newValue){
                    scope.diagram.graphScale = newValue;
                    paperScale(newValue, newValue);
                }
            });




            //add event handlers to interact with the diagram
            scope.diagram.paper.on('cell:pointerclick', function (cellView, evt, x, y) {
                _.each(scope.diagram.graph.getElements(), function(element) {
                    var c =  scope.diagram.paper.findViewByModel(element);
                    c.unhighlight();
                    c.model.set('selected', false);
                });


                cellView.model.set('selected', true);
                //your logic here e.g. select the element
                scope.diagram.currentMCElement = cellView.model.get('mcElement');
                scope.diagram.cellView = cellView;
                cellView.highlight();
                scope.$apply();

            });

            // scope.diagram.paper.on('blank:pointerclick', function (evt, x, y) {
            //     // your logic here e.g. unselect the element by clicking on a blank part of the diagram
            // });

            // scope.diagram.paper.on('link:options', function (evt, cellView, x, y) {
            //     // your logic here: e.g. select a link by its options tool
            // });

            // scope.diagram.graph.on('all', function (eventName, cell) {
            //     console.log(arguments);
            // });


            // scope.diagram.paper.on('blank:mousewheel', function(event, x, y, delta){
            //     debugger
            //     var scale = scope.diagram.paper.scale();
            //     scope.diagram.paper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
            // });



            //https://resources.jointjs.com/tutorials/joint/tutorials/hierarchy.html
            scope.diagram.graph.on('change:position', function(cell) {
                var parentId = cell.get('parent');
                if (!parentId) return;

                var parent = scope.diagram.graph.getCell(parentId);
                var parentBbox = parent.getBBox();
                var cellBbox = cell.getBBox();

                if (parentBbox.containsPoint(cellBbox.origin()) &&
                    parentBbox.containsPoint(cellBbox.topRight()) &&
                    parentBbox.containsPoint(cellBbox.corner()) &&
                    parentBbox.containsPoint(cellBbox.bottomLeft())) {

                    // All the four corners of the child are inside
                    // the parent area.
                    return;
                }

                // Revert the child position.
                cell.set('position', cell.previous('position'));
            });


            scope.diagram.paper.on('blank:pointerdown',
                function (event, x, y) {
                    var scale = V(scope.diagram.paper.viewport).scale();
                    scope.diagram.dragStartPosition = { x: x * scale.sx, y: y * scale.sy};
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


            function newDiagram(height, width, gridSize, graph, targetElement) {
                var paper = new joint.dia.Paper({
                    el: targetElement.find("div#jointDiagramHolder")[0],
                    width: width,
                    height: height,
                    gridSize: gridSize,
                    model: graph
                });
                return paper;
            }




            function paperScale(sx, sy) {
                scope.diagram.paper.scale(sx, sy);
            }

            scope.zoomOut = function() {
              scope.diagram.graphScale -= 0.1;
			  paperScale(scope.diagram.graphScale, scope.diagram.graphScale);
			 };

            scope.zoomIn = function() {
                scope.diagram.graphScale += 0.1;
                paperScale(scope.diagram.graphScale, scope.diagram.graphScale);
			};

            scope.resetZoom = function() {
                scope.diagram.graphScale = 1;
                paperScale(scope.diagram.graphScale, scope.diagram.graphScale);
			};


			scope.reOrder = function () {
                var graphBBox = jointDiagramService.reOrder(scope.diagram.graph);
                // var graphBBox = joint.layout.DirectedGraph.layout(scope.diagram.graph, {
                //     marginY: 10,
                //     marginX: 10,
                //     nodeSep: 20,  //a number of pixels representing the separation between adjacent nodes in the same rank
                //     edgeSep: 120, //a number of pixels representing the separation between adjacent edges in the same rank
                //     rankSep: 150,//a number of pixels representing the separation between ranks
                //     rankDir: "TB"
                // });
            };


			scope.showSameAsLinks = function(){
			    if(scope.showSameAs == true){
                    var cells = jointDiagramService.showSameAsLinks(scope.diagram.cellView);
                    scope.diagram.graph.addCells(cells);
                    scope.reOrder();
                }else{
                    jointDiagramService.removeSameAsLinks(scope.diagram.graph, scope.diagram.paper);
                }
            };


            scope.showNotSameAsLinks = function(){

            };


			function createDataModel(paperV) {
                if(!joint.shapes.html || (joint.shapes.html && !joint.shapes.html.DataModel)){
                    joint.shapes.html = {};

                    joint.shapes.html.DataModel = joint.shapes.basic.Rect.extend({
                        defaults: _.defaultsDeep({
                            type: 'html.Element',
                            attrs: {
                                rect: {stroke: 'none', 'fill-opacity': 0}
                            }
                        }, joint.shapes.basic.Rect.prototype.defaults)
                    });

                    joint.shapes.html.ElementView = joint.dia.ElementView.extend({
                        template: [
                            '<div class="data-model-element">',
                                '<div class="title"></div>',
                                '<span></span>',
                            '</div>'
                        ].join(''),

                        initialize: function () {
                            _.bindAll(this, 'updateBox');
                            joint.dia.ElementView.prototype.initialize.apply(this, arguments);

                            this.$box = $(_.template(this.template)());


                            this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
                            // Update the box position whenever the underlying model changes.
                            this.model.on('change', this.updateBox, this);

                            // Remove the box when the model gets removed from the graph.
                            this.model.on('remove', this.removeBox, this);


                            this.listenTo(paperV, 'scale', this.updateBox);
                            this.listenTo(paperV, 'translate', this.updateBox);

                            this.updateBox();
                        },
                        render: function (args) {

                            joint.dia.ElementView.prototype.render.apply(this, arguments);
                            this.paper.$el.prepend(this.$box);
                            this.updateBox();
                            return this;
                        },
                        updateBox: function () {

                            // Set the position and dimension of the box so that it covers the JointJS element.
                            var bbox = this.model.getBBox({useModelGeometry: true});
                            var scale = joint.V(paperV.viewport).scale();

                            // Example of updating the HTML with a data stored in the cell model.
                            this.$box.find('div.title').text(this.model.get('label'));
                            this.$box.find('span').text(this.model.get('select'));

                            console.log(this.$box.find('div.title'));


                            if(this.model.get('selected') == true){
                                this.$box.addClass('data-model-element-selected');
                            }else{
                                this.$box.removeClass('data-model-element-selected');
                            }

                            this.$box.css({
                                transform: 'scale(' + scale.sx + ',' + scale.sy + ') rotate(' + (this.model.get('angle') || 0) + 'deg)',
                                transformOrigin: '0 0',
                                width: bbox.width,
                                height: bbox.height,
                                left: (bbox.x * scale.sx) + paperV.options.origin.x,
                                top: (bbox.y * scale.sy) + paperV.options.origin.y
                            });
                        },
                        removeBox: function (evt) {
                            this.$box.remove();
                        }
                    });
                }
            }


        },
		controller: function($scope){

		}
	};
});







angular.module('services').factory('jointDiagramDirectedGraph', function ($q, resources, elementTypes) {



    var getTextWidthInPixel = function (text, fontSize) {
        //multiple it to 1.1 (as the returned value form jQuery span is smaller that what I expected!)
        return Math.round(jQuery("#textSampling").css('font-size', fontSize + 'px').text(text).width() * 1.1);
    };
    var reShapeNodeName = function (name, width, fontName, fontSize) {
        var titlePixel = getTextWidthInPixel(name, fontName);
        //if title has a larger width than the membersMaxWidth, then break it into multiple lines
        if (titlePixel > width) {
            var multipleLineText = joint.util.breakText(name, {width: width}, {'font-size': fontSize});
            return multipleLineText.split('\n');
        }
        return [name];
    };
    var getHeight = function (newNameArray) {
        var titleLines = newNameArray.length;
        return titleLines * 15 + 20;// we assume each line has 15pixel height + 20 for top padding
    };



    var Shape = joint.dia.Element.define('demo.Shape', {
        size: {
            width: 200,
            height: 50
        },
        attrs: {
            rect: {
                refWidth: '100%',
                refHeight: '100%',
                fill: '#ededed',
                stroke: '#000',
                strokeWidth: 1,
                cursor: 'pointer'
            },
            'text.el-name': {
                refX: '50%',
                refY: '50%',
                yAlignment: 'middle',
                xAlignment: 'middle',
                fontSize: 15,
                font:"Helvetica Neue",
                fill:'#337ab7'
            },
            'a.el-name': {'xlink:href': 'http://jointjs.com', 'xlink:show': 'new', cursor: 'pointer'},
        }
    }, {
        markup: '<rect/><a class="el-name" target="_blank"><text class="el-name"/></a>',

        setText: function(text) {
            var width    = this.prop('size/width');
            var height   = this.prop('size/height');
            var fontName = this.prop('attrs/text/font');
            var fontSize = this.prop('attrs/text/fontSize');

            var newName   = reShapeNodeName(text, width, fontName, fontSize);
            var newHeight = getHeight(newName);
            var newNameDisplay = newName.map(function (line, index) {
                var nameWithNewLine = line;
                if(index !== newName.length-1){
                    nameWithNewLine +="\n";
                }
                return nameWithNewLine;
            });
            this.attr('size/height', newHeight);
            if(newNameDisplay && newNameDisplay.length >= 2){
                this.prop('size/width', width + 40);//add some padding
                this.prop('size/height', newHeight + 8);//add some padding
            }


            var mc =  this.attributes["mc"];
            var url = 'https://modelcatalogue.cs.ox.ac.uk/catalogue/';
            var mcURL = elementTypes.getLinkUrl(mc);
            if(mc && mcURL){
                url = mcURL;
            }
            this.attr('a.el-name/xlink:href',url);


            return this.attr('text/text', newNameDisplay || '');
        },
        setCustomAttrs: function (node) {
            var self = this;
            angular.forEach(node.attrs, function (attr) {
                self.attr(attr.key, attr.value);
            });
            return self;
        },
        setMCObject: function (mcObject) {
            this.attributes["mc"] = mcObject;
            return this;
        }

    });


    var Link = joint.dia.Link.define('demo.Link', {
        attrs: {
            '.connection': {
                stroke: '#205081',
                strokeWidth: 2,
                cursor: 'pointer',
                targetMarker: {
                    type: 'path',
                    // fill: 'gray',
                    // stroke: 'none',
                    // d: 'M 10 -10 0 0 10 10 z'
                    fill: '#205081',
                    stroke: 'none',
                    d: 'M 10 -5 10 5 0 0 z'
                }
            }
        },
        connector: {
            name: 'rounded'
        },
        z: -1,
        weight: 1,
        minLen: 1,
        labelPosition: 'c',
        labelOffset: 10,
        labelSize: {
            width: 50,
            height: 30
        },
        labels: [{
            markup: '<rect/><text/>',
            attrs: {
                text: {
                    fill: '#000',
                    textAnchor: 'middle',
                    refY: 5,
                    refY2: '-10%',
                    fontSize: 15,
                    fontWeight:'normal',
                    font:"Helvetica Neue",
                    cursor: 'pointer'
                },
                rect: {
                    fill: 'transparent',
                    stroke: 'transparent',
                    strokeWidth: 1,
                    refWidth: '100%',
                    refHeight: '100%',
                    refX: '-50%',
                    refY: '-50%',
                    rx: 2,
                    ry: 2,
                    cursor: 'pointer'
                }
            },
            size: {
                width: 50, height: 20
            }
        }]

    }, {
        markup: '<path class="connection"/><g class="labels"/>',

        connect: function(sourceId, targetId) {
            return this.set({
                source: { id: sourceId },
                target: { id: targetId }
            });
        },
        setLabelText: function(text) {
            var fontName = this.prop('labels/0/attrs/text/font');
            var titlePixel = getTextWidthInPixel(text, fontName);
            var len = Math.round(titlePixel/100) + 1;
            // if(this.attributes.source.id !== this.attributes.target.id){
            //     this.prop('minLen', len*2);
            //     this.prop('labels/0/size/width', len*100);
            // }
            if(text && text.length > 0) {
                this.prop('minLen', len * 2);
                this.prop('labels/0/size/width', len * 100);
                this.prop('labels/0/attrs/text/text', text || '');
            }else{
                this.prop('minLen', 1);
                this.prop('labels/0/size/width', 100);
                this.prop('labels/0/attrs/text/text','   ');
            }

            return this;
        },
        setCustomAttrs: function (node) {
            var self = this;
            angular.forEach(node.attrs, function (attr) {
                self.prop(attr.key, attr.value);
            });
            return self;
        },
        setMCObject: function (mcObject) {
            this.attributes["mc"] = mcObject;
            return this;
        }
    });



    var LayoutControls = joint.mvc.View.extend({

        events: {
            change: 'layout',
            input: 'layout'
        },

        options: {
            padding: 50,
        },

        init: function() {

            var options = this.options;
            if (options.adjacencyList) {
                options.cells = this.buildGraphFromAdjacencyList(options.adjacencyList, options.nodes, options.links);
            }

            this.listenTo(options.paper.model, 'change', function(cell, opt) {
                if (opt.layout) {
                    this.layout();
                }
            });





            //Handle Drag & Drop for the canvas........................................
            //Moving the paper we need to change Origin
            options.paper.on('blank:pointerdown', function (event, x, y) {
                var scale = V(options.paper.viewport).scale();
                options.dragStartPosition = {x: x * scale.sx, y: y * scale.sy};
            });
            options.paper.on('cell:pointerup blank:pointerup', function (cellView, x, y) {
                options.dragStartPosition = null;
            });
            if(options.holderDiv) {
                jQuery(options.holderDiv).on("mousemove", function (event) {
                    if (options.dragStartPosition) {
                        options.paper.setOrigin(
                            event.offsetX - options.dragStartPosition.x,
                            event.offsetY - options.dragStartPosition.y);
                    }
                });
            }
            //............................................................................



        },

        layout: function(rankSep, edgeSep, nodeSep, rankDir) {

            var paper = this.options.paper;
            var graph = paper.model;
            var cells = this.options.cells;
            var scale = this.options.scale ? this.options.scale : 1.0;

            joint.layout.DirectedGraph.layout(cells, this.getLayoutOptions(rankSep, edgeSep, nodeSep, rankDir));

            if (graph.getCells().length === 0) {
                // The graph could be empty at the beginning to avoid cells rendering
                // and their subsequent update when elements are translated
                graph.resetCells(cells);
            }


            paper.fitToContent({
                padding: this.options.padding,
                minWidth: this.options.width,
                minHeight: this.options.height,
                allowNewOrigin: 'any'
            });

            this.trigger('layout');
            this.options.paper.scale(scale, scale);
        },

        zoomIn: function(){
            this.options.scale += 0.1;
            this.options.paper.scale(this.options.scale, this.options.scale);
            return  this.options.scale;
        },

        zoomOut: function(){
            if(this.options.scale*100 < 11){
                return this.options.scale;
            }

            this.options.scale -= 0.1;
            this.options.paper.scale(this.options.scale, this.options.scale);
            return  this.options.scale;
        },

        resetZoom: function(){
            this.options.paper.scale(this.options.defaultScale, this.options.defaultScale);
            return  this.options.defaultScale;
        },

        autoLayout: function(){
            this.options.scale = 1.0;
            this.layout();
        },

        getLayoutOptions: function(rankSep, edgeSep, nodeSep, rankDir) {
            return {
                setVertices: true,
                setLabels: true,
                ranker: this.$('#ranker').val() ? this.$('#ranker').val() : "network-simplex",
                rankDir: rankDir ? rankDir : "LR",
                align: this.$('#align').val() ? this.$('#align').val() : "UL",
                rankSep: rankSep ? rankSep : 50,
                edgeSep: edgeSep ? edgeSep : 50,
                nodeSep: nodeSep ? nodeSep : 50
            };
        },

        buildGraphFromAdjacencyList: function(adjacencyList, nodes, links) {

            var elements = [];
            var UILinks = [];

            Object.keys(adjacencyList).forEach(function(parentLabel) {
                // Add element
                elements.push(
                    new Shape({ id: parentLabel }).setMCObject(nodes[parentLabel]).setText(nodes[parentLabel].label).setCustomAttrs(nodes[parentLabel])
                );

                // Add links
                adjacencyList[parentLabel].forEach(function(childLabel) {
                    UILinks.push(
                        new Link()
                            .connect(parentLabel, childLabel.target)
                            .setMCObject(links[childLabel.link])
                            .setLabelText(links[childLabel.link].label )
                            .setCustomAttrs(links[childLabel.link])

                    );
                });
            });

            // Links must be added after all the elements. This is because when the links
            // are added to the graph, link source/target
            // elements must be in the graph already.
            return elements.concat(UILinks);
        }

    });

    var LinkControls = joint.mvc.View.extend({

        highlighter: {
            name: 'stroke',
            options: {
                attrs: {
                    'stroke': '#ff9933',
                    'stroke-width': 4
                }
            }
        },

        events: {
            change: 'updateLink',
            input: 'updateLink'
        },

        init: function() {
            this.highlight();
            // this.updateControls();
        },

        // updateLink: function() {
        //     this.options.cellView.model.set(this.getModelAttributes(), { layout: true });
        // },

        // updateControls: function() {
        //     var link = this.options.cellView.model;
        //     this.$('#labelpos').val(link.get('labelPosition'));
        //     this.$('#labeloffset').val(link.get('labelOffset'));
        //     this.$('#minlen').val(link.get('minLen'));
        //     this.$('#weight').val(link.get('weight'));
        // },

        // getModelAttributes: function() {
        //     return {
        //         minLen: parseInt(this.$('#minlen').val(), 10),
        //         weight: parseInt(this.$('#weight').val(), 10),
        //         labelPosition: this.$('#labelpos').val(),
        //         labelOffset: parseInt(this.$('#labeloffset').val(), 10)
        //     };
        // },

        onRemove: function() {
            this.unhighlight();
        },

        highlight: function() {
            if(this.options.cellView.model.attributes['type'] === "demo.Shape"){
                this.options.cellView.highlight('rect', { highlighter: this.highlighter });
            }else {
                this.options.cellView.highlight('.connection', {highlighter: this.highlighter});
            }
        },

        unhighlight: function() {
            if(this.options.cellView.model.attributes['type'] === "demo.Shape"){
                this.options.cellView.unhighlight('rect', { highlighter: this.highlighter });
            }else{
                this.options.cellView.unhighlight('.connection', { highlighter: this.highlighter });
            }
        }

    }, {

        create: function(linkView) {
            this.remove();
            this.instance = new this({
                //el: this.template.cloneNode(true),
                cellView: linkView
            });
            //this.instance.$el.insertAfter('#layout-controls');
        },

        remove: function() {
            if (this.instance) {
                this.instance.remove();
                this.instance = null;
            }
        },

        refresh: function() {
            if (this.instance) {
                this.instance.unhighlight();
                this.instance.highlight();
            }
        },

        instance: null,

        //template: document.getElementById('link-controls-template').content.querySelector('.controls')

    });



    return {


        createDM2DMGraph: function(dataFlows, rootDataModel){
            var adjacencyList = {};
            var nodes = {};
            var links = {};


            //Sort the list before drawing
            var sortedList = _.sortBy(dataFlows, "id");

            angular.forEach(sortedList, function (dataFlow) {
                if (!adjacencyList[dataFlow.source.id]) {
                    adjacencyList[dataFlow.source.id] = [];
                }
                if (!adjacencyList[dataFlow.target.id]) {
                    adjacencyList[dataFlow.target.id] = [];
                }
                adjacencyList[dataFlow.source.id].push({
                    target: dataFlow.target.id,
                    link: dataFlow.id
                });
                if (!nodes[dataFlow.source.id]) {
                    nodes[dataFlow.source.id] = dataFlow.source;
                }
                if (!nodes[dataFlow.target.id]) {
                    nodes[dataFlow.target.id] = dataFlow.target;
                }
                links[dataFlow.id] = dataFlow;

                if(dataFlow.source.id ===  rootDataModel.id){
                    nodes[dataFlow.source.id].attrs =[];
                    nodes[dataFlow.source.id].attrs.push({key:'rect/strokeWidth', value: '2'});
                    nodes[dataFlow.source.id].attrs.push({key:'rect/stroke',  value: '#205081'});
                    nodes[dataFlow.source.id].attrs.push({key:'rect/fill',  value: '#e0edf9'});
                    nodes[dataFlow.source.id].attrs.push({key:'text/fontWeight',  value: 'bold'});
                }
                if(dataFlow.target.id ===  rootDataModel.id){
                    nodes[dataFlow.target.id].attrs =[];
                    nodes[dataFlow.target.id].attrs.push({key:'rect/strokeWidth', value: '2'});
                    nodes[dataFlow.target.id].attrs.push({key:'rect/stroke',  value: '#205081'});
                    nodes[dataFlow.target.id].attrs.push({key:'rect/fill',  value: '#e0edf9'});
                    nodes[dataFlow.target.id].attrs.push({key:'text/fontWeight',  value: 'bold'});
                }
            });

            return {
                adjacencyList: adjacencyList,
                nodes:nodes,
                links:links
            };
        },


        createDC2DCGraph: function(dataFlows){
            var adjacencyList = {};
            var nodes = {};
            var links = {};

            angular.forEach(dataFlows, function (dataFlow) {
                if (!adjacencyList[dataFlow.source.id]) {
                    adjacencyList[dataFlow.source.id] = [];
                }
                adjacencyList[dataFlow.source.id].push({
                    target: dataFlow.target.id,
                    link: dataFlow.source.id + "-" + dataFlow.target.id
                });

                if (!adjacencyList[dataFlow.target.id]) {
                    adjacencyList[dataFlow.target.id] = [];
                }


                if (!nodes[dataFlow.source.id]) {
                    nodes[dataFlow.source.id] = dataFlow.source;
                }
                if (!nodes[dataFlow.target.id]) {
                    nodes[dataFlow.target.id] = dataFlow.target;
                }
                dataFlow.label = "";
                dataFlow.domainType = "DC2DCLink";
                links[dataFlow.source.id + "-" + dataFlow.target.id] = dataFlow;
            });

            return {
                adjacencyList: adjacencyList,
                nodes:nodes,
                links:links
            };
        },

        build: function (paperElement, layOutControls, adjacencyList, nodes, links, onElementClick, onElementDbClick, scale, width, height, rankSep, edgeSep, nodeSep, rankDir) {

            var controls = new LayoutControls({
                holderDiv: paperElement,
                scale:scale,
                defaultScale: 0.8,
                el: layOutControls,
                width: width,
                height: height,
                
                paper: new joint.dia.Paper({
                    el: paperElement,
                    width: width,
                    height: height,
                    interactive: function(cellView) {
                        return cellView.model.isElement();
                    }
                }).on({
                    // 'link:pointerdown': function (event) {
                    //     LinkControls.create(event);
                    //     if(onElementClick){
                    //         onElementClick(event);
                    //     }
                    // },
                    'blank:pointerdown': function () {
                        LinkControls.remove(event);
                        if(onElementClick){
                            onElementClick(null);
                        }
                    },
                    'cell:pointerdown': function (event) {
                        LinkControls.create(event);
                        if(onElementClick){
                            onElementClick(event);
                        }
                    },
                    'cell:pointerdblclick': function (event) {
                        if(onElementDbClick){
                            onElementDbClick(event);
                        }
                    },
                }, LinkControls),
                adjacencyList: adjacencyList,
                nodes: nodes,
                links: links,
            }).on({
                'layout': LinkControls.refresh
            }, LinkControls);


            controls.layout(rankSep, edgeSep, nodeSep, rankDir);

            return controls;

        }

    };
});

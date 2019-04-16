angular.module('services').factory('jointDiagramServiceRecursiveDataflow', function () {

    joint.shapes.mcDFChain = {};

    joint.shapes.mcDFChain.Component = joint.shapes.basic.Generic.extend({

        markup: [
            '<g class="rotatable">',
            '<g class="scalable">',
            '<rect class="uml-class-name-rect"/><rect class="uml-class-attrs-rect"/>',
            '</g>',
            '<a class="uml-class-name-link" target="_blank"><text class="uml-class-name-text"/></a>',
            '</g>'
        ].join(''),


        defaults: _.defaultsDeep({

            type: 'mcDFChain.Component',

            ports: {
                groups: {
                    left: {
                        position: 'left' ,
                        attrs: {
                            '.joint-port-body': { r: 0 },
                        },
                    },
                    right: {
                        position: 'right',
                        attrs: {
                            '.joint-port-body': { r: 0 },
                        },
                    },
                    bottom: {
                        position: 'bottom',
                        attrs: {
                            '.joint-port-body': { r: 0 },
                        },
                    },
                },
                items: [{ id:'left', group: 'left' }, { id:'right', group: 'right' }, { id:'bottom', group: 'bottom' }]
            },

            attrs: {
                rect: {
                    'width': 500,

                },
                '.uml-class-name-rect': {fill: '#ededed', stroke: '#000', 'stroke-width': 1},

                'a.uml-class-name-link': {'xlink:href': 'http://jointjs.com', 'xlink:show': 'new', cursor: 'pointer'},

                '.uml-class-name-text': {
                    'ref': '.uml-class-name-rect',
                    'ref-y': .5,
                    'ref-x': .5,
                    'text-anchor': 'middle',
                    'y-alignment': 'middle',
                    'fill': '#337ab7',
                    'font-size': 14,
                    'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif'
                },
            },

            mcType: 'dataModelComponent',
            url: null,
            name: [],
            attributes: [],
            isRoot: false

        }, joint.shapes.basic.Generic.prototype.defaults),

        initialize: function () {
            var self = this;
            var attrs = this.get('attrs');
            var isRoot = this.get('isRoot');

            if(isRoot){
                attrs[".uml-class-name-rect"].fill   = "#e0edf9";
                attrs[".uml-class-name-rect"].stroke = "#205081";
                attrs[".uml-class-name-rect"]["stroke-width"] = 2;

                attrs[".uml-class-name-text"]["font-weight"] = 'bold';
                attrs[".uml-class-name-text"]["font-size"] = 14;
            }else{
                attrs[".uml-class-name-rect"].fill   = "#ededed";
                attrs[".uml-class-name-rect"].stroke = "#000";
                attrs[".uml-class-name-rect"]["stroke-width"] = 1;
            }

            var url = this.get('url') || 'https://modelcatalogue.cs.ox.ac.uk/catalogue/';
            attrs['a.uml-class-name-link']['xlink:href'] = url;


            this.on('change:name change:attributes change:methods', function () {
                this.updateRectangles();
                this.trigger('uml-update');
            }, this);

            this.updateRectangles();

            joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
        },

        getClassName: function () {
            var name = this.get('name');
            var titleFont = this.attr('.uml-class-name-text')['font-size'];
            var title = this.get('name');
            var titlePixel = this.getTextWidthInPixel(title, titleFont);
            var width = this.getWidth();

            //if title has a larger width than the membersMaxWidth, then break it into multiple lines
            if (titlePixel > width) {
                var multipleLineText = joint.util.breakText(name, {width: width}, {'font-size': titleFont});
                return multipleLineText.split('\n');
            }
            return [name];
        },

        getHeight: function () {
            var memberLines = this.get('attributes').length;
            var titleLines = this.getClassName().length;
            return (memberLines + titleLines) * 15 + 20;// we assume each line has 15pixel height + 20 for top padding
        },

        getTextWidthInPixel: function (text, fontSize) {
            //multiple it to 1.1 (as the returned value form jQuery span is smaller that what I expected!)
            return Math.round(jQuery("#textSampling").css('font-size', fontSize + 'px').text(text).width() * 1.1);
        },

        getWidth: function () {
            var titleFont = this.attr('.uml-class-name-text')['font-size'];
            var maxMember = this.getMembersWidth();
            var maxMemberPixel = maxMember.width != 0 ? this.getTextWidthInPixel(maxMember.label, titleFont) : 0;
            var originalWidthPixel = 200;//this.size()['width'];
            var width = 0;

            //No Members, so use the original width (200)
            if (maxMemberPixel <= originalWidthPixel) {
                width = originalWidthPixel;
            } else {
                //use maxMemberPixel
                width = maxMemberPixel;
            }
            return width;
        },

        getMembersWidth: function () {
            var self = this;
            var mcMembers = this.get('attributes');
            var mcMembersWidth = 0;
            var mcMembersMaxWidth = "";
            _.each(mcMembers, function (mcMember, i, v) {
                var memberType = self.getMemberType(mcMember);
                var memberText = mcMember.label.replace('\n', '');
                var memberTypeText = memberType ? ": " + memberType.label : "";

                if ((memberText + memberTypeText).length > mcMembersWidth) {
                    mcMembersWidth = mcMember.label.length + 3 + memberTypeText.length;
                    mcMembersMaxWidth = memberText + memberTypeText;
                }
            });
            return {width: mcMembersWidth, label: mcMembersMaxWidth};
        },

        getMemberType: function (member) {
            return null;
        },

        updateRectangles: function () {
            var self = this;
            var attrs = this.get('attrs');
            var offsetY = 0;

            //First Resize the main Rect to the right Width & Height
            this.resize(this.getWidth(), this.getHeight());

            var rects = [
                {type: 'name', text: this.getClassName()},
            ];

            _.each(rects, function (rect) {
                var lines = _.isArray(rect.text) ? rect.text : [rect.text];
                var rectHeight = lines.length * 15 + 15;
                //attrs['.uml-class-' + rect.type + '-text'].text = lines.join('\n');
                attrs['.uml-class-' + rect.type + '-rect'].height = rectHeight;
                attrs['.uml-class-' + rect.type + '-rect'].transform = 'translate(0,' + offsetY + ')';

                offsetY += rectHeight;
            });
            attrs['.uml-class-name-text'].text = this.getClassName().join('\n');

            var paddingTop = 5;
            var lineSpace = 15;
            var mcMembers = this.get('attributes');
            var mcMembersHeight = 0;
            _.each(mcMembers, function (mcMember, i) {
                attrs['.uml-member-name-text-' + i].text = mcMember.label.replace('\n', '') + " ";
                attrs['.uml-member-name-text-' + i]['ref-y'] = i * lineSpace + paddingTop;
                attrs['.uml-member-name-text-' + i]['ref-x'] = 5;
                attrs['a.uml-member-name-link-' + i]['xlink:href'] = mcMember.url ? mcMember.url : '';

                var tp = self.getMemberType(mcMember);
                if (tp) {
                    attrs['.uml-member-type-text-' + i].text = ": " + tp.label;
                    attrs['.uml-member-type-text-' + i]['ref-y'] = -1;
                    attrs['.uml-member-type-text-' + i]['ref-x'] = 0.99;//mcMember.label.length * 7;
                    attrs['a.uml-member-type-link-' + i]['xlink:href'] = tp.url;
                }
                mcMembersHeight += lineSpace;
            });

        },


    });
    joint.shapes.mcDFChain.ComponentView = joint.dia.ElementView.extend({

        initialize: function () {

            joint.dia.ElementView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'uml-update', function () {
                this.update();
                this.resize();
            });
        }
    });

    joint.shapes.mcDFChain.DataModel = joint.shapes.mcDFChain.Component.extend({
        defaults: _.defaultsDeep({
            type: 'mcDFChain.DataModel',
            mcType: 'datamodel',
        }, joint.shapes.mcDFChain.Component.prototype.defaults),

        operation: function () {
            return true;
        }
    });
    joint.shapes.mcDFChain.DataModelView = joint.shapes.mcDFChain.ComponentView;

    joint.shapes.mcDFChain.DataClass = joint.shapes.mcDFChain.Component.extend({
        defaults: _.defaultsDeep({
            type: 'mcDFChain.DataClass',
            mcType: 'dataclass',
        }, joint.shapes.mcDFChain.Component.prototype.defaults),

        operation: function () {
            return true;
        },

        getMemberType: function (member) {
            return member.dataType;
        },
    });
    joint.shapes.mcDFChain.DataClassView = joint.shapes.mcDFChain.DataClassView;

    joint.shapes.mcDFChain.Association2 = joint.dia.Link.extend({

        defaults: _.defaultsDeep({
            type: 'mcDFChain.Association2',

            connector: {name: 'rounded'},

            attrs: {
                '.connection': { stroke: '#205081', 'stroke-width': 1 },
                //other attributes
                '.link-tools': {display: 'none'},
                '.marker-arrowheads': {display: 'none'},
                '.marker-vertices': {display: 'none'},
                // '.connection-wrap': { display: 'none' },
                '.marker-target': {d: 'M 10 -5 10 5 0 0 z', 'stroke-width': 0, fill: '#000'},
                '.marker-source': {d: 'M 0 0 a 3 3 0 1 0 0 1', 'stroke-width': 0, fill: '#000'}

            },
            dataflow: null,
        }, joint.dia.Link.prototype.defaults),

        setDataflow: function (dataflow) {
            this.dataflow = dataflow;
            return this;
        }
    });


    mcDFChain = joint.shapes.mcDFChain;

    return {
        findLinks: function (dataflow, dataModelsMap, rootDataModel) {

            var source = dataflow.source;
            var target = dataflow.target;
            var linkType = dataflow.linkType;

            if (!dataModelsMap[source.id]) {
                dataModelsMap[source.id] = {
                    id: source.id,
                    label: source.label,
                    isRootCell: rootDataModel.id === source.id,
                    links: {},
                };
            }

            if (!dataModelsMap[target.id]) {
                dataModelsMap[target.id] = {
                    id: target.id,
                    label: target.label,
                    isRootCell: rootDataModel.id === target.id,
                    links: {}
                };
            }
            if (linkType === "Is From") {
                if (!dataModelsMap[target.id].links[source.id]) {
                    dataModelsMap[target.id].links[source.id] = ataModelsMap[target.id].links[source.id] || [];
                    dataModelsMap[target.id].links[source.id].push({
                        id: source.id,
                        label: source.label,
                        dataflow:{
                            id: dataflow.id,
                            label: dataflow.label,
                            description: dataflow.description,
                            source: {id:source.id, label:source.label},
                            target: {id:target.id, label:target.label},
                        }
                    });
                }
            } else {
                //if (!dataModelsMap[source.id].links[target.id]) {
                    dataModelsMap[source.id].links[target.id] = dataModelsMap[source.id].links[target.id] || [];
                    dataModelsMap[source.id].links[target.id].push({
                        id: target.id,
                        label: target.label,
                        dataflow:{
                            id: dataflow.id,
                            label: dataflow.label,
                            description: dataflow.description,
                            source: {id:source.id, label:source.label},
                            target: {id:target.id, label:target.label},
                        }
                    });
                //}
            }

            // for (var i = 0; source.semanticLinks && i < source.semanticLinks.length; i++) {
            //     this.findLinks(source.semanticLinks[i], dataModelsMap, rootDataModel);
            // }
            //
            // for (var i = 0; target.semanticLinks && i < target.semanticLinks.length; i++) {
            //     this.findLinks(target.semanticLinks[i], dataModelsMap, rootDataModel);
            // }

        },

        drawDFChain: function (rootDataModel, recursiveDataflows) {
            var dataModelsMap = {};


            //sort dataflows before drawing
            var sortedList = _.sortBy(recursiveDataflows.items, "id");

            for (var i = 0; i < sortedList.length; i++) {
                this.findLinks(sortedList[i], dataModelsMap, rootDataModel);
            }
            var cellsMap = {};
            var cells = [];
            var links = [];
            var rootCell = null;


            //create all data models
            for (var dm in dataModelsMap) {
                if (dataModelsMap.hasOwnProperty(dm)) {
                    var isRoot = rootDataModel.id === dm;

                    var cell = this.DrawDataModel(dataModelsMap[dm], isRoot);
                    // cells = [].concat(cells).concat(result.cells);
                    cells.push(cell);
                    cellsMap[dataModelsMap[dm].id] = cell;
                    if(rootDataModel.id === dm){
                        rootCell = cell;
                    }
                }
            }
            //create all links
            for (var dm in dataModelsMap) {
                //create the link
                for (var l in dataModelsMap[dm].links) {

                    var allLinks = dataModelsMap[dm].links[l];

                    for (var i = 0; i < allLinks.length; i++) {
                        var sourceDM = dataModelsMap[dm];
                        var targetDM = allLinks[i];
                        var dataflow = allLinks[i].dataflow;

                        var sourceDMUI = cellsMap[sourceDM.id];
                        var targetDMUI = cellsMap[targetDM.id];

                        var link = this.dm2dmLink(sourceDMUI, targetDMUI, dataflow);
                        links.push(link);
                    }


                }
            }
            return {
                cells: [].concat(cells).concat(links),
                rootCell: rootCell,
                cellsMap: cellsMap,
                links: links
            };
        },

        DrawDataModel: function (dataModel, isRoot) {
            var dmUrl = stateHandler.getURL("appContainer.mainApp.twoSidePanel.catalogue.dataModel", {id: dataModel.id});
            var dmCell = new mcDFChain.DataModel({
                position: {x: 500, y: 400},
                name: dataModel.label,
                mcData: dataModel,
                url: dmUrl,
                isRoot:isRoot
            });
            return dmCell;
        },

        dm2dmLink: function (srcDMCell, targetDMCell, dataflow) {
            //Good examples of links in jointJS
            //https://resources.jointjs.com/demos/links
            //https://resources.jointjs.com/demos/joint/demo/links/src/links.js

            var startPort = "right";
            var endPort   = "left";
            var router = 'metro';
            var routerArgs = {
                maxAllowedDirectionChange:70,
                endDirection:["left"]
            };

            if(srcDMCell.id === targetDMCell.id){
                startPort = "bottom";
                endPort = "bottom";
                router = "normal";
            }


            var link = new mcDFChain.Association2({
                router: {
                    name: router,
                    args: routerArgs
                }, //manhattan oneSide metro  orthogonal
                source: {id: srcDMCell.id, port: startPort},
                target: {id: targetDMCell.id, port: endPort},
                labels: [
                    {
                        attrs: {
                            text: {
                                text: dataflow.label,
                                fontSize:'12px',
                                fontWeight:'normal',
                                fontStyle:'italic' ,
                                fontFamily:'Helvetica Neue'
                                },
                            rect: {
                                fill: 'none',

                            },
                        },
                        position: {
                            distance: 0.5,
                            offset: {
                                y: 9
                            }
                        }

                    }
                    // {
                    //     attrs: {
                    //         text: {
                    //             text: 'fancy label',
                    //             fill: '#f6f6f6',
                    //             fontFamily: 'sans-serif'
                    //         },
                    //         rect: {
                    //             stroke: '#7c68fc',
                    //             strokeWidth: 20,
                    //             rx: 5,
                    //             ry: 5
                    //         }
                    //     },
                    //     position: 0.5
                    // }
                ]
            });
            link.setDataflow(dataflow);
            return link;
        },

        reOrder: function (graph) {
            var graphBBox = joint.layout.DirectedGraph.layout(graph, {
                // nodeSep: 50,
                // edgeSep: 190,
                // rankDir: "TB"
                ranker: "tight-tree",//longest-path, tight-tree, network-simplex
                marginY: 100,
                marginX: 100,
                nodeSep: 50,  //a number of pixels representing the separation between adjacent nodes in the same rank
                edgeSep: 100, //a number of pixels representing the separation between adjacent edges in the same rank
                rankSep: 250, //a number of pixels representing the separation between ranks
                minLen: 2,     //The number of ranks to keep between the source and target of the link.
                setLinkVertices: true,
                rankDir: "LR"
            });
            return graphBBox;
        }
    };
});

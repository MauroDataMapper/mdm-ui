angular.module('services').factory('jointDiagramServiceDC2DCDataFlow', function ($q, resources, $state, elementTypes) {

    joint.shapes.mcDataflowDC2DC = {};

    joint.shapes.mcDataflowDC2DC.Component = joint.shapes.basic.Generic.extend({

        markup: [
            '<g class="rotatable">',
            '<g class="scalable">',
            '<rect class="uml-class-name-rect"/><rect class="uml-class-attrs-rect"/><rect class="uml-class-methods-rect"/>',
            '</g>',
            '<a class="uml-class-name-link" target="_blank"><text class="uml-class-name-text"/></a><text class="uml-class-attrs-text"/><mc-members/>',
            '</g>'
        ].join(''),


        defaults: _.defaultsDeep({

            type: 'mcDataflowDC2DC.Component',

            attrs: {
                rect: {'width': 500},
                'circle.input': {r: 3, stroke: 'transparent', fill: 'transparent', 'stroke-width': 1},
                'circle.output': {r: 3, stroke: 'transparent', fill: 'transparent', 'stroke-width': 1},

                '.uml-class-name-rect':  {fill: '#ededed', stroke: '#000', 'stroke-width': 1},
                '.uml-class-attrs-rect': {fill: '#ededed', stroke: '#000', 'stroke-width': 1},

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
                '.uml-class-attrs-text': {
                    'ref': '.uml-class-attrs-rect',
                    'ref-y': 5,
                    'ref-x': 5,
                    'fill': 'black',
                    'font-size': 14,
                    'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif'
                },

            },

            mcType: 'dataModelComponent',
            url: null,
            name: [],
            attributes: [],
            dataClass: null,
            dataflow: null,

        }, joint.shapes.basic.Generic.prototype.defaults),

        initialize: function () {
            var self = this;
            var attrs = this.get('attrs');
            var isRoot = this.get('isRoot');

            if(isRoot){
                attrs[".uml-class-name-rect"].fill   = "#e0edf9";
                attrs[".uml-class-name-rect"].stroke = "#205081";
                attrs[".uml-class-name-rect"]["stroke-width"] = 2;

                attrs[".uml-class-attrs-rect"].fill   = "#e0edf9";
                attrs[".uml-class-attrs-rect"].stroke = "#205081";
                attrs[".uml-class-attrs-rect"]["stroke-width"] = 2;

                attrs[".uml-class-name-text"]["font-weight"] = 'bold';
                attrs[".uml-class-name-text"]["font-size"] = 14;
            }

            var url = this.get('url') || 'https://modelcatalogue.cs.ox.ac.uk/catalogue/';
            attrs['a.uml-class-name-link']['xlink:href'] = url;

            var mcMembers = this.get('attributes');
            var mcMembersStr = '';
            _.each(mcMembers, function (mcMember, i, v) {
                mcMembersStr += '<a target="_blank" class="uml-member-name-link-' + i + '"><text class="uml-member-name-text-' + i + '"/></a>';
                mcMembersStr += '<a target="_blank" class="uml-member-type-link-' + i + '"><text class="uml-member-type-text-' + i + '"/></a>';
                mcMembersStr += '<circle class="input input-' + i + '"/><circle class="output output-' + i + '"/>';

                attrs['a.uml-member-name-link-' + i] = {'xlink:show': 'new', cursor: 'pointer'};
                attrs['.uml-member-name-text-' + i] = {
                    'ref': '.uml-class-attrs-rect',
                    'text-anchor': 'start',
                    'y-alignment': 'left',
                    'font-weight': 'bold',
                    'fill': '#337ab7',
                    'font-size': 12,
                    'font-family': 'Times New Roman'
                };

                attrs['a.uml-member-type-link-' + i] = {'xlink:show': 'new', cursor: 'pointer'};
                attrs['.uml-member-type-text-' + i] = {
                    'ref': 'a.uml-member-name-link-' + i,
                    'text-anchor': 'start',
                    'y-alignment': 'left',
                    'font-weight': 'bold',
                    'fill': '#4cae4c',
                    'font-size': 12,
                    'font-family': 'Times New Roman'
                };

                //each member will have two ports which is 'in'+member.id & 'out'+member.id
                attrs['.input-' + i] = {
                    ref: '.uml-member-name-link-' + i,
                    'ref-x': -3,
                    'ref-y': 0.5,
                    magnet: 'passive',
                    port: 'in' + mcMember.id
                };


                //if it has type, then show the output port after the type text
                //if it doe NOT have type, then show the output after name link
                if (self.getMemberType(mcMember)) {
                    attrs['.output-' + i] = {
                        ref: '.uml-member-type-text-' + i,
                        'ref-dx': 1,
                        'ref-y': 0.5,
                        magnet: true,
                        port: 'out' + mcMember.id
                    };
                }
                else {
                    attrs['.output-' + i] = {
                        ref: '.uml-member-name-link-' + i,
                        'ref-dx': 1,
                        'ref-y': 0.5,
                        magnet: true,
                        port: 'out' + mcMember.id
                    };
                }
            });
            this.markup = this.markup.replace("<mc-members/>", mcMembersStr);


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

            //if title has a larger with than the membersMaxWidth, then break it into multiple lines
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
            //Adding 15 padding to left and right
            this.resize(this.getWidth()+30, this.getHeight());

            var rects = [
                {type: 'name', text: this.getClassName()},
                {type: 'attrs', text: this.get('attributes')}
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

            // var paddingTop = 5;
            // var lineSpace = 15;
            // var mcMembers = this.get('attributes');
            // var mcMembersHeight = 0;
            // _.each(mcMembers, function (mcMember, i) {
            //     attrs['.uml-member-name-text-' + i].text = mcMember.label.replace('\n', '') + " ";
            //     attrs['.uml-member-name-text-' + i]['ref-y'] = i * lineSpace + paddingTop;
            //     attrs['.uml-member-name-text-' + i]['ref-x'] = 5;
            //     attrs['a.uml-member-name-link-' + i]['xlink:href'] = mcMember.url ? mcMember.url : '';
            //
            //     var tp = self.getMemberType(mcMember);
            //     if (tp) {
            //         attrs['.uml-member-type-text-' + i].text = ": " + tp.label;
            //         attrs['.uml-member-type-text-' + i]['ref-y'] = -1;
            //         attrs['.uml-member-type-text-' + i]['ref-x'] = 0.99;//mcMember.label.length * 7;
            //         attrs['a.uml-member-type-link-' + i]['xlink:href'] = tp.url;
            //     }
            //     mcMembersHeight += lineSpace;
            // });

        },


    });
    joint.shapes.mcDataflowDC2DC.ComponentView = joint.dia.ElementView.extend({

        initialize: function () {

            joint.dia.ElementView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'uml-update', function () {
                this.update();
                this.resize();
            });
        }
    });

    joint.shapes.mcDataflowDC2DC.DataClass = joint.shapes.mcDataflowDC2DC.Component.extend({
        defaults: _.defaultsDeep({
            type: 'mcDataflowDC2DC.DataClass',
            mcType: 'datamodel',
        }, joint.shapes.mcDataflowDC2DC.Component.prototype.defaults),

        operation: function () {
            return true;
        }
    });
    joint.shapes.mcDataflowDC2DC.DataClassView = joint.shapes.mcDataflowDC2DC.ComponentView;

    joint.shapes.mcDataflowDC2DC.Association2 = joint.dia.Link.extend({

        defaults: _.defaultsDeep({
            type: 'mcDataflowDC2DC.Association2',
            router: {name: 'manhattan'}, //manhattan oneSide metro  orthogonal
            connector: {name: 'rounded'},

            attrs: {
                '.connection': { stroke: '#205081', 'stroke-width': 1 },
                //other attributes
                '.link-tools': {display: 'none'},
                '.marker-arrowheads': {display: 'none'},
                '.marker-vertices': {display: 'none'},
                // '.connection-wrap': { display: 'none' },
                '.connection-wrap:hover': {display: 'none'},
                '.marker-target': {d: 'M 10 -5 10 5 0 0 z', 'stroke-width': 0, fill: '#000'},
                '.marker-source': {d: 'M 0 0 a 3 3 0 1 0 0 1', 'stroke-width': 0, fill: '#000'}

            },
            sourceDataClass: null,
            targetDataClass: null,
        }, joint.dia.Link.prototype.defaults),

        setDataClasses: function (sourceDC, targetDC) {
            this.attributes['sourceDataClass'] = sourceDC;
            this.attributes['targetDataClass'] = targetDC;
            return this;
        }
    });

    mcDataflowDC2DC = joint.shapes.mcDataflowDC2DC;

    return {
        findLinks: function (dataflow, dataModelsMap) {

            var source = dataflow.source;
            var target = dataflow.target;
            var linkType = dataflow.linkType;


            if (!dataModelsMap[source.id]) {
                dataModelsMap[source.id] = {
                    id: source.id,
                    label: source.label,
                    links: {},
                    dataModel: source.dataModel,
                    domainType: source.domainType,
                    breadcrumbs: source.breadcrumbs
                };
            }

            if (!dataModelsMap[target.id]) {
                dataModelsMap[target.id] = {
                    id: target.id,
                    label: target.label,
                    links: {},
                    dataModel: target.dataModel,
                    domainType: target.domainType,
                    breadcrumbs: target.breadcrumbs
                };
            }
            if (linkType === "Is From") {
                if (!dataModelsMap[target.id].links[source.id]) {
                    dataModelsMap[target.id].links[source.id] = {
                        id: source.id,
                        label: source.label,
                    };
                }
            } else {
                if (!dataModelsMap[source.id].links[target.id]) {
                    dataModelsMap[source.id].links[target.id] = {
                        id: target.id,
                        label: target.label,
                    };
                }
            }

            // for (var i = 0; source.semanticLinks && i < source.semanticLinks.length; i++) {
            //     this.findLinks(source.semanticLinks[i], dataModelsMap);
            // }
            //
            // for (var i = 0; target.semanticLinks && i < target.semanticLinks.length; i++) {
            //     this.findLinks(target.semanticLinks[i], dataModelsMap);
            // }

        },

        drawDC2DC: function (rootDataflow, dataClassesInDataflows) {
            var dataModelsMap = {};

            for (var i = 0; i < dataClassesInDataflows.items.length; i++) {
                this.findLinks(dataClassesInDataflows.items[i], dataModelsMap);
            }
            var cellsMap = {};
            var cells = [];
            var links = [];
            var rootCell = null;


            //create all data models
            for (var dm in dataModelsMap) {
                if (dataModelsMap.hasOwnProperty(dm)) {
                    var cell = this.DrawDataClass(rootDataflow, dataModelsMap[dm]);
                    cells.push(cell);
                    cellsMap[dataModelsMap[dm].id] = cell;
                }
            }
            //create all links
            for (var dm in dataModelsMap) {
                //create the link
                for (var l in dataModelsMap[dm].links) {
                    var sourceDM = dataModelsMap[dm];
                    var targetDM = dataModelsMap[dm].links[l];

                    var sourceDMUI = cellsMap[sourceDM.id];
                    var targetDMUI = cellsMap[targetDM.id];

                    var link = this.dm2dmLink(sourceDMUI, targetDMUI, sourceDM, targetDM);
                    links.push(link);
                }
            }
            return {
                cells: [].concat(cells).concat(links),
                rootCell: rootCell,
                cellsMap: cellsMap,
                links: links
            };
        },

        DrawDataClass: function (rootDataflow, dataClass) {
            var dmUrl = elementTypes.getLinkUrl(dataClass);
            //var dmUrl = $state.href("twoSidePanel.catalogue.dataModel", {id: dataClass.id});
            var dmCell = new mcDataflowDC2DC.DataClass({
                position: {x: 500, y: 400},
                name: dataClass.label,
                url: dmUrl,
                dataflow:rootDataflow,
                dataClass:dataClass
            });
            return dmCell;
        },

        dm2dmLink: function (srcDMCell, targetDMCell, sourceDM, targetDM) {
            return new mcDataflowDC2DC.Association2({
                source: {id: srcDMCell.id},
                target: {id: targetDMCell.id}
            }).setDataClasses(sourceDM, targetDM);
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
                rankDir: "LR", //RL TB BT,
                align:"UL"
            });
            return graphBBox;
        }
    };
});

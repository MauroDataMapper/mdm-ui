angular.module('services').factory('jointDiagramService', function () {


    function init() {
        joint.shapes.customOld = {};
        CreateSvgDataModel();
        CreateSvgDataClass();
    }

    function CreateSvgDataModel() {
        joint.shapes.customOld.DataModel = joint.shapes.basic.Rect.extend({
            markup:'<g class="element">' +
                      '<g class="rotatable">' +
                        '<g class="scalable">' +
                            '<rect></rect>' +
                            '<line style="stroke:rgb(0,0,0);stroke-width:1" />' +
                        '</g>' +
                          '<text class="title"/>' +
                      '</g>' +
                   '</g>',
            defaults: _.defaultsDeep({
                type: 'custom.DataModel'
            }, joint.shapes.basic.Rect.prototype.defaults)
        });
    }

    function CreateSvgDataClass() {
        joint.shapes.customOld.DataClass = joint.shapes.basic.Rect.extend({
            markup:'<g class="element">' +
                        '<g class="rotatable">' +
                            '<g class="scalable">' +
                                '<rect></rect>' +
                                '<line style="stroke:rgb(0,0,0);stroke-width:1" />' +
                            '</g>' +
                                '<a><text class="title"/></a>' +
                        '</g>' +
                    '</g>',
            defaults: _.defaultsDeep({
                type: 'custom.DataClass'
            }, joint.shapes.basic.Rect.prototype.defaults)
        });
    }

    init();


    return {

        dataModelSvg:function (dataModel, addDataClasses) {
            var nodes = [];
            var links = [];

            var width=200, height=100, textPadding=10, moreLineSpace=7, lineY=20, textY=0;
            var spaceBetweenElement = 80;

            var modelPosition=  {
                x: 370,
                y: 160
            };

            var classPosition = {
                x: modelPosition.x - spaceBetweenElement*5,
                y: modelPosition.y + height + spaceBetweenElement
            };


            //Draw DataModel .............................................................................................
            var text = joint.util.breakText(dataModel.label,{width:width-2*textPadding},{'font-size':12});
            var lines = text.split("\n");
            var linesCount = lines.length;
            var dataModelLineY = lineY;
            if(linesCount >= 2){
                dataModelLineY = dataModelLineY + (linesCount - 1) * moreLineSpace;
            }
            var dataModelElement = new joint.shapes.custom.DataModel({
                position: modelPosition, size: { width: width, height: height },
                attrs: {
                    line: { x1: 0, y1: dataModelLineY , x2:width/2 , y2:dataModelLineY},
                    'text.title': {text:text, 'ref-y':textY, 'ref-x':textPadding, 'font-size':12, 'y-alignment':10,'text-anchor':'start', ref:'rect'}
                },
                mcElement:dataModel
            });
            nodes.push(dataModelElement);

            //Draw DataClass .............................................................................................
            if(addDataClasses == true){
                for (var i = 0; i < dataModel.childDataClasses.length; i++) {
                    var dataClassText = joint.util.breakText(dataModel.childDataClasses[i].label,{width:width-2*textPadding},{'font-size':12});
                    var dataClassTextLines      = dataClassText.split("\n");
                    var dataClassTextLinesCount = dataClassTextLines.length;

                    var dataClassLineY = lineY;
                    if(dataClassTextLinesCount >= 2){
                        dataClassLineY = dataClassLineY + (dataClassTextLinesCount - 1) * moreLineSpace;
                    }

                    var linkToDataClass = stateHandler.getURL("appContainer.mainApp.twoSidePanel.catalogue.dataClass", {id: dataModel.childDataClasses[i].id});

                    var dataClassElement = new joint.shapes.custom.DataClass({
                        position: classPosition, size: { width: width, height: height },
                        attrs: {
                            line: { x1: 0, y1: dataClassLineY , x2:width/2 , y2:dataClassLineY},
                            'text.title': {text:dataClassText, 'ref-y':textY, 'ref-x':textPadding, 'font-size':12, 'y-alignment':10,'text-anchor':'start', ref:'rect', fill: '#337ab7'},
                            a: { 'xlink:href': linkToDataClass, 'xlink:show': 'new', cursor: 'pointer' },
                        },
                        mcElement: dataModel.childDataClasses[i]
                    });

                    classPosition.x += width + spaceBetweenElement;
                    nodes.push(dataClassElement);

                    var link = new joint.dia.Link({
                        source: { id: dataModelElement.id },
                        target: { id: dataClassElement.id },
                        //router: { name: 'orthogonal' }, //manhattan oneSide metro  orthogonal
                        connector: { name: 'rounded' },
                        attrs: {
                            //other attributes
                            '.link-tools': {display: 'none'},
                            '.marker-arrowheads': {display: 'none'},
                            '.marker-vertices': { display : 'none' },
                            '.connection-wrap': { display: 'none' }
                        },
                        labels: [
                            { position: -15, attrs: { text: { text: '*'} }},
                        ]
                    });
                    links.push(link);
                }
            }

            return {cells:nodes.concat(links), rootCell:dataModelElement};
        },


        showSameAsLinksSvg: function (cellView) {
            var nodes = [];
            var links = [];

            var mcElement = cellView.model.get('mcElement');
            debugger

            for (var i = 0; i < mcElement.sourceForLinks.length; i++) {
                //if(mcElement.sourceForLinks[i].target.dtype == "DataModel"){
                    var result = this.dataModelSvg(mcElement.sourceForLinks[i].target, false);
                    nodes = nodes.concat(result.cells);
               //}
            }

            for (var i = 0; i < nodes.length; i++) {
                var link = new joint.dia.Link({
                    mcLinkType: 'sameAs',
                    source: { id: nodes[i].id },
                    target: { id: cellView.model.id },
                    router: { name: 'orthogonal' }, //manhattan oneSide metro  orthogonal
                    connector: { name: 'rounded' },
                    smooth: true,

                    attrs: {
                        '.connection': { stroke: '#4cae4c', 'stroke-width': 1,  'stroke-dasharray': '2 2' },
                        '.link-tools': {display: 'none'},
                        '.marker-arrowheads': {display: 'none'},
                        '.marker-vertices': { display : 'none' },
                        '.connection-wrap': { display: 'none' }
                    },
                    labels: [
                        { position: {distance:0.5,offset: { x: 0, y: 0 } }, attrs: { text: { text: '='} }},
                    ]
                });
                links.push(link);
            }

            return nodes.concat(links);
        },



        dataModel: function (dataModel) {

            var nodes = [];
            var links = [];
            var offsetX = 200;
            var offsetY = 400;

            var boxWidth  = 150;
            var boxHeight = 60;

            var el = new joint.shapes.html.DataModel({
                position: {x: 200, y: 100},
                size: {width: boxWidth, height: boxHeight},
                label: dataModel.label,
                mcElement:dataModel
            });
            nodes.push(el);




            // // var basicRect = new joint.shapes.html.DataModel({
            // var basicRect = new joint.shapes.basic.Rect({
            //     position: { x: 0, y: 0 },
            //     size:  { width: 200, height: 800 },
            //     attrs: { rect: { fill: '#205081' }, text: { text: 'DataClass', fill: 'white' } },
            //     label:"Parent",
            //     mcElement: {id:122}
            // });
            // nodes.push(basicRect);
            //
            //
            // // var smallRect = new joint.shapes.html.DataModel({
            // var smallRect = new joint.shapes.basic.Rect({
            //     position: { x: 0, y: 0 },
            //     size:  { width: 50, height: 50 },
            //     attrs: { rect: { fill: '#FFF' }, text: { text: '', fill: 'white' } },
            //     label:"Child",
            //     mcElement: {id:122}
            // });
            // nodes.push(smallRect);
            //
            //
            // basicRect.embed(smallRect)
            // smallRect.toFront();






            for (var i = 0; i < dataModel.childDataClasses.length; i++) {

                var classEl = new joint.shapes.html.DataModel({
                    position: {x: offsetX, y: offsetY},
                    size: {width: boxWidth, height: boxHeight},
                    label: dataModel.childDataClasses[i].label,
                    mcElement:dataModel.childDataClasses[i]
                });


                var link = new joint.dia.Link({
                    source: { id: el.id },
                    target: { id: classEl.id },

                    //router: { name: 'orthogonal' }, //manhattan oneSide metro  orthogonal
                    connector: { name: 'rounded' },

                    attrs: {
                        //other attributes
                        '.link-tools': {display: 'none'},
                        '.marker-arrowheads': {display: 'none'},
                        '.marker-vertices': { display : 'none' },
                        '.connection-wrap': { display: 'none' }
                    },
                    labels: [
                        { position: -10, attrs: { text: { text: '*'} }},
                    ]
                });
                nodes.push(classEl);
                links.push(link);

                offsetX += 200;
            }

            return nodes.concat(links)
        },


        removeSameAsLinks: function (graph, paper) {

            var elements = graph.getElements();

            for (var i = 0; i < elements.length; i++) {
                var c =  paper.findViewByModel(elements[i]);

                if(c.model.get('mcLinkType') == 'sameAs'){
                    c.model.remove();
                }
            }

        },

        showSameAsLinks: function (cellView) {

            var nodes = [];
            var links = [];
            var boxWidth  = 150;
            var boxHeight = 60;

            var mcElement = cellView.model.get('mcElement');
            debugger

            for (var i = 0; i < mcElement.sourceForLinks.length; i++) {
                var el = new joint.shapes.html.DataModel({
                    position: {x: 200, y: 100},
                    size: {width: boxWidth, height: boxHeight},
                    label: mcElement.sourceForLinks[i].target.label,
                    mcElement: cellView.model.get('mcElement'),
                    mcLinkType: 'sameAs'
                });
                nodes.push(el);
            }


            for (var i = 0; i < nodes.length; i++) {
                var link = new joint.dia.Link({
                    mcLinkType: 'sameAs',
                    source: { id: nodes[i].id },
                    target: { id: cellView.model.id },
                    router: { name: 'orthogonal' }, //manhattan oneSide metro  orthogonal
                    connector: { name: 'rounded' },
                    smooth: true,

                    attrs: {
                        '.connection': { stroke: '#4cae4c', 'stroke-width': 1,  'stroke-dasharray': '2 2' },
                        '.link-tools': {display: 'none'},
                        '.marker-arrowheads': {display: 'none'},
                        '.marker-vertices': { display : 'none' },
                        '.connection-wrap': { display: 'none' }
                    },
                    labels: [
                        { position: {distance:0.5,offset: { x: 0, y: 0 } }, attrs: { text: { text: '='} }},
                    ]
                });
                links.push(link);
            }

            return nodes.concat(links);
        },


        reOrder: function(graph) {
            var graphBBox = joint.layout.DirectedGraph.layout(graph, {
                marginY: 10,
                marginX: 10,
                nodeSep: 20,  //a number of pixels representing the separation between adjacent nodes in the same rank
                edgeSep: 120, //a number of pixels representing the separation between adjacent edges in the same rank
                rankSep: 150,//a number of pixels representing the separation between ranks
                rankDir: "TB"
            });
            return graphBBox;
        }

    }
});

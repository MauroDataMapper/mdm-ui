angular.module('services').factory('jointDiagramService2', function () {


    function init() {
        joint.shapes.custom = {};
        CreateSvgDataModel();
        CreateSvgDataClass();
        CreateSvgDataElement();
    }



    function CreateSvgDataElement() {
        joint.shapes.custom.DataElement = joint.shapes.basic.Text.extend({
            markup:'<g class="element">' +
                        '<g class="rotatable">' +
                            '<g class="scalable">' +
                                '<a class="title"><text class="title"/></a>' +
                            '</g>' +
                        '</g>' +
                    '</g>',
            defaults: _.defaultsDeep({
                type: 'custom.DataElement'
            }, joint.shapes.basic.Text.prototype.defaults)
        });
    }



    function CreateSvgDataModel() {
        joint.shapes.custom.DataModel = joint.shapes.basic.Rect.extend({
            markup:'<g class="element">' +
                      '<g class="rotatable">' +
                        '<g class="scalable">' +
                            '<rect></rect>' +
                        '</g>' +
                        '<g><line style="stroke:rgb(0,0,0);stroke-width:1" /></g>' +
                         '<text class="title"/>' +
                      '</g>' +
                   '</g>',
            defaults: _.defaultsDeep({
                type: 'custom.DataModel'
            }, joint.shapes.basic.Rect.prototype.defaults)
        });
    }

    function CreateSvgDataClass() {


        var dataElements = "";
        for (var i = 0; i < 200; i++) {
            dataElements += '<a target="_blank" class="dataElement-'+ i +'">'+'<title class="dataElement-' + i + '"></title><text class="dataElement-' + i + '"/></a>';
        }

        var template =
            '<g class="element">' +
                '<g class="rotatable">' +
                    '<g class="scalable">' +
                        '<rect></rect>' +
                    '</g>' +
                    '<g><line style="stroke:rgb(0,0,0);stroke-width:1" /></g>' +
                    '<a class="dataClass" target="_blank" ><text class="title"/></a>' +
                        dataElements +
                '</g>' +
            '</g>';


        joint.shapes.custom.DataClass = joint.shapes.basic.Rect.extend({
            markup:template,
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


        dataModelSvg2:function (dataModel) {
            var width=200, height=100, textPadding=10, moreLineSpace=18, lineY=30, textY=0;
            var modelPosition=  {
                x: 370,
                y: 160
            };

            //Draw DataModel .............................................................................................
            var text = joint.util.breakText(dataModel.label,{width:width-2*textPadding},{'font-size':12});
            var lines = text.split("\n");
            var linesCount = lines.length;
            var dataModelLineY = lineY;
            if(linesCount >= 2){
                dataModelLineY = dataModelLineY + (linesCount - 1) * moreLineSpace;
            }
            var dataModelNode = new joint.shapes.custom.DataModel({
                position: modelPosition, size: { width: width, height: height },
                attrs: {
                    line: { x1: 0, y1: dataModelLineY , x2:width , y2:dataModelLineY},
                    'text.title': {text:text, 'ref-y':textY, 'ref-x':textPadding, 'font-size':12, 'y-alignment':10,'text-anchor':'start', ref:'rect'}
                },
                mcElement:dataModel,
                mcElementType: "dataModel"
            });
            return dataModelNode;
        },

        dataClassSvg2:function (dataClass, addAllDataElements, simpleDataElementBox) {
            var width=200, height=100, textPadding=10, moreLineSpace=18, lineY=30, textY=0;
            var classPosition=  {
                x: 370,
                y: 160
            };

            var dataClassText = joint.util.breakText(dataClass.label,{width:width-2*textPadding},{'font-size':12});
            var dataClassTextLines      = dataClassText.split("\n");
            var dataClassTextLinesCount = dataClassTextLines.length;

            var dataClassLineY = lineY;
            if(dataClassTextLinesCount >= 2){
                dataClassLineY = dataClassLineY + (dataClassTextLinesCount - 1) * moreLineSpace;
            }

            var linkToDataClass = stateHandler.getURL("twoSidePanel.catalogue.dataClass", {id: dataClass.id});


            // Re-calculate With & Height based on DataElement Text Width ................................................................
            if(addAllDataElements == true) {
                var dataElementLines = dataClass.childDataElements.length * moreLineSpace + moreLineSpace;
                if (dataElementLines > (height - dataClassLineY )) {
                    height += dataElementLines - height + moreLineSpace + dataClassLineY;
                }
                var dataElementMaxWidth = 0;
                for (var i = 0; i < dataClass.childDataElements.length; i++) {
                    if (dataClass.childDataElements[i].label.length > dataElementMaxWidth) {
                        dataElementMaxWidth = dataClass.childDataElements[i].label.length;
                    }
                }
                if (dataElementMaxWidth > 20) {
                    width = (dataElementMaxWidth - 20) * 7 + width;
                }
            }
            //.............................................................................................................................

            var dataClassNode = new joint.shapes.custom.DataClass({
                position: classPosition, size: { width: width, height: height },
                attrs: {
                    line: { x1: 0, y1: dataClassLineY , x2:width , y2:dataClassLineY},
                    'text.title': {text:dataClassText, 'ref-y':textY, 'ref-x':textPadding, 'font-size':12, 'y-alignment':10,'text-anchor':'start', ref:'rect', fill: '#337ab7'},
                    'a.dataClass': { 'xlink:href': linkToDataClass, 'xlink:show': 'new', cursor: 'pointer' }
                },
                mcElement: dataClass,
                mcElementType: "dataClass"
            });


            var elements = [];
            elements.push(dataClassNode);

            //Add dataElements ............................................................................................................
            if(addAllDataElements == true && !simpleDataElementBox){
                for(var i=0;i<dataClass.childDataElements.length;i++){
                    // var linkToDataElement = $state.href("twoSidePanel.catalogue.dataElement", {id: dataClass.childDataElements[i].id});
                    // dataClassNode.attr('text.dataElement-'+i, {text:dataClass.childDataElements[i].label, 'ref-y':dataClassLineY+i*moreLineSpace, 'ref-x':textPadding, 'font-size':12, 'y-alignment':10,'text-anchor':'start', ref:'rect', fill: '#337ab7'});
                    // dataClassNode.attr('title.dataElement-'+i, {text:dataClass.childDataElements[i].label});
                    // dataClassNode.attr('a.dataElement-'+i, { 'xlink:href': linkToDataElement, 'xlink:show': 'new', cursor: 'pointer'});

                    var datae = new  joint.shapes.custom.DataElement({
                        isInteractive: false,
                        position: { y: moreLineSpace * i, x:0 },
                        size: { width: 100, height: 50 },
                        attrs: {
                            text: { text: 'my box', fill: 'black', style:{'pointer-events':'fill'}},
                            'a.title': { 'xlink:href': 'www.google.com', 'xlink:show': 'new', cursor: 'pointer', style:{'pointer-events':'fill'} }
                        },
                        mcElement: dataClass.childDataElements[i],
                        mcElementType: "dataElement"
                    });
                    dataClassNode.embed(datae);
                    elements.push(datae)
                }

            }
            //.............................................................................................................................


            return elements;
        },

        linkSvg2: function (source, target) {

            var linkStr = "";
            if(source.attributes['mcElementType'] == "dataModel" &&
               target.attributes['mcElementType'] == "dataClass" ){

                    var min = target.attributes['mcElementType']["minMultiplicity"] || "";
                    var max = target.attributes['mcElementType']["maxMultiplicity"] || "";

                    if(min == -1){
                        min = "*";
                    }

                    if(max == -1){
                        max = "*";
                    }
                    linkStr = min + ".." + max;

                    if(min == "" || max == ""){
                        linkStr = ""
                    }
            }


            var link = new joint.dia.Link({
                source: { id: source.id },
                target: { id: target.id },
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
                    { position: -15, attrs: { text: { text: linkStr} }},
                ]
            });
            return link;
        },


        DrawMyTestSvg2: function () {
            var nodes = [];
            var links = [];

            joint.shapes.basic.Rect = joint.shapes.basic.Generic.extend({
                markup: '<g class="rotatable"><g class="scalable"><rect/><line class="myLine" style="stroke:rgb(255,0,0);stroke-width:2"/></g><text/></g>',

                defaults: joint.util.deepSupplement({
                    type: 'basic.Rect',
                    attrs: {
                        'rect': { fill: 'white', stroke: 'black', 'follow-scale': true, width: 80, height: 40 },
                        'text': { 'font-size': 14, 'ref-x': .5, 'ref-y': .5, ref: 'rect', 'y-alignment': 'middle', 'x-alignment': 'middle' },
                        'line.myLine': { 'x1': 0, 'y1':20, 'x2': 80, 'y2':20, 'ref':'rect'}
                    }
                }, joint.shapes.basic.Generic.prototype.defaults)
            });


            var rect = new joint.shapes.basic.Rect({
                position: { x: 100, y: 30 },
                size: { width: 400, height: 200 },
                attrs: { rect: { fill: 'white' }, text: { text: 'my box', fill: 'black' } }
            });
            var datac = new joint.shapes.basic.Rect({
                position: { x: 110, y: 40 },
                size: { width: 200, height: 100 },
                attrs: { rect: { fill: 'white' }, text: { text: 'my box', fill: 'black' } }
            });
            rect.embed(datac);


            //------------------------------------------------------------------
            var datae = new  joint.shapes.custom.DataElement({
                isInteractive: false,
                position: { x: 0, y: 0},
                size: { width: 100, height: 50 },
                attrs: {
                    text: { text: 'my box', fill: 'black', style:{'pointer-events':'fill'}},
                    'a.title': { 'xlink:href': 'www.google.com', 'xlink:show': 'new', cursor: 'pointer', style:{'pointer-events':'fill'} }
                }
            });
            datac.embed(datae);


            var point = g.Point(datac.get('position')).difference(datae.get('position'));
            //get it distance to its parent
            //datae.set('position',{ x: point.x+10, y: point.y+10});
            //OR
            datae.set('position',{ x: datac.get('position').x+10, y: datac.get('position').y+10});


            debugger

            //------------------------------------------------------------------

            var rect2 = new joint.shapes.basic.Rect({
                position: { x: 400, y: 100 },
                size: { width: 400, height: 200 },
                attrs: {
                    rect: { fill: 'white' },
                    text: { text: 'my box', fill: 'black' }
                }
            });


            var link = new joint.dia.Link({
                source: { id: datae.id },
                target: { id: rect2.id },
                connector: { name: 'rounded' },
                attrs: {
                    //other attributes
                    '.link-tools': {display: 'none'},
                    '.marker-arrowheads': {display: 'none'},
                    '.marker-vertices': { display : 'none' },
                    '.connection-wrap': { display: 'none' }
                },
                labels: [
                    { position: -15, attrs: { text: { text: "*"} }},
                ]
            });
            return {cells:[rect, datac, datae,rect2,link], rootCell: rect};
        },

        DrawDataModelSvg2: function (dataModel) {
            var nodes = [];
            var links = [];


            return this.DrawMyTestSvg2();


            //     markup: '<g class="element-node">'+
            //     '<rect class="body" stroke-width="0" rx="5px" ry="5px"></rect>'+
            //     '<text class="label" y="0.8em" xml:space="preserve" font-size="14" text-anchor="middle" font-family="Arial, helvetica, sans-serif">'+
            //     '<tspan id="v-18" dy="0em" x="0" class="v-line"></tspan>'+
            //     '</text>'+
            //     '<g class="inPorts"/>' +
            //     '<g class="outPorts"/>' +
            //     '</g>',
            //     portMarkup: '<g class="port port<%= id %>"><circle class="port-body"/></g>'
            // });
            //
            // nodes.push(new joint.shapes.devs.Model({
            //     type: 'devs.Model',
            //     position: {x: 20, y: 20},
            //     attrs: {
            //         '.body': {
            //             width: '140',
            //             height: '60'
            //         },
            //         '.label': {
            //             text: 'blok 1',
            //         },
            //         '.element-node' : {
            //             'data-color': 'pink'
            //         }
            //     },
            //     inPorts: ['center']
            // }));
            // nodes[0].translate(140, 100);
            // nodes.push(nodes[0].clone());
            // nodes[1].translate(300, 60);
            // nodes[1].attr('.label/text', 'blok 2');
            // return {cells:nodes, rootCell: nodes[0]};



            //
            // joint.shapes.devs.CircleModel = joint.shapes.devs.Model.extend({
            //     markup: '<g class="rotatable">' +
            //                 '<g class="scalable">' +
            //                     '<circle class="body"/>' +
            //                 '</g>' +
            //                 '<text class="label"/>' +
            //                 '<g class="inPorts"/>' +
            //                 '<g class="outPorts"/>' +
            //             '</g>',
            //     portMarkup: '<g class="port port<%= id %>"><rect class="port-body"/><text class="port-label"/></g>',
            //
            //     defaults: joint.util.deepSupplement({
            //         type: 'devs.CircleModel',
            //         attrs: {
            //             '.body': { r: 50, cx: 50, stroke: 'blue', fill: 'lightblue' },
            //             '.label': { text: 'Circle Model', 'ref-y': 0.5, 'y-alignment': 'middle' },
            //             '.port-body': { width: 10, height: 10, x: -5, stroke: 'gray', fill: 'lightgray', magnet: 'active' }
            //         }
            //
            //     }, joint.shapes.devs.Model.prototype.defaults)
            // });
            // //joint.shapes.devs.CircleModelView = joint.shapes.devs.ModelView;
            //
            // var circleModel = new joint.shapes.devs.CircleModel({
            //     position: { x: 500, y: 100 },
            //     size: { width: 100, height: 100 },
            //     inPorts: ['a'],
            //     outPorts: ['b']
            // });
            // nodes.push(circleModel)
            // return {cells:nodes, rootCell: circleModel};




            // var el1 = new joint.shapes.devs.Model({
            //     markup: '<g class="rotatable">' +
            //                 '<g class="scalable">' +
            //                     '<image class="body"/>' +
            //                 '</g>' +
            //                     '<text class="label"/>' +
            //                 '<g class="inPorts"/>' +
            //                 '<g class="outPorts"/>' +
            //             '</g>',
            //     size: {
            //         width: 100,
            //         height: 100
            //     },
            //     position: {
            //         x: 50,
            //         y: 75
            //     },
            //     attrs: {
            //         '.label': { text: 'SW_1', 'ref-x': .1, 'ref-y': .01},
            //         '.body': {
            //             width: 1024,
            //             height: 768,
            //             'xlink:href': 'data:image/svg+xml;utf8,' ,
            //             preserveAspectRatio: 'none'
            //         }
            //     },
            //     inPorts: ['1'],
            //     outPorts: ['2']
            // });
            // var el2 = el1.clone().position(300, 300).attr('.label/text','SW_2').resize(100, 100);
            // nodes.push(el1);
            // nodes.push(el2);
            // return {cells:[].concat(nodes), rootCell: el1};




            var dataModelNode = this.dataModelSvg2(dataModel);
            nodes.push(dataModelNode);

            for (var i = 0; i < dataModel.childDataClasses.length; i++) {
                var dataClassNode =  this.dataClassSvg2(dataModel.childDataClasses[i], true);
                // for (var j = 0; j < 1; j++) {
                //     var dataElementNode = this.dataElementBoxSvg2(dataModel.childDataClasses[i].childDataElements[j],0,j*10);
                //     dataClassNode.embed(dataElementNode);
                //     nodes.push(dataElementNode);
                // }
                //nodes.push(dataClassNode);
                //links.push(this.linkSvg2(dataModelNode, dataClassNode));

                nodes = nodes.concat(dataClassNode);
                links.push(this.linkSvg2(dataModelNode, dataClassNode[0]));
            }

            return {cells:[].concat(nodes).concat(links), rootCell: dataModelNode};
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

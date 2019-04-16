angular.module('services').factory('jointDiagramService3', function ($q, stateHandler, resources, $state, elementTypes) {

    joint.shapes.mc = {};

    joint.shapes.mc.Component = joint.shapes.basic.Generic.extend({

        markup: [
            '<g class="rotatable">',
            '<g class="scalable">',
            '<rect class="uml-class-name-rect"/><rect class="uml-class-attrs-rect"/><rect class="uml-class-methods-rect"/>',
            '</g>',
            '<a class="uml-class-name-link" target="_blank"><text class="uml-class-name-text"/></a><text class="uml-class-attrs-text"/><mc-members/>',
            '</g>'
        ].join(''),


        defaults: _.defaultsDeep({

            type: 'mc.Component',

            attrs: {
                rect: { 'width': 500 },
                'circle.input':  { r: 3, stroke: 'transparent', fill: 'transparent', 'stroke-width': 1 },
                'circle.output': { r: 3, stroke: 'transparent', fill: 'transparent', 'stroke-width': 1 },

                '.uml-class-name-rect':    { fill: '#FFF', stroke: '#000', 'stroke-width': 0.5 },
                '.uml-class-attrs-rect':   { fill: '#FFF', stroke: '#000', 'stroke-width': 0.5 },

                'a.uml-class-name-link': { 'xlink:href': 'http://jointjs.com', 'xlink:show': 'new', cursor: 'pointer' },

                '.uml-class-name-text': {
                    'ref': '.uml-class-name-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle', 'font-weight': 'bold',
                    'fill': '#337ab7', 'font-size': 12, 'font-family': 'Times New Roman'
                },
                '.uml-class-attrs-text': {
                    'ref': '.uml-class-attrs-rect', 'ref-y': 5, 'ref-x': 5,
                    'fill': 'black', 'font-size': 12, 'font-family': 'Times New Roman'
                }

            },

            mcType:'dataModelComponent',
            url: null,
            name: [],
            attributes: [],
            showMembersPort:true

        }, joint.shapes.basic.Generic.prototype.defaults),

        initialize: function() {
            var self = this;
            var attrs = this.get('attrs');

            var url = this.get('url') || 'https://modelcatalogue.cs.ox.ac.uk/catalogue/';
            attrs['a.uml-class-name-link']['xlink:href'] = url;

            var mcMembers = this.get('attributes');
            var mcMembersStr = '';
            _.each(mcMembers, function(mcMember, i, v) {
                 mcMembersStr += '<a target="_blank" class="uml-member-name-link-' + i + '"><text class="uml-member-name-text-' + i + '"/></a>';
                 mcMembersStr += '<a target="_blank" class="uml-member-type-link-' + i + '"><text class="uml-member-type-text-' + i + '"/></a>';
                 mcMembersStr += '<circle class="input input-' + i + '"/><circle class="output output-' + i + '"/>';

                 attrs['a.uml-member-name-link-' + i] = { 'xlink:show': 'new', cursor: 'pointer' };
                 attrs['.uml-member-name-text-' + i] = {
                    'ref': '.uml-class-attrs-rect', 'text-anchor': 'start', 'y-alignment': 'left', 'font-weight': 'bold',
                    'fill': '#337ab7', 'font-size': 12, 'font-family': 'Times New Roman'
                 };

                attrs['a.uml-member-type-link-' + i] = { 'xlink:show': 'new', cursor: 'pointer' };
                attrs['.uml-member-type-text-'  + i]  = {
                    'ref': 'a.uml-member-name-link-' + i, 'text-anchor': 'start', 'y-alignment': 'left', 'font-weight': 'bold',
                    'fill': '#4cae4c', 'font-size': 12, 'font-family': 'Times New Roman'
                };

                 //each member will have two ports which is 'in'+member.id & 'out'+member.id
                 attrs['.input-'  + i] = { ref: '.uml-member-name-link-' + i, 'ref-x': -3, 'ref-y': 0.5, magnet: 'passive', port: 'in'  + mcMember.id };


                //if it has type, then show the output port after the type text
                //if it doe NOT have type, then show the output after name link
                if(self.getMemberType(mcMember)){
                    attrs['.output-' + i] = { ref: '.uml-member-type-text-' + i, 'ref-dx': 1, 'ref-y': 0.5, magnet: true, port: 'out' + mcMember.id };
                }
                else{
                    attrs['.output-' + i] = { ref: '.uml-member-name-link-' + i, 'ref-dx': 1, 'ref-y': 0.5, magnet: true, port: 'out' + mcMember.id };
                }
            });
            this.markup = this.markup.replace("<mc-members/>",mcMembersStr);


            this.on('change:name change:attributes change:methods', function() {
                this.updateRectangles();
                this.trigger('uml-update');
            }, this);

            this.updateRectangles();

            joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
        },

        getClassName: function() {
            var name = this.get('name');
            var titleFont = this.attr('.uml-class-name-text')['font-size'];
            var title = this.get('name');
            var titlePixel = this.getTextWidthInPixel(title, titleFont);
            var width = this.getWidth();

            //if title has a larger with than the membersMaxWidth, then break it into multiple lines
            if(titlePixel > width){
                var multipleLineText = joint.util.breakText(name,{width: width},{'font-size':titleFont});
                return multipleLineText.split('\n');
            }
            return [name];
        },

        getHeight: function(){
            var memberLines = this.get('attributes').length;
            var titleLines  = this.getClassName().length;
            return (memberLines + titleLines) * 15 + 20 ;// we assume each line has 15pixel height + 20 for top padding
        },

        getTextWidthInPixel: function(text, fontSize) {
            //multiple it to 1.1 (as the returned value form jQuery span is smaller that what I expected!)
            return Math.round(jQuery("#textSampling").css('font-size', fontSize+'px').text(text).width() * 1.1);
        },

        getWidth: function () {
            var titleFont = this.attr('.uml-class-name-text')['font-size'];
            var maxMember = this.getMembersWidth();
            var maxMemberPixel = maxMember.width != 0 ? this.getTextWidthInPixel(maxMember.label, titleFont) : 0;
            var originalWidthPixel = 200;//this.size()['width'];
            var width = 0;

            //No Members, so use the original width (200)
            if(maxMemberPixel <= originalWidthPixel){
                width = originalWidthPixel;
            }else{
                //use maxMemberPixel
                width = maxMemberPixel
            }
            return width
        },

        getMembersWidth: function () {
            var self = this;
            var mcMembers = this.get('attributes');
            var mcMembersWidth = 0;
            var mcMembersMaxWidth = "";
            _.each(mcMembers, function(mcMember, i, v) {
                var memberType =  self.getMemberType(mcMember);
                var memberText = mcMember.label.replace('\n','');
                var memberTypeText = memberType ? ": " +memberType.label : "";

                if( (memberText+memberTypeText).length > mcMembersWidth){
                    mcMembersWidth = mcMember.label.length + 3 + memberTypeText.length;
                    mcMembersMaxWidth = memberText+memberTypeText;
                }
            });
            return {width:mcMembersWidth, label:mcMembersMaxWidth};
        },

        getMemberType: function(member) {
            return null;
        },

        updateRectangles: function() {
            var self = this;
            var attrs = this.get('attrs');
            var offsetY = 0;

            //First Resize the main Rect to the right Width & Height
            this.resize(this.getWidth(), this.getHeight());

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

            var paddingTop = 5;
            var lineSpace  = 15;
            var mcMembers  = this.get('attributes');
            var mcMembersHeight = 0;
            _.each(mcMembers, function(mcMember, i) {
                attrs['.uml-member-name-text-' + i].text = mcMember.label.replace('\n','')+" ";
                attrs['.uml-member-name-text-' + i]['ref-y'] = i*lineSpace + paddingTop;
                attrs['.uml-member-name-text-' + i]['ref-x'] = 5;
                attrs['a.uml-member-name-link-'+ i]['xlink:href'] = mcMember.url ? mcMember.url : '';

                var tp = self.getMemberType(mcMember);
                if(tp) {
                    attrs['.uml-member-type-text-' + i].text = ": " + tp.label;
                    attrs['.uml-member-type-text-' + i]['ref-y'] = -1;
                    attrs['.uml-member-type-text-' + i]['ref-x'] = 0.99;//mcMember.label.length * 7;
                    attrs['a.uml-member-type-link-' + i]['xlink:href'] = tp.url;
                }
                mcMembersHeight += lineSpace;
            });

        }
    });
    joint.shapes.mc.ComponentView = joint.dia.ElementView.extend({

        initialize: function() {

            joint.dia.ElementView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'uml-update', function() {
                this.update();
                this.resize();
            });
        }
    });

    joint.shapes.mc.DataModel = joint.shapes.mc.Component.extend({
        defaults: _.defaultsDeep({
            type: 'mc.DataModel',
            mcType:'datamodel',
        }, joint.shapes.mc.Component.prototype.defaults),

        operation: function () {
            return true;
        }
    });
    joint.shapes.mc.DataModelView = joint.shapes.mc.ComponentView;

    joint.shapes.mc.DataClass = joint.shapes.mc.Component.extend({
        defaults: _.defaultsDeep({
            type: 'mc.DataClass',
            mcType:'dataclass',
        }, joint.shapes.mc.Component.prototype.defaults),

        operation: function () {
            return true;
        },

        getMemberType: function(member) {
            return member.dataType;
        },
    });
    joint.shapes.mc.DataClassView = joint.shapes.mc.DataClassView;

    joint.shapes.mc.Association2 = joint.dia.Link.extend({

        defaults:  _.defaultsDeep({
            type: 'mc.Association2',

            // router: { name: 'orthogonal' },

            router: { name: 'orthogonal' }, //manhattan oneSide metro  orthogonal
            // connector: { name: 'rounded' },

            attrs: {
                //other attributes
                '.link-tools': {display: 'none'},
                '.marker-arrowheads': {display: 'none'},
                '.marker-vertices': { display : 'none' },
                '.connection-wrap': { display: 'none' }
            },
            min:'',
            max:''

        }, joint.dia.Link.prototype.defaults),

        setMultiplicity: function(min, max) {
            var linkStr = "";

            if(min == -1){
                min = "*";
            }

            if(max == -1){
                max = "*";
            }
            linkStr = min + ".." + max;


            if(min == "" || max == "" || min == undefined || max == undefined){
                linkStr = ""
            }
            this.min = min;
            this.max = max;

            this.set('labels', [{
                position: -15,
                attrs: {
                    text: { text: linkStr, 'fill': '#000', 'font-size': 12, 'font-family': 'Times New Roman'}
                }
            }]);
            return this;
        }
    });
    joint.shapes.mc.LinkToDataType = joint.dia.Link.extend({
        defaults:  _.defaultsDeep({
            type: 'mc.LinkToDataType',
            router: { name: 'orthogonal' },
            // router: { name: 'orthogonal' }, //manhattan oneSide metro  orthogonal
            // connector: { name: 'rounded' },
            attrs: {
                //other attributes
                '.connection': { stroke: '#000', 'stroke-width': 1,  'stroke-dasharray': '2 2' },
                '.link-tools': {display: 'none'},
                '.marker-arrowheads': {display: 'none'},
                '.marker-vertices': { display : 'none' },
                '.connection-wrap': { display: 'none' }
            },
        }, joint.dia.Link.prototype.defaults),

        setColor: function(value) {
            this.attr('.connection', { stroke: value, 'stroke-width': 1,  'stroke-dasharray': '2 2' });
            return this;
        }

    });
    joint.shapes.mc.SameAs = joint.dia.Link.extend({
        defaults:  _.defaultsDeep({
            type: 'mc.SameAs',
            //router: { name: 'metro' }, //manhattan oneSide metro  orthogonal
            connector: { name: 'rounded' },
            attrs: {
                //other attributes
                '.connection': { stroke: '#4cae4c', 'stroke-width': 1,  'stroke-dasharray': '2 2' },
                '.link-tools': {display: 'none'},
                '.marker-arrowheads': {display: 'none'},
                '.marker-vertices': { display : 'none' },
                '.connection-wrap': { display: 'none' }
            },
        }, joint.dia.Link.prototype.defaults),

        setColor: function(value) {
            this.attr('.connection', { stroke: value, 'stroke-width': 1,  'stroke-dasharray': '2 2' })
            return this;
        }

    });

     mc = joint.shapes.mc;

    return {


        dm2dcLink: function (dataModelCell, dataClassCell, dataModel, dataClass) {
            return new mc.Association2({
                source: { id: dataModelCell.id },
                target: { id: dataClassCell.id }}).setMultiplicity(dataClass.minMultiplicity, dataClass.maxMultiplicity)
        },

        DrawDataModel:function (dataModel) {

            var cellsMap = {};
            var cells    = [];
            var links    = [];

            var dmUrl = stateHandler.getURL("appContainer.mainApp.twoSidePanel.catalogue.dataModel", {id: dataModel.id});
            var dmCell = new mc.DataModel({
                position: { x:500  , y: 400 },
                name: dataModel.label,
                url:dmUrl});
            cells.push(dmCell);
            cellsMap[dataModel.id] = dmCell;

            for(var i = 0; i < dataModel.childDataClasses.length; i++){
                var dataClass = dataModel.childDataClasses[i];
                var result = this.DrawDataClass(dataClass, dataModel,dmCell);
                cells = cells.concat(result.cells);
                links = links.concat(result.links);
                cellsMap = angular.extend({}, cellsMap, result.cellsMap);
                // var dataClass = dataModel.childDataClasses[i];
                // var childDataElements = dataClass.childDataElements;
                //
                // //build URL for childDataElements
                // childDataElements = childDataElements.map(function(de) {
                //     de.url =  $state.href("twoSidePanel.catalogue.dataElement", {id: de.id});
                //     de.dataType.url = $state.href("twoSidePanel.catalogue.dataType", {id: de.dataType.id});
                //
                //     if(de.dataType.dtype == "ReferenceType"){
                //         de.dataType.label = de.dataType.referenceClass.label;
                //         de.dataType.id = de.dataType.referenceClass.id;
                //         de.dataType.url = $state.href("twoSidePanel.catalogue.dataClass", {id: de.dataType.referenceClass.id});
                //     }
                //
                //     return de;
                // });
                //
                // var dsUrl = $state.href("twoSidePanel.catalogue.dataClass", {id: dataModel.childDataClasses[i].id});
                // var dsCell = new mc.DataClass({
                //     position: { x:500  , y: 500 },
                //     name: dataModel.childDataClasses[i].label,
                //     url: dsUrl,
                //     attributes:childDataElements});
                //
                // cells.push(dsCell);
                // cellsMap[dataClass.id] = dsCell;
                //
                // //create the link, onlyIf DM and DC have multiplicity
                // if(dataClass.minMultiplicity && dataClass.maxMultiplicity){
                //     links.push(this.dm2dcLink(dmCell, dsCell, dataModel, dataClass));
                // }
            }


            //Create link between dataElements and Ref DataTypes
            for(var i = 0; i < dataModel.childDataClasses.length; i++) {

                ///@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                 var dataClass = dataModel.childDataClasses[i];
                 var result = this.DrawDataTypeLinks(dataClass, cellsMap);
                 links = links.concat(result);
                ///@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


                // var childDataElements = dataClass.childDataElements;
                // angular.forEach(childDataElements, function(de, key) {
                //     if(de.dataType.dtype == "ReferenceType"){
                //         var sourceCell = cellsMap[dataClass.id];
                //         var sourcePort = 'out'+ de.id ;
                //         var targetCell = cellsMap[de.dataType.referenceClass.id];
                //
                //         if(sourceCell && targetCell){
                //             links.push(new mc.LinkToDataType({
                //                 source: { id: sourceCell.id, port:sourcePort},
                //                 target: { id: targetCell.id }}));
                //         }
                //     }
                // });
            }

            return {cells:[].concat(cells).concat(links), rootCell:dmCell, cellsMap: cellsMap, links: links};
        },

        DrawDataClass: function (dataClass, parentElement, parentCell) {
            var self = this;
            var cellsMap = {};
            var cells    = [];
            var links    = [];
            var childDataElements = dataClass.childDataElements;
            var childDataClasses  = dataClass.childDataClasses;

            //build URL for childDataElements
            if(childDataElements) {
                childDataElements = childDataElements.map(function (de) {
                    de.url  = self.generateLink(de);
                    de.dataType.url  = self.generateLink(de.dataType);
                    return de;
                });
            }

            var dsUrl = self.generateLink(dataClass);
            // var dsUrl = $state.href("twoSidePanel.catalogue.dataClass", {id: dataClass.id});
            var dsCell = new mc.DataClass({
                position: { x:500  , y: 500 },
                name: dataClass.label,
                url: dsUrl,
                attributes:childDataElements});

            cells.push(dsCell);
            cellsMap[dataClass.id] = dsCell;

            //create the link, onlyIf parent exists and DC have multiplicity
            if(parent && dataClass.minMultiplicity && dataClass.maxMultiplicity){
                links.push(this.dm2dcLink(parentCell, dsCell, parentElement, dataClass));
            }


            if(childDataClasses) {
                for (var i = 0; i < childDataClasses.length; i++) {
                    var result = this.DrawDataClass(childDataClasses[i], dataClass, dsCell);
                    cells = cells.concat(result.cells);
                    links = links.concat(result.links);
                    cellsMap = angular.extend({}, cellsMap, result.cellsMap);
                }
            }

            return {cells:cells, rootCell:dsCell, cellsMap: cellsMap, links:links};
        },

        DrawDataTypeLinks: function (dataClass, cellsMap) {
            var links = [];

            var childDataElements = dataClass.childDataElements;
            var childDataClasses  = dataClass.childDataClasses;


            if(childDataClasses) {
                for (var i = 0; i < childDataClasses.length; i++) {
                    var result = this.DrawDataTypeLinks(childDataClasses[i], cellsMap);
                    links = links.concat(result);
                }
            }

            angular.forEach(childDataElements, function(de, key) {
                if(de.dataType.domainType == "ReferenceType"){
                    var sourceCell = cellsMap[dataClass.id];
                    // var sourcePort = 'out'+ de.id ;
                    var targetCell = cellsMap[de.dataType.referenceClass.id];

                    if(sourceCell && targetCell){
                        links.push(new mc.LinkToDataType({
                            source: { id: sourceCell.id},//, port:sourcePort},
                            target: { id: targetCell.id }}));
                    }
                }
            });
            return links;
        },


        generateLink: function (element) {
            var types = elementTypes.getTypes();
            var parentDataModel = null;
            var parentDataClass = null;
            if(element.dataModel){
                parentDataModel = element.dataModel;
            }else if(element.breadcrumbs){
                parentDataModel = element.breadcrumbs[0].id;
            }

            if(element.domainType == "DataClass"){
                parentDataClass = element.parentDataClass;
            }

            if(element.domainType == "DataElement"){

                if(element.dataClass) {
                    parentDataClass = element.dataClass;
                }else if (element.breadcrumbs){
                    parentDataClass = element.breadcrumbs[element.breadcrumbs.length-1].id;
                }
            }

            return stateHandler.getURL('appContainer.mainApp.twoSidePanel.catalogue.' + types[element.domainType].link,
                {   id: element.id,
                    dataModelId: parentDataModel,
                    dataClassId: parentDataClass
                });
        },




        reOrder: function(graph) {
            var graphBBox = joint.layout.DirectedGraph.layout(graph, {
                // nodeSep: 50,
                // edgeSep: 190,
                // rankDir: "TB"

                marginY: 10,
                marginX: 10,
                nodeSep: 100,  //a number of pixels representing the separation between adjacent nodes in the same rank
                edgeSep: 120, //a number of pixels representing the separation between adjacent edges in the same rank
                rankSep: 150, //a number of pixels representing the separation between ranks
                minLen:2,     //The number of ranks to keep between the source and target of the link.
                setLinkVertices: true,
                rankDir: "TB"
            });
            return graphBBox;
        },

        saveDiagram: function (graph, element) {
            var json = JSON.stringify(graph);
            localStorage.setItem("Dg-" + element.id, json);
        },

        loadDiagram: function (graph, element) {
            var json = localStorage.getItem("Dg-" + element.id);
            if(json){
                graph.fromJSON(JSON.parse(json));
                return json;
            }
            return null;
        }
    }
});

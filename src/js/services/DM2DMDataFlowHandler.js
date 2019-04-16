
angular.module('services').factory('DM2DMDataFlowLightHandler',  function () {


    var createDM2DMDataFlowLight = function($designer, $svg, isReadOnly, accessHandler) {
        var dataFlow  = {};
        dataFlow.$designer = $designer;
        dataFlow.$svg = $svg;
        dataFlow.isReadOnly = isReadOnly;
        dataFlow.accessHandler = accessHandler;
        dataFlow.zoom = 1;
        dataFlow.zoomClass = null;
        dataFlow.selected = null;

        dataFlow.mcRootDataModel   = [];
        dataFlow.mcSourceDataFlows = [];
        dataFlow.mcTargetDataFlows = [];
        dataFlow.paths  = [];

        dataFlow.dataModels = [];//list of all available dataModels in the diagram


        dataFlow.rootDataModel = null;
        dataFlow.svgLinks = [];

        dataFlow.zoom = function (zoom) {
            var self = this;
            self.zoom = zoom;

            var zoomDetail =
                ".zoom {"+
                "   zoom: "+ self.zoom +";"+
                "   -moz-transform: scale("+ self.zoom +");"+
                "    -moz-transform-origin: 0 0;"+
                "    -o-transform: scale("+ self.zoom +");"+
                "    -o-transform-origin: 0 0;"+
                "    -webkit-transform: scale("+ self.zoom +");"+
                "    -webkit-transform-origin: 0 0;"+
                "    transform: scale("+ self.zoom +");"+
                "    transform-origin: 0 0;"+
                "}";

            if(self.zoomClass){
                self.zoomClass.remove();
            }
            self.zoomClass = jQuery("<style type='text/css'>"+zoomDetail+"</style>");
            self.zoomClass.appendTo("body");
        };

        dataFlow.showConfirmDialogue = function(message) {
            var dfd = jQuery.Deferred();
            $("#dialog-confirm").text(message);
            $("#dialog-confirm").dialog({
                resizable: false,
                height: "auto",
                width: 300,
                modal: true,
                buttons: [
                    {
                        text: "Cancel",
                        "class": 'cancelButtonClass',
                        click: function() {
                            $(this).dialog( "close" );
                            dfd.reject();
                        }
                    },
                    {
                        text: "Yes",
                        "class": 'saveButtonClass',
                        click: function() {
                            $(this).dialog( "close" );
                            dfd.resolve();
                        }
                    }
                ]
            });
            return dfd.promise();
        };
        dataFlow.handleClickOnDesigner = function () {
            dataFlow.$designer.on("click", function (event) {
                //deSelect
                dataFlow.deSelectElement();
            });
        };
        dataFlow.selectElement = function (element, event) {

            //it's multiple select
            if(event && (event.ctrlKey || (event.metaKey && !event.ctrlKey)) && element.type === "dataFlow"){
                if(!this.selected){
                    this.selected = [element];
                }
                else if(this.selected instanceof Array){
                    this.selected.push(element);
                }else{
                    this.selected = [].concat(this.selected).concat(element);
                }
                element.getUIElement().addClass("fatPathSelected");
                $(this).triggerHandler('elementSelected', [this.selected]);
                return
            }

            this.deSelectElement();
            this.selected = element;

            //if it's a dataModel
            if(element.type === 'dataModel'){
                element.getUIElement().addClass("dataModelSelected");
            }else if (element.type === "dataFlow"){
                element.getUIElement().addClass("fatPathSelected");
            }

            $(this).triggerHandler('elementSelected', this.selected);
        };
        dataFlow.deSelectElement = function () {
            if(!this.selected) {
                return
            }
            if(this.selected instanceof Array){
                angular.forEach(this.selected, function(element) {
                    if(element.type === "dataFlow"){
                        var pathId =  element.mcDataFlow.id;
                        element.getUIElement().removeClass("fatPathSelected");
                        jQuery("#middleCircle-" + pathId).addClass("middleCircleHide");
                        jQuery("#deletePath-" + pathId).addClass("deletePathHide");
                        jQuery("#fatPath-" + pathId).addClass("hideFatPath");
                    }else if(element.type === 'dataModel'){
                        element.getUIElement().removeClass("dataModelSelected");
                    }
                })
            }
            else if(this.selected.type === 'dataModel'){
                this.selected.getUIElement().removeClass("dataModelSelected");
            }else if (this.selected.type === "dataFlow"){
                var pathId =  this.selected.mcDataFlow.id;
                this.selected.getUIElement().removeClass("fatPathSelected");

                jQuery("#middleCircle-" + pathId).addClass("middleCircleHide");
                jQuery("#deletePath-" + pathId).addClass("deletePathHide");
                jQuery("#fatPath-" + pathId).addClass("hideFatPath");
            }
            this.selected = null;
            $(this).triggerHandler('elementSelected', null);

        };

        dataFlow.removeLink = function (pathId) {
            var self = this;
            var i = self.mcSourceDataFlows.length - 1;
            while(i >= 0){
                if (self.mcSourceDataFlows[i].id == pathId) {
                    self.mcSourceDataFlows.splice(i,1);
                }
                i--;
            }

            i = self.mcTargetDataFlows.length - 1;
            while(i >= 0){
                if (self.mcTargetDataFlows[i].id == pathId) {
                    self.mcTargetDataFlows.splice(i,1);
                }
                i--;
            }
            self.paths = self.findPaths(self.mcRootDataModel, self.mcSourceDataFlows, self.mcTargetDataFlows);
            self.refreshLinks();
        };

        dataFlow.drawCurvedLine = function(pathId, x1, y1, x2, y2, color, tension) {
            var self = this;
            var guid =  pathId || this.guid();

            
            if(self.zoom){
                x1 = x1 / self.zoom;
                y1 = y1 / self.zoom;

                x2 = x2 / self.zoom;
                y2 = y2 / self.zoom;
            }

            var shape = document.createElementNS("http://www.w3.org/2000/svg","path");
            var delta = (x2 - x1) * tension;
            var hx1 = x1 + delta;
            var hy1 = y1;
            var hx2 = x2 - delta;
            var hy2 = y2;
            var path = "M " + x1 + " " + y1 +
                " C " + hx1 + " " + hy1
                + " " + hx2 + " " + hy2
                + " " + x2 + " " + y2;
            shape.setAttributeNS(null, "id","path-" + guid);
            shape.setAttributeNS(null, "d", path);
            shape.setAttributeNS(null, "fill", "none");
            shape.setAttributeNS(null, "stroke", color);
            shape.setAttributeNS(null, "marker-end", "url(#markerArrow)");
            shape.setAttributeNS(null, "marker-start", "url(#markerCircle)");
            shape.setAttributeNS(null, "marker-middle", "url(#markerCircle)");
            //jQuery(shape).data("mc",{ hx1:hx1, hy1:hy1, hx2:hx2, hy2:hy2 });

            var fatShape = document.createElementNS("http://www.w3.org/2000/svg","path");
            fatShape.setAttributeNS(null, "id","fatPath-" + guid);
            fatShape.setAttributeNS(null, "d", path);
            fatShape.setAttributeNS(null, "class", "fatPath hideFatPath");
            //jQuery(fatShape).data("mc",{ hx1:hx1, hy1:hy1, hx2:hx2, hy2:hy2 });


            if(!self.isReadOnly){
                var X = 0;
                if(hx2 > hx1){
                    X = hx1 + (hx2 - hx1)/2;
                }else{
                    X = hx2 + (hx1 - hx2)/2;
                }
                var Y = 0;
                if(hy2 > hy1){
                    Y = hy1 + (hy2 - hy1)/2;
                }else{
                    Y = hy2 + (hy1 - hy2)/2;
                }

                var deleteCircle = document.createElementNS("http://www.w3.org/2000/svg","circle");
                deleteCircle.setAttributeNS(null, "id","middleCircle-" + guid);
                deleteCircle.setAttributeNS(null, "class", "middleCircle middleCircleHide");
                deleteCircle.setAttributeNS(null, "cx", X);
                deleteCircle.setAttributeNS(null, "cy", Y);
                deleteCircle.setAttributeNS(null, "r", 10);
                deleteCircle.setAttributeNS(null, "stroke", "red");
                deleteCircle.setAttributeNS(null, "fill", "red");
                deleteCircle.setAttributeNS(null, "stroke-width", "1");

                var deletePath = document.createElementNS("http://www.w3.org/2000/svg","path");
                deletePath.setAttributeNS(null, "id","deletePath-" + guid);
                deletePath.setAttributeNS(null, "stroke","white");
                deletePath.setAttributeNS(null, "fill","white");
                deletePath.setAttributeNS(null, "style","background-color:blue");
                deletePath.setAttributeNS(null, "class","deletePath deletePathHide");
                deletePath.setAttributeNS(null, "d","M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z");
                var transform = "translate("+(X-13)+","+(Y-13)+") scale(.8)";
                deletePath.setAttributeNS(null, "transform", transform);


                jQuery(deleteCircle)
                    .on('click',function(event) {
                        var pathId = jQuery(this).attr("id").replace("middleCircle-","");
                        event.stopPropagation();

                        if(self.accessHandler){
                            self.accessHandler(pathId, null, null, "remove").then(function (message) {
                                if(message === null){
                                    var dialogue = self.showConfirmDialogue("Are you sure?");
                                    $.when(dialogue).then(
                                        function() {
                                            self.removeLink(pathId);
                                            $(self).triggerHandler('dataFlowRemoved', pathId);
                                        },
                                        function() {}
                                    );
                                }else{
                                    $(self).triggerHandler('isReadOnly', message);
                                }
                            });
                        }else{
                            var dialogue = self.showConfirmDialogue("Are you sure?");
                            $.when(dialogue).then(
                                function() {
                                    self.removeLink(pathId);
                                    $(self).triggerHandler('dataFlowRemoved', pathId);
                                },
                                function() {}
                            );
                        }
                    }).on('mouseover',function(event) {
                    jQuery(fatShape).trigger('mouseover');
                    event.stopPropagation();
                }).on('mouseout',function(event) {
                    jQuery(fatShape).trigger('mouseout');
                    event.stopPropagation();
                });

                jQuery(deletePath)
                    .on('click',function(event) {
                        var pathId = jQuery(this).attr("id").replace("deletePath-","");
                        event.stopPropagation();

                        if(self.accessHandler){
                            self.accessHandler(pathId, null, null, "remove").then(function (message) {
                                if(message === null){
                                    var dialogue = self.showConfirmDialogue("Are you sure?");
                                    $.when(dialogue).then(
                                        function() {
                                            self.removeLink(pathId);
                                            $(self).triggerHandler('dataFlowRemoved', pathId);
                                        },
                                        function() {}
                                    );
                                }else{
                                    $(self).triggerHandler('isReadOnly', message);
                                }
                            });
                        }else{
                            var dialogue = self.showConfirmDialogue("Are you sure?");
                            $.when(dialogue).then(
                                function() {
                                    self.removeLink(pathId);
                                    $(self).triggerHandler('dataFlowRemoved', pathId);
                                },
                                function() {}
                            );
                        }

                    }).on('mouseover',function(event) {
                    jQuery(fatShape).trigger('mouseover');
                    event.stopPropagation();
                }).on('mouseout',function(event) {
                    jQuery(fatShape).trigger('mouseout');
                    event.stopPropagation();
                });

            }


            jQuery(fatShape)
                .on('mouseover',function(event) {
                    var pathId = jQuery(this).attr("id").replace("fatPath-","");
                    jQuery("#middleCircle-" + pathId).removeClass("middleCircleHide");
                    jQuery("#deletePath-" + pathId).removeClass("deletePathHide");
                    jQuery("#fatPath-" + pathId).removeClass("hideFatPath");
                    var path = jQuery(event.target).data("mc");
                    event.stopPropagation();

                })
                .on('mouseout',function(event) {
                    var pathId = jQuery(this).attr("id").replace("fatPath-","");

                    if(self.selected){
                        if(self.selected.type == "dataFlow" && self.selected.mcDataFlow.id == pathId) {
                            return
                        }
                    }

                    jQuery("#middleCircle-" + pathId).addClass("middleCircleHide");
                    jQuery("#deletePath-" + pathId).addClass("deletePathHide");
                    jQuery("#fatPath-" + pathId).addClass("hideFatPath");
                })
                .on('click',function(event) {
                    // var pathId = jQuery(this).attr("id").replace("fatPath-","");
                    // var path = jQuery(event.target).data("mc");
                    // var deleteCircle = jQuery("#middleCircle-" + pathId);
                    var data = jQuery(this).data("mc");

                    self.selectElement(data, event);
                    event.stopPropagation();})
                .on('dblclick',function(event) {
                    var data = jQuery(this).data("mc");
                    self.selectElement(data, event);
                    event.stopPropagation();
                    $(self).triggerHandler('linkDoubleClick', data);
                });

            this.$svg.append(shape);
            this.$svg.append(fatShape);
            if(!self.isReadOnly) {
                this.$svg.append(deleteCircle);
                this.$svg.append(deletePath);
            }
            return fatShape;
        };
        dataFlow.drawSVGLine = function(x1,y1, x2, y2, status) {
            var line = document.createElementNS("http://www.w3.org/2000/svg","line");
            line.setAttributeNS(null, "x1", x1);
            line.setAttributeNS(null, "y1", y1);
            line.setAttributeNS(null, "x2", x2);
            line.setAttributeNS(null, "y2", y2);
            line.setAttributeNS(null, "stroke", "black");
            line.setAttributeNS(null, "stroke-width", "1");
            line.setAttributeNS(null, "fill", "black");
            if(status == "start"){
                line.setAttributeNS(null, "marker-start", "url(#markerCircle)");
            }
            if(status == "end"){
                line.setAttributeNS(null, "marker-end", "url(#markerArrow)");
            }
            return line;
        };
        dataFlow.guid = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };
        dataFlow.createSVGMakers = function() {
            var defs = document.createElementNS("http://www.w3.org/2000/svg","defs");

            var startMarker = document.createElementNS("http://www.w3.org/2000/svg","marker");
            startMarker.setAttributeNS(null, "id","markerCircle");
            startMarker.setAttributeNS(null, "markerWidth",  "8");
            startMarker.setAttributeNS(null, "markerHeight", "8");
            startMarker.setAttributeNS(null, "refX", "5");
            startMarker.setAttributeNS(null, "refY", "5");
            var startCircle = document.createElementNS("http://www.w3.org/2000/svg","circle");
            startCircle.setAttributeNS(null, "cx", "5");
            startCircle.setAttributeNS(null, "cy", "5");
            startCircle.setAttributeNS(null, "r",  "3");
            startCircle.setAttributeNS(null, "style",  "stroke: none; fill:#000000;");
            startMarker.appendChild(startCircle);

            var endMarker = document.createElementNS("http://www.w3.org/2000/svg","marker");
            endMarker.setAttributeNS(null, "id","markerArrow");
            endMarker.setAttributeNS(null, "markerWidth", "13");
            endMarker.setAttributeNS(null, "markerHeight", "13");
            endMarker.setAttributeNS(null, "refX", "2");
            endMarker.setAttributeNS(null, "refY", "6");
            endMarker.setAttributeNS(null, "orient", "auto");
            var arrowPath = document.createElementNS("http://www.w3.org/2000/svg","path");
            arrowPath.setAttributeNS(null, "d", "M2,2 L2,11 L10,6 L2,2");
            arrowPath.setAttributeNS(null, "style", "fill: #000000;");
            endMarker.appendChild(arrowPath);

            defs.appendChild(startMarker);
            defs.appendChild(endMarker);
            return defs;
        };

        dataFlow.addDataFlow = function (sourceDiv, targetDiv) {
            var self = this;
            var source = sourceDiv.data("mc");
            var target = targetDiv.data("mc");

            var dataFlow = {
                source: source.dataModel,
                target: target.dataModel,
                id: "temp-"+self.guid(),
                temp: true
            };

            if(source.isRoot && target.isRoot){
                self.mcSourceDataFlows.push(dataFlow);
            }
            if(source.isRoot && !target.isRoot){
              self.mcSourceDataFlows.push(dataFlow);
            }
            if(target.isRoot && !source.isRoot){
                self.mcTargetDataFlows.push(dataFlow);
            }

            self.paths = self.findPaths(self.mcRootDataModel, self.mcSourceDataFlows, self.mcTargetDataFlows);

            $(self).triggerHandler('dataFlowAdded', dataFlow);
        };

        dataFlow.updateTempPathId = function (tempPathId, pathId) {
            var self = this;
            for (var i = 0; i < self.mcSourceDataFlows.length; i++) {
                if (self.mcSourceDataFlows[i].temp == true && self.mcSourceDataFlows[i].id == tempPathId) {
                    delete self.mcSourceDataFlows[i].temp;
                    self.mcSourceDataFlows[i].id = pathId;
                }
            }
            for (var i = 0; i < self.mcTargetDataFlows.length; i++) {
                if (self.mcTargetDataFlows[i].temp == true && self.mcTargetDataFlows[i].id == tempPathId) {
                    delete self.mcTargetDataFlows[i].temp;
                    self.mcTargetDataFlows[i].id = pathId;
                }
            }
            self.paths = self.findPaths(self.mcRootDataModel, self.mcSourceDataFlows, self.mcTargetDataFlows);
            self.refreshLinks();
        };

        dataFlow.updateDataFlow = function (id, newId, label, description) {
            var self = this;
            var found = false;
            for (var i = 0; i < self.mcSourceDataFlows.length && !found; i++) {
                if (self.mcSourceDataFlows[i].id == id) {
                    self.mcSourceDataFlows[i].id = newId;
                    self.mcSourceDataFlows[i].label = label;
                    self.mcSourceDataFlows[i].description = description;
                    found  = true;
                    break;
                }
            }
            for (var i = 0; i < self.mcTargetDataFlows.length && !found; i++) {
                if (self.mcTargetDataFlows[i].id == id) {
                    self.mcTargetDataFlows[i].id = newId;
                    self.mcTargetDataFlows[i].label = label;
                    self.mcTargetDataFlows[i].description = description;
                    found  = true;
                    break;
                }
            }
            self.paths = self.findPaths(self.mcRootDataModel, self.mcSourceDataFlows, self.mcTargetDataFlows);
            self.refreshLinks();
        };


        dataFlow.findDataModels = function(rootDataModel, sourceDataFlows, targetDataFlows){

            var dmsMap = {};
            dmsMap[rootDataModel.id] = rootDataModel;


            for (var i = 0; i < sourceDataFlows.length; i++) {
                if(!dmsMap[sourceDataFlows[i].source.id]){
                    dmsMap[sourceDataFlows[i].source.id] = sourceDataFlows[i].source;
                }

                if(!dmsMap[sourceDataFlows[i].target.id]){
                    dmsMap[sourceDataFlows[i].target.id] = sourceDataFlows[i].target;
                }
            }

            for (var i = 0; i < targetDataFlows.length; i++) {
                if(!dmsMap[targetDataFlows[i].source.id]){
                    dmsMap[targetDataFlows[i].source.id] = targetDataFlows[i].source;
                }

                if(!dmsMap[targetDataFlows[i].target.id]){
                    dmsMap[targetDataFlows[i].target.id] = targetDataFlows[i].target;
                }
            }

            return dmsMap;
        };
        dataFlow.hasDataModel = function (id) {
            for (var i = 0; i < this.dataModels.length; i++) {
                if(this.dataModels[i].dataModel.id == id){
                    return this.dataModels[i];
                }
            }
            return null;
        };
        dataFlow.getDataModel = function (id) {
            var self = this;
            for(var i=0;i<self.dataModels.length;i++){
                if(self.dataModels[i].dataModel.id == id){
                    return self.dataModels[i];
                }
            }
        };



        dataFlow.findPaths = function(rootDataModel, sourceDataFlows, targetDataFlows){
            var paths = [];

            for (var i = 0; i < sourceDataFlows.length; i++) {
                paths.push({
                    source: sourceDataFlows[i].source.id,
                    target:sourceDataFlows[i].target.id,
                    id:sourceDataFlows[i].id,
                    label:sourceDataFlows[i].label,
                    description:sourceDataFlows[i].description,
                    editable:sourceDataFlows[i].editable
                });
            }

            for (var i = 0; i < targetDataFlows.length; i++) {
                if(targetDataFlows[i].source.id === rootDataModel.id){
                    continue;
                }

                paths.push({
                    source: targetDataFlows[i].source.id,
                    target:targetDataFlows[i].target.id,
                    id:targetDataFlows[i].id,
                    label:targetDataFlows[i].label,
                    description:targetDataFlows[i].description,
                    editable:targetDataFlows[i].editable
                });
            }

            return paths;
        };

        dataFlow.runDagre = function(dataModelsMap, paths) {
            var self = this;
            // Create a new directed graph
            var g = new dagre.graphlib.Graph();
            // Set an object for the graph label
            g.setGraph({rankdir:"LR", ranksep:100, nodesep:40, edgesep:50});
            // Default to assigning a new object as a label for each new edge.
            g.setDefaultEdgeLabel(function() { return {}; });

            // Add nodes to the graph. The first argument is the node id. The second is
            // metadata about the node. In this case we're going to add labels to each of
            // our nodes.
            for(var id in dataModelsMap) {
                var dm = dataModelsMap[id];
                g.setNode(dm.id, { id: dm.id,  width: 150, height: 100, dataModel:dm });
            }
            for(var i=0;i< self.paths.length;i++) {
                g.setEdge(self.paths[i].source, paths[i].target);
            }
            dagre.layout(g);
            return g;
        };
        dataFlow.findDegree = function (x1, y1, x2, y2) {
            var X2 =  x2 - x1;
            var Y2 =  y1 - y2;
            var radius = Math.atan2(Y2, X2); //radius
            var deg = radius* (180 / Math.PI);
            if(deg < 0){
                deg = deg + 360;
            }
            return deg;
        };

        dataFlow.findPathsBetween = function (sourceId, targetId) {
            var self = this;
            var paths = [];
            for(var i = 0; i < self.paths.length;i++){
                if(self.paths[i].source == sourceId && self.paths[i].target == targetId ||
                    self.paths[i].target == sourceId && self.paths[i].source == targetId){
                    paths.push(self.paths[i]);
                }
            }
            return paths;
        };

        dataFlow.drawLinks = function() {
            var self = this;
            var svgLinks = [];

            for(var i=0; i <self.paths.length;i++) {
                var path = self.paths[i];
                var source =  self.getDataModel(path.source);
                var target =  self.getDataModel(path.target);

                // source located on left side of target source--->target
                var sourceX  = source.div.position().left + source.div.width()/2;
                var sourceY  = source.div.position().top  + source.div.height()/2;

                var targetX  = target.div.position().left + target.div.width()/2;
                var targetY  = target.div.position().top  + target.div.height()/2;

                var degree =self.findDegree(sourceX, sourceY, targetX, targetY);


                var x1 = 0;
                var y1 = 0;
                var x2 = 0;
                var y2 = 0;
                //S1 | S2 | S3
                //S4 | T  | S5
                //S6 | S7 | S8
                //position A1
                if(degree <= 50){
                    //stick to left
                    x1 = source.div.position().left + source.div.width() + 2;
                    y1 = source.div.position().top  + source.div.height()/2;

                    x2 = target.div.position().left -10;
                    y2 = target.div.position().top  + target.div.height()/2;
                }else if(degree > 50 && degree <= 90+30){
                    //stick to bottom
                    x1 = source.div.position().left + source.div.width()/2 - 10;
                    y1 = source.div.position().top;

                    x2 = target.div.position().left + target.div.width()/2;
                    y2 = target.div.position().top  + target.div.height() + 10;
                }else if(degree > 90+30 && degree <= 180){
                    x1 = source.div.position().left + source.div.width();
                    y1 = source.div.position().top  + target.div.height()/2;

                    x2 = target.div.position().left + target.div.width();
                    y2 = target.div.position().top  + target.div.height()/2;
                }else if(degree > 180 && degree <= 270-30){
                    x1 = source.div.position().left;
                    y1 = source.div.position().top  + source.div.height()/2;

                    x2 = target.div.position().left + target.div.width();
                    y2 = target.div.position().top  + target.div.height()/2;
                }else if(degree > 270-30 && degree<360-50){
                    x1 = source.div.position().left + source.div.width()/2;
                    y1 = source.div.position().top  + source.div.height();

                    x2 = target.div.position().left + target.div.width()/2;
                    y2 = target.div.position().top;
                }else if(degree>=360-50){
                    x1 = source.div.position().left + source.div.width() + 2;
                    y1 = source.div.position().top  + source.div.height()/2;

                    x2 = target.div.position().left - 10;
                    y2 = target.div.position().top + target.div.height()/2;
                }


                var svgLine = this.drawCurvedLine(null, x1, y1, x2, y2, "#000080", 0.9);
                svgLinks.push(svgLine);
            }
            return svgLinks;
        };
        dataFlow.drawLinks2 = function() {
            var self = this;
            var svgLinks = [];
            var nodeCounts = {};
            //find the number of magnets we need on right and left side of each node
            for (var i = 0; i < self.dataModels.length; i++) {
                var node = self.dataModels[i];
                nodeCounts[node.dataModel.id] = {
                    right:0, rightUsed:0,
                    left:0, leftUsed:0,
                    top:0, topUsed:0,
                    bottom:0, bottomUsed:0,
                };

                for (var j = 0; j < self.dataModels.length; j++) {
                    var anotherNode = self.dataModels[j];
                    var paths = self.findPathsBetween(node.dataModel.id, anotherNode.dataModel.id);
                    if(paths.length == 0){
                        continue;
                    }


                    if(node.div.position().left + (node.div.outerWidth()*self.zoom) < anotherNode.div.position().left){
                        // root | node
                        nodeCounts[node.dataModel.id].right += paths.length;
                    }
                    else if(anotherNode.div.position().left + (anotherNode.div.outerWidth()*self.zoom) < node.div.position().left){
                        // node | root
                        nodeCounts[self.dataModels[i].dataModel.id].left += paths.length;
                    }
                    else if(anotherNode.div.position().top + (anotherNode.div.outerHeight()*self.zoom) < node.div.position().top){
                        // node
                        //------
                        // root
                        nodeCounts[self.dataModels[i].dataModel.id].top += paths.length;
                    }
                    else if(node.div.position().top < anotherNode.div.position().top + (anotherNode.div.outerHeight()*self.zoom) ){
                        // root
                        //------
                        // node
                        nodeCounts[self.dataModels[i].dataModel.id].bottom += paths.length;
                    }
                }
            }

            //sort all nodes which are on right-hand side of the root based on their bottom position
            //sort all nodes which are on left-hand side of the root based on their bottom position
            var rightSideElements = [];
            var leftSideElements  = [];
            var topSideElements  = [];
            var bottomSideElements  = [];
            for (var i = 0; i < self.dataModels.length; i++) {
                var root  = self.rootDataModel;
                var node  = self.dataModels[i];
                //sort them based on the location to root
                if(node.dataModel.id == root.dataModel.id){
                    continue;
                }

                if(root.div.position().left + (root.div.outerWidth()*self.zoom) < node.div.position().left){
                    //root | node
                    rightSideElements.push(node);
                }
                else if(node.div.position().left + (node.div.outerWidth()*self.zoom) < root.div.position().left){
                    //node | root
                    leftSideElements.push(node);
                }
                else if(node.div.position().top + (node.div.outerHeight()*self.zoom) < root.div.position().top){
                    // node
                    //------
                    // root
                    topSideElements.push(node);
                }
                else if(root.div.position().top + (root.div.outerHeight()*self.zoom) < node.div.position().top){
                    // root
                    //------
                    // node
                    bottomSideElements.push(node);
                }

            }
            rightSideElements.sort(function(a, b) {
                if(a.div.position().top < b.div.position().top){
                    return -1;
                }else if(a.div.position().top > b.div.position().top){
                    return 1;
                }else{
                    return 0;
                }
            });
            leftSideElements.sort(function(a, b) {
                if(a.div.position().top < b.div.position().top){
                    return -1;
                }else if(a.div.position().top > b.div.position().top){
                    return 1;
                }else{
                    return 0;
                }
            });
            topSideElements.sort(function(a, b) {
                if(a.div.position().left < b.div.position().left){
                    return -1;
                }else if(a.div.position().left > b.div.position().left){
                    return 1;
                }else{
                    return 0;
                }
            });
            bottomSideElements.sort(function(a, b) {
                if(a.div.position().left < b.div.position().left){
                    return -1;
                }else if(a.div.position().left > b.div.position().left){
                    return 1;
                }else{
                    return 0;
                }
            });
            var sortedDataModels = [].concat(rightSideElements).concat(leftSideElements).concat(topSideElements).concat(bottomSideElements);


            //now draw links
            for (var i = 0; i < sortedDataModels.length; i++) {
                var node  = sortedDataModels[i];
                var nodeCount = nodeCounts[node.dataModel.id];

                var root  = self.rootDataModel;
                var rootNodeCount = nodeCounts[root.dataModel.id];

                // if(node.dataModel.id == root.dataModel.id){
                // }

                var paths = self.findPathsBetween(self.rootDataModel.id, node.dataModel.id);

                for (var p = 0; p < paths.length; p++) {
                    var path = paths[p];

                    //it's from root to node
                    if(path.source == root.dataModel.id){

                        //root is on left, node is on right
                        //root->node
                        if(root.div.position().left + (root.div.outerWidth()*self.zoom) < node.div.position().left) {
                            var portion = (root.div.outerHeight()*self.zoom) / rootNodeCount.right;
                            var x1 = root.div.position().left + (root.div.outerWidth()*self.zoom) + 2;
                            var y1 = Math.round(root.div.position().top + rootNodeCount.rightUsed * portion + portion / 2);
                            rootNodeCount.rightUsed++;

                            var x2 = node.div.position().left - 9;
                            portion = (node.div.outerHeight()*self.zoom) / nodeCount.left;
                            var y2 = Math.round(node.div.position().top + nodeCount.leftUsed * portion + portion / 2);
                            nodeCount.leftUsed++;

                            var svgFatPath = this.drawCurvedLine(path.id, x1, y1, x2, y2, "#000080", 0.9);
                            self.createDataFlow().init(path, svgFatPath);
                            continue;
                        }

                        //node is on left, root is on right
                        //node<-root
                        if(node.div.position().left + (root.div.outerWidth()*self.zoom) < root.div.position().left) {
                            var portion = (root.div.outerHeight()*self.zoom) / rootNodeCount.left;
                            var x1 = root.div.position().left - 2;
                            var y1 = Math.round(root.div.position().top + rootNodeCount.leftUsed * portion + portion / 2);
                            rootNodeCount.leftUsed++;

                            var x2  = node.div.position().left + (node.div.outerWidth()*self.zoom) + 9;
                            portion = (node.div.outerHeight()*self.zoom) / nodeCount.right;
                            var y2  = Math.round(node.div.position().top + nodeCount.rightUsed * portion + portion / 2);
                            nodeCount.rightUsed++;

                            var svgFatPath = this.drawCurvedLine(path.id, x1, y1, x2, y2, "#000080", 0.9);
                            self.createDataFlow().init(path, svgFatPath);
                            continue;
                        }

                        //root is on top, node is on bottom
                        // node (target)
                        // \|/
                        // root (source)
                        if(root.div.position().top > node.div.position().top  + (node.div.outerHeight()*self.zoom) ) {
                            var portion = (root.div.outerWidth()*self.zoom) / rootNodeCount.top;
                            var x1 = Math.round(root.div.position().left + rootNodeCount.topUsed * portion + portion / 2);
                            var y1 = root.div.position().top - 2;
                            rootNodeCount.topUsed ++;

                            portion = (node.div.outerWidth()*self.zoom) / nodeCount.bottom;
                            var x2 = Math.round(node.div.position().left + nodeCount.bottomUsed * portion + portion / 2);
                            var y2 = node.div.position().top + (node.div.outerHeight()*self.zoom) + 5;
                            nodeCount.bottomUsed++;

                            var svgFatPath = this.drawCurvedLine(path.id, x1, y1, x2, y2, "#000080", 0.9);
                            self.createDataFlow().init(path, svgFatPath);
                            continue;
                        }


                        //root is on top, node is on bottom
                        // root (source)
                        // \|/
                        // node (target)
                        if(root.div.position().top + (root.div.outerHeight()*self.zoom)  < node.div.position().top ) {
                            var portion = (root.div.outerWidth()*self.zoom) / rootNodeCount.bottom;
                            var x1 = Math.round(root.div.position().left + rootNodeCount.bottomUsed * portion + portion / 2);
                            var y1 = root.div.position().top + (root.div.outerHeight()*self.zoom) + 2;
                            rootNodeCount.bottomUsed ++;

                            portion = (node.div.outerWidth()*self.zoom) / nodeCount.top;
                            var x2 = Math.round(node.div.position().left + nodeCount.topUsed * portion + portion / 2);
                            var y2 = node.div.position().top - 5;
                            nodeCount.topUsed++;

                            var svgFatPath = this.drawCurvedLine(path.id, x1, y1, x2, y2, "#000080", 0.9);
                            self.createDataFlow().init(path, svgFatPath);
                            continue;
                        }

                    }

                    //it's from node to root
                    if(path.source == node.dataModel.id){

                        //node is on left, root is on right
                        //node->root
                        if(node.div.position().left + (node.div.outerWidth()*self.zoom) < root.div.position().left) {
                            var portion = (node.div.outerHeight()*self.zoom) / nodeCount.right;
                            var x1 = node.div.position().left + (node.div.outerWidth()*self.zoom) + 2;
                            var y1 = Math.round(node.div.position().top + nodeCount.rightUsed * portion + portion / 2);
                            nodeCount.rightUsed++;

                            var x2  = root.div.position().left - 9;
                            portion = (root.div.outerHeight()*self.zoom) / rootNodeCount.left;
                            var y2 = Math.round(root.div.position().top + rootNodeCount.leftUsed * portion + portion / 2);
                            rootNodeCount.leftUsed++;

                            var svgFatPath = this.drawCurvedLine(path.id, x1, y1, x2, y2, "#000080", 0.9);
                            self.createDataFlow().init(path, svgFatPath);
                            continue;
                        }

                        //root is on left, node is on right
                        //root<-node
                        if(root.div.position().left + (root.div.outerWidth()*self.zoom) < node.div.position().left) {
                            var portion = (node.div.outerHeight()*self.zoom) / nodeCount.left;
                            var x1 = node.div.position().left - 3;
                            var y1 = Math.round(node.div.position().top + nodeCount.leftUsed * portion + portion / 2);
                            nodeCount.leftUsed++;

                            var x2  = root.div.position().left + (root.div.outerWidth()*self.zoom) + 9;
                            portion = (root.div.outerHeight()*self.zoom) / rootNodeCount.right;
                            var y2 = Math.round(root.div.position().top + rootNodeCount.rightUsed * portion + portion / 2);
                            rootNodeCount.rightUsed++;

                            var svgFatPath = this.drawCurvedLine(path.id, x1, y1, x2, y2, "#000080", 0.9);
                            self.createDataFlow().init(path, svgFatPath);
                            continue;
                        }

                        //root is on top, node is on bottom
                        // root (target)
                        // ^
                        // node (source)
                        if(root.div.position().top + (root.div.outerHeight()*self.zoom) <  node.div.position().top ) {
                            portion = (node.div.outerWidth()*self.zoom) / nodeCount.top;
                            var x1 = Math.round(node.div.position().left + nodeCount.topUsed * portion + portion / 2);
                            var y1 = node.div.position().top - 5;
                            nodeCount.topUsed++;

                            var portion = (root.div.outerWidth()*self.zoom) / rootNodeCount.bottom;
                            var x2 = Math.round(root.div.position().left + rootNodeCount.bottomUsed * portion + portion / 2);
                            var y2 = root.div.position().top + (root.div.outerHeight()*self.zoom) + 4;
                            rootNodeCount.bottomUsed ++;

                            var svgFatPath = this.drawCurvedLine(path.id, x1, y1, x2, y2, "#000080", 0.9);
                            self.createDataFlow().init(path, svgFatPath);
                            continue;
                        }

                        //node is on top, root is on bottom
                        // node (source)
                        // \|/
                        // root (target)
                        if(node.div.position().top + (node.div.outerHeight()*self.zoom) < root.div.position().top ) {
                            var portion = (node.div.outerWidth()*self.zoom) / nodeCount.bottom;
                            var x1 = Math.round(node.div.position().left + nodeCount.bottomUsed * portion + portion / 2);
                            var y1 = node.div.position().top + (node.div.outerHeight()*self.zoom) + 2;
                            nodeCount.bottomUsed ++;

                            portion = (root.div.outerWidth()*self.zoom) / rootNodeCount.top;
                            var x2 = Math.round(root.div.position().left + rootNodeCount.topUsed * portion + portion / 2);
                            var y2 = root.div.position().top - 5;
                            rootNodeCount.topUsed++;

                            var svgFatPath = this.drawCurvedLine(path.id, x1, y1, x2, y2, "#000080", 0.9);
                            self.createDataFlow().init(path, svgFatPath);
                            continue;
                        }

                    }

                }
            }
            self.drawToSelf();
        };
        dataFlow.drawLinks3 = function(g, offset) {
            var svgLinks = [];
            var edges = g.edges();
            var nodes = {};

            g.nodes().forEach(function(v) {
                node = g.node(v);
                nodes[node.id] = node;
            });

            for (var i = 0; i < edges.length; i++) {
                var points   = g.edge(edges[i]).points;
                for (var p = 0; p < points.length - 1 ; p++) {
                    var status = null;
                    var x1 = points[p].x + offset;
                    var y1 = points[p].y + offset;
                    var x2 = points[p+1].x + offset;
                    var y2 = points[p+1].y + offset;

                    if(p == 0){
                        status = "start";
                    }
                    if(p + 2 == points.length){
                        status = "end";
                    }
                    var svgLine = this.drawSVGLine(x1, y1, x2, y2, status);
                    this.$svg.append(svgLine);
                }
            }
            return svgLinks;
        };
        dataFlow.drawLinks4 = function() {
            var self = this;
            var svgLinks = [];

            for (var i = 0; i < self.dataModels.length; i++) {

                if(self.dataModels[i].dataModel.id == self.rootDataModel.id){
                    continue;
                }

                var linkCount = 0;
                //find number of dataFlow between rootDataModel and this dataModel
                for (var p = 0; p < self.rootDataModel.dataModel.dataFlows.length; j++) {
                    if(self.dataModels[i].dataModel.id == self.rootDataModel.dataModel.dataFlows[j].dataModel.id){
                        linkCount++;
                    }
                }

                var x1 = self.rootDataModel.div.position().left + self.rootDataModel.div.width() + 4;
                var y1 = self.rootDataModel.div.position().top  + self.rootDataModel.div.height()/2;

                for (var l = 0; l < linkCount; l++) {
                    var x2 = self.dataModels[i].div.position().left - 9;
                    var portion = self.dataModels[i].div.height()/ linkCount;

                    var y2 = self.dataModels[i].div.position().top + l*portion + portion/2;

                    var svgLine = this.drawCurvedLine(null, x1, y1, x2, y2, "#000080", 0.9);
                    svgLinks.push(svgLine);
                }
            };
            return svgLinks;
        };


        dataFlow.drawToSelf = function(){
            var self = this;
            var selfLinks = {};

            var checkedPaths = {};
            for (var i = 0; i < self.paths.length; i++) {
                if (self.paths[i].source === self.paths[i].target){

                    if(checkedPaths[self.paths[i].id]){
                        continue
                    }
                    checkedPaths[self.paths[i].id] = self.paths[i];

                    if(!selfLinks[self.paths[i].source]){
                        selfLinks[self.paths[i].source] = [] ;
                    }
                    selfLinks[self.paths[i].source].push(self.paths[i]);
                }
            }

            //for each selfLink
            for (var elId in selfLinks) {
                if (selfLinks.hasOwnProperty(elId)) {
                    //draw a number of selfLinks (selfLinkCount)
                    for (var i = 0; i < selfLinks[elId].length; i++) {

                        var source =  self.getDataModel(selfLinks[elId][i].source);

                        var X1  = Math.round(source.div.position().left + (source.div.width()*self.zoom)/3);
                        var Y1  = source.div.position().top - 2;

                        var relativeX2  = Math.round((source.div.width()*self.zoom)/2.5);
                        var relativeY2  = -3;

                        var svgPath = dataFlow.drawSelfCircle(selfLinks[elId][i].id, X1, Y1, relativeX2, relativeY2, "#000080", i*40);
                        self.createDataFlow().init(selfLinks[elId][i], svgPath);
                    }
                }
            }
        };

        dataFlow.drawSelfCircle = function(pathId, x1, y1, x2, y2, color, level) {
            var self = this;
            var guid =  pathId || this.guid();

            if(self.zoom){
                x1 = x1 / self.zoom;
                y1 = y1 / self.zoom;

                x2 = x2 / self.zoom;
                y2 = y2 / self.zoom;
            }

            var shape = document.createElementNS("http://www.w3.org/2000/svg","path");

            var hx1 =  0 ;
            var hy1 = -x2 - level ;

            var hx2 = x2;
            var hy2 = -x2 - level;

            var path = "M " + x1 + " " + y1 +
                " c " + hx1 + " " + hy1
                + " " + hx2 + " " + hy2
                + " " + x2 + " " + y2;
            shape.setAttributeNS(null, "id","path-" + guid);
            shape.setAttributeNS(null, "d", path);
            shape.setAttributeNS(null, "fill", "none");
            shape.setAttributeNS(null, "stroke", color);
            shape.setAttributeNS(null, "marker-end", "url(#markerArrow)");
            shape.setAttributeNS(null, "marker-start", "url(#markerCircle)");
            shape.setAttributeNS(null, "marker-middle", "url(#markerCircle)");
            jQuery(shape).data("mc",{ hx1:hx1, hy1:hy1, hx2:hx2, hy2:hy2 });

            var fatShape = document.createElementNS("http://www.w3.org/2000/svg","path");
            fatShape.setAttributeNS(null, "id","fatPath-" + guid);
            fatShape.setAttributeNS(null, "d", path);
            fatShape.setAttributeNS(null, "class", "fatPath hideFatPath");
            jQuery(fatShape).data("mc",{ hx1:hx1, hy1:hy1, hx2:hx2, hy2:hy2 });



            if(!self.isReadOnly){
                var X = x1 + x2/2;
                // if(x1 + hx2 > x1 + hx1){
                //     X = x1 + hx1 + (x1 + hx2 - x1 + hx1)/2;
                // }else{
                //     X = x1 + hx2 + (x1 + hx1 - x1 + hx2)/2;
                // }
                var Y = y1 - x2 - level + 15;

                // if(y1 + hy2 > y1 + hy1){
                //     Y = y1 + hy1 + (y1 + hy2 - y1 + hy1)/2;
                // }else{
                //     Y = y1 + hy2 + (y1 + hy1 - y1 + hy2)/2;
                // }

                var deleteCircle = document.createElementNS("http://www.w3.org/2000/svg","circle");
                deleteCircle.setAttributeNS(null, "id","middleCircle-" + guid);
                deleteCircle.setAttributeNS(null, "class", "middleCircle middleCircleHide");
                deleteCircle.setAttributeNS(null, "cx", X);
                deleteCircle.setAttributeNS(null, "cy", Y);
                deleteCircle.setAttributeNS(null, "r", 10);
                deleteCircle.setAttributeNS(null, "stroke", "red");
                deleteCircle.setAttributeNS(null, "fill", "red");
                deleteCircle.setAttributeNS(null, "stroke-width", "1");

                var deletePath = document.createElementNS("http://www.w3.org/2000/svg","path");
                deletePath.setAttributeNS(null, "id","deletePath-" + guid);
                deletePath.setAttributeNS(null, "stroke","white");
                deletePath.setAttributeNS(null, "fill","white");
                deletePath.setAttributeNS(null, "style","background-color:blue");
                deletePath.setAttributeNS(null, "class","deletePath deletePathHide");
                deletePath.setAttributeNS(null, "d","M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z");
                var transform = "translate("+(X-13)+","+(Y-13)+") scale(.8)";
                deletePath.setAttributeNS(null, "transform", transform);


                jQuery(deleteCircle)
                    .on('click',function(event) {
                        var pathId = jQuery(this).attr("id").replace("middleCircle-","");
                        event.stopPropagation();

                        if(self.accessHandler){
                            self.accessHandler(pathId, null, null, "remove").then(function (message) {
                                if(message === null){
                                    var dialogue = self.showConfirmDialogue("Are you sure?");
                                    $.when(dialogue).then(
                                        function() {
                                            self.removeLink(pathId);
                                            $(self).triggerHandler('dataFlowRemoved', pathId);
                                        },
                                        function() {}
                                    );
                                }else{
                                    $(self).triggerHandler('isReadOnly', message);
                                }
                            });
                        }else{
                            var dialogue = self.showConfirmDialogue("Are you sure?");
                            $.when(dialogue).then(
                                function() {
                                    self.removeLink(pathId);
                                    $(self).triggerHandler('dataFlowRemoved', pathId);
                                },
                                function() {}
                            );
                        }
                    }).on('mouseover',function(event) {
                    jQuery(fatShape).trigger('mouseover');
                    event.stopPropagation();
                }).on('mouseout',function(event) {
                    jQuery(fatShape).trigger('mouseout');
                    event.stopPropagation();
                });

                jQuery(deletePath)
                    .on('click',function(event) {
                        var pathId = jQuery(this).attr("id").replace("deletePath-","");
                        event.stopPropagation();
                        if(self.accessHandler){
                            self.accessHandler(pathId, null, null, "remove").then(function (message) {
                                if(message === null){
                                    var dialogue = self.showConfirmDialogue("Are you sure?");
                                    $.when(dialogue).then(
                                        function() {
                                            self.removeLink(pathId);
                                            $(self).triggerHandler('dataFlowRemoved', pathId);
                                        },
                                        function() {}
                                    );
                                }else{
                                    $(self).triggerHandler('isReadOnly', message);
                                }
                            });
                        }else{
                            var dialogue = self.showConfirmDialogue("Are you sure?");
                            $.when(dialogue).then(
                                function() {
                                    self.removeLink(pathId);
                                    $(self).triggerHandler('dataFlowRemoved', pathId);
                                },
                                function() {}
                            );
                        }
                    }).on('mouseover',function(event) {
                    jQuery(fatShape).trigger('mouseover');
                    event.stopPropagation();
                }).on('mouseout',function(event) {
                    jQuery(fatShape).trigger('mouseout');
                    event.stopPropagation();
                });

            }


            jQuery(fatShape)
                .on('mouseover',function(event) {
                    var pathId = jQuery(this).attr("id").replace("fatPath-","");
                    jQuery("#middleCircle-" + pathId).removeClass("middleCircleHide");
                    jQuery("#deletePath-" + pathId).removeClass("deletePathHide");
                    jQuery("#fatPath-" + pathId).removeClass("hideFatPath");
                    var path = jQuery(event.target).data("mc");
                    event.stopPropagation();

                })
                .on('mouseout',function(event) {
                    var pathId = jQuery(this).attr("id").replace("fatPath-","");

                    if(self.selected){
                        if(self.selected.type == "dataFlow" && self.selected.mcDataFlow.id == pathId) {
                            return
                        }
                    }

                    jQuery("#middleCircle-" + pathId).addClass("middleCircleHide");
                    jQuery("#deletePath-" + pathId).addClass("deletePathHide");
                    jQuery("#fatPath-" + pathId).addClass("hideFatPath");
                })
                .on('click',function(event) {
                    debugger
                    // var pathId = jQuery(this).attr("id").replace("fatPath-","");
                    // var path = jQuery(event.target).data("mc");
                    // var deleteCircle = jQuery("#middleCircle-" + pathId);
                    var data = jQuery(this).data("mc");

                    self.selectElement(data, event);
                    event.stopPropagation();})
                .on('dblclick',function(event) {
                    var data = jQuery(this).data("mc");
                    self.selectElement(data, event);
                    event.stopPropagation();
                    $(self).triggerHandler('linkDoubleClick', data);
                });

            this.$svg.append(shape);
            this.$svg.append(fatShape);
            if(!self.isReadOnly) {
                this.$svg.append(deleteCircle);
                this.$svg.append(deletePath);
            }
            return fatShape;
        };

        dataFlow.addDataModel = function (dataModel) {
            var self = this;
            if(dataModel.isRoot){
                self.rootDataModel = dataModel;
            }
            self.dataModels.push(dataModel);
            self.$designer.append(dataModel.div);
        };

        dataFlow.getDataModel = function (id) {
            var self = this;
            for(var i=0;i<self.dataModels.length;i++){
                if(self.dataModels[i].dataModel.id == id){
                    return self.dataModels[i];
                }
            }
        };
        dataFlow.refreshLinks = function() {
            $(this.$svg).remove();

            this.$svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
            this.$svg.setAttributeNS(null, "class", "designer");
            this.$designer.append(this.$svg);

            var markers = this.createSVGMakers();
            this.$svg.append(markers);
            this.drawLinks2();
        };


        dataFlow.createDataModel = function() {
            var self = {};
            self.div = null;
            self.topBar = null;
            self.titleDiv = null;
            self.dataModel = null;
            self.isRoot = false;
            self.dataFlow  = this;// this points to "parent dataFlow"
            self.type = 'dataModel';

            self.init = function (mcDataModel, isRoot, position) {
                this.isRoot = isRoot;
                this.dataModel = mcDataModel;
                this.id  = mcDataModel.id ||  self.dataFlow.guid();
                var rootDataModelCSS = "";
                if (this.isRoot){
                    rootDataModelCSS = "rootDataModel";
                }
                this.div = jQuery("<div class='dataModel "+rootDataModelCSS+"'></div>");
                this.titleDiv = jQuery("<div class='dataModelTitle'>"+mcDataModel.label+"</div>");
                this.div.append(this.titleDiv);
                this.handleDraggable(position);
                this.handleDroppable();
                this.handleResizable();
                this.handleClick();
                this.div.data("mc", self);
                return this;
            };

            self.handleClick = function () {
                var self = this;
                self.div.on("click", function (event) {
                    self.dataFlow.selectElement(self, event);
                    event.stopPropagation();
                })
            };
            self.handleDraggable = function (position) {
                var self = this;

                this.div.addClass('canvas-element');
                this.div.draggable({
                    containment: "div.designer",
                    start: function(event, ui) {
                        //Fix for draggable when you have scale
                        //https://stackoverflow.com/questions/10212683/jquery-drag-resize-with-css-transform-scale
                        ui.position.left = 0;
                        ui.position.top  = 0;
                    },
                    drag: function(event, ui) {

                        //Fix for draggable when you have scale
                        //https://stackoverflow.com/questions/10212683/jquery-drag-resize-with-css-transform-scale
                        var changeLeft = ui.position.left - ui.originalPosition.left; // find change in left
                        var newLeft = ui.originalPosition.left + changeLeft / self.dataFlow.zoom; // adjust new left by our zoomScale
                        var changeTop = ui.position.top - ui.originalPosition.top; // find change in top
                        var newTop = ui.originalPosition.top + changeTop / self.dataFlow.zoom; // adjust new top by our zoomScale
                        ui.position.left = newLeft;
                        ui.position.top  = newTop;
                        self.dataFlow.refreshLinks();
                    },
                    stop: function(event, ui) {
                        self.dataFlow.refreshLinks();
                    }
                });
                if(position && position['left'] && position['top']) {
                    this.div.css({
                        left: (position.left - this.dataFlow.$designer.position().left) ,
                        top:  (position.top  - this.dataFlow.$designer.position().top) ,
                        position: 'absolute'
                    });
                }

                //-----------------
                self.titleDiv.draggable({
                    helper: "clone",
                    appendTo: "div.designer",
                    start: function(e, ui) {
                        //if dataModel has a long name, just copy the first 50 character while dragging it
                        var title = jQuery(ui.helper).text();
                        if(title.length > 50){
                            jQuery(ui.helper).text(title.substring(0,50)+"...");
                        }
                        jQuery(ui.helper).css("z-index", 1000);
                    }
                });

                return this;
            };
            self.handleDroppable = function() {
                var self = this;
                this.div.droppable({
                    drop: function (event, ui) {
                        if(ui.draggable.hasClass('dataModelTitle')){

                            if(self.dataFlow.isReadOnly){
                                $(self.dataFlow).triggerHandler('isReadOnly', "The resource is read-only!");
                                return false;
                            }
                            var srcDataModelDiv = ui.draggable.parents(".dataModel");
                            var trgDataModelDiv = jQuery(event.target);



                            if(!srcDataModelDiv.data("mc").isRoot && !trgDataModelDiv.data("mc").isRoot){
                                return
                            }

                            if(srcDataModelDiv.data("mc").id === trgDataModelDiv.data("mc").id && !srcDataModelDiv.data("mc").isRoot && !trgDataModelDiv.data("mc").isRoot){
                                return;
                            }

                            if(self.dataFlow.accessHandler){
                                var srcId = srcDataModelDiv.data("mc").dataModel.id;
                                var trgId = trgDataModelDiv.data("mc").dataModel.id;

                                self.dataFlow.accessHandler(null, srcId, trgId, "create").then(function (message) {
                                    if(message === null){
                                        self.dataFlow.addDataFlow(srcDataModelDiv, trgDataModelDiv);
                                        self.dataFlow.refreshLinks();
                                    }else{
                                        $(self.dataFlow).triggerHandler('isReadOnly', message);
                                    }
                                });
                            }else{
                                self.dataFlow.addDataFlow(srcDataModelDiv, trgDataModelDiv);
                                self.dataFlow.refreshLinks();
                            }
                        }
                    }
                });
            };
            self.handleResizable = function () {
                var self = this;
                self.div.resizable({
                    resize: function(event, ui){
                        self.dataFlow.refreshLinks();
                    }
                });
                return this;
            };
            self.move = function (position) {
                this.div.css({
                    left: position.left,
                    top:  position.top,
                    position: 'absolute'
                });
            };
            self.getUIElement = function () {
                return this.div;
            };

            self.resize = function (width, height) {
                this.div.css({
                    width: width,
                    height: height
                });
            };

            self.remove = function () {
                var self = this;
                self.div.off("click");
                self.div.remove();
            };

            return self;
        };

        dataFlow.createDataFlow = function() {
            var self = {};
            self.svgFatPath = null;
            self.mcDataFlow = null;
            self.type = 'dataFlow';

            self.init = function (mcDataFlow, svgFatPath) {
                var self = this;
                self.mcDataFlow = mcDataFlow;
                self.svgFatPath = $(svgFatPath);

                self.svgFatPath.data("mc",self);
            };
            self.getUIElement = function () {
                return this.svgFatPath;
            };

            return self;
        };

        dataFlow.drawDataFlows = function(rootDataModel, sourceDataFlows, targetDataFlows, offset, isReadOnly) {
            var self = this;

            self.mcRootDataModel = sourceDataFlows;
            self.mcSourceDataFlows = sourceDataFlows;
            self.mcTargetDataFlows = targetDataFlows;
            if(isReadOnly != null && isReadOnly != undefined) {
                self.isReadOnly = isReadOnly;
            }

            var dataModelsMap = this.findDataModels(rootDataModel, sourceDataFlows, targetDataFlows);
            self.paths = this.findPaths(rootDataModel, sourceDataFlows, targetDataFlows);
            self.g = this.runDagre(dataModelsMap, self.paths);

            self.g.nodes().forEach(function(v) {
                var isRoot = false;
                if(rootDataModel.id == self.g.node(v).dataModel.id){
                    isRoot = true;
                }
                var dm = self.createDataModel().init(self.g.node(v).dataModel, isRoot,{});
                self.dataModels.push(dm);
                self.$designer.append(dm.div);
                dm.move({top: self.g.node(v).y - dm.div.height()/2 + offset, left:self.g.node(v).x - dm.div.width()/2 + offset});

                if(rootDataModel.id == dm.dataModel.id){
                    self.rootDataModel = dm;
                }
            });

            this.refreshLinks();
        };

        dataFlow.remove = function () {
            var self= this;
            $(self.$svg).remove();
            self.$svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
            self.$svg.setAttributeNS(null, "class", "designer");
            self.$designer.append(self.$svg);

            var i = self.dataModels.length - 1;
            while (i > 0) {
                self.dataModels[i].remove();
                self.dataModels.splice(i, 1);
                i--;
            }

            if(self.rootDataModel){
                self.rootDataModel.remove();
            }
            self.zoomClass.remove();
        };

        dataFlow.handleClickOnDesigner();
        return dataFlow;
    };


    var handleDataFlowDroppable = function (event, ui, dataFlowHandler) {
      if (!ui.draggable.hasClass('canvas-element')) {
        if(ui.draggable.hasClass('draggableNode')) {

          if(ui.draggable.attr("data-domainType") !== "DataModel"){
              return;
          }
          var mcId     = ui.draggable.attr("data-id");
          var mcLabel  = ui.draggable.attr("data-label");

          //if it's already there, just select it
          var dm = dataFlowHandler.hasDataModel(mcId);
          if(dm){
            dataFlowHandler.selectElement(dm);
            return;
          }

          var dataModel = dataFlowHandler.createDataModel().init({id:mcId, label:mcLabel}, false, {left:ui.offset.left, top:ui.offset.top});
          dataFlowHandler.addDataModel(dataModel);
        }
      }
    };

    return {

        getDM2DMDataFlowLightHandler: function ($designer, $svg, isReadOnly, accessHandler) {
            var dataFlowHandler = createDM2DMDataFlowLight($designer, $svg, isReadOnly, accessHandler);

            jQuery($designer).droppable({
                drop: function (event, ui) {
                  handleDataFlowDroppable(event, ui, dataFlowHandler);
                }
            });
            return dataFlowHandler;
        },


    }
});


angular.module('services').factory('dataFlowHandler', function ($q, resources) {


    var createDataFlow = function($designer, $svg, isReadOnly) {
        var dataFlow  = {};
        dataFlow.isReadOnly = isReadOnly;
        dataFlow.$designer = $designer;
        dataFlow.$svg = $svg;
        dataFlow.type = "dataFlow";

        dataFlow.id = null;
        dataFlow.label = "";
        dataFlow.description = "";

        dataFlow.sourceDataClasses = [];
        dataFlow.targetDataClasses = [];
        dataFlow.transformations   = [];

        dataFlow.mcDataFlow = null;


        dataFlow.selected = null;

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
        dataFlow.selectElement = function (element) {
            this.deSelectElement();
            this.selected = element;
            if(this.selected.type === "transformation" && this.selected.transformationType === "direct"){
                //no op
            }else{
                this.selected.div.addClass("dataFlowSelectedElement");
            }
            $(this).triggerHandler('dataFlowElementSelected', this.selected);
        };
        dataFlow.deSelectElement = function () {
            if(this.selected) {
                if(this.selected.type === "transformation" && this.selected.transformationType === "direct"){
                    //no op
                }else{
                    this.selected.div.removeClass("dataFlowSelectedElement");
                }
                this.selected = null;
                $(this).triggerHandler('dataFlowElementSelected', null);
            }
        };

        dataFlow.getUnsavedTransformations = function () {
            var self = this;
            var items = [];
            angular.forEach(self.transformations, function (t) {
                if(!t.transformation.id) {
                    items.push(t);
                }
            });
            return items;
        };

        dataFlow.addDataClass = function(dataClass, status) {
            var self = this;
            var found = null;
            if(status == "source"){
                for (var i = 0; i < self.sourceDataClasses.length && !found; i++) {
                    if(self.sourceDataClasses[i].id == dataClass.id){
                        found = self.sourceDataClasses[i];
                    }
                }
                if(!found){
                    found = dataClass;
                    self.sourceDataClasses.push(dataClass);
                }
            }

            if(status == "target"){
                for (var i = 0; i < self.targetDataClasses.length && !found; i++) {
                    if(self.targetDataClasses[i].id == dataClass.id){
                        found = self.targetDataClasses[i];
                    }
                }
                if(!found){
                    found = dataClass;
                    self.targetDataClasses.push(dataClass);
                }
            }
            return found;
        };
        dataFlow.hasDataClass = function (id, isTarget) {
            var found = false;

            if(isTarget === undefined || isTarget === false) {
                for (var i = 0; i < this.sourceDataClasses.length && !found; i++) {
                    if (this.sourceDataClasses[i].id == id) {
                        return this.sourceDataClasses[i];
                    }
                }
            }
            if(isTarget === undefined || isTarget === true) {
                for (var i = 0; i < this.targetDataClasses.length && !found; i++) {
                    if (this.targetDataClasses[i].id == id) {
                        return this.targetDataClasses[i];
                    }
                }
            }
            return null;
        };
        dataFlow.hasTransformation = function (id) {
            for (var i = 0; i < this.transformations.length; i++) {
                if(this.transformations[i].id == id){
                    return this.transformations[i];
                }
            }
            return null;
        };
        dataFlow.hasLink = function (dataElementId, isTarget, transformationId) {
            for (var i = 0; i < this.transformations.length; i++) {
                var tran = this.transformations[i];
                if(tran.id !== transformationId){
                    continue;
                }

                for (var j = 0; j < tran.links.length; j++) {
                    var deId = this.findDataElementId(tran.links[j].dataElement);
                    if( tran.links[j].isTarget === isTarget && deId === dataElementId){
                        return tran.links[j];
                    }
                }
            }
            return null;
        };

        dataFlow.addTransformation = function (transformation) {
            dataFlow.transformations.push(transformation);
            $(dataFlow).triggerHandler('transformationAdded', transformation);
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
        dataFlow.drawDE2TR = function(pathId, dataClass, dataElement, transformation, visible) {
            var self = this;
            var pathGUID = null;


            if(jQuery(dataClass).data("mc").isTarget){
                if ($(dataElement).css("visibility") == "visible") {
                    var deContainer = dataElement.parent(".dataElementContainer");

                    var x1 = transformation.position().left + transformation.outerWidth();
                    var y1 = transformation.position().top  + (transformation.outerHeight() / 2);

                    var x2 = dataClass.position().left;
                    var y2 = deContainer.position().top + dataClass.position().top + (dataElement.position().top + dataElement.outerHeight() / 2);

                    pathGUID = this.drawCurvedLine(pathId, x1 + 3, y1, x2 - 10, y2, "#000080", 0.9, !self.isReadOnly, visible, "link");
                } else {
                    var deContainer = dataElement.parent(".dataElementContainer");

                    var x1 = transformation.position().left + transformation.outerWidth();
                    var y1 = transformation.position().top + (transformation.outerHeight() / 2);

                    var x2 = dataClass.position().left;
                    var y2 = 0;

                    if (dataElement.position().top < 0) {
                        y2 = deContainer.position().top + dataClass.position().top;
                    } else {
                        y2 = dataClass.position().top + dataClass.height();
                    }

                    pathGUID = this.drawCurvedLine(pathId, x1 + 3, y1, x2 - 10, y2, "#000080", 0.9, false, visible, "link");
                }

            }else {

                if ($(dataElement).css("visibility") == "visible") {
                    var deContainer = dataElement.parent(".dataElementContainer");

                    var x1 = dataClass.position().left + dataClass.width();
                    var y1 = deContainer.position().top + dataClass.position().top + (dataElement.position().top + dataElement.outerHeight() / 2);


                    var x2 = transformation.position().left;
                    var y2 = transformation.position().top + (transformation.outerHeight() / 2);

                    pathGUID = this.drawCurvedLine(pathId, x1 + 3, y1, x2 - 10, y2, "#000080", 0.9, !self.isReadOnly, visible, "link");
                } else {
                    var deContainer = dataElement.parent(".dataElementContainer");

                    var x1 = dataClass.position().left + dataClass.width();
                    var y1 = 0;

                    if (dataElement.position().top < 0) {
                        y1 = deContainer.position().top + dataClass.position().top;
                    } else {
                        y1 = dataClass.position().top + dataClass.height();
                    }


                    var x2 = transformation.position().left;
                    var y2 = transformation.position().top + (transformation.outerHeight() / 2);
                    pathGUID = this.drawCurvedLine(pathId, x1 + 3, y1, x2 - 10, y2, "#000080", 0.9, false, visible, "link");
                }
            }
            return pathGUID;
        };

        dataFlow.drawDirectTransformation = function(transformation) {
            var self = this;
            var pathGUID = null;

            var transformationId = transformation.id;
            var srcDataClass   = transformation.srcDataClass;
            var srcDataElement = transformation.srcDataElement;

            var trgDataClass   = transformation.trgDataClass;
            var trgDataElement = transformation.trgDataElement;
            var visible = transformation.visible;


            if ($(srcDataElement).css("visibility") === "visible") {
                var deContainer = srcDataElement.parent(".dataElementContainer");

                var x1 = srcDataClass.position().left + srcDataClass.width();
                var y1 = deContainer.position().top + srcDataClass.position().top + (srcDataElement.position().top + srcDataElement.outerHeight() / 2);


            } else {
                var deContainer = srcDataElement.parent(".dataElementContainer");

                var x1 = srcDataClass.position().left + srcDataClass.width();
                var y1 = 0;

                if (srcDataElement.position().top < 0) {
                    y1 = deContainer.position().top + srcDataClass.position().top;
                } else {
                    y1 = srcDataClass.position().top + srcDataClass.height();
                }
            }

            if ($(trgDataElement).css("visibility") === "visible") {
                var deContainer = trgDataElement.parent(".dataElementContainer");

                var x2 = trgDataClass.position().left;
                var y2 = deContainer.position().top + trgDataClass.position().top + (trgDataElement.position().top + trgDataElement.outerHeight() / 2);

                pathGUID = this.drawCurvedLine(transformationId, x1 + 3, y1, x2 - 10, y2, "#000080", 0.9, !self.isReadOnly, visible, "transformation");
            } else {
                var deContainer = trgDataElement.parent(".dataElementContainer");

                var x2 = trgDataClass.position().left;
                var y2 = 0;

                if (trgDataElement.position().top < 0) {
                    y2 = deContainer.position().top + trgDataClass.position().top;
                } else {
                    y2 = trgDataClass.position().top + trgDataClass.height();
                }

                pathGUID = this.drawCurvedLine(transformationId, x1 + 3, y1, x2 - 10, y2, "#000080", 0.9, false, visible, "transformation");
            }

            return pathGUID;
        };

        dataFlow.refreshLinks = function() {

            $(this.$svg).remove();
            this.$svg =  document.createElementNS("http://www.w3.org/2000/svg","svg");
            this.$svg.setAttributeNS(null, "class", "designer");
            this.$svg = jQuery(this.$svg);
            this.$designer.append(this.$svg);

            var markers = this.createSVGMakers();
            this.$svg.append(markers);

            for(var i = 0; i < this.transformations.length; i++){
                var tns = this.transformations[i];
                // if(tns.links.length === 2 && !tns.links[0].isTarget && tns.links[1].isTarget){
                //     this.drawDE2DE(tns.links[0], tns.links[1]);
                //
                // }else if(tns.links.length === 2 && tns.links[0].isTarget && !tns.links[1].isTarget){
                //     this.drawDE2DE(tns.links[1], tns.links[0]);
                // }
                if(tns.transformationType === "direct"){
                    this.drawDirectTransformation(tns);
                } else{

                    for (var j = 0; j < tns.links.length; j++) {
                        var dataClass   = tns.links[j].dataClass;
                        var dataElement = tns.links[j].dataElement;

                        this.drawDE2TR(tns.links[j].id, dataClass, dataElement, tns.div, tns.links[j].visible);
                    }
                }

            }
        };


        dataFlow.refreshLinksForTransformation = function(transformation) {
            var self = this;
            for (var j = 0; j < transformation.links.length; j++) {
                var link = transformation.links[j];
                self.removeCurvedLine(link.id);
                this.drawDE2TR(
                    link.id,
                    link.dataClass,
                    link.dataElement,
                    transformation.div,
                    link.visible);
            }
        };


        dataFlow.refreshLinksForDataClass = function(dataClass) {
            var self = this;
            var items = [];

            for (var i = 0; i < self.transformations.length; i++) {
                var trans = self.transformations[i];

                if(trans.transformationType === "indirect"){
                    for (var j = 0; j < trans.links.length; j++) {
                        var link = trans.links[j];
                        if(link.dataClassId === dataClass.id){
                            items.push({link:link, transformation:trans});
                        }
                    }
                }

                if(trans.transformationType === "direct"){
                    items.push({link:null, transformation:trans});
                }

            }

            for (var j = 0; j < items.length; j++) {

                if(items[j].transformation.transformationType === "indirect"){
                    var link = items[j].link;
                    self.removeCurvedLine(link.id);
                    this.drawDE2TR(
                        link.id,
                        link.dataClass,
                        link.dataElement,
                        items[j].transformation.div,
                        link.visible);
                }else if(items[j].transformation.transformationType === "direct"){
                    self.removeCurvedLine(items[j].transformation.id);
                    this.drawDirectTransformation(items[j].transformation)
                }
            }
        };



        dataFlow.updateDataElementVisibility = function(dataElement, dataClass) {

            $(dataElement).css("visibility","visible");

            if($(dataElement).position().top + ($(dataElement).height()/2) < 0){
                $(dataElement).css("visibility","hidden");//hidden_on_top
            }

            var parentHeight = $(dataClass).height();
            var nodeBottom   = $(dataElement).position().top + $(dataElement).height()/2;
            if(nodeBottom > parentHeight - 20){
                $(dataElement).css("visibility","hidden");//hidden_on_bottom
            }


            var top = $(dataElement).position().top;
            var height = $(dataClass).find("div.dataElementContainer").height();
            if(top + $(dataElement).height()/2 > height){
                $(dataElement).css("visibility","hidden");//hidden_on_bottom
            }
        };
        dataFlow.drawCurvedLine = function(pathId, x1, y1, x2, y2, color, tension, isDeletable, visible, linkType) {
            var self = this;
            var guid =  pathId || this.guid();

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
            jQuery(shape).data("mc",{ hx1:hx1, hy1:hy1, hx2:hx2, hy2:hy2 });

            var fatShape = document.createElementNS("http://www.w3.org/2000/svg","path");
            fatShape.setAttributeNS(null, "id","fatPath-" + guid);
            fatShape.setAttributeNS(null, "linkType", linkType);
            fatShape.setAttributeNS(null, "d", path);
            fatShape.setAttributeNS(null, "class", "fatPath hideFatPath");
            jQuery(fatShape).data("mc",{ hx1:hx1, hy1:hy1, hx2:hx2, hy2:hy2 });


            if(isDeletable) {
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
                deleteCircle.setAttributeNS(null, "linkType", linkType);
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
                        var linkType = jQuery(this).attr("linkType");

                        event.stopPropagation();
                        var dialogue = self.showConfirmDialogue("Are you sure?");
                        $.when(dialogue).then(
                            function() {
                                if(linkType === "link") {
                                    var removedLink = self.removeLinks([pathId]);
                                    $(self).triggerHandler('linkRemoved', removedLink[0]);
                                }else if (linkType === "transformation"){
                                    var transformation = self.hasTransformation(pathId);
                                    self.removeTransformation(transformation);
                                    $(self).triggerHandler('transformationRemoved', transformation);
                                }

                            },
                            function() {}
                        );
                    }).on('mouseover',function(event) {
                    jQuery(fatShape).trigger('mouseover');
                    event.stopPropagation();
                }).on('mouseout',function(event) {
                    jQuery(fatShape).trigger('mouseout');
                    event.stopPropagation();
                }).on('click',function(event) {
                });

                jQuery(deletePath)
                    .on('click',function(event) {
                        var pathId = jQuery(this).attr("id").replace("deletePath-","");
                        event.stopPropagation();
                        var dialogue = self.showConfirmDialogue("Are you sure?");
                        $.when(dialogue).then(
                            function() {
                                if(linkType === "link") {
                                    var removedLink = self.removeLinks([pathId]);
                                    $(self).triggerHandler('linkRemoved', removedLink[0]);
                                }else if (linkType === "transformation"){
                                    var transformation = self.hasTransformation(pathId);
                                    self.removeTransformation(transformation);
                                    $(self).triggerHandler('transformationRemoved', transformation);
                                }
                            },
                            function() {}
                        );
                    }).on('mouseover',function(event) {
                    jQuery(fatShape).trigger('mouseover');
                    event.stopPropagation();
                }).on('mouseout',function(event) {
                    jQuery(fatShape).trigger('mouseout');
                    event.stopPropagation();
                }).on('click',function(event) {
                });

            }


            jQuery(fatShape)
                .on('click',function(event) {
                    var pathId = jQuery(this).attr("id").replace("fatPath-","");
                    var linkType = jQuery(this).attr("linkType");
                    if (linkType === "transformation"){
                        var transformation = self.hasTransformation(pathId);
                        self.selectElement(transformation);
                        event.stopPropagation();
                    }
                })
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
                    jQuery("#middleCircle-" + pathId).addClass("middleCircleHide");
                    jQuery("#deletePath-" + pathId).addClass("deletePathHide");
                    jQuery("#fatPath-" + pathId).addClass("hideFatPath");
                }).on('click',function(event) {
                var pathId = jQuery(this).attr("id").replace("fatPath-","");
                var path = jQuery(event.target).data("mc");
                var deleteCircle = jQuery("#middleCircle-" + pathId);
            });



            if(visible == false){
                jQuery(deleteCircle).attr("visibility","hidden");
                jQuery(deletePath).attr("visibility","hidden");
                jQuery(shape).attr("visibility","hidden");
                jQuery(fatShape).attr("visibility","hidden");
            }else{
                jQuery(deleteCircle).attr("visibility","visible");
                jQuery(deletePath).attr("visibility","visible");
                jQuery(shape).attr("visibility","visible");
                jQuery(fatShape).attr("visibility","visible");
            }

            this.$svg.append(shape);
            this.$svg.append(fatShape);
            if(isDeletable) {
                this.$svg.append(deleteCircle);
                this.$svg.append(deletePath);
            }
            return guid;
        };
        dataFlow.removeCurvedLine = function(pathId){
            jQuery("#path-" + pathId).remove();
            jQuery("#middleCircle-" + pathId).remove();
            jQuery("#deletePath-" + pathId).remove();
            jQuery("#fatPath-" + pathId).remove();
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
        dataFlow.removeLinks = function (linkIds) {
            var removedLinks = [];

            for (var i = 0; i < this.transformations.length; i++) {
                removedLinks = removedLinks.concat(this.transformations[i].removeLinks(linkIds));
            }
            for (var i = 0; i < this.sourceDataClasses.length; i++) {
                this.sourceDataClasses[i].removeLinks(linkIds);
            }
            for (var i = 0; i < this.targetDataClasses.length; i++) {
                this.targetDataClasses[i].removeLinks(linkIds);
            }
            this.refreshLinks();

            return removedLinks;
        };
        dataFlow.removeDataClass = function(dataClass){

            for (var i = 0; i < this.transformations.length; i++) {
                this.removeLinks(dataClass.links);
            }

            var id = dataClass.id;
            for (var i = 0; i < this.sourceDataClasses.length; i++) {
                if(this.sourceDataClasses[i].id == id){
                    dataClass.remove();
                    this.sourceDataClasses.splice(i,1);
                    break;
                }
            }
            for (var i = 0; i < this.targetDataClasses.length; i++) {
                if(this.targetDataClasses[i].id == id){
                    dataClass.remove();
                    this.targetDataClasses.splice(i,1);
                    break;
                }
            }
            this.refreshLinks();
        };
        dataFlow.removeTransformation = function(transformation){


            if(transformation.transformationType === "indirect") {
                var linkIds = transformation.getLinkIds();
                for (var i = 0; i < this.sourceDataClasses.length; i++) {
                    this.sourceDataClasses[i].removeLinks(linkIds);
                }
                for (var i = 0; i < this.targetDataClasses.length; i++) {
                    this.targetDataClasses[i].removeLinks(linkIds);
                }
            }

            for (var i = 0; i < this.transformations.length; i++) {
                if(this.transformations[i].id === transformation.id){
                    this.transformations.splice(i,1);
                    break;
                }
            }

            transformation.remove();
            this.refreshLinks();
        };

        dataFlow.findDataElementDiv  = function (dataElementId, dataClassId, isTarget) {
            var prefix = isTarget ? "target" : "source";
            var actualId = dataElementId.replace("source-","").replace("target-","");
            var dataElements = jQuery("#"+prefix+"-"+actualId);
            for(var i=0; i< dataElements.length; i++){
                var dataClassDiv = jQuery(dataElements[i]).parents(".dataClass");
                var dataClass    = dataClassDiv.data("mc");
                if(dataClass.id === dataClassId || dataClass.isTarget === isTarget){
                    return jQuery(dataElements[i]);
                }
            }
            return null;
        };
        dataFlow.findDataElementId = function (deDiv) {
            var id = deDiv.attr("id");
            if(id.indexOf("target-") === 0){
                return id.replace("target-","");
            }
            if(id.indexOf("source-") === 0){
                return id.replace("source-","");
            }
        };

        dataFlow.createDataClass = function() {
            var self = {};
            self.type = "dataClass";
            self.div = null;
            self.visible = true;
            self.titleDiv = null;
            self.deContainerDiv = null;
            self.dataClass = null;
            self.links = [];
            self.dataElements = [];
            self.isTarget = false;
            self.dataFlow = this;// this points to "parent dataFlow"

            self.init = function (mcDataClass, isTarget, position, size) {
                this.id = mcDataClass.id ||  self.dataFlow.guid();

                var hasDataClass = this.dataFlow.hasDataClass(self.id, isTarget);
                if(hasDataClass){
                    return hasDataClass;
                }

                this.setDataClass(mcDataClass);
                this.isTarget = isTarget;
                this.div            = jQuery("<div class='dataClass'></div>");
                this.titleDiv       = jQuery("<div class='dataClassTitle'></div>").text(mcDataClass.label);
                this.deContainerDiv = jQuery("<div class='dataElementContainer'></div>");
                this.deleteButton   = jQuery("<div class='dataFlow deleteButton deleteButtonHide'><span class='deleteIconContainer'><i class='fa fa-window-close' aria-hidden='true'></i></span></div>");

                // for (var i = 0; i < 10; i++) {
                //     var dataElement = jQuery("<div class='dataElement'></div>").text("DataElement" + i);
                //     dataElement.bind('dataClassScroll', function (e, dataClass) {
                //         self.dataFlow.updateDataElementVisibility($(this), dataClass);
                //         self.dataFlow.refreshLinks();
                //     });
                //     dataElement.bind('dataClassResize', function (e, dataClass) {
                //         self.dataFlow.updateDataElementVisibility($(this), dataClass);
                //         self.dataFlow.refreshLinks();
                //     });
                //     this.deContainerDiv.append(dataElement);
                // }
                this.div.append(self.titleDiv);
                this.div.append(self.deContainerDiv);

                if(!self.dataFlow.isReadOnly){
                    this.div.append(self.deleteButton);
                }

                this.handleDraggable(position);
                this.handleDraggableForDataElement();
                this.handleDroppable();
                this.handleScroll();
                this.handleResizable(size);
                this.handleRemoveButton();
                this.handleMouseOver();
                self.handleClick();

                this.div.data("mc", self);


                if(this.isTarget) {
                    this.dataFlow.addDataClass(self,"target");
                }else{
                    this.dataFlow.addDataClass(self,"source");
                }

                return this;
            };

            self.setDataClass = function (mcDataClass) {
                this.dataClass = mcDataClass
            };
            self.updateTitle = function (title) {
                this.titleDiv.text(title);
            };

            self.addMCDataElement = function (mcDataElement) {
                var self = this;

                var prefix = self.isTarget ? "target" : "source";

                var dataElement = jQuery("<div class='dataElement' id='" + prefix + "-" + mcDataElement.id + "'></div>").text(mcDataElement.label);
                self.dataElements.push(mcDataElement);

                // dataElement.bind('dataClassScroll', function (e, dataClass) {
                //     self.dataFlow.updateDataElementVisibility($(this), dataClass);
                //     self.dataFlow.refreshLinks();
                // });
                // dataElement.bind('dataClassResize', function (e, dataClass) {
                //     self.dataFlow.updateDataElementVisibility($(this), dataClass);
                //     self.dataFlow.refreshLinks();
                // });
                self.deContainerDiv.append(dataElement);

                self.dataFlow.updateDataElementVisibility(jQuery(dataElement), $(this.div));

                self.handleDraggableForDataElement();
                self.handleDroppable();
            };

            self.handleMouseOver = function() {
                var self = this;
                $(this.div)
                    .on("mouseover", function (event) {
                        if(self.links && self.links.length == 0) {
                            self.deleteButton.removeClass("deleteButtonHide");
                        }
                    })
                    .on("mouseout", function (event) {
                        //if(self.links && self.links.length > 0) {
                            self.deleteButton.addClass("deleteButtonHide");
                        //}
                    });
            };
            self.handleDraggable = function (position) {
                var self = this;
                this.div.addClass('canvas-element');
                this.div.draggable({
                    containment: "div.designer",
                    start: function(event, ui) {
                        // self.dataFlow.refreshLinks();
                        self.dataFlow.refreshLinksForDataClass(self);
                    },
                    drag: function(event, ui) {
                        // self.dataFlow.refreshLinks();
                        self.dataFlow.refreshLinksForDataClass(self);
                    },
                    stop: function(event, ui) {
                        //self.dataFlow.refreshLinks();
                        self.dataFlow.refreshLinksForDataClass(self);
                        $(self.dataFlow).trigger('dataClassMove', {
                            dataClass:{id:self.dataClass.id},
                            dataFlow:{id:self.dataFlow.mcDataFlow.id},
                            position: ui.position,
                            size:{
                                width: jQuery(event.target).width(),
                                height: jQuery(event.target).height()
                            }
                        });
                    }
                });

                this.div.css({
                    left: (position.left - this.dataFlow.$designer.position().left) ,
                    top:  (position.top - this.dataFlow.$designer.position().top) ,
                    position: 'absolute'
                });

                return this;
            };
            self.handleDraggableForDataElement = function(){
                this.div.find(".dataElement").draggable({
                    helper: "clone",
                    appendTo: "div.designer",
                    start: function(e, ui) {
                        $(ui.helper).css("z-index", 1000);
                    }
                });
            };
            self.handleDroppable = function() {

                var self = this;
                this.div.find("div.dataElement").droppable({
                    drop: function (event, ui) {

                        if($(event.target).css("visibility") !== "visible"){
                            return;
                        }

                        if(self.dataFlow.isReadOnly){
                            return;
                        }

                        if(ui.draggable.hasClass('transformationTitle')){
                            var transformation   = ui.draggable.parents(".transformation");
                            var dataElement = jQuery(event.target);
                            var dataClass   = jQuery(event.target).parents(".dataClass");
                            var isTarget = dataClass.data("mc").isTarget;

                            var deId = self.dataFlow.findDataElementId(dataElement);
                            if(self.dataFlow.hasLink(deId, isTarget, transformation.data("mc").id)){
                               return;
                            }

                            var linkId = self.dataFlow.drawDE2TR(null, dataClass, dataElement, transformation);
                            var link = transformation.data("mc").addLink(dataClass, dataElement, linkId);

                            $(self.dataFlow).triggerHandler('linkAdded', link);
                            return;
                        }

                        if(ui.draggable.hasClass("dataElement")){
                            var srcDataClass   = jQuery(ui.draggable).parents(".dataClass").data("mc");
                            var srcDataElement = jQuery(ui.draggable);

                            var trgDataClass   = jQuery(event.target).parents(".dataClass").data("mc");
                            var trgDataElement = jQuery(event.target);

                            if(srcDataClass.isTarget || !trgDataClass.isTarget){
                                return;
                            }
                            //create a direct dataflow
                            var newTransformation = self.dataFlow.createDirectTransformation().init(
                                {label:"Transformation"},
                                srcDataClass.id, srcDataElement.attr("id"),
                                trgDataClass.id, trgDataElement.attr("id"));


                            dataFlow.drawDirectTransformation(newTransformation);


                            var dataElementSrcActualId =  srcDataElement.attr("id").replace("source-","").replace("target-","");
                            var dataElementTrgActualId =  trgDataElement.attr("id").replace("source-","").replace("target-","");

                            newTransformation.transformation = {label:"Transformation"};
                            newTransformation.sourceLinks = [ {dataElementId: dataElementSrcActualId, dataClassId:srcDataClass.id} ];
                            newTransformation.targetLinks = [ {dataElementId: dataElementTrgActualId, dataClassId:trgDataClass.id} ];

                            var newLink = { transformation: newTransformation};

                            $(self.dataFlow).triggerHandler('linkAdded', newLink);
                            return;
                        }
                    }
                });
            };
            self.handleScroll = function () {
                var self = this;
                self.div.find("div.dataElementContainer").bind("scroll", function(e, z) {
                    var parentDataClass = $(this).parent("div.dataClass");
                    // self.div.find('div.dataElement').trigger('dataClassScroll', parentDataClass);
                    for (var i = 0; i < self.dataElements.length; i++) {
                        var deDiv = self.dataFlow.findDataElementDiv(self.dataElements[i].id, self.id,self.isTarget);

                        self.dataFlow.updateDataElementVisibility(jQuery(deDiv), parentDataClass);
                        self.dataFlow.refreshLinksForDataClass(self.dataClass);
                    }
                });
                return this;
            };
            self.handleResizable = function (size) {
                var self = this;
                if(size){
                    self.div.width(size.width);
                    self.div.height(size.height);
                }
                self.div.resizable({
                    minHeight:100,
                    minWidth:200,
                    stop: function(event, ui){
                        self.dataFlow.refreshLinks();
                        // self.div.find('div.dataElement').trigger('dataClassResize', jQuery(ui.element));
                        $(self.dataFlow).trigger('dataClassResize', {
                            dataClass:{id:self.dataClass.id},
                            dataFlow:{id:self.dataFlow.mcDataFlow.id},
                            size: ui.size,
                            position: ui.element.position()
                        });
                        // //wait for 200ms till the resize is finished
                        // //and then trigger 'dataClassResize' event
                        // clearTimeout($.data(self, 'resizeTimer'));
                        // $.data(self, 'resizeTimer', setTimeout(function() {
                        //     $(self.dataFlow).trigger('dataClassResize', {
                        //         dataClass:{id:self.dataClass.id},
                        //         dataFlow:{id:self.dataFlow.mcDataFlow.id},
                        //         size: ui.size,
                        //         position: ui.element.position()
                        //     });
                        // }, 200));

                        //update all dataElements
                        for (var i = 0; i < self.dataElements.length; i++) {
                            var deDiv = self.dataFlow.findDataElementDiv(self.dataElements[i].id, self.id,self.isTarget);

                            self.dataFlow.updateDataElementVisibility(jQuery(deDiv), self.div);
                            self.dataFlow.refreshLinksForDataClass(self.dataClass);
                        }
                    }
                });
                return this;
            };
            self.handleRemoveButton = function () {
                var self = this;
                self.deleteButton.on("click", function (event) {
                    event.stopPropagation();

                    if(self.links && self.links.length == 0) {
                        self.dataFlow.removeDataClass(self);
                    }

                    // var dialogue = self.dataFlow.showConfirmDialogue("Are you sure?");
                    // $.when(dialogue).then(
                    //     function() {
                    //         self.dataFlow.removeDataClass(self);
                    //     },
                    //     function() {});
                });
            };
            self.addLink = function (linkId) {
                this.links.push(linkId);
            };
            self.removeLinks = function (linkIds) {
                var i = this.links.length;
                while( i > 0){
                    i--;
                    if(linkIds.indexOf(this.links[i]) != -1){
                        this.links.splice(i,1);
                    }
                }
            };
            self.remove = function () {
                $(this.deleteButton).remove();
                $(this.deContainerDiv).remove();
                $(this.titleDiv).remove();
                $(this.div).remove();
            };
            self.handleClick = function () {
                var self = this;
                self.div.on("click", function (event) {
                    self.dataFlow.selectElement(self);
                    event.stopPropagation();
                })
            };

            return self;
        };
        dataFlow.createTransformation = function () {
            var self = {};
            self.type = "transformation";
            self.transformationType = "indirect";
            self.id = null;
            self.visible = true;
            self.div = null;
            self.titleDiv = null;
            self.links = [];

            self.sourceLinks = [];
            self.targetLinks = [];

            self.deleteButton = null;

            self.transformation = null;
            self.dataFlow = this;// this points to "parent dataFlow"

            self.init = function (mcTransformation, position) {
                this.div = jQuery("<div class='transformation'></div>");
                this.titleDiv = jQuery("<span class='transformationTitle'>"+mcTransformation.label+"</span>");
                this.div.append(this.titleDiv);
                this.deleteButton   = jQuery("<div class='dataFlow deleteButton deleteButtonHide'><span class='deleteIconContainer'><i class='fa fa-window-close' aria-hidden='true'></i></span></div>");

                this.id  = mcTransformation.id || self.dataFlow.guid();
                this.transformation = mcTransformation;

                this.handleDraggable(position);
                this.handleDroppable();
                this.handleMouseOver();
                this.handleRemoveButton();
                this.handleClick();

                if(!self.dataFlow.isReadOnly){
                    this.div.append(this.deleteButton);
                }

                this.div.data("mc", self);

                this.dataFlow.addTransformation(this);
                return this;
            };
            self.addLink = function (dataClass, dataElement, linkId) {
                var self = this;
                dataClass.data("mc").addLink(linkId);


                var deId = self.dataFlow.findDataElementId(dataElement);

                var link = {
                    id: linkId,

                    dataClass: dataClass,
                    dataClassId: dataClass.data("mc").dataClass.id,

                    dataElement: dataElement,
                    dataElementId: deId,
                    dataElementLabel: dataElement.text(),

                    isTarget: dataClass.data("mc").isTarget,
                    transformation: self,
                    visible: true
                };
                if(link.isTarget){
                    self.targetLinks.push(link);
                }else{
                    self.sourceLinks.push(link);
                }

                self.links.push(link);
                return link;
            };
            self.removeLinks = function (linkIds) {
                var removedLinks = [];

                //remove from Links
                var i = this.links.length;
                while( i > 0){
                    i--;
                    if(linkIds.indexOf(this.links[i].id) != -1){
                        removedLinks.push(this.links[i]);
                        this.links.splice(i,1);
                    }
                }

                //remove from sourceLinks
                var i = this.sourceLinks.length;
                while( i > 0){
                    i--;
                    if(linkIds.indexOf(this.sourceLinks[i].id) != -1){
                        this.sourceLinks.splice(i,1);
                    }
                }

                //remove from targetLinks
                var i = this.targetLinks.length;
                while( i > 0){
                    i--;
                    if(linkIds.indexOf(this.targetLinks[i].id) != -1){
                        this.targetLinks.splice(i,1);
                    }
                }

                return removedLinks;
            };
            self.getLinkIds = function () {
                var linkIds = [];
                for(var i = 0; i < this.links.length;i++){
                    linkIds.push(this.links[i].id);
                }
                return linkIds;
            };
            self.handleDraggable = function(position) {
                var self = this;
                self.div.addClass('canvas-element');
                self.div.draggable({
                    containment: "div.designer",
                    start: function(event, ui) {
                        //self.dataFlow.refreshLinks();
                        self.dataFlow.refreshLinksForTransformation(self);
                    },
                    drag: function(event, ui) {
                        //self.dataFlow.refreshLinks();
                        self.dataFlow.refreshLinksForTransformation(self);
                    },
                    stop: function(event, ui) {
                        //self.dataFlow.refreshLinks();
                        self.dataFlow.refreshLinksForTransformation(self);
                        $(self.dataFlow).trigger('transformationMove', {
                            transformation:{id:self.transformation.id},
                            position: ui.position,
                            size:{
                                width: jQuery(event.target).width(),
                                height: jQuery(event.target).height()
                            }
                        });
                    }
                });
                this.div.css({
                    left: (position.left - $designer.position().left) ,
                    top:  (position.top  - $designer.position().top) ,
                    position: 'absolute'
                });

                //-----------------
                self.titleDiv.draggable({
                    helper: "clone",
                    appendTo: "div.designer",
                    start: function(e, ui) {
                        $(ui.helper).css("z-index", 1000);
                    }
                });
            };
            self.handleDroppable = function() {
                var self = this;
                this.div.droppable({
                    drop: function (event, ui) {

                        if(self.dataFlow.isReadOnly){
                            return;
                        }
                        if(ui.draggable.hasClass('dataElement')){
                            var dataElement = ui.draggable;
                            var dataClass   = ui.draggable.parents(".dataClass");
                            var transformation = jQuery(event.target);
                            var isTarget = dataClass.data("mc").isTarget;
                            var deId = self.dataFlow.findDataElementId(dataElement);

                            if(self.dataFlow.hasLink(deId, isTarget, transformation.data("mc").id)){
                                return;
                            }
                            
                            var linkId = self.dataFlow.drawDE2TR(null, dataClass, dataElement, transformation);
                            var link = transformation.data("mc").addLink(dataClass, dataElement, linkId);
                            $(self.dataFlow).triggerHandler('linkAdded', link);
                        }
                    }
                });
            };
            self.handleMouseOver = function() {
                var self = this;
                $(this.div)
                    .on("mouseover", function (event) {
                        self.deleteButton.removeClass("deleteButtonHide");
                        //self.createLinkBtn.removeClass("createLinkButtonHide");
                    })
                    .on("mouseout", function (event) {
                        self.deleteButton.addClass("deleteButtonHide");
                        //self.createLinkBtn.addClass("createLinkButtonHide");
                    });
            };
            self.handleRemoveButton = function () {
                var self = this;
                self.deleteButton.on("click", function (event) {
                    event.stopPropagation();
                    var dialogue = self.dataFlow.showConfirmDialogue("Are you sure?");
                    $.when(dialogue).then(
                        function() {
                            self.dataFlow.removeTransformation(self);
                            $(self.dataFlow).triggerHandler('transformationRemoved', self);
                        },
                        function() {});
                });
            };
            self.remove = function () {
                $(this.deleteButton).remove();
                $(this.div).remove();
            };
            self.handleClick = function () {
                var self = this;
                self.div.on("click", function (event) {
                    self.dataFlow.selectElement(self);
                    event.stopPropagation();
                });
            };
            self.updateTitle = function (title) {
                var self = this;
                self.titleDiv.text(title);
                self.dataFlow.refreshLinks();
            };

            self.toggle = function () {
               var self = this;
               if(self.visible == false){
                   self.div.hide();
                   angular.forEach(self.links, function (link) {
                       link.visible = false;
                       jQuery("#middleCircle-"+link.id).attr("visibility","hidden");
                       jQuery("#path-"+link.id).attr("visibility","hidden");
                       jQuery("#fatpath-"+link.id).attr("visibility","hidden");
                   });
               }else{
                   self.div.show();
                   angular.forEach(self.links, function (link) {
                       link.visible = true;
                       jQuery("#middleCircle-"+link.id).attr("visibility","visible");
                       jQuery("#path-"+link.id).attr("visibility","visible");
                       jQuery("#fatpath-"+link.id).attr("visibility","visible");
                   });
                   self.dataFlow.refreshLinks();
               }
            };

            return self;
        };
        dataFlow.createDirectTransformation = function () {
            var self = {};
            self.type = "transformation";
            self.transformationType = "direct";

            self.id = null;
            self.title = null;
            self.link = null;
            self.transformation = null;

            self.srcDataClass = null;
            self.srcDataElement = null;

            self.trgDataClass = null;
            self.trgDataElement = null;
            self.visible = true;

            self.dataFlow = this;// this points to "parent dataFlow"

            self.init = function (mcTransformation, srcDataClassId, srcDataElementId, targetDataClassId, targetDataElementId) {
                this.id  = mcTransformation.id || self.dataFlow.guid();
                this.transformation = mcTransformation;

                this.dataFlow.addTransformation(this);

                var srcDataClass = this.dataFlow.hasDataClass(srcDataClassId, false);
                srcDataClass.addLink(this.id);
                this.srcDataClass   = srcDataClass.div;
                //this.srcDataElement = this.dataFlow.$designer.find("#"+srcDataElementId);
                this.srcDataElement = this.dataFlow.findDataElementDiv(srcDataElementId, srcDataClassId, false);

                this.dataFlow.updateDataElementVisibility(this.srcDataElement, this.srcDataClass);

                var trgDataClass = this.dataFlow.hasDataClass(targetDataClassId, true);
                trgDataClass.addLink(this.id);

                this.trgDataClass   = trgDataClass.div;
                // this.trgDataElement = this.dataFlow.$designer.find("#"+targetDataElementId);
                this.trgDataElement = this.dataFlow.findDataElementDiv(targetDataElementId, targetDataClassId, true);

                this.dataFlow.updateDataElementVisibility(this.trgDataElement, this.trgDataClass);

                // var srcElement = this.transformation.sourceElements[0];
                // var parentDataClass = srcElement.breadcrumbs[srcElement.breadcrumbs.length - 1];
                // this.srcDataClass   = this.dataFlow.hasDataClass(parentDataClass.id).div;
                // this.srcDataElement = this.dataFlow.$designer.find("#"+srcElement.id);
                //
                // var trgElement = this.transformation.targetElements[0];
                // parentDataClass = trgElement.breadcrumbs[trgElement.breadcrumbs.length - 1];
                // this.trgDataClass   = this.dataFlow.hasDataClass(parentDataClass.id).div;
                // this.trgDataElement = this.dataFlow.$designer.find("#"+trgElement.id);

                return this;
            };


            self.toggle = function () {
                var self = this;
                if(self.visible == false){
                    self.visible = false;
                    jQuery("#middleCircle-"+self.id).attr("visibility","hidden");
                    jQuery("#path-"+self.id).attr("visibility","hidden");
                    jQuery("#fatpath-"+self.id).attr("visibility","hidden");
                }else{
                    self.visible = true;
                    jQuery("#middleCircle-"+self.id).attr("visibility","visible");
                    jQuery("#path-"+self.id).attr("visibility","visible");
                    jQuery("#fatpath-"+self.id).attr("visibility","visible");
                    self.dataFlow.refreshLinks();
                }
            };


            self.removeLinks = function () {
                return [];
            };
            self.remove = function () {

            };
            self.updateTitle = function () {

            };

            return self;
        };

        dataFlow.drawDataFlow = function (mcDataFlow, positions) {
            var self = this;
            self.mcDataFlow = mcDataFlow;
            var offset = self.$designer.position();
            var dataClasses = {};

            //first load all used dataClasses and their dataElements and make sure that they are loaded just once
            for (var i = 0; i < self.mcDataFlow.dataFlowComponents.length; i++) {
                var mcTran = self.mcDataFlow.dataFlowComponents[i];
                angular.forEach(mcTran.sourceElements, function(el) {
                    if(!dataClasses[el.dataClass]) {
                        dataClasses[el.dataClass] = {
                            id:el.dataClass,
                            dataModel:el.dataModel,
                            dataClass:el.breadcrumbs[el.breadcrumbs.length - 1].id,
                        };
                    }
                });
                angular.forEach(mcTran.targetElements, function(el) {
                    if(!dataClasses[el.dataClass]) {
                        dataClasses[el.dataClass] = {
                            id:el.dataClass,
                            dataModel:el.dataModel,
                            dataClass:el.breadcrumbs[el.breadcrumbs.length - 1].id,
                        };
                    }
                });
            }

            //load dataElements for all those used dataClasses for the diagram
            var promises = [];
            for (var id in dataClasses) {
                if (!dataClasses.hasOwnProperty(id)){
                    continue;
                }
                var options = {sortType:'asc', sortBy:'label', all:true};
                promises.push(resources.dataClass.get(dataClasses[id].dataModel, null, dataClasses[id].id, "dataElements", options));
            };
            $q.all(promises).then(function (results) {
                var index = 0;
                for (var id in dataClasses) {
                    if (!dataClasses.hasOwnProperty(id)){
                        continue;
                    }
                    dataClasses[id].childDataElements = results[index].items;
                    index++;
                }

                var sourceTop = 0;
                var targetTop = 0;
                var transformationTop = 0;

                //Now all dataElements are loaded, add source DataClasses
                for (var i = 0; i < self.mcDataFlow.dataFlowComponents.length; i++) {
                    var mcTran = self.mcDataFlow.dataFlowComponents[i];
                    angular.forEach(mcTran.sourceElements, function (sourceDataElement) {
                        var mcDataClass = {
                            id:sourceDataElement.dataClass,
                            dataModel:sourceDataElement.dataModel,
                            dataClass:sourceDataElement.breadcrumbs[sourceDataElement.breadcrumbs.length - 1].id,
                            label:sourceDataElement.breadcrumbs[sourceDataElement.breadcrumbs.length - 1].label,
                            breadcrumbs: sourceDataElement.breadcrumbs.slice(0,  sourceDataElement.breadcrumbs.length-1)
                        };
                        if (self.hasDataClass(mcDataClass.id, false)) {
                            return;
                        }

                        var left =  offset.left + 50;
                        var top  =  offset.top  + sourceTop + 50;
                        var size = null;
                        if(positions && positions[mcDataClass.id] && positions[mcDataClass.id].asSource){
                            var savedDetails = positions[mcDataClass.id].asSource;
                            left = offset.left + savedDetails.position.left;
                            top  = offset.top  + savedDetails.position.top;
                            size = savedDetails.size;
                        }

                        var dataClass = self.createDataClass().init(mcDataClass, false, {left:left,top:top},size);
                        dataClass.setDataClass(mcDataClass);
                        dataClass.updateTitle(mcDataClass.label);
                        self.$designer.append(dataClass.div);

                        angular.forEach(dataClasses[mcDataClass.id].childDataElements, function (dataElement) {
                            dataClass.addMCDataElement(dataElement);
                        });
                        sourceTop += 100 + 10;//default height + space-in-between
                    });

                    //Now all dataElements are loaded, add target DataClasses
                    angular.forEach(mcTran.targetElements, function (targetElement) {
                        var mcDataClass = {
                            id:targetElement.dataClass,
                            dataModel:targetElement.dataModel,
                            dataClass:targetElement.breadcrumbs[targetElement.breadcrumbs.length - 1].id,
                            label:targetElement.breadcrumbs[targetElement.breadcrumbs.length - 1].label,
                            breadcrumbs:targetElement.breadcrumbs.slice(0,  targetElement.breadcrumbs.length-1)
                        };
                        if (self.hasDataClass(mcDataClass.id, true)) {
                            return;
                        }

                        var left =  offset.left + 50 + 500;// add 500 space in between source dataClasses and target dataClasses
                        var top  =  offset.top  + targetTop + 50;
                        var size = null;
                        if(positions && positions[mcDataClass.id] && positions[mcDataClass.id].asTarget){
                            var savedDetails = positions[mcDataClass.id].asTarget;
                            left = offset.left + savedDetails.position.left;
                            top  = offset.top  + savedDetails.position.top;
                            size = savedDetails.size;
                        }
                        var dataClass = self.createDataClass().init(mcDataClass,true,{left:left,top:top},size);

                        dataClass.setDataClass(mcDataClass);
                        dataClass.updateTitle(mcDataClass.label);
                        self.$designer.append(dataClass.div);

                        angular.forEach(dataClasses[mcDataClass.id].childDataElements, function (dataElement) {
                            dataClass.addMCDataElement(dataElement);
                        });
                        targetTop += 100 + 50;//default height + space-in-between
                    });
                }

                //Add transformations
                for (var i = 0; i < self.mcDataFlow.dataFlowComponents.length; i++) {
                    var mcTran = self.mcDataFlow.dataFlowComponents[i];

                    //Now add transformations
                    var transformation = self.hasTransformation(mcTran.id);
                    if(transformation){
                        continue;
                    }

                    if(mcTran.sourceElements.length === 1 && mcTran.targetElements.length === 1){


                        var srcElement = mcTran.sourceElements[0];
                        var srcDataClass = srcElement.breadcrumbs[srcElement.breadcrumbs.length - 1];

                        var trgElement = mcTran.targetElements[0];
                        var trgDataClass = trgElement.breadcrumbs[trgElement.breadcrumbs.length - 1];


                        transformation = self.createDirectTransformation().init(mcTran, srcDataClass.id, srcElement.id, trgDataClass.id, trgElement.id);
                    }else{
                        var top   =  offset.top  + transformationTop + 50;
                        var left  =  offset.left + 350;
                        if(positions && positions[mcTran.id]){
                            var savedDetails = positions[mcTran.id];
                            left = offset.left + savedDetails.position.left;
                            top  = offset.top  + savedDetails.position.top;
                        }

                        transformation = self.createTransformation().init(mcTran, {
                            top: top,
                            left: left
                        });
                        self.$designer.append(transformation.div);
                        transformationTop += 100;

                        angular.forEach(mcTran.sourceElements, function (element) {
                            var parentDataClass = element.breadcrumbs[element.breadcrumbs.length - 1];
                            var dataClass   = self.hasDataClass(parentDataClass.id, false);

                            //var dataElement = self.$designer.find("#"+element.id);
                            var dataElement = self.findDataElementDiv(element.id, dataClass.id,dataClass.isTarget);

                            var transformation = self.hasTransformation(mcTran.id).div;
                            var linkId = self.drawDE2TR(null, dataClass.div, dataElement, transformation);
                            transformation.data("mc").addLink(dataClass.div, dataElement, linkId);
                            self.updateDataElementVisibility(dataElement, dataClass.div);
                        });

                        angular.forEach(mcTran.targetElements, function (element) {
                            var parentDataClass = element.breadcrumbs[element.breadcrumbs.length - 1];
                            var dataClass   = self.hasDataClass(parentDataClass.id, true);

                            //var dataElement = self.$designer.find("#"+element.id);
                            var dataElement = self.findDataElementDiv(element.id, dataClass.id,dataClass.isTarget);

                            var transformation = self.hasTransformation(mcTran.id).div;
                            var linkId = self.drawDE2TR(null, dataClass.div, dataElement, transformation);
                            transformation.data("mc").addLink(dataClass.div, dataElement, linkId);
                            self.updateDataElementVisibility(dataElement, dataClass.div);
                        })
                    }
                }

                self.refreshLinks();

            });


        };

        dataFlow.getElementPositions = function () {
            var self = this;
            var positions = {};

            angular.forEach(this.sourceDataClasses, function (dc) {
                if(!positions[dc.dataClass.id]){
                    positions[dc.dataClass.id] = {
                        type:"DataClass",
                        asSource: null,
                        asTarget: null
                    }
                }
                positions[dc.dataClass.id].asSource = {
                    position: jQuery(dc.div).position(),
                    size:{
                        width: jQuery(dc.div).width(),
                        height: jQuery(dc.div).height()
                    }
                };
            });

            angular.forEach(this.targetDataClasses, function (dc) {
                if(!positions[dc.dataClass.id]){
                    positions[dc.dataClass.id] = {
                        type:"DataClass",
                        asSource: null,
                        asTarget: null
                    }
                }
                positions[dc.dataClass.id].asTarget = {
                    position: jQuery(dc.div).position(),
                    size:{
                        width: jQuery(dc.div).width(),
                        height: jQuery(dc.div).height()
                    }
                };
            });

            angular.forEach(this.transformations, function (tr) {
                positions[tr.transformation.id] = {
                    type:"Transformation",
                    position: jQuery(tr.div).position(),
                    size:{
                        width:  jQuery(tr.div).width(),
                        height: jQuery(tr.div).height()
                    }
                }
            });

            return {
                dataFlow: {id: self.mcDataFlow.id},
                positions: positions
            };
        };

        dataFlow.handleClickOnDesigner();
        return dataFlow;
    };

    return {

        getDataFlowHandler: function ($designer, $svg, isReadOnly) {
            var dataFlowHandler = createDataFlow($designer, $svg, isReadOnly);

            jQuery($designer).droppable({
                drop: function (event, ui) {


                    var $canvas = $(this);
                    if (!ui.draggable.hasClass('canvas-element')) {
                        if(ui.draggable.hasClass('dataClassInTree')) {

                            if(dataFlowHandler.isReadOnly){
                                $(dataFlowHandler).triggerHandler('isReadOnly');
                                return;
                            }

                            var element = ui.draggable.parent().data("element");
                            var mcId = ui.draggable.parent().data("id");
                            var mcLabel = ui.draggable.parent().data("label");
                            var clone  = ui.draggable.clone();
                            var isTarget = jQuery(clone).hasClass("target");

                            var currentDataClass = dataFlowHandler.hasDataClass(mcId, isTarget);
                            if(currentDataClass){
                                dataFlowHandler.selectElement(currentDataClass);
                                return;
                            }

                            var dataClass = dataFlowHandler.createDataClass().init(element, isTarget, {left:ui.offset.left, top:ui.offset.top});
                            $canvas.append(dataClass.div);
                            $(dataFlowHandler).triggerHandler('dataClassAdded', dataClass);

                        }
                        if(ui.draggable.hasClass('transformationToolBox')) {
                            var $canvasElement = dataFlowHandler.createTransformation().init({label:"Transformation"}, {left:ui.offset.left, top:ui.offset.top}).div;
                            $canvas.append($canvasElement);
                        }
                    }
                }
            });
            return dataFlowHandler;
        },

    }
});

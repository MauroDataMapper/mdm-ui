angular.module('services').factory('topicViewHandler', function () {

    var createTopicView = function($designer, $svg) {
        var topicView  = {};
        topicView.$designer = $designer;
        topicView.$svg = $svg;
        topicView.zoomValue = 1;
        topicView.zoomClass = null;
        topicView.selected = null;
        topicView.topicIndex = 0;

        topicView.dataModels = [];
        topicView.topics = [];

        topicView.showConfirmDialogue = function(message) {
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
        topicView.handleClickOnDesigner = function () {
            var self = this;
            topicView.$designer.on("click", function (event) {
                //deSelect
                self.deSelectElement();
            });
        };

        topicView.selectElement = function (element) {
            this.deSelectElement();
            this.selected = element;

            //if it's a dataModel
            if(element.type == 'dataModel'){
                element.getUIElement().addClass("dataModelSelected");
            }else if (element.type == "topic"){
                element.getUIElement().addClass("topicSelected");
            }

            topicView.applyGreyOutAllExcept(this.selected);
            $(this).triggerHandler('elementSelected', this.selected);
        };
        topicView.deSelectElement = function () {
            if(!this.selected) {
                return
            }

            this.removeGreyOut();

            if(this.selected.type == 'dataModel'){
                this.selected.getUIElement().removeClass("dataModelSelected");
            }else if (this.selected.type == "topic"){
                var pathId =  this.selected.topic.id;
                this.selected.getUIElement().removeClass("topicSelected");
            }
            this.selected = null;
            $(this).triggerHandler('elementSelected', null);

        };

        topicView.applyGreyOutAllExcept = function (except) {
            var self = this;
            self.$designer.find(".dataModel").addClass("greyOut");
            self.$designer.find(".topic").addClass("greyOut");
            self.$designer.find(".path").addClass("greyOut");
            except.div.removeClass("greyOut");
            for (var linkId in except.links) {
                if (except.links.hasOwnProperty(linkId)) {
                    var link = except.links[linkId];
                    jQuery(link.dataModel.div).removeClass("greyOut");
                    jQuery(link.topic.div).removeClass("greyOut");
                    jQuery("#path-" + linkId).removeClass("greyOut");
                }
            }
        };
        topicView.removeGreyOut = function () {
            var self = this;
            self.$designer.find(".dataModel").removeClass("greyOut");
            self.$designer.find(".topic").removeClass("greyOut");
            self.$designer.find(".path").removeClass("greyOut");
        };

        topicView.refreshLinks = function() {
            var self = this;
            $(self.$svg).remove();
            self.$svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
            self.$svg.setAttributeNS(null, "class", "designer");
            self.$designer.append(this.$svg);

            var markers = self.createSVGMakers();
            self.$svg.append(markers);

            for(var i = 0; i < self.topics.length; i++){
                var topic = self.topics[i];

                for (var linkId in topic.links) {
                    if (topic.links.hasOwnProperty(linkId)) {
                        var link = topic.links[linkId];
                        self.drawLine(linkId, link.dataModel.div, topic.div);
                    }
                }
            }

            if(self.selected){
                self.removeGreyOut();
                self.applyGreyOutAllExcept(self.selected);
            }

        };
        topicView.guid = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };
        topicView.createSVGMakers = function() {
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
        topicView.zoom = function (zoom) {
            var self = this;
            self.zoomValue = zoom;

            var zoomDetail =
                ".zoom {"+
                "   zoom: "+ self.zoomValue +";"+
                "   -moz-transform: scale("+ self.zoomValue +");"+
                "    -moz-transform-origin: 0 0;"+
                "    -o-transform: scale("+ self.zoomValue +");"+
                "    -o-transform-origin: 0 0;"+
                "    -webkit-transform: scale("+ self.zoomValue +");"+
                "    -webkit-transform-origin: 0 0;"+
                "    transform: scale("+ self.zoomValue +");"+
                "    transform-origin: 0 0;"+
                "}";

            if(self.zoomClass){
                self.zoomClass.remove();
            }
            self.zoomClass = jQuery("<style type='text/css'>"+zoomDetail+"</style>");
            self.zoomClass.appendTo("body");
        };
        topicView.drawCurvedLine = function(pathId, x1, y1, x2, y2, color, tension, isDeletable, visible) {
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
            shape.setAttributeNS(null, "class", "path");
            jQuery(shape).data("mc",{ hx1:hx1, hy1:hy1, hx2:hx2, hy2:hy2 });

            var fatShape = document.createElementNS("http://www.w3.org/2000/svg","path");
            fatShape.setAttributeNS(null, "id","fatPath-" + guid);
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
                        var dialogue = self.showConfirmDialogue("Are you sure?");
                        $.when(dialogue).then(
                            function() {
                                self.removeLinks([pathId]);
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
                                self.removeLinks([pathId]);
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
        topicView.drawLine = function(pathId, dataModelDiv, topicDiv) {
            var self = this;
            var pathGUID = null;

            if(dataModelDiv.position().left < topicDiv.position().left){
                var x1 = dataModelDiv.position().left + dataModelDiv.outerWidth();
                var y1 = dataModelDiv.position().top  + (dataModelDiv.outerHeight() / 2);

                var x2 = topicDiv.position().left;
                var y2 = topicDiv.position().top + (topicDiv.outerHeight() / 2);
            }else{
                var x1 = dataModelDiv.position().left - 8;
                var y1 = dataModelDiv.position().top  + (dataModelDiv.outerHeight() / 2);

                var x2 = topicDiv.position().left  + topicDiv.outerWidth() + 18;
                var y2 = topicDiv.position().top + (topicDiv.outerHeight() / 2);
            }

            pathGUID = self.drawCurvedLine(pathId, x1 + 3, y1, x2 - 10, y2, "#000080", 0.9, true, true);

            return pathGUID;
        };

        topicView.addLink = function (linkId, dataModelDiv, topicDiv) {
            var self = this;
            var dm = dataModelDiv.data("mc");
            var tp = topicDiv.data("mc");

            linkId = linkId || dm.dataModel.id + "-" + tp.topic.id;

            //check in all dataModels of the Topic and see if it already has a link
            var exists = false;
            for (var link in tp.links) {
                if (tp.links.hasOwnProperty(link)) {
                    if (tp.links[link].dataModel.dataModel.id == dm.dataModel.id) {
                        exists = true;
                    }
                }
            }

            if(exists){
                return null;
            }

            self.drawLine(linkId, dataModelDiv, topicDiv);
            dm.links[linkId] = {topic:tp, dataModel:dm};
            tp.links[linkId] = {topic:tp, dataModel:dm};
            return linkId;
        };
        topicView.updateTopicLabel = function (topicId, NewLabel) {
            var self = this;
            for (var i = 0; i < self.topics.length; i++) {
                if(self.topics[i].topic.id == topicId){
                    self.topics[i].updateTitle(NewLabel);
                    return;
                }
            }
        };
        topicView.getDataModel = function(id){
            var self = this;
            for (var i = 0; i < self.dataModels.length; i++) {
                if(self.dataModels[i].dataModel.id == id){
                    return self.dataModels[i];
                }
            }
            return null;
        };

        topicView.addDataModel = function (dataModel) {
            var self = this;
            self.dataModels.push(dataModel);
            self.$designer.append(dataModel.div);
        };
        topicView.addTopic = function (topic) {
            var self = this;
            self.topics.push(topic);
            self.$designer.append(topic.div);
        };

        topicView.removeTopic = function(topic){
            return;
            var self = this;

            //remove topic links from dataModels at the other end of the link
            for (var linkId in topic.links) {
                if (topic.links.hasOwnProperty(linkId)) {
                    var link = topic.links[linkId];
                    var dataModel = link.dataModel;
                    delete dataModel.links[linkId];
                }
            }

            //remove topic from TopicViewHandler
            for (var i = 0; i < self.topics.length; i++) {
                if(self.topics[i].topic.id == topic.topic.id){
                    self.topics.splice(i,1);
                    break;
                }
            }

            topic.remove();
            this.refreshLinks();
            $(self).triggerHandler('topicRemoved', {topic:topic});
        };
        topicView.removeDataModel = function(topic){

            // var linkIds = topic.getLinkIds();
            //
            // topic.remove();
            // $(dataFlow).triggerHandler('topicRemoved', topic);

            this.refreshLinks();
        };
        topicView.removeLinks = function(linkIds){

            return;

            var self = this;
            var linkId = linkIds[0];



            for (var i = 0; i < self.topics.length; i++) {
                for (var link in self.topics[i].links) {
                    if (self.topics[i].links.hasOwnProperty(link)) {
                        if (link == linkId) {
                            delete self.topics[i].links[link];
                        }
                    }
                }
            }


            for (var i = 0; i < self.dataModels.length; i++) {
                for (var link in self.dataModels[i].links) {
                    if (self.dataModels[i].links.hasOwnProperty(link)) {
                        if (link == linkId) {
                            delete self.dataModels[i].links[link];
                        }
                    }
                }
            }


            this.refreshLinks();
        };


        topicView.createDataModel = function() {
            var self = {};
            self.div = null;
            self.topBar = null;
            self.titleDiv = null;
            self.dataModel = null;
            self.links = {};
            self.topicView  = this;// this points to "parent topicView"
            self.type = 'dataModel';

            self.init = function (mcDataModel, position) {
                this.dataModel = mcDataModel;
                this.id  = mcDataModel.id ||  self.topicView.guid();

                this.div            = jQuery("<div class='dataModel'></div>");
                this.titleDiv       = jQuery("<div class='dataModelTitle'></div>").text(mcDataModel.label);
                //this.deleteButton   = jQuery("<div class='dataModelDeleteButton deleteButtonHide'><span class='deleteIconContainer'><i class='fa fa-window-close' aria-hidden='true'></i></span></div>");
                this.div.append(this.titleDiv);
                //this.div.append(this.deleteButton);

                this.handleDraggable(position);
                this.handleDroppable();
                this.handleResizable();
                this.handleClick();
                this.handleMouseOver();
                this.handleRemoveButton();

                this.div.data("mc", self);
                return this;
            };

            self.handleClick = function () {
                var self = this;
                self.div.on("click", function (event) {
                    self.topicView.selectElement(self);
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
                        var newLeft = ui.originalPosition.left + changeLeft / self.topicView.zoomValue; // adjust new left by our zoomScale
                        var changeTop = ui.position.top - ui.originalPosition.top; // find change in top
                        var newTop = ui.originalPosition.top + changeTop / self.topicView.zoomValue; // adjust new top by our zoomScale
                        ui.position.left = newLeft;
                        ui.position.top  = newTop;
                        self.topicView.refreshLinks();
                    },
                    stop: function(event, ui) {
                        self.topicView.refreshLinks();
                    }
                });
                if(position && position['left'] && position['top']) {
                    this.div.css({
                        left: (position.left - this.topicView.$designer.position().left) ,
                        top:  (position.top  - this.topicView.$designer.position().top) ,
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

                        if(ui.draggable.hasClass('topicTitle')){
                            var topicTitle = ui.draggable;
                            var topicDiv = ui.draggable.parents(".topic");
                            var topic = topicDiv.data("mc");
                            var dataModelDiv = jQuery(event.target);
                            var linkId = self.topicView.addLink(null, dataModelDiv, topicDiv);
                            if(linkId) {
                                $(self.topicView).triggerHandler('linkAdded', {linkedId:linkId, dataModel:dataModelDiv.data("mc"), topic:topic});
                            }
                        }
                    }
                });
            };
            self.handleResizable = function () {
                var self = this;
                self.div.resizable({
                    resize: function(event, ui){
                        self.topicView.refreshLinks();
                    }
                });
                return this;
            };
            self.handleMouseOver = function() {
                var self = this;
                // $(this.div)
                //     .on("mouseover", function (event) {
                //         self.deleteButton.removeClass("deleteButtonHide");
                //         //self.createLinkBtn.removeClass("createLinkButtonHide");
                //     })
                //     .on("mouseout", function (event) {
                //         self.deleteButton.addClass("deleteButtonHide");
                //         //self.createLinkBtn.addClass("createLinkButtonHide");
                //     });
            };
            self.handleRemoveButton = function () {
                var self = this;
                // self.deleteButton.on("click", function (event) {
                //     event.stopPropagation();
                //     var dialogue = self.topicView.showConfirmDialogue("Are you sure?");
                //     $.when(dialogue).then(
                //         function() {
                //             self.topicView.removeDataModel(self);
                //         },
                //         function() {});
                // });
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
        topicView.createTopic = function () {
            var self = {};
            self.type = "topic";
            self.id = null;
            self.visible = true;
            self.div = null;
            self.titleDiv = null;
            self.deleteButton = null;

            self.links = {};
            self.topic = null;
            self.topicView = this;// this points to "parent topicView"

            self.init = function (mcTopic, position) {
                this.div = jQuery("<div class='topic'></div>");
                this.titleDiv = jQuery("<span class='topicTitle'>"+mcTopic.label+"</span>");
                this.div.append(this.titleDiv);
                this.deleteButton   = jQuery("<div class='topicDeleteButton deleteButtonHide'><span class='deleteIconContainer'><i class='fa fa-window-close' aria-hidden='true'></i></span></div>");

                this.id  = mcTopic.id || self.topicView.guid();
                this.topic = mcTopic;
                this.topic['id'] = this.id;

                this.handleDraggable(position);
                this.handleDroppable();
                this.handleMouseOver();
                this.handleRemoveButton();
                this.handleClick();

                this.div.append(this.deleteButton);
                this.div.data("mc", self);
                return this;
            };

            self.handleDraggable = function(position) {
                var self = this;
                self.div.addClass('canvas-element');
                self.div.draggable({
                    containment: "div.designer",
                    start: function(event, ui) {
                        self.topicView.refreshLinks();
                    },
                    drag: function(event, ui) {
                        self.topicView.refreshLinks();
                    },
                    stop: function(event, ui) {
                        self.topicView.refreshLinks();
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
                        if(ui.draggable.hasClass('dataModelTitle')){
                            var dataModelTitle = ui.draggable;
                            var dataModelDiv = ui.draggable.parents(".dataModel");
                            var topicDiv = jQuery(event.target);
                            var linkId = self.topicView.addLink(null, dataModelDiv, topicDiv);
                            if(linkId) {
                                $(self.topicView).triggerHandler('linkAdded', {linkedId:linkId, dataModel:dataModelDiv.data("mc"), topic:topicDiv.data("mc")});
                            }
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
                    var dialogue = self.topicView.showConfirmDialogue("Are you sure?");
                    $.when(dialogue).then(
                        function() {
                            self.topicView.removeTopic(self);
                        },
                        function() {});
                });
            };
            self.remove = function () {
                $(this.deleteButton).remove();
                $(this.titleDiv).remove();
                $(this.div).remove();
            };
            self.handleClick = function () {
                var self = this;
                self.div.on("click", function (event) {
                    self.topicView.selectElement(self);
                    event.stopPropagation();
                });
            };
            self.updateTitle = function (title) {
                var self = this;
                self.titleDiv.text(title);
                self.topicView.refreshLinks();
            };
            self.getUIElement = function () {
                return this.div;
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
                    self.topicView.refreshLinks();
                }
            };

            return self;
        };

        topicView.handleClickOnDesigner();
        return topicView;
    };

    return {

        getTopicViewHandler: function ($designer, $svg) {
            var topicViewHandler = createTopicView($designer, $svg);

            jQuery($designer).droppable({
                drop: function (event, ui) {

                    var $canvas = $(this);
                    if (!ui.draggable.hasClass('canvas-element')) {
                        if(ui.draggable.hasClass('dataModelInTree')) {

                            var mcId    = ui.draggable.parent().data("id");
                            var mcLabel = ui.draggable.text();

                            var found = topicViewHandler.getDataModel(mcId);
                            if(found != null){
                                topicViewHandler.selectElement(found);
                                return;
                            }
                            var dataModel = topicViewHandler.createDataModel().init({id:mcId, label:mcLabel}, {left:ui.offset.left, top:ui.offset.top});
                            topicViewHandler.addDataModel(dataModel);

                        }else if(ui.draggable.hasClass('topicToolBox')) {
                            topicViewHandler.topicIndex++;
                            var topic = topicViewHandler.createTopic().init({id:topicViewHandler.guid(), label:"New Topic " + topicViewHandler.topicIndex}, {left:ui.offset.left, top:ui.offset.top});
                            topicViewHandler.addTopic(topic);
                            $(topicViewHandler).triggerHandler('topicAdded', topic);
                        }
                    }
                }
            });
            return topicViewHandler;
        },
    }
});

angular.module('directives').directive('myTreeMultiLevel', function ($state, $rootScope, $stateParams, securityHandler, resources, jQueryExtender, $q, stateHandler) {
    return{
        restrict: 'A',
        scope: {
            children: "=",
            onSelect: "&",
            onDbClick:"&",
            onAddChildDataClass:"&",
            onAddDataElement:"&",
            onAddDataType:"&",
            onAddDataModel:"&",
            onCompareTo:"&",
            loadModelsToCompare:"&",
            selectOnStateChange : "@",
            initialSelectedElement: "=",
            hideSpinner:"=",
            treeName:"=",
            justDataModels:"="
        },
        template: '<ul class="root myTree">\
						<li class="myTreeEmptyRoot">\
				  		</li>\
				  </ul>\
				  <div style="width: 100%;height: 100%;" class="treeWaitingSpinner" ng-show="!hideSpinner">\
					<div style="position: absolute;top:30%;left:40%;">\
						<a style="font-size: 75px;" class="themeColor">\
							<i class="fa fa-refresh fa-spin"></i>\
						</a>\
					</div>\
				  </div>',
        link: function (scope, element, attrs) {


            //.........................................................................................................
            jQueryExtender.addContainsi();//case insensitive contains for jQuery
            //.........................................................................................................


            var rootUL = element.find("ul.root");
            rootUL.addClass(scope.treeName + "_tree");
            var spinner = element.find("div.treeWaitingSpinner");


            // unwrap the function
            //http://stackoverflow.com/questions/19889615
            if(scope.onSelect) {
                scope.onSelect = scope.onSelect();
            }
            if(scope.onDbClick) {
                scope.onDbClick = scope.onDbClick();
            }
            if(scope.onAddChildDataClass){
                scope.onAddChildDataClass = scope.onAddChildDataClass();
            }
            if(scope.onAddDataElement){
                scope.onAddDataElement = scope.onAddDataElement();
            }
            if(scope.onAddDataType){
                scope.onAddDataType = scope.onAddDataType();
            }
            if(scope.onAddDataModel){
                scope.onAddDataModel = scope.onAddDataModel();
            }
            if(scope.onCompareTo){
                scope.onCompareTo = scope.onCompareTo();
            }
            if(scope.loadModelsToCompare){
                scope.loadModelsToCompare = scope.loadModelsToCompare();
            }

            spinner.show();

            scope.$watch("children.length", function (newVal, oldVal, scope) {

                //if there are not any models, then make the model tree empty
                if (newVal != undefined && newVal === 0 ){
                    spinner.hide();
                    var rootUL = element.find("ul.root");
                    rootUL.html('');//First remove all elements if any exist, in case we are reloading it ($reloadModelTreeView broadcast)
                    //initialize right click, context menu
                    initializeContextMenu();
                    return;
                }

                if (newVal && newVal != oldVal) {

                    spinner.show();
                    var rootUL = element.find("ul.root");
                    rootUL.html('');//First remove all elements if any exist, in case we are reloading it ($reloadModelTreeView broadcast)
                    for (var i = 0; i < scope.children.length; i++) {
                        var node = createNode(0, scope.children[i], true);
                        rootUL.append(node);
                    }
                    spinner.hide();


                    //initialize right click, context menu
                    initializeContextMenu();


                    //Select the element on the tree if there is an id on the stateParam
                    if (scope.selectOnStateChange && scope.selectOnStateChange=="true" && $stateParams) {
                        var id = $stateParams.id;
                        var elementType = "dataModel";
                        if ($state.current.name == "twoSidePanel.catalogue.dataClass") {
                            elementType = "dataClass"
                        }
                        openNodeAndParents(id, elementType);
                    }

                    //Select the element on the tree if initialSelectedElement is passed

                    if(scope.initialSelectedElement) {
                        openNodeAndParents(scope.initialSelectedElement.id, scope.initialSelectedElement.type);
                    }

                    //if the searchCriteria is already set, then manually apply the Hightlight after loading the data
                    //used for backend search service, we actually don't need the following lines for local/client side search
                    if($rootScope.searchCriteria && $rootScope.searchCriteria.length > 0){
                        var rootUL = element.find("ul.root");
                        scope.removeHighlight(rootUL);
                        scope.addHighlight($rootScope.searchCriteria);
                    }
                    //.........................................................................................................
                }
            });



            // $rootScope.$on('$markNewOnesInDataModels', function (event, newDataModels){
            //   angular.forEach(newDataModels, function (dataModel) {
            //     //find all newly added dataModels and mark them(change their color for 2minutes)
            //     jQuery("li#" + dataModel.id).find("span.elementName").addClass("newlyAddedDataModel");
            //   });
            //   setTimeout(function(){
            //     angular.forEach(newDataModels, function (dataModel) {
            //       //find all newly added dataModels and mark them(change their color for 2minutes)
            //       jQuery("li#" + dataModel.id).find("span.elementName").removeClass("newlyAddedDataModel");
            //     });
            //   }, 20000);//disappear after 20sec
            // });


            //check for stateChange and
            $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
                return;

                if (to.name === "appContainer.mainApp.twoSidePanel.catalogue.dataClass" ||
                    to.name === "appContainer.mainApp.twoSidePanel.catalogue.dataModel" ||
                    to.name === "appContainer.mainApp.twoSidePanel.catalogue.dataElement") {
                    var id = toParams.id;
                    var elementType = "dataModel";
                    if (to.name === "appContainer.mainApp.twoSidePanel.catalogue.dataClass") {
                        elementType = "dataClass";
                    }else if (to.name === "appContainer.mainApp.twoSidePanel.catalogue.dataElement"){
                        //for dataElement, we select its dataClass and expand it
                        elementType = "dataClass";
                        //if parentId is provided
                        if(toParams.parentId) {
                            id = toParams.parentId;
                        }
                    }
                    //if id is provided then openNodeAndParents, otherwise do not do it!
                    if(id) {
                        openNodeAndParents(id, elementType);
                    }
                }
            });


            //$elementDetailsUpdated is called when an element in the tree is updated
            //like label and we need to find the element in the tree and update the label
            $rootScope.$on('$elementDetailsUpdated',function (event, updatedResource){
                //find the element in the tree
                var li = rootUL.find("li#" + updatedResource.id);
                //find the span that has the name text
                var nameSpan = li.children("span.elementName");
                //update the label
                nameSpan.text(updatedResource.label);
            });


            //$elementDeleted is called when an element in deleted
            $rootScope.$on('$elementDeleted',function (event, updatedResource, permanent){
                if(!permanent) {
                    jQuery("li#" + updatedResource.id).find("span.elementName").addClass("deletedTreeItem");
                }else{
                    jQuery("li#" + updatedResource.id).remove();
                }
            });


            //$highlightText is called when we want to filter/search a text in the treeView and highlight the text
            $rootScope.$on('$highlightText-' + scope.treeName,function (event, args){
                var text = args.filterCriteria;
                scope.filterCriteria = text;

                if(!text || (text && text.trim().length ==0)){
                    scope.filterCriteria = null;
                    scope.removeHighlight(rootUL);
                    return
                }
                scope.removeHighlight(rootUL);
                scope.addHighlight(text);
            });

            function openNodeAndParents(id, elementType) {
                var li = rootUL.find(":data('id-" + id + "-" + elementType + "')");
                if (li && li.length > 0) {
                    var plusElements = li.parents('ul').parents("li").children("i.fa-minus,i.fa-plus");
                    for (var i = 0; i < plusElements.length; i++) {
                        openElement(jQuery(plusElements[i]));
                    }
                    li.parents("ul").show();
                    selectNode(li);
                }
            }


            function isOpen(plusMinusElement) {
                return  (plusMinusElement && plusMinusElement.hasClass("fa-minus"))
            }

            function addNodeDetailToElement(level, node, li) {


                li.data("element", node);

                if (level == 0) {
                    li.data("id", node.id);
                    li.data("level", level);
                    li.attr("id", node.id);
                    li.data("elementType", "dataModel");
                    li.data("id-" + node.id + "-" + "dataModel", "id-" + node.id + "-" + "dataModel");
                } else {
                    li.data("id", node.id);
                    li.data("dataModelId", node.dataModel);
                    li.data("level", level);
                    li.attr("id", node.id);
                    li.data("elementType", "dataClass");
                    li.data("id-" + node.id + "-" + "dataClass", "id-" + node.id + "-" + "dataClass");
                }
            }

            function changeState(li) {
                if (li.data("elementType") === "dataModel") {
                    var dataModelId = li.data("id");
                    $state.go("appContainer.mainApp.twoSidePanel.catalogue.dataModel", {id: dataModelId});

                } else {
                    var dataClassId = li.data("id");
                    $state.go("appContainer.mainApp.twoSidePanel.catalogue.dataClass", {id: dataClassId});
                }
            }

            function findChildrenNodeName(level) {
                return "children";

                //if (level == 0) {
                //	return "subClasses";
                //}
                //return "childClasses";
            }

            function openElement(plus) {
                var li 	  = plus.parent();
                var id    = li.data("id");
                var type  = li.data("elementType");
                var level = li.data("level");

                //When we are in Filter mode, don't call 'datamodel/incrementaltree'
                //as it already has all the dataClasses and dataModels
                //so just open the tree and show them
                if(scope.filterCriteria){
                     //show all ul(children) which is under this element
                     li.children('ul').show();
                     //remove plus sign
                     jQuery(plus).removeClass("fa-plus");
                     //add minus sign
                     jQuery(plus).addClass("fa-minus");
                     return;
                }

                li.children('ul').remove();
                resources.catalogueItem.tree(id).then(function(data){

                    if(data.length == 0){
                        //Nothing to show
                        plus.remove();
                    }else{


                        for (var i = 0; i < data.length; i++) {
                            var node = createNode(level+1, data[i], true);

                            //XXXXXX

                            if(li.children('ul').length == 0) {
                                var ulChildren = jQuery('<ul class="myTree" style="display: none !important;"></ul>');
                                li.append(ulChildren)
                            }

                            li.children('ul').append(node);
                        }
                        li.children('ul').show();

                        //remove plus sign
                        jQuery(plus).removeClass("fa-plus");
                        //add minus sign
                        jQuery(plus).addClass("fa-minus");

                    }



                    //if the searchCriteria is already set, then manually apply the Hightlight after loading the data
                    //used for backend search service, we actually don't need the following lines for local/client side search
                    if($rootScope.searchCriteria && $rootScope.searchCriteria.length > 0){
                        var rootUL = element.find("ul.root");
                        scope.removeHighlight(rootUL);
                        scope.addHighlight($rootScope.searchCriteria);
                    }

                });


            }

            function closeElement(minus) {
                var li = minus.parent();
                //hide all ul(children) which is under this element
                li.children('ul').hide();
                //add plus sign
                jQuery(minus).addClass("fa-plus");
                //remove minus sign
                jQuery(minus).removeClass("fa-minus");
            }

            function selectNode(li) {




                //set all others to normal first
                var currentSelectedLi = element.find("li.selectedElement");
                if (currentSelectedLi.length > 0) {
                    currentSelectedLi.removeClass("selectedElement");
                    currentSelectedLi.children("span.elementName").css("font-weight", "normal");
                }

                //add class to li then we can find it later
                li.addClass("selectedElement");
                //find the nameSpan (Span which holds the element name
                var nameSpan = li.children("span.elementName");
                //add bold font style to it
                nameSpan.css("font-weight", "bold");
            }

            function createNode(level, node, showChildren) {

                //create initial li element for this node
                //we need the 'tabindex' to bind the keypress,.. events, otherwise it does not capture that
                var li = jQuery("<li tabindex='1' class='myTreeNode'></li>");

                //add jQuery data attribute to the element
                addNodeDetailToElement(level, node, li);

                //find name of the child elements based on the level
                //level 0 is dataModel so children are in 'subClasses'
                //other levels are dataClass so children are in 'childClasses'
                var childrenNode = node[findChildrenNodeName(level)];



                var className = "dataClassInTree";
                if(li.data("elementType") == "dataModel"){
                    className = "dataModelInTree";
                }
                if(node.deleted){
                    className+=" deletedTreeItem";
                }


                var docVersion = "";
                if(node.superseded){
                    className+=" supersededByItem";
                    docVersion =    "<span style='font-size: 11px'> (" + node.documentationVersion +") </span>";
                }

                //create a span for holding element label
                var elementName = jQuery('<span class="elementName ' + className + " "+ scope.treeName +'">' + node.label + docVersion + '</span>');

                //make it draggable, if it's a dataClass
                if(li.data("elementType") === "dataModel"){
                    elementName.draggable({
                        helper: "clone"
                    });
                }


                //if it has children, then create subNodes recursively
                if (((childrenNode && childrenNode.length > 0) ||  node.hasChildren == true) && scope.justDataModels != true) {
                    var plus = jQuery('<i class="fa fa-plus plusMinusElement" style="margin-right: 3px; font-size: 9px; font-weight: normal"></i>');
                    plus.on('click', function (event) {
                        var plusMinusElement = jQuery(this);
                        //If it is closed, then open it
                        if (jQuery(plusMinusElement).hasClass("fa-plus")) {
                            openElement(plusMinusElement);
                        } else {
                            closeElement(plusMinusElement);
                        }
                        event.stopPropagation();
                    });
                    li.append(plus);

                    //Show icons for nodes on level 0 as they are dataModels
                    if (level == 0) {
                        var iconType = "fa fa-file-text-o";
                        if(node.type === "Data Asset"){
                            iconType = "fa fa-database";
                        }
                        var icon = '<i class="modelIcon '+ iconType +'" style="padding-right: 3px;"></i>';
                        li.append(icon);
                    }
                    li.append(elementName);

                    //add a children holder UL element, and make it hidden for now
                    var ulChildren = jQuery('<ul class="myTree" style="display: none !important;"></ul>');

                    //for all children of the node, build the hierarchy for them
                    for (var i = 0; childrenNode && i < childrenNode.length; i++) {
                        var chileNode = createNode(level + 1, childrenNode[i], false);
                        //add the created child hierarchy to the UL children holder
                        ulChildren.append(chileNode);
                    }
                    //if the children should be hidden in this level, then hide them
                    if (!showChildren) {
                        ulChildren.hide();
                    }
                    li.append(ulChildren);
                } else {



                	/*
                    var plus = jQuery('<i class="fa fa-plus plusMinusElement" style="margin-right: 3px; font-size: 9px; font-weight: normal"></i>');
                    plus.on('click', function (event) {
                        var plusMinusElement = jQuery(this);
                        //If it is closed, then open it
                        if (jQuery(plusMinusElement).hasClass("fa-plus")) {
                            openElement(plusMinusElement);
                        } else {
                            closeElement(plusMinusElement);
                        }
                        event.stopPropagation();
                    });
                    li.append(plus);
                    //Show icons for nodes on level 0 as they are dataModels
                    if (level == 0) {
                        var icon = '<i class="modelIcon fa fa-list" style="padding-right: 3px;"></i>';
                        li.append(icon);
                    }
                    li.append(elementName);
					*/

					 var nonPlus = jQuery('<i style="padding: 5px;"></i>');
					 li.append(nonPlus);
					 if (level == 0) {
                         var iconType = "fa fa-file-text-o";
                         if(node.type === "Data Asset"){
                             iconType = "fa fa-database";
                         }
                         var icon = '<i class="modelIcon '+ iconType +'" style="padding-right: 3px;"></i>';
                         li.append(icon);
					 }
					 li.append(elementName);

                }

                li.on("click", function (event) {

                    var self = jQuery(this);
                    selectNode(self);
                    //change the state of Angular
                    //changeState(self);


                    //Also call the external method if any provided
                    if(scope.onSelect) {
                        var element = self.data("element");
                        scope.onSelect(event,element);
                    }

                    event.stopPropagation();
                });





                //open the list if it is close
                li.on("dblclick", function (event) {
                    var self = jQuery(this);
                    selectNode(self);
                    //changeState(self);
                    if(scope.onDbClick) {
                        scope.onDbClick(event, self.data("element"));
                    }

                    var plusMinusElement = self.find("i.plusMinusElement");
                    if (plusMinusElement && plusMinusElement.length > 0) {
                        if (isOpen(jQuery(plusMinusElement[0]))) {
                            closeElement(jQuery(plusMinusElement[0]));
                        } else {
                            openElement(jQuery(plusMinusElement[0]));
                        }
                    }
                    event.stopPropagation();
                });

                li.on('keydown', function (event) {

                    switch (event.keyCode) {
                        case 39: //right, collapse the node
                            var plusMinusElement = jQuery(this).find("i.plusMinusElement:first");
                            if (plusMinusElement && plusMinusElement.length > 0) {
                                if (!isOpen(jQuery(plusMinusElement[0]))) {
                                    openElement(jQuery(plusMinusElement[0]));
                                }
                            }
                            event.stopPropagation();
                            break;
                        case 37: //left, close the node
                            var plusMinusElement = jQuery(this).find("i.plusMinusElement:first");
                            if (plusMinusElement && plusMinusElement.length > 0) {
                                if (isOpen(jQuery(plusMinusElement[0]))) {
                                    closeElement(jQuery(plusMinusElement[0]));
                                }
                            }
                            event.stopPropagation();
                            break;
                        case 38: //up, got to parent, if exists
                            var prevLI = jQuery(this).prev("li");
                            if (prevLI && prevLI.length > 0) {
                                //if it is the very TOP level node, so do not do anything
                                if (prevLI.hasClass("myTreeEmptyRoot")) {
                                    //Do nothing
                                } else {
                                    selectNode(prevLI);
                                    jQuery(prevLI).focus();
                                    //changeState(prevLI);
                                    if(scope.onSelect) {
                                        scope.onSelect(event, prevLI.data("element"));
                                    }
                                }
                            } else {
                                //if has parent
                                var parentLI = jQuery(this).parent("ul").parent("li");
                                if (parentLI && parentLI.length > 0) {
                                    selectNode(parentLI);
                                    jQuery(parentLI).focus();
                                    //changeState(parentLI);
                                    if(scope.onSelect) {
                                        scope.onSelect(event,parentLI.data("element"));
                                    }
                                }
                            }
                            event.stopPropagation();
                            break;

                        case 40: //down, got to child or next
                            //If it is an open element, which has children, then
                            //select its first child
                            var self = jQuery(this);
                            var plusMinusElement = self.find("i.plusMinusElement:first");
                            if (isOpen(plusMinusElement)) {
                                var childrenLI = self.children("ul").find("li");
                                if (childrenLI && childrenLI.length > 0) {
                                    var firstChild = jQuery(childrenLI[0]);
                                    selectNode(firstChild);
                                    firstChild.focus();
                                    //changeState(firstChild);
                                    if(scope.onSelect) {
                                        scope.onSelect(event,firstChild.data("element"));
                                    }
                                }
                            } else {
                                var nextLI = jQuery(this).next("li");
                                if (nextLI && nextLI.length > 0) {
                                    selectNode(nextLI);
                                    jQuery(nextLI).focus();
                                    //changeState(nextLI);
                                    if(scope.onSelect) {
                                        scope.onSelect(event,nextLI.data("element"));
                                    }
                                } else {
                                    //if has parent
                                    var nextParentsLISibling = jQuery(this).parent("ul").parent("li").next("li");
                                    if (nextParentsLISibling && nextParentsLISibling.length > 0) {
                                        selectNode(nextParentsLISibling);
                                        jQuery(nextParentsLISibling).focus();
                                        //changeState(nextParentsLISibling);
                                        if(scope.onSelect) {
                                            scope.onSelect(event,nextParentsLISibling.data("element"));
                                        }
                                    }
                                }
                            }
                            event.stopPropagation();
                            break;
                    }
                    //stop Propagation which causes the main UI to
                    //scroll after pressing the keys
                    return false;
                });
                return li;
            }


            scope.loadVersions = function($element){
                var self = jQuery($element);
                var sourceDataModel = self.data("element");

                var deferred =  jQuery.Deferred();
                var subItems = {
                    "anotherDataModel":
                        {
                            name: "Another Data Model",
                            className: 'contextCompareToItem',
                            callback: function (itemKey, opt) {
                                var self = jQuery($element);
                                selectNode(self);
                                if (scope.onSelect) {
                                    scope.onSelect(event, self.data("element"));
                                }
                                if (scope.onCompareTo) {
                                    scope.onCompareTo(self.data("element"), null);
                                }
                                return true;
                            }
                        }
                };
                if(scope.loadModelsToCompare){
                    scope.loadModelsToCompare(sourceDataModel).then(function(targetModels){
                        angular.forEach(targetModels, function (targetModel) {
                            subItems[targetModel.label] = {
                                isHtmlName: true,
                                name: targetModel.label + "<span style='padding-left: 5px;font-style:italic;font-size: 11px;'>" + targetModel.documentationVersion + "</span>",
                                callback: function () {
                                    if (scope.onSelect) {
                                        scope.onSelect(event, sourceDataModel);
                                    }
                                    if (scope.onCompareTo) {
                                        scope.onCompareTo(sourceDataModel, targetModel);
                                    }
                                    return true;
                                }
                            };
                        });
                        deferred.resolve(subItems);
                    })
                }else{
                    deferred.resolve(subItems);
                }
                return deferred.promise();
            };

            function dataModelContext($element) {
                return {
                    "OpenInNewWindow": {
                        name: "Open (New Window)",
                        callback: function (itemKey, opt) {
                            var self = jQuery($element);
                            var dataModel = self.data("element");
                            debugger
                            stateHandler.NewWindow("datamodel", {id:dataModel.id});
                            return true;
                        }
                    },
                    "sep1": "---------",
                    "addChildDataClass": {
                        name: "Add DataClass",
                        callback: function (itemKey, opt) {
                            var self = jQuery($element);
                            selectNode(self);
                            if (scope.onSelect) {
                                scope.onSelect(event, self.data("element"));
                            }
                            if (scope.onAddChildDataClass) {
                                scope.onAddChildDataClass(event, self.data("element"));
                            }
                            return true;
                        }
                    },
                    "addChildDataType": {
                        name: "Add DataType",
                        callback: function (itemKey, opt) {
                            var self = jQuery($element);
                            selectNode(self);
                            if (scope.onSelect) {
                                scope.onSelect(event, self.data("element"));
                            }
                            if (scope.onAddDataType) {
                                scope.onAddDataType(event, this.data("element"));
                            }
                            return true;
                        }
                     },
                    "sep2": "---------",
                    "compareTo": {
                        name: "Compare to...",
                        icon:"  ",//Do NOT remove this, otherwise loading spinner will not be displayed
                        items: scope.loadVersions($element),
                        callback: function (itemKey, opt) {
                            var self = jQuery($element);
                            selectNode(self);
                            if (scope.onSelect) {
                                scope.onSelect(event, self.data("element"));
                            }
                            if (scope.onCompareTo) {
                                scope.onCompareTo(self.data("element"), null);
                            }
                            return true;
                        }
                    }
                };
            }

            function dataClassContext($element) {
                return {
                    "addChildDataClass": {
                        name: "Add DataClass",
                        callback: function (itemKey, opt) {
                            var self = jQuery($element);
                            selectNode(self);
                            if (scope.onSelect) {
                                scope.onSelect(event, self.data("element"));
                            }
                            if (scope.onAddChildDataClass) {
                                scope.onAddChildDataClass(event, self.data("element"));
                            }
                            return true;
                        }
                    },
                    "addDataElement": {
                        name: "Add DataElement",
                        callback: function (itemKey, opt) {
                            var self = jQuery($element);
                            selectNode(self);
                            if (scope.onSelect) {
                                scope.onSelect(event, self.data("element"));
                            }
                            if (scope.onAddDataElement) {
                                scope.onAddDataElement(event, self.data("element"));
                            }
                            return true;
                        }
                    }
                };
            }

            function initializeContextMenu(){
                var treeClass = "ul." + scope.treeName + "_tree";

                if(securityHandler.showIfRoleIsWritable()) {
                    if(scope.treeName === "models"){
                        jQuery.contextMenu({
                            selector: treeClass + " li.myTreeNode",
                            items: {},
                            build: function ($element) {
                                var options = {
                                    callback: function(key, options) {},
                                    items: {}
                                };
                                var type = $element.data("elementType");
                                if(type === "dataModel") {
                                    options.items = dataModelContext($element);
                                }
                                if(type === "dataClass"){
                                    options.items = dataClassContext($element);
                                }
                                return options;
                            }
                        });
                    }else{

                    }
                }
                else{
                    //disable context menu
                    var treeItems = jQuery(treeClass + " li.myTreeNode");
                    if(treeItems && treeItems.length > 0){
                        treeItems.contextMenu(false);
                    }

                }
            }


            //Highlight the search text in the tree and also hide the items that don't have the searched text
            scope.addHighlight = function(str) {
                if(!str){
                    return;
                }

                //show all nodes (in case they were filtered in the previous search)
                rootUL.find("li > span.elementName").parents("li").show();
                //show all parent nodes (in case they were filtered in the previous search)
                rootUL.find("li > span.elementName").parent().find("li").show();

                var regex = new RegExp(str, "gi");
                var spans = rootUL.find("span.elementName:containsi('"+ str +"')");
                for(var i = 0; i< spans.length; i++){
                    spans[i].innerHTML = spans[i].innerHTML.replace(regex, function(a){
                        return a.replace(regex, "<span class='mcHighlighter'>"+ a +"</span>");
                    });
                }

                //for each root element, show the number of nodes that contain "str" within them
                // var modelsLi = rootUL.children("li");
                // for(var i = 0; i< modelsLi.length; i++){
                //     var spans = jQuery(modelsLi[i]).find("span.elementName:containsi('"+ str +"')");
                //     if(spans.length > 1) {
                //         jQuery(jQuery(modelsLi[i]).find("span.elementName")[0]).after("<span class='foundCount badge'>" + spans.length + "</span>");
                //     }
                // }



                //Hide all the nodes that don't have the searched str in their text
                //rootUL.find("li > span.elementName:not(:containsi('"+ str +"'))").parents("li:not(myTreeEmptyRoot)").hide();

                //Show all the nodes that HAVE the searched str in their text
                rootUL.find("li > span.elementName:containsi('"+ str +"')").parents("li").show();

                //Show all the child nodes of the parent nodes that HAVE the searched str in their text
                rootUL.find("li > span.elementName:containsi('"+ str +"')").parent().find("li").show();
            };

            //remove the highlighted texts in the tree and return it to the normal status
            scope.removeHighlight = function(root) {

                root.find("li > span.foundCount").remove();

                //show all nodes (in case they were filtered in the previous search)
                rootUL.find("li > span.elementName").parents("li").show();
                //show all parent nodes (in case they were filtered in the previous search)
                rootUL.find("li > span.elementName").parent().find("li").show();

                var spans = root.find("span.mcHighlighter");
                for(var i = 0; i < spans.length; i++){
                    var parent =  jQuery(spans[i]).parent();
                    if(parent && parent.length > 0){
                        var parentText = parent[0].innerText;
                        parent.html(parentText);
                        jQuery(spans[i]).remove();
                    }
                }
            };

        }
    }
});
angular.module('directives').directive('myTreeForAModel', function ($state, $rootScope, $stateParams, securityHandler, resources) {
    return{
        restrict: 'A',
        scope: {
            children: "=",
            onSelect: "&",
            expandAll: "=",
            treeName:"="
        },
        template: '<ul class="root myTree">\
						<li class="myTreeEmptyRoot">\
				  		</li>\
				  </ul>\
				  <div style="width: 100%;height: 100%;">\
					<div style="position: absolute;top:30%;left:40%;">\
					</div>\
				  </div>',
        link: function (scope, element, attrs) {

            var rootUL = element.find("ul.root");
            rootUL.addClass(scope.treeName + "_tree");

            // unwrap the function
            //http://stackoverflow.com/questions/19889615

            if(scope.onSelect) {
                scope.onSelect = scope.onSelect();
            }



            scope.$watch("children", function (newVal, oldVal, scope) {

                //if there are not any models, then make the model tree empty
                if (newVal === undefined || newVal == null || (newVal && newVal.length === 0)){
                    var rootUL = element.find("ul.root");
                    rootUL.html('');//First remove all elements if any exist, in case we are reloading it ($reloadModelTreeView broadcast)
                    return;
                }

                var rootUL = element.find("ul.root");
                rootUL.html('');//First remove all elements if any exist, in case we are reloading it ($reloadModelTreeView broadcast)
                for (var i = 0; i < scope.children.length; i++) {
                    var node = createNode(0, scope.children[i], true);
                    rootUL.append(node);
                }
                //.........................................................................................................
            });


            function isOpen(plusMinusElement) {
                return  (plusMinusElement && plusMinusElement.hasClass("fa-minus"))
            }

            function addNodeDetailToElement(level, node, li) {

                li.data("element", node);

                if (level == 0) {
                    li.data("id", node.id);
                    li.data("label", node.label);
                    li.data("level", level);
                    li.attr("id", node.id);
                    li.data("elementType", "dataModel");
                    li.data("id-" + node.id + "-" + "dataModel", "id-" + node.id + "-" + "dataModel");
                } else {
                    li.data("id", node.id);
                    li.data("label", node.label);
                    li.data("level", level);
                    li.attr("id", node.id);
                    li.data("elementType", "dataClass");
                    li.data("id-" + node.id + "-" + "dataClass", "id-" + node.id + "-" + "dataClass");
                }
            }

            function findChildrenNodeName(level) {
                return "childDataClasses";
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

                li.children('ul').remove();
                resources.tree.get(id).then(function(data){
                    if(data.length == 0){
                        //Nothing to show
                        plus.remove();
                    }else{
                        for (var i = 0; i < data.length; i++) {
                            var node = createNode(level+1, data[i], true);

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


                var id    = li.data("id");
                var type  = li.data("elementType");

                if(type == "dataClass"){
                    //load all the dataElements

                }

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
                //create a span for holding element label
                var elementName = jQuery('<span class="elementName ' + className + " "+ scope.treeName +'">' + node.label + '</span>');

                //make it draggable, if it's a dataClass
                if(li.data("elementType") == "dataClass"){
                    elementName.draggable({
                        helper: "clone"
                    });
                }


                //if it has children, then create subNodes recursively
                if (node && node.hasChildren) {
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

                    if(scope.expandAll){
                        li.append(plus);
                    }
                    //openElement(plus);
                    //Show icons for nodes on level 0 as they are dataModels
                    if (level == 0) {
                        var icon = '<i class="modelIcon fa fa-list" style="padding-right: 3px;"></i>';
                        li.append(icon);
                    }
                    li.append(elementName);

                    //add a children holder UL element, and make it hidden for now
                    var ulChildren = jQuery('<ul class="myTree" style="display: none !important;"></ul>');

                    // //for all children of the node, build the hierarchy for them
                    // for (var i = 0; i < childrenNode.length; i++) {
                    //     var chileNode = createNode(level + 1, childrenNode[i], false);
                    //     //add the created child hierarchy to the UL children holder
                    //     ulChildren.append(chileNode);
                    // }
                    //if the children should be hidden in this level, then hide them
                    if (!showChildren) {
                        ulChildren.hide();
                    }
                    li.append(ulChildren);
                } else {
					 var nonPlus = jQuery('<i style="padding: 5px;"></i>');
					 li.append(nonPlus);
					 if (level == 0) {
					     var icon = '<i class="modelIcon fa fa-list" style="padding-right: 3px;"></i>';
					    li.append(icon);
					 }
					 li.append(elementName);
                }

                li.on("click", function (event) {

                    var self = jQuery(this);
                    selectNode(self);
                    //Also call the external method if any provided
                    if(scope.onSelect) {
                        console.log("in directive: onSelect")
                        scope.onSelect(event,self);
                    }
                    event.stopPropagation();
                });
                return li;
            }

        }
    }
});
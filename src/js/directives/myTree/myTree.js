angular.module('directives').directive('myTree', function ($state, $rootScope, $stateParams, securityHandler) {
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
			selectOnStateChange : "@",
			initialSelectedElement: "=",
			hideSpinner:"@",
			treeName:"="
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



			//This will extend jQuery to support case insensitive search by using 'containsi' .........................
			jQuery.extend($.expr[':'], {
				'containsi': function(elem, i, match, array)
				{
					var text = (elem.textContent || elem.innerText || '');
					return text.toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
				}
			});
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
					};


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


			//check for stateChange and
			$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
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


			//$highlightText is called when we want to filter/search a text in the treeView and highlight the text
			$rootScope.$on('$highlightText-' + scope.treeName,function (event, args){
				var text = args.filterCriteria;
				if(!text || (text && text.trim().length ==0)){
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

				if (level === 0) {
					li.data("id", node.id);
					li.attr("id", node.id);
					li.data("elementType", "dataModel");
					li.data("id-" + node.id + "-" + "dataModel", "id-" + node.id + "-" + "dataModel");
				} else {
					li.data("id", node.id);
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
				return "childDataClasses";

				//if (level == 0) {
				//	return "subClasses";
				//}
				//return "childClasses";
			}

			function openElement(plus) {
				var li = plus.parent();
				//show all ul(children) which is under this element
				li.children('ul').show();
				//remove plus sign
				jQuery(plus).removeClass("fa-plus");
				//add minus sign
				jQuery(plus).addClass("fa-minus");
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

				//create a span for holding element label
				var elementName = jQuery('<span class="elementName">' + node.label + '</span>');

				//if it has children, then create subNodes recursively
				if (childrenNode && childrenNode.length > 0) {
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

					//add a children holder UL element, and make it hidden for now
					var ulChildren = jQuery('<ul class="myTree" style="display: none !important;"></ul>');

					//for all children of the node, build the hierarchy for them
					for (var i = 0; i < childrenNode.length; i++) {
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
					//change the state of Angular
					//changeState(self);


					//Also call the external method if any provided
					if(scope.onSelect) {
						scope.onSelect(event,self.data("element"));
					}

					event.stopPropagation();
				});





				//open the list if it is close
				li.on("dblclick", function (event) {
					var self = jQuery(this);
					selectNode(self);
					//changeState(self);
					if(scope.onDbClick) {
						scope.onDbClick(event,self);
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
										scope.onSelect(event,prevLI.data("element"));
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

			function initializeContextMenu(){
				//enable context menu if user has Write Access
				if(securityHandler.showIfRoleIsWritable()) {

					var treeClass = "ul." + scope.treeName + "_tree";
					if(scope.treeName == "models"){
						jQuery.contextMenu({
								// define which elements trigger this menu
								selector: treeClass + " li.myTreeNode",
								// define the elements of the menu
								items: {
                                    "addDataModel": {name: "New DataModel", callback: function (itemKey, opt) {
                                        var self = jQuery(this);
                                        selectNode(self);

                                        debugger
                                        if (scope.onAddDataModel) {
                                            scope.onAddDataModel(event);
                                        }
                                        return true;
                                    }},
                                    "sep1": "---------",
                                    "edit": {name: "Go to", callback: function (itemKey, opt) {

										//Also call the external method if any provided
										if (scope.onSelect) {
											scope.onSelect(event, jQuery(this).data("element"));
										}
										return true;
									}
									},
									/*"cut": {name: "Cut",  callback: function (itemKey, opt) {
									 //alert("Clicked on " + itemKey + " on element " + opt.$trigger.id);
									 scope.clipBoard = this;
									 scope.clipBoardOperation = "cut";
									 // Do not close the menu after clicking an item
									 //return false;
									 return true;
									 }
									 },
									 "copy": {name: "Copy", callback: function (itemKey, opt) {
									 //alert("Clicked on " + itemKey + " on element " + opt.$trigger.id);
									 scope.clipBoard = this;
									 scope.clipBoardOperation = "copy";
									 // Do not close the menu after clicking an item
									 //return false;
									 return true;
									 }
									 },
									 "paste": {name: "Paste",
									 //hide it if nothing has been Copied or Cut (when cacheClipBoard is Empty)
									 disabled: function (key, opt) {
									 // Hide this item if the menu was triggered on a div
									 if (scope.clipBoard) {
									 //do copy operation
									 return false;
									 }
									 return true;
									 },
									 callback: function (itemKey, opt) {
									 if(scope.clipBoardOperation == "cut") {
									 scope.clipBoardOperation = undefined;
									 scope.clipBoard = undefined;
									 return true;
									 }
									 if(scope.clipBoardOperation == "copy") {
									 return true;
									 }
									 }
									 },
									 "delete": {
									 name: "Delete",
									 callback: function (itemKey, opt) {
									 var self = jQuery(this);
									 //var content =
									 //	"<button type='button' class='btn btn-default btn-xs' click='confirmDeleteClicked()'><i class='fa fa-check confirmDeleteButton'></i></button>" +
									 //    "<button type='button' class='btn btn-default btn-xs' click='cancelDeleteClicked()' style='margin-left:5px;'><i class='fa fa-times cancelButton'></i></button>" +
									 //    "<span  style='font-size: 11px;'><br>Are you sure?</span>";
									 //jQuery(opt.$selected).html(jQuery(content));
									 return true;
									 }
									 },*/
									"sep2": "---------",
									"addChildDataClass": {name: "Add DataClass", callback: function (itemKey, opt) {
										var self = jQuery(this);
										selectNode(self);
										//Also call the external method if any provided
										if (scope.onSelect) {
											scope.onSelect(event, self.data("element"));
										}

										var id = this.data("id");
										var type = this.data("elementType");
										if (scope.onAddChildDataClass) {
											scope.onAddChildDataClass(event, id, type);
										}
										return true;
									}},
									"addChildDataType": {name: "Add DataType",
										//disable the element if the item is a dataModel (dataModel does NOT have dataElement)
										disabled: function(key, opt){
											var type = this.data("elementType");
											if(type == "dataClass") {
												return true;
											}
											return false;
										},
										callback: function (itemKey, opt) {
											var self = jQuery(this);
											selectNode(self);
											//Also call the external method if any provided
											if (scope.onSelect) {
												scope.onSelect(event, self.data("element"));
											}

											var dataModelId = this.data("id");
											var type = this.data("elementType");
											if (scope.onAddDataType) {
												scope.onAddDataType(event, dataModelId);
											}
											return true;
										}},
									"addDataElement": {name: "Add DataElement",
										//disable the element if the item is a dataModel (dataModel does NOT have dataElement)
										disabled: function(key, opt){
											var type = this.data("elementType");
											if(type == "dataModel") {
												return true;
											}
											return false;
										},
										callback: function (itemKey, opt) {
											var self = jQuery(this);
											selectNode(self);
											//Also call the external method if any provided
											if (scope.onSelect) {
												scope.onSelect(event, self.data("element"));
											}

											var dataClassId = this.data("id");
											if (scope.onAddDataElement) {
												scope.onAddDataElement(event, dataClassId);
											}
											return true;
										}
									}
								}
							}
							// there's more, have a look at the demos and docs...
						);
					}else {

					}


				}
				else{
					var treeClass = "ul." + scope.treeName + "_tree";
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

				//Hide all the nodes that don't have the searched str in their text
				rootUL.find("li > span.elementName:not(:containsi('"+ str +"'))").parents("li:not(myTreeEmptyRoot)").hide();

				//Show all the nodes that HAVE the searched str in their text
				rootUL.find("li > span.elementName:containsi('"+ str +"')").parents("li").show();

				//Show all the child nodes of the parent nodes that HAVE the searched str in their text
				rootUL.find("li > span.elementName:containsi('"+ str +"')").parent().find("li").show();
			};


			//remove the highlighted texts in the tree and return it to the normal status
			scope.removeHighlight = function(root) {

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
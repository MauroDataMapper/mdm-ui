angular.module('directives').directive('myTreeSimple', function ($state, $rootScope, $stateParams) {
	return{
		restrict: 'A',
		scope: {
			children: "=",
			onSelect: "&",
			onDbClick:"&",
			onAddChildDataClass:"&",
			onAddDataElement:"&",
			onAddDataType:"&",
			selectElement : "&",
			initialSelectedElement: "=",
			showSpinner:"=",
			collapseRootNodes: '@',
			treeName:"="
		},
		template: '<ul class="root myTree">\
						<li class="myTreeEmptyRoot">\
				  		</li>\
				  </ul>\
				  <div style="width: 100%;height: 100%;position: relative;" class="treeWaitingSpinner" ng-show="showSpinner">\
					<div style="position: absolute;top:30%;left:40%;">\
						<a style="font-size: 75px;" class="themeColor">\
							<i class="fa fa-refresh fa-spin"></i>\
						</a>\
					</div>\
				  </div>',
		link: function (scope, element, attrs) {

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

			if(scope.selectElement){
				scope.selectElement = scope.selectElement();
			}

			//Select the element on the tree if there is an id on the stateParam
			if (scope.selectOnStateChange && scope.selectOnStateChange=="true" && $stateParams) {
				var id = $stateParams.id;
				var elementType = "dataModel";
				if ($state.current.name == "twoSidePanel.catalogue.dataClass") {
					elementType = "dataClass"
				}
				openNodeAndParents(id, elementType);
			}

			spinner.hide();

			scope.$watch("children.length", function (newVal, oldVal, scope) {

				//if there are not any models, then make the model tree empty
				if (newVal != undefined && newVal === 0 ){
					spinner.hide();
					rootUL.html('');//First remove all elements if any exist, in case we are reloading it ($reloadModelTreeView broadcast)
					return;
				}

				if (newVal && newVal != oldVal) {

					spinner.show();
					rootUL.html('');//First remove all elements if any exist, in case we are reloading it ($reloadModelTreeView broadcast)
					for (var i = 0; i < scope.children.length; i++) {
						var node = createNode(0, scope.children[i], true);
						if(scope.collapseRootNodes) {
							openLiElement(node);
						}
						rootUL.append(node);
					}
					spinner.hide();


					//Select the element on the tree if initialSelectedElement is passed

					if(scope.initialSelectedElement) {
						openNodeAndParents(scope.initialSelectedElement.id, scope.initialSelectedElement.type);
					};
				}
			});


			scope.$watch("showSpinner", function(newVal, oldVal, scope){
				//if there are not any models, then make the model tree empty
				if (newVal === true ){
					spinner.show();
					return;
				}
				spinner.hide();
				return;
			})

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
				if (level == 0) {
					li.data("nodeObject", node);
					li.data("id", node.id);
					li.data("elementType", "dataModel");
					li.data("id-" + node.id + "-" + "dataModel", "id-" + node.id + "-" + "dataModel");
				} else {
					li.data("nodeObject", node);
					li.data("id", node.id);
					li.data("elementType", "dataClass");
					li.data("id-" + node.id + "-" + "dataClass", "id-" + node.id + "-" + "dataClass");
				}
			}

			function findChildrenNodeName(level) {

				return "childDataClasses";

				// if (level == 0) {
				// 	return "subClasses";
				// }
				// return "childClasses";
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

			function openLiElement(li) {
				var plus = li.children("i.fa-minus,i.fa-plus");
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
				//if another element is already selected, then
				// remove its 'selectedElement' class
				// change its font-weight to Normal
				if (currentSelectedLi.length > 0) {
					currentSelectedLi.removeClass("selectedElement");
					currentSelectedLi.children("span.elementName").css("font-weight", "normal");
				}

				//add 'selectedElement' class to the selected 'li' then we can find it later
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

				//if in the Comparison, this element is deleted
				if(node.status == "deleted"){
					elementName.addClass("deletedElement");
				}else if(node.status == "updated"){
					elementName.addClass("updatedElement");
				}else if(node.status == "new"){
					elementName.addClass("newElement");
				}

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
						scope.onSelect(event,self);
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
										scope.onSelect(event,prevLI);
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
										scope.onSelect(event,parentLI);
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
										scope.onSelect(event,firstChild);
									}
								}
							} else {
								var nextLI = jQuery(this).next("li");
								if (nextLI && nextLI.length > 0) {
									selectNode(nextLI);
									jQuery(nextLI).focus();
									//changeState(nextLI);
									if(scope.onSelect) {
										scope.onSelect(event,nextLI);
									}
								} else {
									//if has parent
									var nextParentsLISibling = jQuery(this).parent("ul").parent("li").next("li");
									if (nextParentsLISibling && nextParentsLISibling.length > 0) {
										selectNode(nextParentsLISibling);
										jQuery(nextParentsLISibling).focus();
										//changeState(nextParentsLISibling);
										if(scope.onSelect) {
											scope.onSelect(event,nextParentsLISibling);
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

		}
	}
});
angular.module('directives').directive('foldersTree2',  function ($state, $rootScope, $stateParams, securityHandler, resources, jQueryExtender, $q, stateHandler, $timeout, messageHandler, favouriteHandler) {
    return {
        restrict: 'E',
        scope: {
            node: "=",
            searchCriteria: "=",
            defaultCheckedMap: "=",

            onNodeClick: '=',
            onNodeDbClick:'=',
            onNodeChecked:'=',

            onAddFolder: '=',
            onAddDataModel: '=',
            onAddChildDataClass: '=',
            onAddChildDataType: '=',
            onAddChildDataElement: '=',
            onDeleteFolder: "=",

            onCompareTo: '=',
            loadModelsToCompare: '=',

            doNotShowDataClasses: '=',
            doNotShowTerms: '=',
            justShowFolders: '=',
            showCheckboxFor:'=',//it is an array of domainTypes like ['DataClass','DataModel','Folder']
            propagateCheckbox:"=",
            enableDrag:'=',
            enableDrop:'=',
            enableContextMenu:'=',
            enableLocalStorage:'=',
            expandOnNodeClickFor: '=',
            doNotMakeSelectedBold: '=',

            inSearchMode:'='
        },
        templateUrl: './foldersTree2.html',
        link: function (scope, element, attrs) {

            // //if you want to know when the tree render is done!
            // $timeout(function () {
            //     //DOM has finished rendering
            // });

        },
        controller: function ($scope) {

            $scope.selectedNode = null;


            $scope.loadOpenNodes = function () {
                if($scope.enableLocalStorage !== true){
                    $rootScope.openNodes = {};
                }else {
                    $rootScope.openNodes = JSON.parse(localStorage.getItem("openNodes")) || {};
                }
            };
            $scope.updateOpenNodes = function (element, open) {

                if (["Folder"].indexOf(element.domainType) === -1 || $scope.enableLocalStorage !== true) {
                    return;
                }
                if (open) {
                    $rootScope.openNodes[element.id] = true;
                } else {
                    delete $rootScope.openNodes[element.id];
                }
                localStorage.setItem("openNodes", JSON.stringify($rootScope.openNodes));
            };
            $scope.readNodeOpens = function (element) {
                if (["Folder"].indexOf(element.domainType) === -1) {
                    return false;
                }
                return !!(element && element.id && $rootScope.openNodes[element.id] === true);
            };
            $scope.loadOpenNodes();

            $scope.isOpen = function (node) {
                if (node.open === true) {
                    return true;
                }
                if (node.open === false) {
                    return false;
                }
                //it's undefined
                if (node.open === undefined) {
                    node.open = $scope.readNodeOpens(node);
                }
                return node.open;
            };
            $scope.hasChildren = function (node) {
                return (node.children && node.children.length !== 0) || node.hasChildren || node.hasChildFolders;
            };



            $scope.loadFavourites = function () {
                var fs = favouriteHandler.get();
                $scope.favourites  = {};
                angular.forEach(fs, function (f) {
                    $scope.favourites[f.id] = f;
                });
            };

            $scope.loadModelTree = function (model) {
                var deferred = $q.defer();

                if(model.domainType === "DataModel" || model.domainType === "DataClass"){
                    resources.tree.get(model.id).then(function (result) {
                        deferred.resolve(result);
                    }, function (error) {
                        deferred.reject(error);
                    });
                }

                if(model.domainType === "Terminology"){
                    resources.terminology.get(model.id, "tree").then(function (result) {
                        deferred.resolve(result);
                    }, function (error) {
                        deferred.reject(error);
                    });
                }

                if(model.domainType === "Term"){
                    resources.term.get(model.terminology, model.id, "tree").then(function (result) {
                        deferred.resolve(result);
                    }, function (error) {
                        deferred.reject(error);
                    });
                }

                return deferred.promise;
            };
            $scope.expand = function (node) {
                var deferred = $q.defer();

                if (node.domainType === "Folder") {

                    if($scope.justShowFolders){
                        resources.folder.get(node.id, "folders").then(function (result) {
                            deferred.resolve(result.items);
                        });
                    }else {
                        deferred.resolve(node.children);
                    }
                    return deferred.promise;
                }

                $scope.loadModelTree(node).then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    node.processing = false;
                    deferred.reject(error);
                });
                return deferred.promise;
            };
            $scope.toggleExpand = function (node) {


                //When it's in search mode, it has all the children and
                //children has the values. So we don't need to call backend
                if($scope.inSearchMode ){
                    node.open = !node.open;
                    $scope.updateOpenNodes(node, node.open);
                    return;
                }


                if (node.open === undefined) {
                    node.processing = true;
                    $scope.expand(node).then(function (data) {
                        node.children = data;
                        node.processing = false;
                        node.open = true;
                        $scope.updateOpenNodes(node, true);
                    });
                } else {
                    if (!node.open) {
                        node.processing = true;
                        $scope.expand(node).then(function (data) {
                            node.children = data;
                            node.processing = false;
                            node.open = true;

                            //if it's checked then check all sub nodes
                            if(node.checked && $scope.propagateCheckbox){
                                angular.forEach(node.children, function (child) {
                                    child.checked = true;
                                    child.disableChecked = true;
                                });
                            }else{
                                //if it's NOT checked then check and see if the children is in checkedList
                                angular.forEach(node.children, function (child) {
                                    if($scope.checkedList[child.id]){
                                        child.checked = true;
                                    }
                                });
                            }
                            $scope.updateOpenNodes(node, true);
                        });
                    } else {
                        node.open = false;
                        $scope.updateOpenNodes(node, false);
                    }
                }
            };

            $scope.nodeClick = function (event, node) {
                var e = $scope.find(node, null, node.id);

                //it's multiple select
                if (event && (event.ctrlKey || (event.metaKey && !event.ctrlKey))) {

                }

                if(!$scope.doNotMakeSelectedBold) {
                    node.selected = !node.selected;

                    if ($scope.selectedNode) {
                        $scope.selectedNode.selected = false;
                    }
                }
                $scope.selectedNode = node;


                if($scope.expandOnNodeClickFor){
                    if($scope.expandOnNodeClickFor.indexOf(node.domainType)!== -1){
                        $scope.toggleExpand(node);
                    }
                }

                if ($scope.onNodeClick) {
                    $scope.onNodeClick(node);
                }
            };

            $scope.nodeDbClick = function (event, node) {
                if ($scope.onNodeDbClick) {
                    $scope.onNodeDbClick(node);
                }
            };


            $scope.find = function (node, parent, ID) {
                if (node.id === ID) {
                    return {node:node, parent:parent};
                }
                if (node.domainType === "Folder" || node.domainType === "DataModel" || node.domainType === "DataClass" || node.isRoot === true) {
                    if (!node.children) {
                        return null;
                    }
                    var i = 0;
                    while (i < node.children.length ) {
                        var result = $scope.find(node.children[i], node, ID);
                        if (result !== null) {
                            return result;
                        }
                        i++;
                    }
                }
                return null;
            };

            $scope.findChildIndex = function (parent, child) {
                for (var i = 0; i < parent.children.length; i++) {
                    if(child.id === parent.children[i].id){
                        return i;
                    }
                }
                return null;
            };

            //Drag/Drop ************************************************
            function handleDraggable() {
                jQuery(".draggableNode").draggable({
                    scroll: true,
                    scrollSensitivity: 100,
                    scrollSpeed: 100,
                    helper: function (event, ui) {
                        return jQuery(this).find('span.nodeLabel').clone();
                    },
                    start: function (event, ui) {
                        var hasAccess = securityHandler.showIfRoleIsWritable();
                        if(!hasAccess){
                            event.preventDefault();
                            return false;
                        }
                    }
                });
            }

            function handleDroppable() {
                jQuery(".draggableNode").droppable({
                    greedy: true,
                    drop: function (event, ui) {
                        jQuery(this).find("span.nodeLabel").removeClass("draggableHover");

                        var source = {
                            domainType: ui.draggable.attr("data-domainType"),
                            id: ui.draggable.attr("data-id"),
                            label: ui.draggable.attr("data-label")
                        };
                        var target  = {
                            domainType: jQuery(this).attr("data-domainType"),
                            id: jQuery(this).attr("data-id"),
                            label: jQuery(this).attr("data-label")
                        };

                        source.element = $scope.find($scope.node, null, source.id);
                        target.element = $scope.find($scope.node, null, target.id);

                        if (source.domainType === "Folder" && target.domainType === "Folder" ){

                            //do not copy a folder to its own parent folder
                            if(source.element.parent.id === target.id){
                                event.stopPropagation();
                                return false;
                            }

                            resources.folder.put(source.id, null, {resource:{parentFolder:target.id}}).then(function (result) {
                                messageHandler.showSuccess('Folder moved successfully.');

                                //remove from source parent
                                var srcIndex =  $scope.findChildIndex(source.element.parent, source.element.node);
                                source.element.parent.children.splice(srcIndex, 1);
                                if(source.element.parent.children.length === 0){
                                    source.element.parent.hasChildren = false;
                                    $scope.updateOpenNodes(source.element.parent, false);
                                    source.element.parent.open = false;
                                }
                                //add it to target parent
                                target.element.node.children = target.element.node.children || [];
                                target.element.node.children.push(source.element.node);

                                $timeout(function () {
                                    handleDraggable();
                                    handleDroppable();
                                }, 400);


                            }).catch(function (error) {
                                messageHandler.showError('There was a problem moving the Folder.', error);
                            });
                        }
                        else if (source.domainType === "DataModel" && target.domainType === "Folder"){

                            //do not copy a dataModel to its own parent folder
                            if(source.element.parent.id === target.id){
                                event.stopPropagation();
                                return false;
                            }

                            resources.dataModel.put(source.id, "folder/"+target.id).then(function (result) {
                                messageHandler.showSuccess('Data Model moved successfully.');

                                //remove from source parent
                                var srcIndex =  $scope.findChildIndex(source.element.parent, source.element.node);
                                source.element.parent.children.splice(srcIndex, 1);
                                if(source.element.parent.children.length === 0){
                                    source.element.parent.hasChildren = false;
                                    $scope.updateOpenNodes(source.element.parent, false);
                                    source.element.parent.open = false;
                                }
                                //add it to target parent
                                target.element.node.children = target.element.node.children || [];
                                target.element.node.children.push(source.element.node);

                                $timeout(function () {
                                    handleDraggable();
                                    handleDroppable();
                                }, 400);


                            }).catch(function (error) {
                                messageHandler.showError('There was a problem moving the Data Model.', error);
                            });
                        }
                        else if (source.domainType === "Terminology" && target.domainType === "Folder"){

                            //do not copy a terminology to its own parent folder
                            if(source.element.parent.id === target.id){
                                event.stopPropagation();
                                return false;
                            }

                            resources.folder.put(target.id, "terminologies/"+source.id).then(function (result) {
                                messageHandler.showSuccess('Terminology moved successfully.');

                                //remove from source parent
                                var srcIndex =  $scope.findChildIndex(source.element.parent, source.element.node);
                                source.element.parent.children.splice(srcIndex, 1);
                                if(source.element.parent.children.length === 0){
                                    source.element.parent.hasChildren = false;
                                    $scope.updateOpenNodes(source.element.parent, false);
                                    source.element.parent.open = false;
                                }
                                //add it to target parent
                                target.element.node.children = target.element.node.children || [];
                                target.element.node.children.push(source.element.node);

                                $timeout(function () {
                                    handleDraggable();
                                    handleDroppable();
                                }, 400);


                            }).catch(function (error) {
                                messageHandler.showError('There was a problem moving the Data Model.', error);
                            });
                        }
                        else if(source.domainType === "Folder" && !source.element.parent.isRoot && target.element.node.isRoot ){




                            resources.folder.put(source.id, null, {resource:{parentFolder:null}}).then(function (result) {
                                messageHandler.showSuccess('Folder moved successfully.');

                                //remove from source parent
                                var srcIndex =  $scope.findChildIndex(source.element.parent, source.element.node);
                                source.element.parent.children.splice(srcIndex, 1);
                                if(source.element.parent.children.length === 0){
                                    source.element.parent.hasChildren = false;
                                    $scope.updateOpenNodes(source.element.parent, false);
                                    source.element.parent.open = false;
                                }
                                //add it to target parent
                                target.element.node.children = target.element.node.children || [];
                                target.element.node.children.push(source.element.node);

                                $timeout(function () {
                                    handleDraggable();
                                    handleDroppable();
                                }, 400);

                            }).catch(function (error) {
                                messageHandler.showError('There was a problem moving the Folder.', error);
                            });
                        }

                    },
                    over: function (event, ui) {

                        var sourceDomainType = ui.draggable.attr("data-domainType");
                        var targetDomainType  = jQuery(this).attr("data-domainType");

                        if( ["DataModel","Terminology"].indexOf(sourceDomainType) !==-1 && targetDomainType === "Folder"){
                            jQuery(this).find("span.nodeLabel").addClass("draggableHover");
                        }

                        if(sourceDomainType === "Folder" && targetDomainType === "Folder"){
                            jQuery(this).find("span.nodeLabel").addClass("draggableHover");
                        }

                    },
                    out: function (event, ui) {
                        jQuery(this).find("span.nodeLabel").removeClass("draggableHover");
                    }
                });
            }

            $timeout(function () {
                if($scope.enableDrag) {
                    handleDraggable();
               }
               if($scope.enableDrop) {
                   handleDroppable();
               }
                $scope.loadFavourites();
            }, 400);


            //***********************************************************
            $scope.checkedList = $scope.defaultCheckedMap || {};
            $scope.nodeChecked = function(child){
                var element = $scope.find($scope.node, null, child.id);

                $scope.markChildren(child, child, child.checked);

                if(child.checked) {
                    $scope.checkedList[element.node.id] = element;
                }else{
                    delete $scope.checkedList[element.node.id];
                }
                if($scope.onNodeChecked){
                    $scope.onNodeChecked(element.node, element.parent, $scope.checkedList);
                }
            };
            $scope.markChildren = function(node, root, status){
                node.checked = status;
                delete $scope.checkedList[node.id];

                if($scope.propagateCheckbox) {
                    angular.forEach(node.children, function (n) {
                        n.disableChecked = status;
                        $scope.markChildren(n, null, status);
                    });
                }
            };
            //************************************************************



            $scope.loadVersions = function (dataModel) {
                var deferred = jQuery.Deferred();
                if ($scope.loadModelsToCompare) {
                    $scope.loadModelsToCompare(dataModel).then(function (targetModels) {
                        deferred.resolve(targetModels);
                    })
                } else {
                    deferred.resolve([]);
                }
                return deferred.promise();
            };

            function dataModelContextMenu(dataModel, targetVersions) {
                var subMenu = [
                    [   'Open (New Window)',
                        function ($itemScope,$event) {
                            stateHandler.NewWindow("datamodel", {id: dataModel.id});
                        }
                    ]
                ];

                var favourites = [];
                if(!$scope.favourites[dataModel.id]){
                    favourites.push(
                        [   'Add to Favourites',
                            function ($itemScope,$event) {
                                favouriteHandler.add(dataModel);
                                $scope.loadFavourites();
                            }
                        ]
                    );
                }else{
                    favourites.push(
                        [   'Remove from Favourites',
                            function ($itemScope,$event) {
                                favouriteHandler.remove(dataModel);
                                $scope.loadFavourites();
                            }
                        ]
                    );
                }

                favourites.push(null);
                subMenu = subMenu.concat(favourites);


                if(!dataModel.finalised && !dataModel.deleted){
                    var actions = [
                        [   'Add DataClass',
                            function ($itemScope,$event) {
                                if ($scope.onSelect) {
                                    $scope.onSelect($event, dataModel);
                                }
                                if ($scope.onAddChildDataClass) {
                                    $scope.onAddChildDataClass($event, dataModel);
                                }
                            }
                        ],
                        [   'Add DataType',
                            function ($itemScope,$event) {
                                if ($scope.onSelect) {
                                    $scope.onSelect($event, dataModel);
                                }
                                if ($scope.onAddChildDataType) {
                                    $scope.onAddChildDataType($event, dataModel);
                                }
                            }
                        ],
                        null
                    ];
                    subMenu = subMenu.concat(actions);
                }


                var compare =  [
                    'Compare...',
                    [
                        [   "Another Data Model",
                            function ($itemScope,$event) {
                                if ($scope.onSelect) {
                                    $scope.onSelect($event, dataModel);
                                }
                                if ($scope.onCompareTo) {
                                    $scope.onCompareTo(dataModel, null);
                                }
                            }
                        ]
                    ]
                ];
                angular.forEach(targetVersions, function (targetVersion) {
                    compare[1].push([
                        targetVersion.label + "<span style='padding-left: 5px;font-style:italic;font-size: 11px;'>" + targetVersion.documentationVersion + "</span>",
                        function ($itemScope,$event) {
                            if ($scope.onSelect) {
                                $scope.onSelect($event, dataModel);
                            }

                            if ($scope.onCompareTo) {
                                $scope.onCompareTo(dataModel, targetVersion);
                            }
                            return true;
                        }
                    ]);
                });
                subMenu.push(compare);
                return subMenu;
            }

            function dataClassContextMenu(dataClass) {
                var subMenu = [
                    [   'Open (New Window)',
                        function ($itemScope,$event) {
                            stateHandler.NewWindow("dataclass", {id: dataClass.id, dataModelId:dataClass.dataModel, dataClassId:dataClass.parentDataClass});
                        }
                    ],
                    [   'Add DataClass',
                        function ($itemScope,$event) {
                            if ($scope.onSelect) {
                                $scope.onSelect($event, dataClass);
                            }
                            if ($scope.onAddChildDataClass) {
                                $scope.onAddChildDataClass($event, dataClass);
                            }
                        }
                    ],
                    [   'Add DataElement',
                        function ($itemScope,$event) {
                            if ($scope.onSelect) {
                                $scope.onSelect($event, dataClass);
                            }
                            if ($scope.onAddChildDataElement) {
                                $scope.onAddChildDataElement($event, dataClass);
                            }
                        }
                    ]
                ];
                return subMenu;
            }

            function folderContextMenu(folder) {
                var subMenu = [
                    [   'Add Folder',
                        function ($itemScope,$event) {
                            if ($scope.onAddFolder) {
                                $scope.onAddFolder($event, folder).then(function (result) {

                                    if ($scope.selectedNode) {
                                        $scope.selectedNode.selected = false;
                                    }
                                    result.selected = true;
                                    $scope.selectedNode = result;

                                }, function (error) {

                                });
                            }
                        }
                    ],
                    [   'Add Data Model',
                        function ($itemScope,$event) {
                            if ($scope.onAddDataModel) {
                                $scope.onAddDataModel($event, folder);
                            }
                        }
                    ]
                ];
                if($rootScope.isAdmin()){
                    subMenu.push(null);
                    if(!folder.deleted) {
                        subMenu.push([
                            'Mark as deleted',
                            function ($itemScope, $event) {
                                if ($scope.onDeleteFolder) {
                                    $scope.onDeleteFolder($event, folder, false);
                                }
                            }
                        ]);
                    }
                    subMenu.push([
                        'Delete <span class="errorMessage">permanently</span>',
                        function ($itemScope,$event) {
                            if ($scope.onDeleteFolder) {
                                $scope.onDeleteFolder($event, folder, true);
                            }
                        }
                    ]);
                }
                return subMenu;
            }


            function terminologyContextMenu(terminology) {
                var subMenu = [
                    [   'Open (New Window)',
                        function ($itemScope,$event) {
                            stateHandler.NewWindow("terminology", {id: terminology.id});
                        }
                    ]
                ];

                var favourites = [];
                if(!$scope.favourites[terminology.id]){
                    favourites.push(
                        [   'Add to Favourites',
                            function ($itemScope,$event) {
                                favouriteHandler.add(terminology);
                                $scope.loadFavourites();
                            }
                        ]
                    );
                }else{
                    favourites.push(
                        [   'Remove from Favourites',
                            function ($itemScope,$event) {
                                favouriteHandler.remove(terminology);
                                $scope.loadFavourites();
                            }
                        ]
                    );
                }
                subMenu = subMenu.concat(favourites);
                return subMenu;
            }


            $scope.menuOptions = [];
            $scope.rightClick = function (child) {

                if(!$scope.enableContextMenu){
                    $scope.menuOptions = null;
                    return;
                }

                var hasAccess = securityHandler.showIfRoleIsWritable();
                if(!hasAccess){
                    $scope.menuOptions = null;
                    return;
                }

                if(child.domainType === "Folder"){
                    $scope.menuOptions = folderContextMenu(child);
                }else if (child.domainType === "DataModel"){

                    var deferred = $q.defer();
                    $scope.menuOptions = deferred.promise;
                    $scope.loadVersions(child).then(function (targetVersions) {
                        var menu = dataModelContextMenu(child, targetVersions);
                        deferred.resolve(menu);
                    });

                }else if (child.domainType === "DataClass"){
                    $scope.menuOptions = dataClassContextMenu(child);
                }else if (child.domainType === "Terminology"){
                    $scope.menuOptions = terminologyContextMenu(child);
                }
            };

            $scope.$on("favourites", function (event, action, dataModel) {
                $scope.loadFavourites();
            });


        }
    };
});

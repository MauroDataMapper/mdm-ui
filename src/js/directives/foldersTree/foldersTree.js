angular.module('directives').directive('foldersTree',  function ($compile, $rootScope, stateHandler) {
    return {
        restrict: 'E',
        scope: {
            type: '=', //static, dynamic
            val: '=',
            parentData: '=',
            childElementName: '=',
            treeName: '=',

            onNodeExpand: '=',
            onNodeClick: '=',

            onAddFolder: '=',
            onAddDataModel: '=',
            onAddChildDataClass: '=',
            onAddChildDataType: '=',
            onAddChildDataElement: '=',
            onDeleteFolder: "=",

            onCompareTo: '=',
            loadModelsToCompare: '='
        },

        link: function (scope, element, iAttrs, ctrl) {

            scope.loadHistory = function () {
                $rootScope.foldersTreeHistory =  JSON.parse(localStorage.getItem("foldersTreeHistory")) || {};
            };
            scope.updateHistory = function (element, open) {
                //Just keep history of Folder and DataModels
                if(["DataModel", "Folder"].indexOf(element.domainType) === -1){
                    return;
                }

                $rootScope.foldersTreeHistory[element.id] = {'isOpen': open};
                localStorage.setItem("foldersTreeHistory", JSON.stringify($rootScope.foldersTreeHistory));
            };
            scope.getHistory = function (element) {
                //Just keep history of Folder and DataModels
                if(["DataModel", "Folder"].indexOf(element.domainType) === -1){
                    return;
                }

                if(element && element.id && $rootScope.foldersTreeHistory[element.id]){
                    return $rootScope.foldersTreeHistory[element.id];
                }
                return {};
            };



            scope.buildIt = function () {
                if (scope.childElementName && scope.val && scope.val[scope.childElementName]) {
                    scope.val.items = [].concat(scope.val[scope.childElementName]);
                }
                if (scope.val && scope.val.close !== false) {
                    scope.val.close = true;
                }
                var history =  scope.getHistory(scope.val);
                if(scope.val && history && history.isOpen === true){
                    scope.val.close = false;
                }

                var template = '';
                if (!scope.val.isRoot) {
                    template = '<span style="padding-right:9px;"></span>';
                    if ((angular.isArray(scope.val.items) && scope.val.items.length > 0) || (scope.val.hasChildren)) {

                        template =
                            [
                                "<i ng-class=\"{'fa':true, 'fa-plus':val.close ,'fa-minus':!val.close,'plusMinusElement':true,'foldersTree':true}\"",
                                "style=\"margin-right: 3px; font-size: 10px;font-weight: normal\"",
                                "ng-click='toggleExpand()'>",
                                "</i>"
                            ].join('\n');
                    }

                    if(scope.val.domainType === "Folder"){
                        template += "<i ng-class=\"{'foldersTree folderTreeIcon fa':true,'themeColor': !val.deleted, 'deletedFolder':val.deleted , 'fa-folder':val.close, 'fa-folder-open':!val.close}\"></i>";
                    }else if(scope.val.domainType === "DataModel"){
                        var iconType = "fa fa-file-text-o";
                        if(scope.val.type === "Data Asset"){
                            iconType = "fa fa-database";
                        }
                        template += "<i class='foldersTree folderTreeIcon themeColor "+iconType+"'></i>";
                    }

                    template +=
                        [
                            "<span ng-class=\"{'nodeLabel':true, 'foldersTree':true, 'created':val.created,",
                            "'deleted':val.deleted, 'selected':val.selected, 'isGhost':val.isGhost, 'modified':val.modified}\"'",
                            "ng-click='nodeClick($event)'>{{val.label}}</span>"
                        ].join('\n');

                } else {
                    scope.val.close = false;
                }
                template +=
                    ["<ul ng-class=\"{'myTree':true, 'foldersTree':true, 'hide':val.close}\">",
                        '<li class="myTreeEmptyRoot foldersTree node" ng-repeat="item in val.items">',
                            '<folders-tree ' +
                                'val="item" ' +
                                'parent-data="val.items" ' +
                                'child-element-name="childElementName" ' +
                                'tree-name="treeName" ' +
                                'type="type"' +
                                'on-node-click="onNodeClick"' +
                                'on-add-folder="onAddFolder"'+
                                'on-add-data-model="onAddDataModel"'+
                                'on-add-child-data-class="onAddChildDataClass"'+
                                'on-add-child-data-type="onAddChildDataType"'+
                                'on-add-child-data-element="onAddChildDataElement"'+
                                'on-delete-folder="onDeleteFolder"'+
                                'on-compare="onCompareTo"'+
                                'load-models-to-compare="loadModelsToCompare"'+
                                'on-node-expand="onNodeExpand">',
                            '</foldersTree>',
                        '</li>',
                        '</ul>'
                    ].join('\n');

                $rootScope.$on(scope.treeName + '-nodeSelected', function (ev, data) {
                    if (scope.val && data.node.id !== scope.val.id && scope.val.selected) {
                        scope.val.selected = false;
                    }
                });

                var newElement = angular.element(template);
                $compile(newElement)(scope);
                element.replaceWith(newElement);


                var nodeLabel = jQuery(newElement[2]);
                nodeLabel.attr("id", scope.val.id);
                nodeLabel.data("mc",scope.val);

                //https://stackoverflow.com/a/26560348/3426603
                //Make $rootScope eventListener to listen just ONCE, as this is a recursive directive
                if(!$rootScope.$$listenerCount["$updateFoldersTree"]) {
                    $rootScope.$on("$updateFoldersTree", function (event, action, element) {
                        if (action === "update") {
                            jQuery("span#" + element.id).data("mc").label = element.label;
                        }
                        if(action === "softDelete"){
                            jQuery("span#" + element.id).data("mc").deleted = true;
                        }
                        if(action === "permanentDelete"){
                            jQuery("span#" + element.id).parent("li").remove();
                        }
                    });


                    //load history just once as it's saved in $rootScope
                    scope.loadHistory();

                }

                if(["Folder","DataModel"].indexOf(scope.val.domainType) !== -1){
                    handleDraggable(nodeLabel);
                    handleDroppable(nodeLabel);
                    initializeContextMenu2();
                }

            };
            scope.buildIt();



            scope.deleteMe = function (index) {
                if (scope.parentData) {
                    var itemIndex = scope.parentData.indexOf(scope.val);
                    scope.parentData.splice(itemIndex, 1);
                }
                scope.val = {};
            };

            scope.toggleExpand = function () {

                if (scope.type === 'static') {
                    scope.val.close = !scope.val.close;
                    scope.updateHistory(scope.val, !scope.val.close);
                    return;
                }

                if (scope.type === 'dynamic') {
                    if (scope.val.close) {
                        if (scope.onNodeExpand) {
                            scope.onNodeExpand(scope.val).then(function (data) {
                                scope.val.items = data;
                                scope.val.close = !scope.val.close;
                                scope.updateHistory(scope.val, !scope.val.close);
                                scope.safeApply();
                            })
                        }
                    } else {
                        scope.val.close = !scope.val.close;
                        scope.updateHistory(scope.val, !scope.val.close);
                    }
                } else {

                }
            };

            scope.nodeClick = function (event) {

                //it's multiple select
                if (event && (event.ctrlKey || (event.metaKey && !event.ctrlKey))) {
                    console.log('ctrl')
                }
                scope.val.selected = !scope.val.selected;
                $rootScope.$broadcast(scope.treeName + '-nodeSelected', {node: scope.val});
                if (scope.onNodeClick) {
                    scope.onNodeClick(scope.val);
                }

            };

            scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

            function handleDraggable(nodeLabel) {
                nodeLabel.draggable({helper: "clone"});
            }

            function handleDroppable(nodeLabel) {
                nodeLabel.droppable({
                    drop: function (event, ui) {
                        nodeLabel.removeClass("draggableHover");

                        if (ui.draggable.hasClass('dataModelTitle')) {

                        }
                    },
                    over: function (event, ui) {
                        nodeLabel.addClass("draggableHover");
                        //open if it's close
                    },
                    out: function (event, ui) {
                        nodeLabel.removeClass("draggableHover");
                    }
                });
            }

            scope.loadVersions = function(dataModel){
                var deferred =  jQuery.Deferred();
                var subItems = {
                    "anotherDataModel":
                        {
                            name: "Another Data Model",
                            className: 'contextCompareToItem',
                            callback: function (itemKey, opt) {
                                if (scope.onSelect) {
                                    scope.onSelect(event, dataModel);
                                }
                                if (scope.onCompareTo) {
                                    scope.onCompareTo(dataModel, null);
                                }
                                return true;
                            }
                        }
                };
                if(scope.loadModelsToCompare){
                    scope.loadModelsToCompare(dataModel).then(function(targetModels){
                        angular.forEach(targetModels, function (targetModel) {
                            subItems[targetModel.label] = {
                                isHtmlName: true,
                                name: targetModel.label + "<span style='padding-left: 5px;font-style:italic;font-size: 11px;'>" + targetModel.documentationVersion + "</span>",
                                callback: function () {
                                    if (scope.onSelect) {
                                        scope.onSelect(event, dataModel);
                                    }
                                    if (scope.onCompareTo) {
                                        scope.onCompareTo(dataModel, targetModel);
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

            function dataModelContext(dataModel) {
                return {
                    "OpenInNewWindow": {
                        name: "Open (New Window)",
                        callback: function (itemKey, opt) {
                            stateHandler.NewWindow("datamodel", {id:dataModel.id});
                            return true;
                        }
                    },
                    "sep1": "---------",
                    "addChildDataClass": {
                        name: "Add DataClass",
                        callback: function (itemKey, opt) {
                            if (scope.onSelect) {
                                scope.onSelect(event, dataModel);
                            }
                            if (scope.onAddChildDataClass) {
                                scope.onAddChildDataClass(event, dataModel);
                            }
                            return true;
                        }
                    },
                    "addChildDataType": {
                        name: "Add DataType",
                        callback: function (itemKey, opt) {
                            if (scope.onSelect) {
                                scope.onSelect(event, dataModel);
                            }
                            if (scope.onAddChildDataType) {
                                scope.onAddChildDataType(event, dataModel);
                            }
                            return true;
                        }
                    },
                    "sep2": "---------",
                    "compareTo": {
                        name: "Compare to...",
                        icon:"  ",//Do NOT remove this, otherwise loading spinner will not be displayed
                        items: scope.loadVersions(dataModel),
                        callback: function (itemKey, opt) {
                             if (scope.onSelect) {
                                scope.onSelect(event, dataModel);
                            }
                            if (scope.onCompareTo) {
                                scope.onCompareTo(dataModel, null);
                            }
                            return true;
                        }
                    }
                };
            }

            function dataClassContext(dataClass) {
                return {
                    "addChildDataClass": {
                        name: "Add DataClass",
                        callback: function (itemKey, opt) {
                            if (scope.onSelect) {
                                scope.onSelect(event, dataClass);
                            }
                            if (scope.onAddChildDataClass) {
                                scope.onAddChildDataClass(event, dataClass);
                            }
                            return true;
                        }
                    },
                    "addDataElement": {
                        name: "Add DataElement",
                        callback: function (itemKey, opt) {
                            if (scope.onSelect) {
                                scope.onSelect(event, dataClass);
                            }
                            if (scope.onAddDataElement) {
                                scope.onAddDataElement(event, dataClass);
                            }
                            return true;
                        }
                    }
                };
            }


            function folderContext(folder) {
                var subMenu = {};
                subMenu = {
                    "addFolder": {
                        name: "Add Folder",
                        callback: function (itemKey, opt) {
                            if (scope.onAddFolder) {
                                scope.onAddFolder(event, folder);
                            }
                            return true;
                        }
                    },
                    "addDataModel": {
                        name: "Add DataModel",
                        callback: function (itemKey, opt) {
                            if (scope.onAddDataModel) {
                                scope.onAddDataModel(event, folder);
                            }
                            return true;
                        }
                    }
                };

                if($rootScope.isAdmin()){
                    angular.extend(subMenu, {"sep1": "---------"});

                    if(!folder.deleted){
                        angular.extend(subMenu, {
                                "softDeleteFolder": {
                                    name: "Mark as deleted",
                                    callback: function (itemKey, opt) {
                                        if (scope.onDeleteFolder) {
                                            scope.onDeleteFolder(event, folder, false);
                                        }
                                        return true;
                                    }
                                }
                        })
                    }
                    angular.extend(subMenu, {
                            "permanentlyDeleteFolder": {
                                name: "Delete permanently",
                                callback: function (itemKey, opt) {
                                    if (scope.onDeleteFolder) {
                                        scope.onDeleteFolder(event, folder, true);
                                    }
                                    return true;
                                }
                            }
                    })
                }
                return subMenu;
            }

            function initializeContextMenu2(){
                jQuery.contextMenu({
                    selector: ".nodeLabel",
                    items: {},
                    build: function ($element) {
                        var options = {
                            callback: function(key, options) {},
                            items: {}
                        };

                        var mcNode = jQuery($element).data("mc");

                        if(mcNode.domainType === "DataModel") {
                            options.items = dataModelContext(mcNode);
                        }
                        if(mcNode.domainType === "DataClass"){
                            options.items = dataClassContext(mcNode);
                        }
                        if(mcNode.domainType === "Folder"){
                            options.items = folderContext(mcNode);
                        }
                        return options;
                    }
                });
            }
        },

        controller: '$scope', function ($scope) {
        }
    };
});

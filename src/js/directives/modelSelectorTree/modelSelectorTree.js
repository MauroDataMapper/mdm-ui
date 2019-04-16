angular.module('directives').directive('modelSelectorTree', function (resources, $document, $q, securityHandler, userSettingsHandler) {
    return {
        restrict: 'E',
        scope: {
            root:"=",
            defaultElements: "=",
            defaultCheckedMap: "=",
            onSelect: "=",
            onCheck:"=",
            ngModel : '=',

            isRequired: "=",
            showValidationError:"=",
            doNotShowDataClasses:"=",
            doNotShowTerms:"=",
            justShowFolders:"=",
            placeholder:"=",

            accepts: "=",
            treeSearchDomainType: "=",//"Folder" or "DataClass" or "DataModel" use as DomainType=xxx when searching in tree/search?domainType=DataModel
            readOnlySearchInput: "=",

            multiple: "=",
            processing:"=",
            hideSelectedElements:"=",
            alwaysShowTree:"=",
            showCheckboxFor:"=", //['DataClass','DataModel','Folder']"
            propagateCheckbox:"=",
            usedInModalDialogue:"=",
            doNotApplySettingsFilter: "=",
        },
        templateUrl: './modelSelectorTree.html',

        link: function (scope, element, attrs) {

        },
        controller: function ($scope) {

            $scope.showTree = $scope.alwaysShowTree;

            $scope.placeholderStr = $scope.placeholder ? $scope.placeholder : "Select";


            $scope.loadFolder = function (folder) {
                var id = (folder && folder.id) ? folder.id : null;
                $scope.loading = true;
                resources.folder.get(id, null, {all:true, sortBy:"label"}).then(function (data) {
                    $scope.loading = false;
                    $scope.rootNode = {
                        children: data.items,
                        isRoot: true
                    };
                    $scope.filteredRootNode = angular.copy($scope.rootNode);

                }, function (error) {
                    $scope.loading = false;
                });
            };



            $scope.loadTree = function (model) {
                var id = (model && model.id) ? model.id : null;
                $scope.loading = true;


                var options = {};

                if(!$scope.doNotApplySettingsFilter && securityHandler.isLoggedIn()){
                    if(userSettingsHandler.get("includeSupersededDocModels") || false){
                        options = {
                            queryStringParams : {
                                includeModelSuperseded: true,
                            }
                        };
                    }
                }else{
                    options = {
                        queryStringParams : {
                            includeDocumentSuperseded: true,
                            includeModelSuperseded: true,
                            includeDeleted: true
                        }
                    };
                }


                resources.tree.get(id, null , options).then(function (data) {
                    $scope.loading = false;
                    $scope.rootNode = {
                        children: data,
                        isRoot: true
                    };
                    $scope.filteredRootNode = angular.copy($scope.rootNode);

                    if($scope.defaultCheckedMap){
                        $scope.markChildren($scope.filteredRootNode);
                    }

                }, function (error) {
                    $scope.loading = false;
                });
            };


            $scope.reload = function () {
                if($scope.justShowFolders) {
                    $scope.loadFolder($scope.root);
                }else{
                    $scope.loadTree($scope.root);
                }
            };
            $scope.reload();


            $scope.markChildren = function(node){
                if($scope.defaultCheckedMap[node.id]){
                    node.checked = true;
                }
                if($scope.propagateCheckbox) {
                    angular.forEach(node.children, function (n) {
                        n.disableChecked = status;
                        $scope.markChildren(n, null, status);
                    });
                }
            };


            $scope.$watch('defaultElements', function (newValue, oldValue, scope) {
                if (newValue !== null && newValue !== undefined) {
                    $scope.selectedElements = newValue;
                    if(!$scope.multiple) {
                        $scope.searchCriteria = $scope.selectedElements[0] ? $scope.selectedElements[0].label : null;
                    }
                }
            });

            $scope.$watch('searchCriteria', function (newValue, oldValue, scope) {
                if (newValue !== null && newValue !== undefined) {

                    if(!$scope.multiple){
                        if($scope.selectedElements && $scope.selectedElements.length>0){
                            var label = $scope.selectedElements[0] ? $scope.selectedElements[0].label : "";
                            if($scope.selectedElements && newValue.trim().toLowerCase() === label.trim().toLowerCase() && label.trim().toLowerCase()!==""){
                                return;
                            }
                        }
                    }

                    // $scope.filteredRootNode = angular.copy($scope.rootNode);
                    // $scope.filterDataModels($scope.filteredRootNode, newValue);
                    // $scope.showTree = true;


                    var options = {
                        queryStringParams : {
                            domainType: $scope.treeSearchDomainType,
                            includeDocumentSuperseded: true,
                            includeModelSuperseded: true,
                            includeDeleted: true
                        }
                    };


                    if($scope.searchCriteria.trim().length > 0){
                        $scope.inSearchMode = true;
                        resources.tree.get(null, "search/" + $scope.searchCriteria, options).then(function (result) {
                            $scope.filteredRootNode = {
                                "children": result,
                                isRoot: true
                            };
                        });
                    }else{
                        $scope.inSearchMode = false;
                        $scope.reload();
                    }

                }
            });

            $scope.toggleTree = function () {
                if($scope.alwaysShowTree){
                    $scope.showTree = true;
                    return;
                }
                $scope.showTree = !$scope.showTree;
            };

            $scope.onNodeClick = function (node) {
                $scope.click(node);
            };

            $scope.onNodeDbClick = function (node) {
                $scope.click(node);
            };

            $scope.click = function(node){
                $scope.hasValidationError = false;

                if ($scope.accepts && $scope.accepts.indexOf(node.domainType) === -1) {
                    $scope.checkValidationError();
                    return;
                }

                if($scope.elementExists(node)){
                    $scope.checkValidationError();
                    return;
                }

                if(!$scope.multiple){
                    $scope.selectedElements = null;
                }

                if(!$scope.selectedElements){
                    $scope.selectedElements = [];
                }

                $scope.selectedElements.push(node);
                $scope.safeApply();


                if ($scope.onSelect) {
                    $scope.onSelect($scope.selectedElements);
                }
                if(!$scope.multiple) {
                    $scope.searchCriteria = $scope.selectedElements[0].label;
                    $scope.showTree = false;
                }

                $scope.ngModel = $scope.selectedElements;
                $scope.checkValidationError();
            };


            $scope.onNodeChecked = function(node, parent, checkedList){
                if($scope.onCheck){
                    $scope.onCheck(node, parent, checkedList);
                }
            };

            $scope.checkValidationError = function(){
                $scope.hasValidationError = false;
                if($scope.isRequired && $scope.showValidationError){

                    if($scope.multiple && $scope.selectedElements.length === 0){
                        $scope.hasValidationError = true;
                    }
                    if(!$scope.multiple && (!$scope.selectedElements || ($scope.selectedElements && $scope.selectedElements.length === 0))){
                        $scope.hasValidationError = true;
                    }
                }
            };

            $scope.filterDataModels = function (node, term) {
                if (node.domainType === "Folder" || node.isRoot === true) {
                    if (node.children === undefined || node.deleted) {
                        return false;
                    }
                    var i = node.children.length - 1;
                    while (i >= 0) {
                        if (!$scope.filterDataModels(node.children[i], term)) {
                            node.children.splice(i, 1);
                        }
                        i--;
                    }
                    return node.children.length > 0;
                }
                if (node.domainType === "DataModel") {
                    return !(node.deleted || node.label.trim().toLowerCase().indexOf(term.trim().toLowerCase()) === -1);
                }

                if (node.domainType === "DataClass") {
                    return !(node.label.trim().toLowerCase().indexOf(term.trim().toLowerCase()) === -1);
                }

            };

            $scope.cleanSelection = function () {
                if(!$scope.multiple) {
                    $scope.selectedElements = [];
                    $scope.safeApply();

                    $scope.ngModel = $scope.selectedElements;
                    $scope.checkValidationError();

                    if ($scope.onSelect) {
                        $scope.onSelect($scope.selectedElements);
                    }
                }
                $scope.searchCriteria = null;
                $scope.filteredRootNode = angular.copy($scope.rootNode);
                $scope.checkValidationError();
            };

            $scope.inputClick = function(){
                $scope.showTree = true;
            };

            $scope.remove = function(event, element){
                if($scope.multiple){
                    var el = $scope.elementExists(element);
                    $scope.selectedElements.splice(el.index,1);
                    if ($scope.onSelect) {
                        $scope.onSelect($scope.selectedElements);
                    }
                }
            };


            $scope.elementExists = function(element){
                var i = 0;
                while($scope.selectedElements && i < $scope.selectedElements.length){
                    if($scope.selectedElements[i] && $scope.selectedElements[i].id === element.id){
                        return {element:$scope.selectedElements[i], index:i};
                    }
                    i++;
                }
                return null;
            };


            $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };


            $scope.globalClickHandler = function (event) {
                if( $scope.showTree === false){
                    return;
                }
                var parents  = jQuery(event.target).parents(".modelSelectorTree");
                var hasClass = jQuery(event.target).hasClass("foldersTree");
                if(parents.length === 0 && !hasClass){
                    $scope.showTree = false;
                    // $scope.checkValidationError();
                    $scope.safeApply();
                    //event.stopPropagation();
                    //return false;
                }
            };
            if(!$scope.alwaysShowTree) {
                $document.on('click', $scope.globalClickHandler);
                $scope.$on('$destroy', function () {
                    $document.off('click', $scope.globalClickHandler);
                });
            }

        }
    };
});
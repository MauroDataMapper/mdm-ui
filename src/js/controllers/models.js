
angular.module('controllers').controller('modelsCtrl',  function ($scope, $state, resources, $rootScope, $uibModal, modalHandler, restHandler, $stateParams, $cookies, $window, stateHandler, userSettingsHandler, securityHandler, validator, $q, messageHandler, folderHandler, favouriteHandler) {

        $window.document.title = "Models";


        $scope.levels = {
            current:0,
            currentFocusedElement:null,

            folders: function(){
                this.current = 0;
                //$scope.filteredModels = $scope.filterDataModels(angular.copy($scope.allModels));
                $scope.reloadTree();
            },
            focusedElement: function (node) {
                var self= this;
                if(node) {
                    this.currentFocusedElement = node;
                }

                $scope.reloading = true;


                if(node.domainType === "DataModel"){
                    resources.tree.get(this.currentFocusedElement.id).then(function (children) {
                        self.currentFocusedElement.children = children;
                        self.currentFocusedElement.open = true;
                        self.currentFocusedElement.selected = true;
                        var curModel  = {
                            "children": [self.currentFocusedElement],
                            isRoot: true
                        };
                        // $scope.filteredModels = $scope.filterDataModels(angular.copy(curModel));
                        $scope.filteredModels = angular.copy(curModel);
                        $scope.reloading = false;
                        self.current = 1;
                    }, function (error) {
                        $scope.reloading = false;
                    });
                }else if (node.domainType === "Terminology"){

                    resources.terminology.get(this.currentFocusedElement.id, "tree").then(function (children) {
                        self.currentFocusedElement.children = children;
                        self.currentFocusedElement.open = true;
                        self.currentFocusedElement.selected = true;
                        var curElement  = {
                            "children": [self.currentFocusedElement],
                            isRoot: true
                        };
                        // $scope.filteredModels = $scope.filterDataModels(angular.copy(curElement));
                        $scope.filteredModels = angular.copy(curElement);
                        $scope.reloading = false;
                        self.current = 1;
                    }, function (error) {
                        $scope.reloading = false;
                    });

                }

            },

        };

        $scope.formData = {};
        $scope.activeTab = 0;// the first Tab
        $scope.allModels = null;
        $scope.filteredModels = null;
        $scope.isAdmin = securityHandler.isAdmin();
        $scope.inSearchMode = false;

        //Hard
        $scope.includeSupersededDocModels = false;

        //Soft
        $scope.showSupersededModels = false;
        $scope.showDeletedModels = false;

        $scope.showFilters = false;

        if ($rootScope.isLoggedIn()) {
            $scope.includeSupersededDocModels = userSettingsHandler.get("includeSupersededDocModels") || false;
            $scope.showSupersededModels = userSettingsHandler.get("showSupersededModels") || false;
            $scope.showDeletedModels = userSettingsHandler.get("showDeletedModels") || false;
        }

        //if there is already a text in rootScope.searchCriteria then paste it into filterCriteria input
        if ($rootScope.searchCriteria && $rootScope.searchCriteria.length > 0) {
            $scope.formData.filterCriteria = $rootScope.searchCriteria;
        }



        $scope.currentTab = "dataModels";
        $scope.tabSelected = function (tabName) {
            $scope.currentTab = tabName;
        };


        $scope.loadClassifiers = function () {
            $scope.classifierLoading = true;
            resources.classifier.get(null, null, {all: true}).then(function (data) {
                $scope.allClassifiers = data.items;
                $scope.classifierLoading = false;
                //$rootScope.$broadcast('$dataModelsLoadCompleted');
            }, function () {
                $scope.classifierLoading = false;
            });
        };
        $scope.loadFolders = function (noCache) {
            $scope.reloading = true;

            var options = {};
            if ($rootScope.isLoggedIn()) {
                options = {
                    queryStringParams: {
                        includeDocumentSuperseded: userSettingsHandler.get("includeSupersededDocModels") || false,
                        includeModelSuperseded: userSettingsHandler.get("showSupersededModels") || false,
                        includeDeleted: userSettingsHandler.get("showDeletedModels") || false
                    }
                };
            }
            if(noCache) {
              options.queryStringParams.noCache = true;
            }
            resources.tree.get(null, null, options).then(function (data) {
                $scope.allModels = {
                    "children": data,
                    isRoot: true
                };
                // $scope.filteredModels = $scope.filterDataModels(angular.copy($scope.allModels));// $scope.filterDataModels();
                $scope.filteredModels = angular.copy($scope.allModels);// $scope.filterDataModels();
                $scope.reloading = false;
            }, function () {
                $scope.reloading = false;
            });
        };

        $scope.onNodeClick = function (node) {
            stateHandler.Go(node.domainType, {
                id: node.id,
                dataModelId: node.dataModel,
                dataClassId: node.parentDataClass,
                terminologyId: node.terminology
            });
        };

        $scope.onNodeDbClick = function (node) {
            //if the element if a dataModel, load it
            if(["DataModel", "Terminology"].indexOf(node.domainType) === -1){return;}
            $scope.levels.focusedElement(node);
        };

        $scope.onCompareTo = function (source, target) {
            stateHandler.NewWindow("modelscomparison", {
                sourceId: source.id,
                targetId: target ? target.id : null
            });
        };
        $scope.loadModelsToCompare = function (dataModel) {
            var deferred = $q.defer();
            resources.dataModel.get(dataModel.id, "semanticLinks", {filters: "all=true"}).then(function (semanticLinks) {
                var compareToList = [];

                angular.forEach(semanticLinks.items, function (link) {

                    if (["Superseded By", "New Version Of"].indexOf(link.linkType) !== -1 && link.source.id === dataModel.id) {
                        compareToList.push(link.target);
                    }
                });
                deferred.resolve(compareToList);
            });
            return deferred.promise;
        };
        $scope.onAddFolder = function (event, folder) {
            var deferred = $q.defer();

            var parentId;
            if (folder) {
                parentId = folder.id;
            }
            var endpoint;
            if (parentId) {
                endpoint = resources.folder.post(parentId, "folders", {resource: {}});
            }else{
                endpoint = resources.folder.post(null, null, {resource: {}});
            }
            endpoint.then(function (result) {
                if(folder) {
                    result.domainType = "Folder";
                    folder.children = folder.children || [];
                    folder.children.push(result);
                }else{
                    result.domainType = "Folder";
                    $scope.allModels.children.push(result);
                    $scope.filteredModels.children.push(result);
                }

                //go to folder
                stateHandler.Go("Folder", {id:result.id, edit:true});
                deferred.resolve(result);

                messageHandler.showSuccess('Folder created successfully.');
            }).catch(function (error) {
                messageHandler.showError('There was a problem creating the Folder.', error);
                deferred.reject(error);
            });

            return deferred.promise;
        };
        $scope.onAddDataModel = function (event, folder) {
            stateHandler.Go("NewDataModel", {parentFolderId: folder.id});
        };
        $scope.onAddCodeSet = function (event, folder) {
            stateHandler.Go("NewCodeSet", {parentFolderId: folder.id});
        };

        $scope.onAddChildDataClass = function (event, element) {
            stateHandler.Go("NewDataClass", {
                grandParentDataClassId: element.domainType === "DataClass" ? element.parentDataClass : null,
                parentDataModelId: element.domainType === "DataModel" ? element.id : element.dataModel,
                parentDataClassId: element.domainType === "DataModel" ? null : element.id
            });
        };
        $scope.onAddChildDataElement = function (event, element) {
            stateHandler.Go("NewDataElement", {
                grandParentDataClassId: element.parentDataClass ? element.parentDataClass : null,
                parentDataModelId: element.dataModel,
                parentDataClassId: element.id
            });
        };
        $scope.onAddChildDataType = function (event, element) {
            stateHandler.Go("NewDataType", {parentDataModelId: element.id});
        };
        // $scope.filterDataModels = function (node) {
        //     if (node.domainType === "DataModel" || node.domainType === "Terminology") {
        //         if (!$scope.showDeletedModels && node.deleted) {
        //             return false;
        //         }
        //             if (!$scope.showSupersededModels && node.superseded) {
        //             return false;
        //         }
        //         return true;
        //     }
        //     if (node.domainType === "Folder" || node.isRoot === true) {
        //         if (!node.children) {
        //             return true;
        //         }
        //         var i = node.children.length - 1;
        //         while (i >= 0) {
        //             if (!$scope.filterDataModels(node.children[i])) {
        //                 node.children.splice(i, 1);
        //             }
        //             i--;
        //         }
        //     }
        //     return node;
        // };
        $scope.toggleFilterMenu = function () {
            $scope.showFilters = !$scope.showFilters;
        };
        $scope.toggleFilters = function (filerName) {
            $scope[filerName] = !$scope[filerName];
            $scope.reloading = true;


            // setTimeout(function () {
            //     $scope.filteredModels = $scope.filterDataModels(angular.copy($scope.allModels));
            //     $scope.reloading = false;
            // }, 10);
            if ($rootScope.isLoggedIn()) {
                userSettingsHandler.update("showSupersededModels", $scope.showSupersededModels);
                userSettingsHandler.update("showDeletedModels", $scope.showDeletedModels);
                userSettingsHandler.saveOnServer();
            }


            $scope.loadFolders();

            $scope.showFilters = !$scope.showFilters;
        };
        $scope.onDeleteFolder  = function (event, folder, permanent) {
            if (!$rootScope.isAdmin()) {
                return
            }
            if(permanent === true){
                folderHandler.askForPermanentDelete(folder.id).then(function () {
                    $scope.loadFolders();
                })
            }else{
                folderHandler.askForSoftDelete(folder.id).then(function () {
                    folder.deleted = true;
                })
            }
        };

        var initializeModelsTree = function () {
            $scope.loadFolders();
            $scope.loadClassifiers();
        };
        initializeModelsTree();


        $rootScope.$on('$reloadClassifiers', function (ev, to, toParams, from, fromParams) {
            resources.classifier.get(null, null, {all: true}).then(function (data) {
                $scope.allClassifiers = data.items;
            });
        });

        $rootScope.$on('$reloadFoldersTree', function (ev, to, toParams, from, fromParams) {
            $scope.loadFolders();
        });

        $scope.currentClassification = null;
        $scope.allClassifications = [];

        $scope.changeState = function (newState, newWindow) {
            if (newWindow) {
                stateHandler.NewWindow(newState);
                return;
            }
            stateHandler.Go(newState);
        };
        $scope.onSearchInputKeyDown = function (event) {
            if (event.keyCode && event.keyCode === 13) {
                $scope.search();
            }
            if (validator.isEmpty($scope.formData.filterCriteria)) {
                $scope.search();
            }
            event.preventDefault();
            return false;
        };
        $scope.search = function () {
            if ($scope.formData.filterCriteria.trim().length > 2) {

                $scope.formData.ClassificationFilterCriteria = "";
                $rootScope.searchCriteria = $scope.formData.filterCriteria;

                $scope.reloading = true;
                $scope.inSearchMode = true;
                $scope.allModels = [];

                resources.tree.get(null, "search/" + $rootScope.searchCriteria).then(function (result) {
                    $scope.reloading = false;
                    $scope.allModels = {
                        "children": result,
                        isRoot: true
                    };
                    // $scope.filteredModels = $scope.filterDataModels(angular.copy($scope.allModels));// $scope.filterDataModels();
                     $scope.filteredModels = angular.copy($scope.allModels);// $scope.filterDataModels();
                    $scope.searchText = $scope.formData.filterCriteria;
                });
            } else {
                $scope.inSearchMode = false;
                $rootScope.searchCriteria = "";
                $scope.searchText = "";
                $scope.reloading = true;
                resources.tree.get().then(function (data) {
                    $scope.allModels = {
                        "children": data,
                        isRoot: true
                    };
                    // $scope.filteredModels = $scope.filterDataModels(angular.copy($scope.allModels));// $scope.filterDataModels();
                    $scope.filteredModels = angular.copy($scope.allModels);// $scope.filterDataModels();
                    $scope.reloading = false;
                }, function () {
                    $scope.reloading= false;
                });
            }
        };


        $scope.classifierTreeOnSelect = function (event, element) {
            stateHandler.Go("classification", {id: element.id});
        };

        $scope.$watch('formData.ClassificationFilterCriteria', function (val) {
            if (val && val.trim().length === 0) {
                $scope.filterClassifications();
            }
        });
        $scope.filterClassifications = function () {
            $scope.formData.filterCriteria = "";
            $rootScope.searchCriteria = $scope.formData.ClassificationFilterCriteria;
            $rootScope.$broadcast('$highlightText-classifiers', {filterCriteria: $scope.formData.ClassificationFilterCriteria});
            $rootScope.$broadcast('$highlightText-models', {filterCriteria: ""});
        };
        //In each Model change, we need to see if it's going to be Classification or sth other than that
        //and we show the right Tab (it's not a very good approach)
        if ($state && $state.current && ["appContainer.mainApp.twoSidePanel.catalogue.classification", "appContainer.mainApp.twoSidePanel.catalogue.NewClassifier"].indexOf($state.current.name) !== -1) {
            $scope.activeTab = 1;
        }
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
            //if the state is Classification, then show the second tab, otherwise show the first tab
            if (["appContainer.mainApp.twoSidePanel.catalogue.classification", "appContainer.mainApp.twoSidePanel.catalogue.NewClassifier"].indexOf(toState.name) !== -1) {
                $scope.activeTab = 1;
            }
        });


        $scope.onFavouriteDbClick = function (node) {
            stateHandler.Go(node.domainType, {
                id: node.id,
                dataModelId: node.dataModel,
                dataClassId: node.parentDataClass
            });
        };
        $scope.onFavouriteClick = function (node) {
            stateHandler.Go(node.domainType, {
                id: node.id,
                dataModelId: node.dataModel,
                dataClassId: node.parentDataClass
            });
        };

        $scope.reloadTree = function () {
            $scope.loadFolders(true);
        };


        $scope.addClassifier = function () {
            stateHandler.Go("newclassification");
        };

    });

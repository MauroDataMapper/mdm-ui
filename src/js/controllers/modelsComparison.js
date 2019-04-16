angular.module('controllers').controller('modelsComparisonCtrl',  function ($window, $scope, $q, resources, $stateParams, $state, validator, messageHandler) {

    $scope.diffMap = {};
    $scope.max = 100;
    $scope.dynamic = 100;

    $scope.diffElements = ["dataClasses", "dataElements", "dataTypes"];
    $scope.diffProps = ["label", "description", "author", "organisation"];

    $scope.form = {
        dataTypeFilter: null,
        dataElementFilter: null
    };

    $scope.checkIfSwapNeeded = function () {
        var swapNeeded = false;
        for (var i = 0; $scope.sourceModel.semanticLinks && i < $scope.sourceModel.semanticLinks.length; i++) {
            var link = $scope.sourceModel.semanticLinks[i];
            if (link.linkType === "New Version Of" && link.target.id === $scope.targetModel.id) {
                swapNeeded = true;
            }
        }
        for (var i = 0; $scope.targetModel.semanticLinks && i < $scope.targetModel.semanticLinks.length; i++) {
            var link = $scope.targetModel.semanticLinks[i];
            if (link.linkType === "Superseded By" && link.target.id === $scope.sourceModel.id) {
                swapNeeded = true;
            }
        }
        return swapNeeded;
    };

    $scope.loadDataModelDetail = function (id) {
        var deferred = $q.defer();
        resources.dataModel.get(id).then(function (data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    $scope.loadModelTree = function (model) {
        var deferred = $q.defer();
        resources.tree.get(model.id).then(function (result) {
            deferred.resolve(result);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };

    $scope.onLeftModelSelect = function (select) {
        if (!select || (select && select.length === 0)) {
            $scope.sourceModel = null;
            $scope.diffs = [];
            return;
        }
        $scope.loadDataModelDetail(select[0].id).then(function (data) {
            $scope.sourceModel = angular.copy(data);
            $scope.safeApply();
            $scope.loadModelTree(data).then(function (data) {
                $scope.sourceModel.children = angular.copy(data);
                $scope.sourceModel.close = false;
                if($scope.targetModel) {
                    $scope.runDiff();
                }
            });
        });
    };

    $scope.onRightModelSelect = function (select) {
        if (!select || (select && select.length === 0)) {
            $scope.targetModel = null;
            $scope.diffs = [];
            return;
        }
        $scope.loadDataModelDetail(select[0].id).then(function (data) {
            $scope.targetModel = angular.copy(data);
            $scope.safeApply();
            $scope.loadModelTree(data).then(function (data) {
                $scope.targetModel.children = angular.copy(data);
                $scope.targetModel.close = false;
                if($scope.sourceModel) {
                    $scope.runDiff();
                }
            });
        });
    };

    $scope.swap = function(){
        var srcCopy;
        if($scope.sourceModel){
            srcCopy = angular.copy($scope.sourceModel);//left
        }else{
            srcCopy = null;
        }
        var trgCopy;
        if($scope.targetModel){
            trgCopy = angular.copy($scope.targetModel);//right
        }else{
            trgCopy = null;
        }
        $scope.sourceModel = trgCopy;
        $scope.targetModel = srcCopy;


        //Load all children of source & target dataModels
        //to rest deleted, created, modified properties
        var promises = [];
        promises.push($scope.loadModelTree($scope.sourceModel));
        promises.push($scope.loadModelTree($scope.targetModel));
        $q.all(promises).then(function (results) {
            $scope.sourceModel.children = angular.copy(results[0]);
            $scope.sourceModel.close = false;

            $scope.targetModel.children = angular.copy(results[1]);
            $scope.targetModel.close = false;

            $scope.runDiff();
        });

    };

    $scope.cleanDiff = function () {
        $scope.diffMap = {};
        // if ($scope.diffMap[$scope.sourceModel.id]) {
        //     delete $scope.diffMap[$scope.sourceModel.id].modified;
        //     delete $scope.diffMap[$scope.sourceModel.id].deleted;
        //     delete $scope.diffMap[$scope.sourceModel.id].created;
        // }
        // if ($scope.diffMap[$scope.targetModel.id]) {
        //     delete $scope.diffMap[$scope.targetModel.id].modified;
        //     delete $scope.diffMap[$scope.targetModel.id].deleted;
        //     delete $scope.diffMap[$scope.targetModel.id].created;
        // }
        // angular.forEach($scope.sourceModel.children, function (dc) {
        //     delete dc.deleted;
        //     delete dc.created;
        //     delete dc.modified;
        // });
        // angular.forEach($scope.targetModel.children, function (dc) {
        //     delete dc.deleted;
        //     delete dc.created;
        //     delete dc.modified;
        // });
        $scope.diffs = [];
    };

    //When an element is modified, we need to mark its parent as Modified too
    //provided that its parent is not created or deleted
    //and in this case we just mark it as modified
    $scope.modifiedParents = function (breadcrumbs, diffMap) {
        if (!breadcrumbs) {
            return;
        }
        angular.forEach(breadcrumbs, function (element, index) {
            $scope.initDiff(element.id, diffMap);

            //Not deleted & Not modified -> modified
            if (!diffMap[element.id].deleted && !diffMap[element.id].created) {
                diffMap[element.id].modified = true;
                diffMap[element.id].deleted = false;
                diffMap[element.id].created = false;
            }
        });
    };

    $scope.initDiff = function (id, diffMap) {
        if(diffMap[id]){
            return;
        }
        diffMap[id] = {
            id: id,
            diffs:{
                "properties":[],
                "metadata":[],
                "enumerationValues":[],

                "dataTypes":[],
                "dataClasses":[],
                "dataElements":[]
            }
        };
    };

    $scope.findDiffDataTypeChanges = function(leftId, rightId, dataTypeDiff, diffMap){
        $scope.initDiff(leftId, diffMap);
        $scope.initDiff(rightId, diffMap);
        diffMap[leftId].modified = true;
        diffMap[rightId].modified = true;

        var update = {
            property:"dataType",
            title:"DataType",
            left:dataTypeDiff.left,
            right:dataTypeDiff.right
        };
        diffMap[leftId].diffs.properties.push(update);
        diffMap[rightId].diffs.properties.push(update);
    };

    $scope.findDiffProps = function(propName, leftId, rightId, labelDiff, diffMap) {
        $scope.initDiff(leftId, diffMap);
        $scope.initDiff(rightId, diffMap);
        diffMap[leftId].modified = true;
        diffMap[rightId].modified = true;

        var update = {
            property: propName,
            title: validator.capitalize(propName),
            left: (!labelDiff.left  || labelDiff.left === "null")  ? "' '" : labelDiff.left,
            right:(!labelDiff.right || labelDiff.right === "null") ? "' '" : labelDiff.right
        };

        diffMap[leftId].diffs.properties.push(update);
        diffMap[rightId].diffs.properties.push(update);
    };

    $scope.findDiffMetadata = function(leftId, rightId, metadataDiff, diffMap) {

        $scope.initDiff(leftId, diffMap);
        $scope.initDiff(rightId, diffMap);
        diffMap[leftId].modified = true;
        diffMap[rightId].modified = true;

        if(metadataDiff.created){
            angular.forEach(metadataDiff.created, function(created) {
                created.created = true;
                diffMap[leftId].diffs.metadata.push(created);
                diffMap[rightId].diffs.metadata.push(created);
            });
        }
        if(metadataDiff.deleted){
            angular.forEach(metadataDiff.deleted, function(deleted) {
                deleted.deleted = true;
                diffMap[leftId].diffs.metadata.push(deleted);
                diffMap[rightId].diffs.metadata.push(deleted);
            });
        }
        if(metadataDiff.modified){
            angular.forEach(metadataDiff.modified, function(modified) {
                var update = {
                    leftId: modified.leftId,
                    rightId: modified.rightId,
                    key: modified.key,
                    namespace: modified.namespace,
                    property: "value",
                    left: modified.diffs[0].value.left,
                    right: modified.diffs[0].value.right,
                    modified:true
                };
                diffMap[leftId].diffs.metadata.push(update);
                diffMap[rightId].diffs.metadata.push(update);
            });
        }
    };

    $scope.findDiffEnumerationValues = function(leftId, rightId, enumerationValuesDiff, diffMap){
        $scope.initDiff(leftId,  diffMap);
        $scope.initDiff(rightId, diffMap);
        diffMap[leftId].modified  = true;
        diffMap[rightId].modified = true;

        if(enumerationValuesDiff.created){
            angular.forEach(enumerationValuesDiff.created, function(created) {
                created.created = true;
                diffMap[leftId].diffs.enumerationValues.push(created);
                diffMap[rightId].diffs.enumerationValues.push(created);
            });

        }
        if(enumerationValuesDiff.deleted){
            angular.forEach(enumerationValuesDiff.deleted, function(deleted) {
                deleted.deleted = true;
                diffMap[leftId].diffs.enumerationValues.push(deleted);
                diffMap[rightId].diffs.enumerationValues.push(deleted);
            });
        }

        if(enumerationValuesDiff.modified){
            angular.forEach(enumerationValuesDiff.modified, function(modified) {
                var update = {
                    leftId: modified.leftId,
                    rightId: modified.rightId,
                    label: modified.label,
                    property: "value",
                    left:  modified.diffs[0].value.left,
                    right: modified.diffs[0].value.right,
                    modified:true
                };
                diffMap[leftId].diffs.enumerationValues.push(update);
                diffMap[rightId].diffs.enumerationValues.push(update);
            });

        }
    };

    $scope.runDiff = function () {
        $scope.ready = false;
        if (!$scope.sourceModel || !$scope.targetModel) {
            return;
        }

        $scope.cleanDiff();
        $scope.processing = true;


        resources.dataModel.get($scope.sourceModel.id, "diff/" + $scope.targetModel.id).then(function (result) {
            $scope.processing = false;

            var diffMap = {};

            //Run for DataModel
            angular.forEach(result.diffs, function (diff) {
                if (diff.label) {
                    $scope.findDiffProps("label", result.leftId, result.rightId, diff.label, diffMap);
                }
                if (diff.description) {
                    $scope.findDiffProps("description", result.leftId, result.rightId, diff.description, diffMap);
                }
                if (diff.author) {
                    $scope.findDiffProps("author", result.leftId, result.rightId, diff.author, diffMap);
                }
                if (diff.organisation) {
                    $scope.findDiffProps("organisation", result.leftId, result.rightId, diff.organisation, diffMap);
                }

                if (diff.metadata) {
                    $scope.findDiffMetadata(result.leftId, result.rightId, diff.metadata, diffMap);
                }
            });

            angular.forEach(result.diffs, function (diff) {


                angular.forEach($scope.diffElements, function (diffElement) {
                    if (!diff[diffElement]) {
                        return;
                    }

                    angular.forEach(diff[diffElement].created, function (el) {
                        $scope.initDiff(el.id, diffMap);
                        diffMap[el.id].id = el.id;
                        diffMap[el.id].created  = true;
                        diffMap[el.id].deleted  = false;
                        diffMap[el.id].modified = false;

                        if (diffElement === "dataClasses") {
                            $scope.modifiedParents(el.breadcrumbs, diffMap);
                        }

                        if (diffElement === "dataElements" && el.breadcrumbs) {
                            $scope.modifiedParents(el.breadcrumbs, diffMap);

                            var parentDC = el.breadcrumbs[el.breadcrumbs.length - 1];
                            $scope.initDiff(parentDC.id, diffMap);
                            el.created  = true;
                            el.modified = false;
                            el.deleted  = false;
                            el.domainType = "DataElement";
                            diffMap[parentDC.id].diffs.dataElements.push(el);
                        }

                        if(diffElement === "dataTypes"){
                            $scope.modifiedParents([{id:$scope.sourceModel.id}], diffMap);
                            $scope.modifiedParents([{id:$scope.targetModel.id}], diffMap);

                            $scope.initDiff($scope.sourceModel.id, diffMap);
                            $scope.initDiff($scope.targetModel.id, diffMap);

                            el.created  = true;
                            el.modified = false;
                            el.deleted  = false;
                            el.domainType = "DataType";
                            
                            diffMap[$scope.sourceModel.id].diffs.dataTypes.push(el);
                            diffMap[$scope.targetModel.id].diffs.dataTypes.push(el);
                        }
                    });

                    angular.forEach(diff[diffElement].deleted, function (el) {
                        $scope.initDiff(el.id, diffMap);
                        diffMap[el.id].id = el.id;
                        diffMap[el.id].deleted  = true;
                        diffMap[el.id].created  = false;
                        diffMap[el.id].modified = false;

                        if (diffElement === "dataClasses") {
                            if (el.breadcrumbs) {
                                $scope.modifiedParents(el.breadcrumbs.slice(0, el.breadcrumbs.length - 1), diffMap);
                            }
                        }
                        if (diffElement === "dataElements" && el.breadcrumbs) {
                            $scope.modifiedParents(el.breadcrumbs, diffMap);

                            var parentDC = el.breadcrumbs[el.breadcrumbs.length - 1];
                            $scope.initDiff(parentDC.id, diffMap);
                            el.deleted  = true;
                            el.created  = false;
                            el.modified = false;
                            el.domainType = "DataElement";
                            diffMap[parentDC.id].diffs.dataElements.push(el);
                        }

                        if(diffElement === "dataTypes"){
                            $scope.modifiedParents([{id:$scope.sourceModel.id}], diffMap);
                            $scope.modifiedParents([{id:$scope.targetModel.id}], diffMap);

                            $scope.initDiff($scope.sourceModel.id, diffMap);
                            $scope.initDiff($scope.targetModel.id, diffMap);
                            el.deleted  = true;
                            el.created  = false;
                            el.modified = false;
                            el.domainType = "DataType";
                            diffMap[$scope.sourceModel.id].diffs.dataTypes.push(el);
                            diffMap[$scope.targetModel.id].diffs.dataTypes.push(el);
                        }

                    });


                    angular.forEach(diff[diffElement].modified, function (el) {

                        $scope.initDiff(el.leftId, diffMap);
                        diffMap[el.leftId].modified = true;
                        diffMap[el.leftId].id = el.leftId;

                        $scope.initDiff(el.rightId, diffMap);
                        diffMap[el.rightId].modified = true;
                        diffMap[el.rightId].id = el.rightId;

                        if (diffElement === "dataClasses") {
                            if (el.leftBreadcrumbs) {
                                $scope.modifiedParents(el.leftBreadcrumbs.slice(0, el.leftBreadcrumbs.length - 1), diffMap);
                            }
                            if (el.rightBreadcrumbs) {
                                $scope.modifiedParents(el.rightBreadcrumbs.slice(0, el.rightBreadcrumbs.length - 1), diffMap);
                            }
                        }

                        if (diffElement === "dataElements" && el.leftBreadcrumbs) {
                            $scope.modifiedParents(el.leftBreadcrumbs, diffMap);

                            var parentDC = el.leftBreadcrumbs[el.leftBreadcrumbs.length - 1];
                            $scope.initDiff(parentDC.id, diffMap);
                            el.modified = true;
                            el.created  = false;
                            el.deleted  = false;
                            el.domainType = "DataElement";
                            diffMap[parentDC.id].diffs.dataElements.push(el);
                        }


                        if (diffElement === "dataElements" && el.rightBreadcrumbs) {
                            $scope.modifiedParents(el.rightBreadcrumbs, diffMap);

                            var parentDC = el.rightBreadcrumbs[el.rightBreadcrumbs.length - 1];
                            $scope.initDiff(parentDC.id, diffMap);
                            el.modified = true;
                            el.created  = false;
                            el.deleted  = false;
                            el.domainType = "DataElement";
                            diffMap[parentDC.id].diffs.dataElements.push(el);
                        }

                        if(diffElement === "dataTypes" && el.leftBreadcrumbs){
                            $scope.modifiedParents(el.leftBreadcrumbs, diffMap);

                            var parentDM = el.leftBreadcrumbs[0];
                            $scope.initDiff(parentDM.id, diffMap);
                            el.modified = true;
                            el.deleted  = false;
                            el.created  = false;
                            el.domainType = "DataType";
                            diffMap[parentDM.id].diffs.dataTypes.push(el);
                        }

                        if(diffElement === "dataTypes" && el.rightBreadcrumbs){
                            $scope.modifiedParents(el.rightBreadcrumbs, diffMap);

                            var parentDM = el.rightBreadcrumbs[0];
                            $scope.initDiff(parentDM.id, diffMap);
                            el.modified = true;
                            el.deleted  = false;
                            el.created  = false;
                            el.domainType = "DataType";
                            diffMap[parentDM.id].diffs.dataTypes.push(el);
                        }


                        //Run for Element
                        angular.forEach(el.diffs, function (diff) {

                            if (diff.label) {
                                $scope.findDiffProps("label",el.leftId, el.rightId, diff.label, diffMap);
                            }
                            if (diff.description) {
                                $scope.findDiffProps("description",el.leftId, el.rightId, diff.description, diffMap);
                            }
                            if (diff.author) {
                                $scope.findDiffProps("author", el.leftId, el.rightId, diff.author, diffMap);
                            }
                            if (diff.organisation) {
                                $scope.findDiffProps("organisation", el.leftId, el.rightId, diff.organisation, diffMap);
                            }
                            if(diff.minMultiplicity){
                                $scope.findDiffProps("minMultiplicity", el.leftId, el.rightId, diff.minMultiplicity, diffMap);
                            }
                            if(diff.maxMultiplicity){
                                $scope.findDiffProps("maxMultiplicity", el.leftId, el.rightId, diff.maxMultiplicity, diffMap);
                            }

                            if (diff.metadata) {
                                $scope.findDiffMetadata(el.leftId, el.rightId, diff.metadata, diffMap);
                            }

                            if(diffElement === "dataTypes" && diff.enumerationValues){
                                $scope.findDiffEnumerationValues(el.leftId, el.rightId, diff.enumerationValues, diffMap);
                            }

                            if(diffElement === "dataElements" && diff['dataType.label']){
                                $scope.findDiffDataTypeChanges(el.leftId, el.rightId, diff['dataType.label'], diffMap);
                            }

                        });

                    });

                });
            });
            $scope.diffMap = diffMap;


            if ($scope.diffMap[$scope.sourceModel.id]) {
                $scope.sourceModel.modified = $scope.diffMap[$scope.sourceModel.id].modified;
            }

            if ($scope.diffMap[$scope.targetModel.id]) {
                $scope.targetModel.modified = $scope.diffMap[$scope.targetModel.id].modified;
            }


            angular.forEach($scope.sourceModel.children, function (dc) {

                if ($scope.diffMap[dc.id]) {
                    dc.deleted = $scope.diffMap[dc.id].deleted;
                    dc.created = $scope.diffMap[dc.id].created;
                    dc.modified = $scope.diffMap[dc.id].modified;
                }
            });

            angular.forEach($scope.targetModel.children, function (dc) {

                if ($scope.diffMap[dc.id]) {
                    dc.deleted = $scope.diffMap[dc.id].deleted;
                    dc.created = $scope.diffMap[dc.id].created;
                    dc.modified = $scope.diffMap[dc.id].modified;
                }
            });

            $scope.ready = true;
            $scope.onNodeClick($scope.sourceModel);

            $scope.safeApply();
        }, function (error) {
            messageHandler.showError('There was a problem comparing the Data Models.', error);
            $scope.processing = false;
        });

    };

    $scope.onNodeExpand = function (node) {
        var deferred = $q.defer();
        $scope.loadModelTree(node).then(function (result) {
            angular.forEach(result, function (dc) {
                if ($scope.diffMap[dc.id]) {
                    dc.deleted = $scope.diffMap[dc.id].deleted;
                    dc.created = $scope.diffMap[dc.id].created;
                    dc.modified = $scope.diffMap[dc.id].modified;
                }
            });

            deferred.resolve(result);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };

    $scope.onNodeClick = function (node) {
        $scope.diffs = [];
        if(!$scope.diffMap[node.id]){
            return;
        }
        $scope.diffs = $scope.diffMap[node.id].diffs;



        $scope.diffs.filteredDataTypes    = angular.copy($scope.diffs.dataTypes);
        $scope.diffs.dataTypesStatus = {
            deleted:0,
            created:0,
            modified:0
        };
        angular.forEach($scope.diffs.dataTypes, function (value) {
            if(value.deleted){
                $scope.diffs.dataTypesStatus.deleted++;
            }
            if(value.created){
                $scope.diffs.dataTypesStatus.created++;
            }
            if(value.modified){
                $scope.diffs.dataTypesStatus.modified++;
            }
        });




        $scope.diffs.filteredDataElements = angular.copy($scope.diffs.dataElements);
        $scope.diffs.dataElementsStatus = {
            deleted:0,
            created:0,
            modified:0
        };
        angular.forEach($scope.diffs.dataElements, function (value) {
            if(value.deleted){
                $scope.diffs.dataElementsStatus.deleted++;
            }
            if(value.created){
                $scope.diffs.dataElementsStatus.created++;
            }
            if(value.modified){
                $scope.diffs.dataElementsStatus.modified++;
            }
        });


        $scope.form = {
            dataTypeFilter: null,
            dataElementFilter: null
        };

        $scope.activeTab ={index:0};


        if($scope.diffs.properties.length > 0){
            $scope.activeTab.index = 0;
        }else if($scope.diffs.metadata.length > 0){
            $scope.activeTab.index = 1;
        }else if($scope.diffs.dataTypes.length > 0){
            $scope.activeTab.index = 2;
        }else if($scope.diffs.dataElements.length > 0) {
            $scope.activeTab.index = 3;
        }

    };

    $scope.dataElementFilterChange = function () {
        if($scope.diffs.dataElements && $scope.diffs.dataElements.length > 0){
            if(!$scope.form.dataElementFilter){
                $scope.diffs.filteredDataElements = angular.copy($scope.diffs.dataElements);
                return
            }
            $scope.diffs.filteredDataElements = _.filter($scope.diffs.dataElements, function (dataType) {
                if($scope.form.dataElementFilter === "deleted" && dataType.deleted){
                    return dataType
                }
                if($scope.form.dataElementFilter === "created" && dataType.created){
                    return dataType
                }
                if($scope.form.dataElementFilter === "modified" && dataType.modified){
                    return dataType
                }
            });
        }
    };

    $scope.dataTypeFilterChange = function () {
        if($scope.diffs.dataTypes && $scope.diffs.dataTypes.length > 0){
            if(!$scope.form.dataTypeFilter){
                $scope.diffs.filteredDataTypes = angular.copy($scope.diffs.dataTypes);
                return
            }
            $scope.diffs.filteredDataTypes = _.filter($scope.diffs.dataTypes, function (dataType) {
                if($scope.form.dataTypeFilter === "deleted" && dataType.deleted){
                    return dataType
                }
                if($scope.form.dataTypeFilter === "created" && dataType.created){
                    return dataType
                }
                if($scope.form.dataTypeFilter === "modified" && dataType.modified){
                    return dataType
                }
            });
        }
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


    if ($stateParams.sourceId && $stateParams.targetId) {

        $scope.loadDataModelDetail($stateParams.sourceId).then(function (data) {
            $scope.sourceModel = angular.copy(data);
            $scope.safeApply();
            $scope.loadModelTree(data).then(function (tree) {
                $scope.sourceModel.children = angular.copy(tree);
                $scope.sourceModel.close = false;

                $scope.loadDataModelDetail($stateParams.targetId).then(function (data) {
                    $scope.targetModel = angular.copy(data);
                    $scope.safeApply();
                    $scope.loadModelTree(data).then(function (tree) {
                        $scope.targetModel.children = angular.copy(tree);
                        $scope.targetModel.close = false;

                        //check if source and target need to be swapped
                        if($scope.checkIfSwapNeeded()){
                            $scope.swap();
                        }

                        $scope.runDiff();
                    });
                });

            });
        });

    }else if ($stateParams.targetId) {
        $scope.loadDataModelDetail($stateParams.targetId).then(function (data) {
            $scope.targetModel = angular.copy(data);
            $scope.safeApply();
            $scope.loadModelTree(data).then(function (tree) {
                $scope.targetModel.children = angular.copy(tree);
                $scope.targetModel.close = false;
            });
        });
    }else if($stateParams.sourceId ){
        $scope.loadDataModelDetail($stateParams.sourceId).then(function (data) {
            $scope.sourceModel = angular.copy(data);
            $scope.safeApply();
            $scope.loadModelTree(data).then(function (tree) {
                $scope.sourceModel.children = angular.copy(tree);
                $scope.sourceModel.close = false;
            });
        });
    }

});
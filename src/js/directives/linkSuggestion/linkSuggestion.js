angular.module('directives').directive('linkSuggestion',  function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            sourceDataModelId: "=",
            sourceDataClassId: "=",
            sourceDataElementId: "=",

            targetDataModelId: "=",
        },
        templateUrl: './linkSuggestion.html',
        link: function (scope, element, attrs) {

        },

        controller: function ($scope, resources, messageHandler, securityHandler, $q, elementTypes) {

            $scope.model = {
                source: null,
                sourceLink: null,
                loadingSource:false,

                target: null,
                targetLink:null,
                loadingTarget:false,

                suggestions: [],
                processing: false,

                sourceEditable: true,
                successfullyAdded:0,
                totalSuggestionLinks:0,
                totalIgnoredLinks:0
            };

            $scope.$watch('sourceDataModelId', function (newValue, oldValue, scope) {
                if (newValue === null || newValue === undefined) {
                    return;
                }
                if($scope.sourceDataElementId) {
                    $scope.setSourceDataElement($scope.sourceDataModelId, $scope.sourceDataClassId, $scope.sourceDataElementId);
                }else if($scope.sourceDataModelId){
                    $scope.setSourceDataModel([{id:$scope.sourceDataModelId}]);
                }

            });

            $scope.$watch('targetDataModelId', function (newValue, oldValue, scope) {
                if (newValue === null || newValue === undefined) {
                    return;
                }
                $scope.setTargetDataModel([{id:$scope.targetDataModelId}]);
            });


            $scope.onSourceSelect = function(dataModels){
                $scope.model.suggestions = [];
                $scope.setSourceDataModel(dataModels);
            };

            $scope.setSourceDataModel = function(dataModels){
                if(dataModels && dataModels.length > 0) {
                    $scope.model.loadingSource = true;
                    resources.dataModel.get(dataModels[0].id).then(function (data) {
                        $scope.model.source = data;
                        $scope.model.sourceLink =  elementTypes.getLinkUrl( $scope.model.source);
                        var access = securityHandler.dataModelAccess($scope.model.source);
                        $scope.model.sourceEditable = access.showEdit;
                        $scope.model.loadingSource = false;
                        $scope.safeApply();
                    });
                }else{
                    $scope.model.sourceLink = null;
                    $scope.model.source = null;
                    $scope.model.sourceEditable = true;
                    $scope.safeApply();
                }
            };

            $scope.setSourceDataElement = function(sourceDMId, sourceDCId, sourceDEId){
                $scope.model.loadingSource = true;
                resources.dataElement.get(sourceDMId, sourceDCId, sourceDEId).then(function(data){
                    $scope.model.source = data;
                    $scope.model.sourceLink =  elementTypes.getLinkUrl($scope.model.source);
                    var access = securityHandler.dataModelAccess($scope.model.source);
                    $scope.model.sourceEditable = access.showEdit;
                    $scope.model.loadingSource = false;
                    $scope.safeApply();
                });

            };



            $scope.onTargetSelect = function(dataModels){
                $scope.model.suggestions = [];
                $scope.setTargetDataModel(dataModels);
            };

            $scope.setTargetDataModel = function(dataModels){
                if(dataModels && dataModels.length > 0) {

                    $scope.model.loadingTarget = true;
                    resources.dataModel.get(dataModels[0].id).then(function (data) {
                        $scope.model.target = data;
                        $scope.model.targetLink =  elementTypes.getLinkUrl($scope.model.target);
                        $scope.model.loadingTarget = false;
                        $scope.safeApply();
                    });
                }else{
                    $scope.model.targetLink = null;
                    $scope.model.target = null;
                    $scope.safeApply();
                }
            };

            $scope.onTargetDateElementSelect = function (suggestion, record) {
                record.selectedTarget = suggestion;
                record.showMore = null;
                $scope.safeApply();
            };



            $scope.approveSuggestion = function (index, suggest) {

                var resource = {
                    target: {id: suggest.selectedTarget.dataElement.id},
                    linkType: "Refines"
                };

                $scope.mcDisplayRecords[index].processing = true;
                var  i  = $scope.mcTableHandler.getAbsoluteIndex(index);

                //create the link and then remove it
                resources.catalogueItem.post($scope.model.source.id, "semanticLinks", {resource: resource})
                    .then(function (response) {
                        $scope.mcDisplayRecords[index].processing = false;
                        $scope.mcDisplayRecords[index].success = true;
                        $scope.model.successfullyAdded++;
                        $scope.safeApply();

                        setTimeout(function(){
                            // $scope.mcDisplayRecords[index].success = false;
                            $scope.model.suggestions.splice(i, 1);
                            $scope.safeApply();
                        }, 300);

                    })
                    .catch(function (error) {
                        $scope.mcDisplayRecords[index].processing = false;
                        $scope.mcDisplayRecords[index].success = false;
                        $scope.model.suggestions[i].success = false;

                        messageHandler.showError('There was a problem saving link.', error);
                    });

            };

            $scope.ignoreSuggestion = function (index) {
                $scope.model.totalIgnoredLinks++;

                var  i  = $scope.mcTableHandler.getAbsoluteIndex(index);
                $scope.mcDisplayRecords[index].ignore = true;
                $scope.safeApply();
                setTimeout(function(){
                    $scope.model.suggestions.splice(i, 1);
                    $scope.safeApply();
                }, 300);

            };


            $scope.toggleShowMore = function(suggestion){
                suggestion.showMore = !suggestion.showMore;
            };

            $scope.suggest = function () {
                $scope.model.processing = true;

                $scope.model.successfullyAdded = 0;
                $scope.model.totalSuggestionLinks = 0;
                $scope.model.totalIgnoredLinks = 0;

                if($scope.model.source.domainType === "DataModel"){
                    resources.dataModel.get($scope.model.source.id, "suggestLinks/" + $scope.model.target.id).then(function (data) {
                        $scope.model.suggestions = data.links;
                        $scope.model.totalSuggestionLinks = data.links.length;

                        angular.forEach($scope.model.suggestions, function (suggestion) {
                            suggestion.selectedTarget = suggestion.results[0];
                        });
                        $scope.model.processing = false;
                        $scope.safeApply();

                    }, function (error) {
                        $scope.model.processing = false;
                    });
                }else if($scope.model.source.domainType === "DataElement"){
                    resources.dataElement.get($scope.model.source.dataModel, $scope.model.source.dataClass, $scope.model.source.id, "suggestLinks/" + $scope.model.target.id).then(function (data) {
                        $scope.model.suggestions = [data];
                        $scope.model.totalSuggestionLinks = 1;

                        angular.forEach($scope.model.suggestions, function (suggestion) {
                            suggestion.selectedTarget = suggestion.results[0];
                        });
                        $scope.model.processing = false;
                        $scope.safeApply();

                    }, function (error) {
                        $scope.model.processing = false;
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

        }
    };
});
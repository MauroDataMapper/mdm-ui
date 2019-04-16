angular.module('controllers').controller('terminologyCtrl',  function ($scope, $state, $stateParams, resources, $window, selectionHandler, $rootScope, jointDiagramService3, $q, elementTypes, stateHandler) {
        $scope.activeTab = {index: -1};

        $scope.initialize = function () {
            if (!$stateParams.id) {
                stateHandler.NotFound({location: false});
                return;
            }
            $scope.terminology = null;
            $scope.diagram = null;
            $window.document.title = "Terminology";

            resources.terminology.get($stateParams.id).then(function (data) {
                $scope.terminology = data;
                $scope.terminology.classifiers = $scope.terminology.classifiers || [];
                $scope.activeTab = getTabDetail($stateParams.tabView);
            });

        };

        //These should be in the same order as in the HTML template file (terminology.html)
        function getTabDetail(tabName) {
            switch (tabName) {
                case 'properties':  return {index: 0, name: 'properties'};
                case 'comments':    return {index: 1, name: 'comments'};
                case 'attachments': return {index: 2, name: 'attachments'};
                case 'history':     return {index: 3, name: 'history'};
                default:           return {index: 0, name: 'properties'};
            }
        }

        $scope.Save = function (updatedResource) {
            $rootScope.$broadcast('$elementDetailsUpdated', updatedResource);
        };

        $scope.tabSelected = function (itemsName) {
            var tab = getTabDetail(itemsName);
            stateHandler.Go("terminology", {tabView: itemsName}, {notify: false, location: tab.index != 0});
            $scope[itemsName] = [];

            $scope.activeTab = getTabDetail(itemsName);

            if ($scope.activeTab && $scope.activeTab.fetchUrl) {
                $scope[$scope.activeTab.name] = [];
                $scope.loadingData = true;
                resources.dataModel.get($stateParams.id, $scope.activeTab.fetchUrl).then(function (data) {
                    $scope[$scope.activeTab.name] = data || [];
                    $scope.loadingData = false;
                });
            }
        };


        $scope.showEditForm = false;
        $scope.editForm = null;
        $scope.openEditForm = function (formName) {
            $scope.showEditForm = true;
            $scope.editForm = formName;
        };

        $scope.closeEditForm = function () {
            $scope.showEditForm = false;
            $scope.editForm = null;
        };


        $scope.fetch = function (text, offset, limit) {
            var deferred = $q.defer();

            limit = limit ? limit : 30;
            offset = offset ? offset : 0;

            if(text.trim() === ""){
                return $q.when({
                    results: [],
                    count: 0,
                    limit: limit,
                    offset: offset
                });
            }
            $scope.searchTerm = text;
            resources.terminology.get($scope.terminology.id, "terms/search", {
                    queryStringParams: {
                        search:  encodeURIComponent(text),
                        limit: limit,
                        offset: offset,
                    }
            }).then(function (result) {
                deferred.resolve({
                    results: result.items,
                    count: result.count,
                    limit: limit,
                    offset: offset
                });
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        $scope.onTermSelect = function(term){
            stateHandler.NewWindow("term",{terminologyId:term.terminology, id:term.id});
        };

        $scope.initialize();

    });

angular.module('controllers').controller('termCtrl',  function ($scope, $state, $stateParams, resources, $window, $rootScope, jointDiagramService3, $q, elementTypes, stateHandler) {
        $scope.activeTab = {index: -1};

        $scope.initialize = function () {

            if (!$stateParams.terminologyId || !$stateParams.id) {
                stateHandler.NotFound({location: false});
                return;
            }

            $scope.terminology = null;
            $scope.term = null;
            $window.document.title = "Term";

            //Load Term and also Terminology
            var promises = [];
            promises.push(resources.terminology.get($stateParams.terminologyId));
            promises.push(resources.term.get($stateParams.terminologyId, $stateParams.id));
            promises.push(resources.term.get($stateParams.terminologyId, $stateParams.id, "semanticLinks"));

            $q.all(promises).then(function (results) {
                $scope.terminology = results[0];
                $scope.term = results[1];
                $scope.term.semanticLinks = results[2].items;

                $scope.term.finalised = $scope.terminology.finalised;
                $scope.term.editable  = $scope.terminology.editable;

                $scope.term.classifiers = $scope.term.classifiers || [];
                $scope.activeTab = getTabDetail($stateParams.tabView);
            });

        };

        //These should be in the same order as in the HTML template file (term.html)
        function getTabDetail(tabName) {
            switch (tabName) {
                case 'properties':  return {index: 0, name: 'properties'};
                case 'comments':    return {index: 1, name: 'comments'};
                case 'links':       return {index: 2, name: 'links'};
                case 'attachments': return {index: 3, name:'attachments'};
                default:    return {index: 0, name: 'properties'};
            }
        }

        $scope.Save = function (updatedResource) {
            $rootScope.$broadcast('$elementDetailsUpdated', updatedResource);
        };

        $scope.tabSelected = function (itemsName) {
            var tab = getTabDetail(itemsName);
            stateHandler.Go("term", {tabView: itemsName}, {notify: false, location: tab.index !== 0});
            $scope[itemsName] = [];

            $scope.activeTab = getTabDetail(itemsName);

            if ($scope.activeTab && $scope.activeTab.fetchUrl) {
                $scope[$scope.activeTab.name] = [];
                $scope.loadingData = true;
                resources.terminology.get($stateParams.terminologyId, $scope.activeTab.fetchUrl).then(function (data) {
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


        $scope.initialize();

    });

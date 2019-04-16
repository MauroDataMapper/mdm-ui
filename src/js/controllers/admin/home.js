'use strict';

angular.module('controllers').controller('adminHomeCtrl',  function ($window, $scope, resources, $q, $rootScope) {

        // $scope.activeSessions = [];
        // $scope.plugins = [];
        // $scope.modules = [];
        //
        // resources.admin.get("modules").then(function (result) {
			// $scope.modules = result;
			// $scope.modules.push({id:"0", name:"UI", version:$rootScope.appVersion, isUI: true});
        //
        //     var counts = [5, 10, 25, 50];
        //     if($scope.modules && $scope.modules.length < 10){
        //         counts = [];
        //     }
        //
        //     $scope.modulesTableParams = new ngTableParams(
        //         {
        //             count: 10
        //         },
        //         {
        //             tableTitle: "Modules",
        //             hideAddNewRowButton: true,
        //             counts: counts,
        //             dataset: $scope.modules
        //         }
        //     );
        //
        // });
        //
        // $scope.isToday = function(date){
        //     var today = new Date();
        //     if(today.getUTCFullYear() == date.getUTCFullYear() &&
        //        today.getUTCMonth()   == date.getUTCMonth() &&
        //        today.getUTCDate() == date.getUTCDate()){
        //             return true
        //     }
        //     return false;
        // };
        //
        // resources.admin.get("activeSessions").then(function (result) {
        //     for (var sessionId in result) {
        //         if (result.hasOwnProperty(sessionId)) {
        //             result[sessionId].start = new Date(result[sessionId].sessionOpened);
        //             result[sessionId].last  = new Date(result[sessionId].lastAccess);
        //             $scope.activeSessions.push(result[sessionId]);
        //         }
        //     }
        // });
        //
        // $scope.$watch('activeSessions.length', function (newValue, oldValue, scope) {
        //     if (newValue !== null && newValue !== oldValue) {
        //         if (!scope.activeSessions) {
        //             scope.activeSessions = [];
        //         }
        //         $scope.initializeActiveSessions();
        //     }
        // });
        //
        //
        //
        // $scope.initializeActiveSessions = function () {
        //     var counts = [5, 10, 25, 50];
        //     if($scope.activeSessions && $scope.activeSessions.length < 10){
        //         counts = [];
        //     }
        //
        //     $scope.userTableParams = new ngTableParams(
        //         {
        //             count: 10
        //         },
        //         {
        //             tableTitle: "Active Sessions",
        //             hideAddNewRowButton: true,
        //             counts: counts,
        //             dataset: $scope.activeSessions
        //         }
        //     );
        // };
        //
        //
        //
        // $scope.loadAll = function(){
        //     var deferred = $q.defer();
        //     var result = [];
        //     var promises = [
        //         resources.admin.get("plugins/importers"),
        //         resources.admin.get("plugins/dataLoaders"),
        //         resources.admin.get("plugins/emailers"),
        //         resources.admin.get("plugins/exporters")
        //     ];
        //     $q.all(promises).then(function(responses){
        //         angular.forEach(responses, function (response) {
        //             result = result.concat(response);
        //         });
        //         deferred.resolve(result);
        //     });
        //     return deferred.promise;
        // };
        //
        //
        // $scope.loadAll().then(function (result) {
        //     $scope.plugins = result;
        //     var counts = [5, 10, 25, 50];
        //     if($scope.plugins && $scope.plugins.length < 10){
        //         counts = [];
        //     }
        //     $scope.pluginTableParams = new ngTableParams(
        //         {
        //             count: 10
        //         },
        //         {
        //             tableTitle: "Plugins",
        //             hideAddNewRowButton: true,
        //             counts: counts,
        //             dataset: $scope.plugins
        //         }
        //     );
        // });
        // $scope.initializeActiveSessions();

    });


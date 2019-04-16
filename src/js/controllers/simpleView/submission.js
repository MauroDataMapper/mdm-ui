'use strict';

angular.module('controllers').controller('simpleViewSubmissionCtrl', function ($window, $scope, resources, stateHandler, $cookies, windowHandler, $rootScope) {
        $window.document.title = "Filter Data Models";

        $scope.mainForm = {
            selectedDataModels: [],

            firstName: "",
            lastName: "",
            email: "",
            organisation: "",

           interestedInNotAvailableModels: false,
           moreAdvice: false,

           submissionCompleted: false
        };


        if(!$rootScope.simpleViewSupport){
            stateHandler.Go("home");
            return;
        }


        $scope.readCookies = function() {
            var selectedStr = $cookies.get('selectedDataModels') || "[]";
            return JSON.parse(selectedStr);
        };

        $scope.clearCookies = function() {
            $cookies.remove('selectedDataModels');
        };

        var selectedModels = $scope.readCookies();
        angular.copy(selectedModels, $scope.mainForm.selectedDataModels);
        if($scope.mainForm.selectedDataModels.length === 0){
            stateHandler.Go("appContainer.simpleApp.filter");
            return;
        }

        $scope.addMoreDataSets = function () {
            stateHandler.Go("appContainer.simpleApp.filter");
        };

        $scope.submitRequestForm = function () {
            $scope.mainForm.submissionCompleted = true;
            $scope.clearCookies();
        };


    });


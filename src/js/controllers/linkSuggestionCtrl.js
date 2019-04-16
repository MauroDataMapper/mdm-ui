angular.module('controllers').controller('linkSuggestionCtrl',
    function ($stateParams, $scope, $window) {

        $window.document.title = "Link Suggestion";
        $scope.sourceDMId = $stateParams.sourceDMId;
        $scope.sourceDCId = $stateParams.sourceDCId;
        $scope.sourceDEId = $stateParams.sourceDEId;
        $scope.targetDMId = $stateParams.targetDMId;

    });
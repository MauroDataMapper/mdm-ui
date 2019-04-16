angular.module('directives').directive('mcDataTypeListButtons', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            deleteRows: "&",
            add: "=",
            mcDisplayRecords: "="
        },
        templateUrl: './mcDataTypeListButtons.html',

        link: function (scope, iElement, iAttrs, ctrl) {

        },

        controller: function ($scope) {

            if ($scope.deleteRows) {
                $scope.deleteRows = $scope.deleteRows();
            }

            $scope.textLocation = "left";
            $scope.deletePending = false;

            $scope.onAskDelete = function () {
                var showDelete = false;
                angular.forEach($scope.mcDisplayRecords, function (record) {
                    if (record.checked === true) {
                        showDelete = true;
                    }
                });
                if(showDelete) {
                    $scope.deletePending = true;
                }else{
                    $scope.deleteWarning = "Please select one or more elements.";
                }
            };


            $scope.confirmDeleteClicked = function () {
                if ($scope.deleteRows) {
                    $scope.deletePending = false;
                    $scope.deleteInProgress = true;

                    $scope.deleteRows().then(function () {
                        $scope.deletePending = false;
                        $scope.deleteInProgress = false;
                    }, function () {
                        $scope.deletePending = false;
                        $scope.deleteInProgress = false;
                    });
                }
            };

            $scope.cancelDeleteClicked = function () {
                $scope.deletePending = false;
            };


        }
    };
});

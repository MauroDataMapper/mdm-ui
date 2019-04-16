angular.module("modals").config(["modalHandlerProvider", function (modalHandlerProvider) {

    var factory = ["$uibModal", "args", "securityHandler", function ($uibModal, args, securityHandler) {

        securityHandler.loginModalDisplayed = true;
        var dialogue = $uibModal.open({
            animation: true,
            backdrop: 'static',
            keyboard: false,
            templateUrl: './forgotPasswordModalForm.html',
            controller: ["$scope", "$uibModalInstance", "$state", "securityHandler", "resources", function ($scope, $uibModalInstance, $state, securityHandler, resources) {

                $scope.username = securityHandler.getEmailFromCookies();

                $scope.resetPassword = function () {
                    resources.catalogueUser.get($scope.username, "resetPasswordLink").then(function (result) {
                        $scope.message = 'success';
                    }).catch(function (error) {
                        $scope.message = 'error';
                    });
                    //$uibModalInstance.close($scope.username);
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.keyEntered = function (event) {
                    event.preventDefault();
                    return false;
                };

                $scope.close = function () {
                    $uibModalInstance.dismiss();
                };
            }]
        });
        return dialogue.result;
    }];


    modalHandlerProvider.addModal('forgotPasswordModalForm', factory);
}]);

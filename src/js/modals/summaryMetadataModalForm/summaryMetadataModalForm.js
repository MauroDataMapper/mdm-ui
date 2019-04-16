angular.module("modals").config(["modalHandlerProvider", function (modalHandlerProvider) {

    var factory = ["$uibModal", "args", "securityHandler", function ($uibModal, args, securityHandler) {

        securityHandler.loginModalDisplayed = true;
        var dialogue = $uibModal.open({
            animation: true,
            backdrop: 'static',
            keyboard: true,
            size: 'lg',

            templateUrl: './summaryMetadataModalForm.html',
            controller: ["$scope", "$uibModalInstance", "$state", "securityHandler", "resources", 'validator', 'messageHandler', function ($scope, $uibModalInstance, $state, securityHandler, resources, validator, messageHandler) {

                $scope.model = {
                    summary:args.summary,
                    defaultChartType: args.chartType,
                    currentChartType: args.chartType
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

                // $uibModalInstance.opened.then(function () {
                //     var parent = jQuery("#"+ $scope.model.name).parents(".modal-dialog");
                //     parent.addClass("summaryMetadataModalFormDialogue");
                // });

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
            }]
        });
        return dialogue.result;
    }];


    modalHandlerProvider.addModal('summaryMetadataModalForm', factory);
}]);


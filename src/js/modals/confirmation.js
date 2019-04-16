angular.module('modals').factory('confirmationModal',  function ($q, resources, $uibModal) {

    return {

        open: function (title, message, okBtnTitle, cancelBtnTitle) {
            var dialogue = $uibModal.open({
                animation: true,
                backdrop: 'static',
                keyboard: false,
                template: "\
                <form role='form'>\
					<div class='modal-header'> \
						<h4 class='modal-title'>{{title}}</h4> \
					</div> \
					<div class='modal-body'> \
					    <span ng-bind-html='message'></span>\
					</div> \
					<div class='modal-footer'> \
						<button type='button' class='btn btn-sm btn-success' ng-click='ok()'>{{okTitle}}</button>\
						<button type='button' class='btn btn-sm btn-default' ng-click='close()'>{{cancelTitle}}</button>\
					</div>\
				</form>",
                controller: ["$scope", "$uibModalInstance","$state","securityHandler","$rootScope", function ($scope, $uibModalInstance,$state,securityHandler,$rootScope) {

                    $scope.title  = title;
                    $scope.message  = message;
                    $scope.username = securityHandler.getEmailFromCookies();
                    $scope.password = "";

                    $scope.okTitle     = okBtnTitle ? okBtnTitle: "OK";
                    $scope.cancelTitle = cancelBtnTitle ? cancelBtnTitle: "Cancel";

                    $scope.ok = function () {
                        $uibModalInstance.close({status:"ok"});
                        // $uibModalInstance.dismiss();
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.close({status:"cancel"});
                        // $uibModalInstance.dismiss();
                    };

                    $scope.close = function(){
                        $uibModalInstance.close({status:"close"});
                        // $uibModalInstance.dismiss();
                    }
                }]
            });
            return dialogue.result;
        }

    }
});

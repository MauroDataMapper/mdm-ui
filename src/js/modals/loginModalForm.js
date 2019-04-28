angular.module("modals").config(["modalHandlerProvider", function (modalHandlerProvider) {

	var factory = ["$uibModal", "args", "securityHandler", "modalHandler", function ($uibModal, args,securityHandler, modalHandler) {

		securityHandler.loginModalDisplayed = true;
		var dialogue = $uibModal.open({
			animation: true,
			backdrop: 'static',
			keyboard: false,
			template: " \
				<form role='form' onkeypress='return event.keyCode != 13;'>\
					<div class='modal-header'> \
						<h3 class='modal-title'>Login</h3> \
					</div> \
					<div class='modal-body'> \
						<div ng-show='message' class='alert alert-danger'>\
							<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>\
							{{message}}\
						</div>\
						<div class='form-group'>\
							<label for='username'>Username:</label>\
							<input  class='form-control' id='username' ng-model='username'>\
						</div>\
						<div class='form-group'>\
							<label  for='password'>Password:</label>\
							<input type='password' class='form-control' id='password' ng-model='password' ng-keypress='keyEntered($event)'>\
						</div>\
						<div class='form-group'>\
    					<a href='' ng-click='reset()'>Forgot Password</a>\
        		</div>\
					</div> \
					<div class='modal-footer'> \
						<button type='button' class='btn btn-success' ng-click='login()' ng-disabled='!username || !password'><span class='glyphicon glyphicon-ok'></span> Login</button>\
						<button class='btn btn-default' ng-click='close()'>Cancel</button>\
					</div>\
				</form>",
			controller: ["$scope", "$uibModalInstance","$state","securityHandler","$rootScope", function ($scope, $uibModalInstance,$state,securityHandler,$rootScope) {

				$scope.username = securityHandler.getEmailFromCookies();
				$scope.password = "";

				$scope.login = function () {
					securityHandler.login($scope.username, $scope.password).then(function (user) {
						$uibModalInstance.close(user);
						securityHandler.loginModalDisplayed = false;
					}, function (error) {
						securityHandler.loginModalDisplayed = true;
						if(error.status === 401){
							$scope.message = "Invalid username or password!";
						}else if (error.status === 409){
                            $scope.message = "A user is already logged in, logout first"
                        }else if(error.status === -1){
							//$scope.message = "Server is not available!";
						}
					});
				};

				$scope.cancel = function () {
					securityHandler.loginModalDisplayed = false;
					$uibModalInstance.dismiss('cancel');
				};

				$scope.keyEntered = function(event){
					if (event.which === 13) {
                    	$scope.login();
                     }
				};

				$scope.close = function(){
					securityHandler.loginModalDisplayed = false;
					$uibModalInstance.dismiss()
				};

				$scope.reset = function(){
						$uibModalInstance.dismiss();
            modalHandler.prompt("forgotPasswordModalForm", {});
				}

			}]
		});
		return dialogue.result;
	}];


	modalHandlerProvider.addModal('loginModalForm', factory);
}]);

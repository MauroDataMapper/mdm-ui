
angular.module('directives').directive('approveButton', function () {
	return{
		restrict: 'E',
		scope: {

			onApproveClicked:"&",
			onRejectClicked:"&",

			onConfirmApprove:"&",
      onConfirmReject:"&",

			onCancel:"&",

			textLocation:"@"
		},
		templateUrl: './approveButton.html',
		link: function (scope, element, attrs) {

			scope.pending = false;
			scope.requestType = null;


			/****** Approve ************************************/
			scope.approveClicked = function(){
				scope.pending = true;
        scope.requestType = "approve";

				if (scope.onApproveClicked) {
					scope.onApproveClicked();
				}
			};

			scope.rejectClicked = function(){
					scope.pending = true;
					scope.requestType = "reject";

					if (scope.onRejectClicked) {
							scope.onRejectClicked();
					}
			};

			scope.cancelClicked = function(){
				scope.pending = false;
        scope.requestType = null;
				if(scope.onCancel) {
					scope.onCancel();
				}
			};

			scope.confirmClicked = function(){

				if(scope.requestType === "approve"){
            if(scope.onConfirmApprove) {
                scope.onConfirmApprove();
            }
				}
				if(scope.requestType === "reject"){
            if(scope.onConfirmReject) {
                scope.onConfirmReject();
            }
				}
         scope.pending = false;
         scope.requestType = null;
			};
      /**************************************************** */

		}
	};
});



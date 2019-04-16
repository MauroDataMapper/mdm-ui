angular.module("modals").config(["modalHandlerProvider", function (modalHandlerProvider) {

	var factory = ["$uibModal", "args", function ($uibModal, args) {

		var dialogue = $uibModal.open({
			animation: true,
			template: " \
					<div class='modal-header'> \
						<h3 class='modal-title'>Sample Modal</h3> \
					</div> \
					<div class='modal-body'> \
						<ul> \
							<li ng-repeat='item in items'> \
								<a href='#' ng-click='$event.preventDefault(); selected.item = item'>{{ item }}</a> \
							</li> \
						</ul> \
						Selected: <b>{{ selected.item }}</b> \
					</div> \
					<div class='modal-footer'> \
						<button class='btn btn-primary' type='button' ng-click='ok()'>OK</button> \
						<button class='btn btn-warning' type='button' ng-click='cancel()'>Cancel</button> \
					</div>",
			controller: ["$scope", "$uibModalInstance", function ($scope, $uibModalInstance) {
				$scope.items = args.items;
				$scope.selected = {
					item: $scope.items[0]
				};
				$scope.ok = function () {
					$uibModalInstance.close($scope.selected.item);
				};
				$scope.cancel = function () {
					$uibModalInstance.dismiss('cancel');
				};
			}]
		});
		return dialogue.result;
	}];

	modalHandlerProvider.addModal('sampleModalForm', factory);
}]);

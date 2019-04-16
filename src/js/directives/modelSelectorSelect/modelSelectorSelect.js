angular.module('directives').directive('modelSelectorSelect', function () {
	return{
		restrict: 'E',
		replace: true,
		scope: {
			selectedAddress: "=",
			delay: "=?mssDelay"
		},
		templateUrl: './modelSelectorSelect.html',
		link: function (scope, element, attrs) {
			scope.delay = scope.delay || 250;
		},

		controller: function($scope, resources){

			$scope.model = {};
			$scope.model.selectedAddress = {};
			$scope.model.addresses = [];
			$scope.refreshAddresses = function(address) {
				if(address.length <= 3){
					$scope.model.addresses = [];
					return;
				}
				return resources.searchLabel("datamodelcomponent", address, 0, 0)
					.then(function(response) {
						$scope.model.addresses = response.results;
					});
			};
		}
	};
});



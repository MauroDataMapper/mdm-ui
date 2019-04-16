angular.module('directives').directive('userSelector', function () {
	return{
		restrict: 'E',
		replace: true,
		scope: {
			selectedUser: "=",
			canEnterNewUser: "=",
			ngChange:"&"
		},
		templateUrl: './userSelector.html',
		link: function (scope, element, attrs) {
		},

		controller: function($scope){

			$scope.model = {};
			$scope.model.selectedUser = {};
			$scope.model.users = [];


            // resources.getResource("user", "all").then(function(data) {
            //     $scope.model.users = data;
            // });

            $scope.refreshUsers = function(address) {
				if (!address) { return; }

				var searchCriteria = {
					searchTerm: address,
					offset: 0,
					limit:0
				};


                // resources.saveResourceRel("user", "search", null,searchCriteria).then(function(data){
                //     $scope.model.users = data.results;
                //
                //     if($scope.model.users  && $scope.model.users.length == 0 && $scope.canEnterNewUser == true){
                //         $scope.model.users.push({emailAddress:address, new:true})
                //     }
                // });

            };

            $scope.onSelected = function (selectedItem) {
                //do selectedItem.PropertyName like selectedItem.Name or selectedItem.Key
                //whatever property your list has.
				if($scope.ngChange) {
                    $scope.ngChange(selectedItem);
                }
            }


		}
	};
});



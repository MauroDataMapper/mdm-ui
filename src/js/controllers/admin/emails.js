'use strict';

angular.module('controllers').controller('emailsCtrl', function (resources, $scope, ngToast, $window) {
		$window.document.title = 'Admin - Emails';

		$scope.emails = [];
		resources.admin.get("emails").then(function(result){
			angular.forEach(result, function (row) {
				row.dateTimeSentString = row.dateTimeSent.year+"/"+row.dateTimeSent.monthValue+"/"+row.dateTimeSent.dayOfMonth + " "+row.dateTimeSent.hour+":"+ row.dateTimeSent.minute+":"+row.dateTimeSent.second;
            });
			$scope.emails = result;
		}).catch(function (error) {

		});

		$scope.dateToString = function (date) {
            return date.dayOfMonth+"/"+date.monthValue+"/"+date.year+"  "+date.hour+":"+ date.minute+":"+date.second;
        };


		$scope.toggleMessage = function (record) {
            record.showFailure = !record.showFailure;
        };

	}
);


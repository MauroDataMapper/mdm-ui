angular.module('controllers').controller('newDataModelCtrl', function ($scope, $state, $rootScope, $stateParams, stateHandler, $window, resources, messageHandler) {

		$window.document.title = "New DataModel";

		$scope.steps = [
			{
				templateUrl: '../../../views/newDataModel/step1.html',
				title: 'Element Details',
				hasForm: 'true',
				controller: 'newDataModelStep1Ctrl'
 			},
			{
				templateUrl: '../../../views/newDataModel/step2.html',
				title: 'Properties',
				controller: 'newDataModelStep2Ctrl'
			}
            // {
            //     templateUrl: '../../../views/newDataModel/step3.html',
            //     title: 'Properties',
            //     controller: 'newDataModelStep3Ctrl'
            // }
		];
		$scope.model = {
            metadata: [],
        	classifiers: []
		};

        $scope.parentFolderId = $stateParams.parentFolderId;
        if (!$stateParams.parentFolderId) {
            stateHandler.NotFound({location: false});
        }

        resources.folder.get($scope.parentFolderId).then(function (result) {
        	result.domainType = "Folder";
			$scope.parentFolder = result;
        }).catch(function (error) {
            messageHandler.showError('There was a problem loading the Folder.', error);
        });


        $scope.cancelWizard = function () {
            stateHandler.GoPrevious();
        };

	});

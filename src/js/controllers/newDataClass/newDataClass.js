angular.module('controllers').controller('newDataClassCtrl', function ($scope, $window, $stateParams, $state, resources, $q, $rootScope,formStepElement, ngToast, stateHandler) {

		$window.document.title = "New DataClass";

		$scope.steps = [
            {
                templateUrl: '../../../views/newDataClass/step0.html',
                title: 'How to create?',
                hasForm: 'true',
                controller: 'newDataClassStep0Ctrl'
            },
			{
				templateUrl: '../../../views/newDataClass/step1.html',
				title: 'Element Details',
				hasForm: 'true',
				controller: 'newDataClassStep1Ctrl'
			},
			{
				templateUrl: '../../../views/newDataClass/step2.html',
				title: 'Properties',
				controller: 'newDataClassStep2Ctrl'
			}
		];

		$scope.model = {
            metadata: [],
            classifiers: [],

            createType:"new",
            copyFromDataModel:[],

            selectedDataClasses:[],
            selectedDataClassesMap:{}
		};

        if(!$stateParams.parentDataModelId){
			stateHandler.NotFound({ location: false } );
			return;
        }
        if($stateParams.parentDataClassId){
            resources.dataClass
				.get($stateParams.parentDataModelId, $stateParams.grandParentDataClassId, $stateParams.parentDataClassId)
				.then(function (result) {
                	result.breadcrumbs.push(angular.copy(result));
                    $scope.model.parent = result;
            });
		}else{
            resources.dataModel
				.get($stateParams.parentDataModelId).then(function (result) {
					result.breadcrumbs = [angular.copy(result)];
					$scope.model.parent = result;
            });
		}

        $scope.cancelWizard = function () {
            stateHandler.GoPrevious();
        };

	});

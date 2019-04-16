angular.module('controllers').controller('newDataTypeCtrl',  function ($scope, $window, $state, resources, $rootScope, $q,$stateParams, stateHandler) {
		$window.document.title = "New Data Type";
		$scope.steps = [
			{
                templateUrl: '../../../views/newDataType/step0.html',
                title: 'How to create?',
                hasForm: 'true',
                controller: 'newDataTypeStep0Ctrl'
			},
			{
				templateUrl: '../../../views/newDataType/step1.html',
				title: 'Data Type Details',
				hasForm: 'true',
				controller: 'newDataTypeStep1Ctrl'
			},
			{
				templateUrl: '../../../views/newDataType/step2.html',
				title: 'Metadata',
				controller: 'newDataTypeStep2Ctrl'
			}
		];

		$scope.model =  {
            createType:"new",
            copyFromDataModel:[],
            isValid:false,

			details:{
                label:"",
                description:"",

                domainType: "PrimitiveType",
				metadata:[],
                enumerationValues:[],
                classifiers:[]
			},
		};

        $scope.parentScopeHandler = $scope;


        if(!$stateParams.parentDataModelId){
            stateHandler.NotFound({ location: false } );
            return;
        }

        resources.dataModel
            .get($stateParams.parentDataModelId)
            .then(function (result) {
                $scope.model.parentDataModel = result;
            });


        $scope.cancelWizard = function () {
            stateHandler.GoPrevious();
        };
	});
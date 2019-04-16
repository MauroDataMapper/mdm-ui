angular.module('controllers').controller('newDataClassStep0Ctrl',
	function ($scope, multiStepFormInstance) {

        $scope.$watch('model', function (newValue, oldValue, scope) {
            if (newValue && newValue !== oldValue) {
                $scope.validate(newValue);
            }
        }, true);

        $scope.onSelect = function (dataModel) {
          $scope.model.selectedDataTypes= [];
        };
        $scope.validate = function (newValue) {
            var isValid = true;

            if(!$scope.model.createType){
                isValid = false;
            }

            if($scope.model.createType === 'copy' && $scope.model.copyFromDataModel.length === 0){
                isValid = false;
            }

            multiStepFormInstance.setValidity(isValid);
            return isValid;
        };

        $scope.selectCreateType = function (createType) {
            $scope.model.createType = createType;
        };

    });
angular.module('controllers').controller('newDataElementStep0Ctrl', function ($scope, multiStepFormInstance) {

        multiStepFormInstance.setValidity(false);
        $scope.$watch('model', function (newValue, oldValue, scope) {
            if (newValue) {
                $scope.validate(newValue);
            }
        }, true);

        $scope.onSelect = function (dataClass) {
          $scope.model.selectedDataElements = [];
        };
        $scope.validate = function (newValue) {
            var isValid = true;

            if(!$scope.model.createType){
                isValid = false;
            }

            if($scope.model.createType === 'copy' && $scope.model.copyFromDataClass.length === 0){
                isValid = false;
            }

            multiStepFormInstance.setValidity(isValid);
            return isValid;
        };

        $scope.selectCreateType = function (createType) {
            $scope.model.createType = createType;
        };

    });
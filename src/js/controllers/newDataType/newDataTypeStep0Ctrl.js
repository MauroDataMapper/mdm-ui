angular.module('controllers').controller('newDataTypeStep0Ctrl', function ($scope, multiStepFormInstance, helpDialogueHandler) {

        $scope.$watch('model', function (newValue, oldValue, scope) {
            if (newValue) {
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

        $scope.loadHelp = function () {
            helpDialogueHandler.open("Creating_a_new_type", { my: "right top", at: "bottom", of: jQuery("#helpIcon") });
        };

        $scope.selectCreateType = function (createType) {
            $scope.model.createType = createType;
        };

    });
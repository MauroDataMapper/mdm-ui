angular.module('controllers').controller('newDataClassStep1Ctrl', function ($scope, multiStepFormInstance, validator) {


        multiStepFormInstance.setValidity(false);
        //This is a very very expensive watch as it check 'model' object and all its properties ( as we passed true )...
        //we check if the values are valid and then make the Next button active or inactive
        $scope.$watch('model', function (newValue, oldValue, scope) {
            if (newValue) {
                $scope.multiplicityError = null;
                $scope.validate(newValue);
            }
        }, true);


        $scope.validate = function (newValue) {
            var isValid = true;
            if (newValue && $scope.model.createType === 'new') {
                //check Min/Max
                $scope.multiplicityError = validator.validateMultiplicities(newValue.minMultiplicity, newValue.maxMultiplicity);

                //Check Mandatory fields
                if (!newValue.label || newValue.label.trim().length === 0 || $scope.multiplicityError) {
                    isValid = false;
                }
            }
            if (newValue && $scope.model.createType === 'copy') {
                if ($scope.model.selectedDataClasses.length === 0) {
                    isValid = false;
                }
            }
            multiStepFormInstance.setValidity(isValid);
            return isValid;
        };

        //..............................................................................................................
        $scope.selectedDataClassesStr = "";
        $scope.defaultCheckedMap = $scope.model.selectedDataClassesMap;
        $scope.createSelectedArray = function(){
            $scope.model.selectedDataClasses = [];
            for (var id in $scope.model.selectedDataClassesMap) {
                if ($scope.model.selectedDataClassesMap.hasOwnProperty(id)) {
                    var element = $scope.model.selectedDataClassesMap[id];
                    $scope.model.selectedDataClasses.push(element.node);
                }
            }
        };
        if($scope.model.selectedDataClassesMap){
            $scope.createSelectedArray();
            $scope.validate();
        }
        $scope.onCheck = function (node, parent, checkedMap) {
            $scope.model.selectedDataClassesMap = checkedMap;
            $scope.createSelectedArray();
        };

    });
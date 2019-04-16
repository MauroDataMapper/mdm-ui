angular.module('controllers').controller('newDataModelStep1Ctrl', function ($scope, multiStepFormInstance, $state, resources, helpDialogueHandler) {
		// $scope.allDataModelTypes = elementTypes.getTypesForBaseType("DataModel");
		resources.dataModel.get(null, "types").then(function (dataTypes) {
            $scope.allDataModelTypes = dataTypes;
        })


        $scope.loadHelp = function () {
            helpDialogueHandler.open("Create_a_new_model", { my: "right top", at: "bottom", of: jQuery("#helpIcon") });
        };
	});



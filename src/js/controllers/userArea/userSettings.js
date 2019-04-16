'use strict';

angular.module('controllers').controller('userSettingsCtrl', function ($scope, userSettingsHandler, messageHandler, helpDialogueHandler) {

		$scope.countPerTable = 10;

		$scope.loadUserSettings = function(){
			$scope.countPerTable         = userSettingsHandler.get("countPerTable") || 10;
			$scope.expandMoreDescription = userSettingsHandler.get("expandMoreDescription") || false;
            $scope.includeSupersededDocModels = userSettingsHandler.get("includeSupersededDocModels") || false;
            $scope.showSupersededModels = userSettingsHandler.get("showSupersededModels") || false;
            $scope.showDeletedModels = userSettingsHandler.get("showDeletedModels") || false;
            $scope.favourites = userSettingsHandler.get("favourites") || [];
        };


        userSettingsHandler.init().then(function () {
            $scope.loadUserSettings();
        });


		$scope.submitForm = function () {
            userSettingsHandler.update("countPerTable", $scope.countPerTable);
            userSettingsHandler.update("expandMoreDescription", $scope.expandMoreDescription);
            userSettingsHandler.update("includeSupersededDocModels", $scope.includeSupersededDocModels);

            userSettingsHandler.saveOnServer()
                .then(function() {
                    messageHandler.showSuccess('Settings saved successfully.');
                }).catch(function (error) {
                    messageHandler.showError('There was a problem updating the settings.', error);
                });
        };


        $scope.loadHelp = function () {
            helpDialogueHandler.open("Preferences", { my: "right top", at: "bottom", of: jQuery("#helpIcon") });
        };
	}
);
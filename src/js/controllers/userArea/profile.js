'use strict';

angular.module('controllers').controller('profileCtrl', function ($scope, resources, messageHandler, $window, $cookies, helpDialogueHandler, $rootScope) {
		$window.document.title = "Profile";
        //it's almost a fake variable, it just helps to reload the image after each upload
		$scope.imageVersion = 1;

        $scope.savePicture = function () {
            var imageData = { thumb: $scope.cropped.thumbnail, full: $scope.cropped.image, type: 'png' };
            resources.catalogueUser.put($scope.profile.id, 'image', {resource:imageData}).then(function () {
                messageHandler.showSuccess('User profile image updated successfully.');
                $scope.imageVersion++;
                $scope.cropped = null;
                $rootScope.$broadcast('reloadProfilePicture');
            }).catch(function (error) {
                messageHandler.showError('There was a problem updating your image.', error);
            });
        };

        resources.catalogueUser.get($cookies.get('userId')).then(function (result) {
            $scope.profile = result;
        });

		$scope.onAfterSave = function () {
			var user = {
				id: $scope.profile.id,
				firstName: $scope.profile.firstName,
                lastName: $scope.profile.lastName,
                organisation: $scope.profile.organisation,
                jobTitle: $scope.profile.jobTitle
			};
			resources.catalogueUser.put(user.id, null, {resource: user}).then(function (result) {
                messageHandler.showSuccess('User details updated successfully.');
			});
		};

		$scope.chooseFileImage = function(ev) {
			var file = ev.currentTarget.files[0];
			if(!file){ return; }
			var reader = new FileReader();
			reader.onload = function (e) {
				$scope.$apply(function () {
                    $scope.cropped = {
                        source: e.target.result,
                        thumbnail: null,
						image: null
					};
				});
			};
			reader.readAsDataURL(file);
		};

		$scope.removeProfileImage = function () {
			resources.catalogueUser.delete($scope.profile.id, 'image').then(function (profile) {
                messageHandler.showSuccess('User profile image removed successfully.');
                $scope.cropped = null;
				$scope.imageVersion++;
                $rootScope.$broadcast('reloadProfilePicture');
			});
		};

		$scope.clear = function () {
            $scope.cropped = null;
		};


        $scope.loadHelp = function () {
            helpDialogueHandler.open("User_profile", { my: "right top", at: "bottom", of: jQuery("#helpIcon") });
        };
	}
);
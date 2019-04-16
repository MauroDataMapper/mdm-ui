'use strict';

angular.module('controllers').controller('configurationCtrl', function (resources, $scope, $window, objectEnhancer, messageHandler) {
		$window.document.title = 'Admin - Configuration';

		function getConfig () {
			$scope.properties = null;
			resources.admin.get('properties').then(function(data){
				$scope.old = angular.copy(data);
				$scope.properties = data;
			}).catch(function (error) {
                messageHandler.showError('There was a problem getting the configuration properties.', error);
			});
		}

		$scope.properties = undefined;
		$scope.saving = false;
		$scope.old = {};

		getConfig();

		/**
		 * Create or edit a configuration property
		 */
		$scope.submit = function() {
			// string: form will not close (e.g. server error)
			// not string: form will be closed
			var resource = objectEnhancer.diff($scope.properties, $scope.old);
			$scope.saving = true;

			resources.admin
				.post('editProperties', {resource:resource})
				.then(function () {
                    messageHandler.showSuccess('Configuration properties updated successfully.');
                    getConfig();
			}).catch(function (error) {
                messageHandler.showError('There was a problem updating the configuration properties.', error);
			}).finally(function () {
				$scope.saving = false;
			});
		};

		$scope.same = function () {
			return angular.equals($scope.old, $scope.properties);
		};


		$scope.indexingStatus = '';

		$scope.rebuildIndex = function () {
            $scope.indexingStatus = 'start';
            resources.admin.post("rebuildLuceneIndexes", null, null).then(function(result){
                $scope.indexingStatus = 'success';
            }).catch(function (error) {
            	if(error.status === 418){
                    $scope.indexingStatus = 'success';
            		if(error.data && error.data.timeTaken) {
                        $scope.indexingTime = "in " + error.data.timeTaken;
                    }
				}else {
                    $scope.indexingStatus = 'error';
                }
            });
        }
	}
);

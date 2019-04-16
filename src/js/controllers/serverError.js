angular.module('controllers').controller('serverErrorCtrl', function ($window, $scope, $q, resources, $rootScope, $cookies, securityHandler) {
        $window.document.title = $rootScope.appTitle;

        $scope.supported = false;

        $scope.showError = false;
        $scope.isAdmin = securityHandler.isAdmin();
        $rootScope.latestErrorStr =   JSON.stringify($rootScope.latestError,null,'\t');

        $scope.showYouTrackLink = function () {
            if(!$rootScope.youTrack || ($rootScope.youTrack && !$rootScope.youTrack.url)){
                return false;
            }
            return true;
        };

        $scope.report = function () {
            var error = $rootScope.latestError;
            var summary = "Error " + error.response.status + " on " + error.host;
            var desc = {
                error: error.response.status,
                call: error.response.config.url,
                url: error.url,
                host: error.host,
                date: new Date(),
                message: error.response.data ? error.response.data.message : "",
                exception: error.response.data.exception ? error.response.data.exception.message : "",
                errorCode: error.response.data.errorCode ? error.response.data.errorCode : "",
                user: {
                    firstName: $cookies.get("firstName"),
                    lastName: $cookies.get("lastName"),
                    role: $cookies.get("role")
                },
                validationErrors: (error.response.data && error.response.data.validationErrors) ? error.response.data.validationErrors : "",
            };

            //make sure youTrack is configured
            if (!$scope.showYouTrackLink()) {
                return;
            }
            var descStr = encodeURIComponent("`" + JSON.stringify(desc, undefined, 2) + "`");

            $scope.processing = true;
            resources.youTrack.createIssue(summary, descStr).then(function (response) {
                $scope.processing = false;
                $scope.sentSuccessfully = true;
                delete $rootScope.latestError;
            }).catch(function (result) {
                $scope.processing = false;
                $scope.errorInSubmit = true;
            });
        };

        $scope.toggleLatestError = function () {
            $scope.showError = ! $scope.showError;

        };

    });


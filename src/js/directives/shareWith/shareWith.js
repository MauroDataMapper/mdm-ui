angular.module('directives').directive('shareWith', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            mcElement: "=",
            mcDomainType:"="
        },
        templateUrl: './shareWith.html',
        link: function (scope, element, attrs) {


        },
        controller: function ($scope, messageHandler, resources) {


            $scope.supportedDomainTypes = {
                "DataModel":  {name:"dataModel",   message:"Data Model"},
                "Classifier": {name:"classifier",  message:"Classifier"},
                "Folder":     {name:"folder",      message:"Folder"},
                "Terminology":{name:"terminology", message:"Terminology"}
            };


            $scope.init = function () {
                var type = $scope.supportedDomainTypes[$scope.mcDomainType];
                $scope.endPoint = resources[type.name];
                $scope.message  = type.message;
            };

            $scope.init();

            $scope.shareReadWithEveryoneChanged = function () {
                var callBack;
                if ($scope.mcElement.readableByEveryone === true) {
                    callBack = $scope.endPoint.put($scope.mcElement.id, "readByEveryone");
                } else {
                    callBack = $scope.endPoint.delete($scope.mcElement.id, "readByEveryone");
                }
                callBack.then(function (result) {
                    messageHandler.showSuccess($scope.message + ' updated successfully.');
                }).catch(function (error) {
                    messageHandler.showError('There was a problem updating the ' + $scope.message + '.', error);
                });
            };


            $scope.shareReadWithAuthenticatedChanged = function () {
                var callBack;
                if ($scope.mcElement.readableByAuthenticated === true) {
                    callBack = $scope.endPoint.put($scope.mcElement.id, "readByAuthenticated");
                } else {
                    callBack = $scope.endPoint.delete($scope.mcElement.id, "readByAuthenticated");
                }
                callBack.then(function (result) {
                    messageHandler.showSuccess($scope.message + ' updated successfully.');
                }).catch(function (error) {
                    messageHandler.showError('There was a problem updating the ' + $scope.message + '.', error);
                });
            };

        }
    };
});



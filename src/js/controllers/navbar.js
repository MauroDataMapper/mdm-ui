'use strict';


angular.module("controllers").controller('navbarCtrl', function ($scope, securityHandler, modalHandler, $rootScope, stateHandler) {


        $scope.profilePictureReloadIndex = 0 ;

        if(securityHandler.isLoggedIn()){
            $scope.profile =  securityHandler.getCurrentUser();
        }


        $rootScope.$on('userLoggedIn', function (event, args) {
            $scope.profile =  securityHandler.getCurrentUser();
        });

        $rootScope.$on('reloadProfilePicture', function (event, args) {
            $scope.profilePictureReloadIndex++;
        });



        $scope.openProfile = function(){
            stateHandler.Go("userarea.profile");
        };

        $scope.login = function () {
            var modalInstance = modalHandler.prompt("loginModalForm", {});
            modalInstance.then(function (user) {
                if(user.needsToResetPassword){
                    $rootScope.$broadcast('userLoggedIn', {goTo: "appContainer.userArea.changePassword"});
                    return;
                }
                $scope.profile = user;

                var latestURL = securityHandler.getLatestURL();
                if(latestURL){
                    $rootScope.$broadcast('userLoggedIn');
                    securityHandler.removeLatestURL();
                    stateHandler.CurrentWindow(latestURL);
                    return;
                }else{
                    $rootScope.$broadcast('userLoggedIn', {goTo:  "appContainer.mainApp.twoSidePanel.catalogue.allDataModel"});
                    return;
                }

            });
        };

        $scope.logout = function () {
            securityHandler.logout().then(function () {
                $rootScope.$broadcast('userLoggedOut', {goTo: 'home'});
            });
        };

        $scope.forgottenPassword= function () {
            var modalInstance = modalHandler.prompt("forgotPasswordModalForm", {});
            modalInstance.then(function (username) {


            });
        };

    });
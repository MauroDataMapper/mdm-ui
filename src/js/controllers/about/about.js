'use strict';

var aboutControllerModule =  angular.module('controller.about',[]);
aboutControllerModule.controller('aboutCtrl', function ($window, $scope) {
        $window.document.title = "About";
        $scope.xyz = "Hello from About"
    });

export default aboutControllerModule.name


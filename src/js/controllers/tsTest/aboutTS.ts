import * as angular from 'angular';

var aboutTSControllerModule =  angular.module('controller.aboutTS',[]);
aboutTSControllerModule.controller('aboutTSCtrl', ['$window', '$scope', function ($window, $scope) {
    $window.document.title = "About";
    $scope.xyz = "Hello from About TS";
}]);

export default aboutTSControllerModule.name


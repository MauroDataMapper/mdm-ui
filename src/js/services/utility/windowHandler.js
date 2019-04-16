
angular.module('services').provider("windowHandler", function () {
    var windowProvider = {};

    windowProvider.$get = function ($rootScope) {
        var factoryObject = {};

        factoryObject.isSmallScreen = function () {
           return  $(window).width() <  990 ;
        };
        return factoryObject;
    };

    return windowProvider;
});



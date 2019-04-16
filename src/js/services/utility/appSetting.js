
angular.module('services').provider("appSetting", function () {
    //main setting map
    var appSettings = {};

    //Provider definition
    var appSettingProvider = {};
    appSettingProvider.add = function(key,value){
        appSettings[key] = value;
    };

    appSettingProvider.getSettings = function(){
        return appSettings;
    };

    //appSetting factory
    appSettingProvider.$get = function ($rootScope) {
        'ngInject'

        var factoryObject = {};

        factoryObject.get = function(key){
            return appSettings[key]
        };

        return factoryObject;
    };

    return appSettingProvider;
});


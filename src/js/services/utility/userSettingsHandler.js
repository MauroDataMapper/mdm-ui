import {ngCookies} from 'angular-cookies';
import {CacheFactory} from 'angular-cache';

angular.module('services').factory("userSettingsHandler", function (CacheFactory, resources, $cookies, $q) {

    var defaultSettings =  {
            countPerTable: 20,
            counts: [5, 10, 20, 50],
            expandMoreDescription: false,
            favourites:[],
            includeSupersededModels: false,
            showSupersededModels: false,
            showDeletedModels: false,
            dataFlowDiagramsSetting: {}
    };


    function getUserSettings() {
        var settings = JSON.parse(localStorage.getItem("userSettings"));
        if (!settings) {
            updateUserSettings(defaultSettings);
            settings = defaultSettings;
        }
        return settings;
    }

    function updateUserSettings(setting) {
        localStorage.setItem("userSettings", JSON.stringify(setting));
    }



    function initUserSettings() {
        var deferred = $q.defer();
        //load it from server
        resources.catalogueUser
            .get($cookies.get('userId'), "userPreferences")
            .then(function(result) {
                var settings = null;
                if(!result){
                    settings = defaultSettings;
                } else {
                    //check if we have added new items but they don't exists already, then add them
                    for (var property in defaultSettings) {
                        if (defaultSettings.hasOwnProperty(property) && !result[property]) {
                            result[property] =  defaultSettings[property];
                        }
                    }
                    //save them into the localStorage
                    settings = result;
                }
                //save it locally
                updateUserSettings(settings);
                deferred.resolve(settings);
            },
            function (error) {
                deferred.reject(error);
            });
        return deferred.promise;
    }


    var factoryObject = {};


    factoryObject.init = function () {
        return initUserSettings();
    };


    factoryObject.update = function (setting, value) {
        var storage = getUserSettings();
        storage[setting] = value;
        updateUserSettings(storage);
    };

    factoryObject.get = function (setting) {
        var storage = getUserSettings();
        return storage[setting];
    };

    factoryObject.removeAll = function () {
        localStorage.removeItem("userSettings");
    };


    factoryObject.saveOnServer = function () {
        var defaultSettings = getUserSettings();
        var settingsStr = JSON.stringify(defaultSettings);
        return resources.catalogueUser
            .put($cookies.get('userId'), "userPreferences", {resource:settingsStr, contentType:"text/plain"});
    };

    factoryObject.handleCountPerTable = function(items) {
        var counts = factoryObject.get("counts");
        if(items && items.length < 5) {
            counts = [];
        }
        return counts;
    };

    return factoryObject;

});

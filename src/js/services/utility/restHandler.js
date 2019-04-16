'use strict';

angular.module('services').factory('restHandler', [ '$q', '$http', '$rootScope', '$timeout','$injector', function($q, $http, $rootScope, $timeout ,$injector) {
    var restCall;
    restCall = function(config) {
        var deferred;
        deferred = $q.defer();

        //Make sure that 'withCredentials' is provided, as we no longer use token and just use sessionId
        if(config.withCredentials == undefined || config.withCredentials == null ||
            (config.withCredentials != undefined && config.withCredentials == false)){
            throw new Error("withCredentials is not provided!");
        }


        //broadcast the api is called
        $rootScope.$broadcast('apiCallStart');

        config.headers =  config.headers || {};
        //STOP IE11 from Caching HTTP GET
        config.headers['Cache-Control'] = 'no-cache';
        config.headers['Pragma'] = 'no-cache';

        $http(config).then(function(response) {

            //broadcast the api called is ended
            $rootScope.$broadcast('apiCallEnd');

            if ((response.data == null || response.data == undefined || response.data === "") && response.status >= 200 && response.status < 300) {
                return deferred.resolve(response.data, response.status);
            } else if (response.data.errors == null) {
                return deferred.resolve(response.data);
            } else {
                return deferred.reject(response);
            }
        }, function(response) {

            //broadcast the api called is ended
            $rootScope.$broadcast('apiCallEnd');

            if (response.status === 0 || response.status === -1) {
                $rootScope.$broadcast('applicationOffline', response);
                return deferred.reject(response);
            }
            else if (response.status === 401){
                return deferred.reject(response);
            }
            else if (response.status === 501){
                $rootScope.$broadcast('notImplemented', response);
                return deferred.reject(response);
            }
            else if (response.status >= 400 && response.status < 500 && config.method == 'GET') {
                $rootScope.$broadcast('resourceNotFound', response);
                return deferred.reject(response);
            } else if (response.status >= 500){
                $rootScope.$broadcast('serverError', response);
                return deferred.reject(response);
            }

            return deferred.reject(response);
        });
        return deferred.promise;
    };
    return restCall;
}]);



'use strict';
angular.module('services').factory("mcHttpInterceptor", function ($rootScope,$q) {
	return{
		request:function(config){
			return config;
		}, response:function(response){
			return response||$q.when(response);
		},
		responseError:function(reason){
			return $q.reject(reason);
		} };
});

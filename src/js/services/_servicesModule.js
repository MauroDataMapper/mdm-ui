import 'ng-toast';
import {ngCookies} from 'angular-cookies';
import 'angular-http-auth';
import {CacheFactory} from 'angular-cache';


var servicesModule =  angular.module('services',['ngCookies', 'ngToast.directives', 'http-auth-interceptor', 'angular-cache']);
export default servicesModule.name;
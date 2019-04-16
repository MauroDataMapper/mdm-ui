'use strict';

angular.module('services').provider("securityHandler", function () {

    var securityProvider = {};

    securityProvider.$get =  function ($rootScope,restHandler,$cookies,$state,authService, appSetting, $injector, resources,$q, elementTypes, stateHandler) {
        'ngInject'

        function removeCookie(){
            $cookies.remove('token');
            $cookies.remove('userId');
            $cookies.remove('firstName');
            $cookies.remove('lastName');
            $cookies.remove('username');
            $cookies.remove('role');
            $cookies.remove('needsToResetPassword');
            $cookies.remove('userId');
        }

        function getUserFromCookie(){
            if($cookies.get('username') && $cookies.get('username').length > 0){
                return {
                    id:$cookies.get('userId'),
                    token:$cookies.get('token'),
                    username:$cookies.get('username'),
                    email:$cookies.get('username'),
                    firstName:$cookies.get('firstName'),
                    lastName:$cookies.get('lastName'),
                    role:$cookies.get('role'),
                    needsToResetPassword: $cookies.get('needsToResetPassword')
                };
            }
            return null;
        }

        function getEmailFromCookies() {
            return $cookies.get("email");
        }

        var factoryObject = {};

        factoryObject.addToCookie = function(user){
            $cookies.put('userId',user.id);
            $cookies.put('token',user.token);
            $cookies.put('firstName',user.firstName);
            $cookies.put('lastName',user.lastName);
            $cookies.put('username',user.username);
            $cookies.put('userId',user.id);

            //Keep username for 100 days
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 100);
            $cookies.put('email',user.username, {'expires': expireDate});

            $cookies.put('role',user.role);
            $cookies.put('needsToResetPassword',user.needsToResetPassword);
        };

        factoryObject.loginModalDisplayed = false;
        factoryObject.in_AuthLoginRequiredCheck = false;

        factoryObject.login = function (username, password) {
            // //ignoreAuthModule: true
            // //This parameter is very important as we do not want to handle 401 if user credential is rejected on login modal form
            // //as if the user credentials are rejected Back end server will return 401, we should not show the login modal form again
            var deferred = $q.defer();
            var resource = {username:username,password:password};
            resources.authentication
                .post("login", {resource:resource}, {login:true, ignoreAuthModule: true, withCredentials: true})
                .then(function (result) {
                    var currentUser   = {
                        id: result.id,
                        token: result.token,
                        firstName : result.firstName,
                        lastName: result.lastName,
                        username: result.emailAddress,
                        role: result.userRole.toLowerCase(),
                        needsToResetPassword: result.needsToResetPassword
                    };
                    factoryObject.addToCookie(currentUser);
                    deferred.resolve(currentUser);
                }, function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        };

        factoryObject.logout = function () {
            var deferred = $q.defer();
            resources.authentication
                .post("logout")
                .then(function (result) {
                    removeCookie();
                    stateHandler.Go('home');
                    deferred.resolve(result);
                });
            return deferred.promise;
        };

        factoryObject.expireToken = function () {
            $cookies.remove('token');
        };

        factoryObject.isValidSession = function(){
            return resources.authentication.get('isValidSession');
        };

        factoryObject.isLoggedIn = function(){
            return (getUserFromCookie() != null);
        };

        factoryObject.isAdmin = function(){
            if(this.isLoggedIn()){
                var user = getUserFromCookie();
                if(user.role === "administrator"){
                    return true;
                }
            }
            return false;
        };

        factoryObject.getCurrentUser = function(){
            return getUserFromCookie();
        };


        factoryObject.showIfRoleIsWritable = function(element) {

            //if this app is NOT 'editable', return false
            var isEditable = appSetting.get("appIsEditable");
            if ( isEditable !== null && isEditable === false) {
                return false;
            }else if (isEditable !== null && isEditable === true){

                //Now app is editable, lets check if the user has writable role
                var user = this.getCurrentUser();

                //if the user is not logged-in
                if(!user){
                    return false;
                }

                //because of circular dependencies between stateRoleAccess and SecurityHandler, we load it locally instead of injecting it
                var stateRoleAccess = $injector.get('stateRoleAccess');

                //check if the user role is a writable one and return false if it is NOT
                var allRoles = stateRoleAccess.getAllRoles();
                if(user && user.role && allRoles[user.role]) {
                    if (allRoles[user.role].writable === false) {
                        return false;
                    }
                }else{
                    return false;
                }

                //if a value is provided, we need to check if the user has writable access to the element
                if(element){
                    if(element.editable && !element.finalised){
                        return true;
                    }
                    return false;
                }

                return true;
            }

            return false;
        };

        factoryObject.getEmailFromCookies = function(){
            return getEmailFromCookies();
        };

        factoryObject.isCurrentSessionExpired = function() {
            var deferred = $q.defer();
            if(this.getCurrentUser()) {
                //check session and see if it's still valid
                this.isValidSession().then(function (response) {
                    deferred.resolve(!response);
                });
            }else{
                deferred.resolve(false);
            }
            return deferred.promise;
        };


        factoryObject.saveLatestURL = function (url) {
            $cookies.put('latestURL', url);
        };
        factoryObject.getLatestURL = function () {
            return $cookies.get('latestURL');
        };
        factoryObject.removeLatestURL = function () {
            $cookies.remove('latestURL');
        };

        factoryObject.dataModelAccess = function (element) {
            return {
                showEdit: element.editable && !element.finalised,
                showNewVersion: element.editable && element.finalised,
                showFinalise: element.editable && !element.finalised,
                showPermission: element.editable || factoryObject.isAdmin(),
                showDelete: factoryObject.isAdmin(),
                canAddAnnotation: factoryObject.isLoggedIn(),
                canAddMetadata: factoryObject.isLoggedIn(),

                canAddLink: element.editable && !element.finalised
            };
        };

        factoryObject.termAccess = function (element) {
            return {
                showEdit: element.editable && !element.finalised,
                showNewVersion: element.editable && element.finalised,
                showFinalise: element.editable && !element.finalised,
                showPermission: element.editable || factoryObject.isAdmin(),
                showDelete: factoryObject.isAdmin(),
                canAddAnnotation: factoryObject.isLoggedIn(),
                canAddMetadata: factoryObject.isLoggedIn(),

                canAddLink: element.editable
            };
        };

        factoryObject.dataElementAccess = function(element){
            return {
                showEdit: element.editable,
                showDelete: factoryObject.isAdmin(),
                canAddAnnotation: factoryObject.isLoggedIn(),
                canAddMetadata: factoryObject.isLoggedIn(),

                canAddLink: element.editable && !element.finalised
            };
        };

        factoryObject.dataClassAccess = function(element){
            return {
                showEdit: element.editable,
                showDelete: factoryObject.isAdmin(),
                canAddAnnotation: factoryObject.isLoggedIn(),
                canAddMetadata: factoryObject.isLoggedIn(),

                canAddLink: element.editable && !element.finalised
            };
        };

        factoryObject.dataTypeAccess = function(element){
            return {
                showEdit: element.editable,
                showDelete: factoryObject.isAdmin(),
                canAddAnnotation: factoryObject.isLoggedIn(),
                canAddMetadata: factoryObject.isLoggedIn(),

                canAddLink: element.editable && !element.finalised
            };
        };

        factoryObject.datFlowAccess = function (dataFlow) {
            return {
                showEdit: dataFlow.editable,
                canAddAnnotation: dataFlow.editable,
                canAddMetadata: factoryObject.isLoggedIn()
            };
        };

        factoryObject.elementAccess = function (element) {
            if(element.domainType === "DataModel" || element.domainType === "Terminology" || element.domainType === "CodeSet"){
                return factoryObject.dataModelAccess(element);
            }

            if(element.domainType === "Term"){
                return factoryObject.termAccess(element);
            }

            if(element.domainType === "DataElement"){
                return factoryObject.dataElementAccess(element);
            }

            if(element.domainType === "DataClass"){
                return factoryObject.dataClassAccess(element);
            }

            var dataTypes = elementTypes.getAllDataTypesMap();
            if(dataTypes[element.domainType]){
                return factoryObject.dataTypeAccess(element);
            }

            if(element.domainType === "DataFlow"){
                return factoryObject.datFlowAccess(element);
            }
        };


        factoryObject.folderAccess = function (folder) {
            return {
                showEdit: folder.editable,
                showPermission: folder.editable || factoryObject.isAdmin(),
                showDelete: factoryObject.isAdmin()
            };
        };

        return factoryObject;
    };

    return securityProvider;
});


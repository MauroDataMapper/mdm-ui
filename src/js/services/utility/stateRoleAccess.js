
angular.module('services').provider("stateRoleAccess", function () {

	var allRoles = {
		unregistered: { writable: false },
		editor: { writable: true},
		administrator: { writable: true}
	};

	var mappings = {};

	var stateRoleAccessProvider = {};
	stateRoleAccessProvider.add = function(state, accessRoles){

		if(accessRoles === undefined || accessRoles === null ||  state === undefined || state == null){
			return;
		}

		//lowercase the values
		angular.forEach(accessRoles, function(value, index) {
			accessRoles[index] = value.toLowerCase();
		});

		mappings[state.toLowerCase()] =  accessRoles;
	};

	stateRoleAccessProvider.getMappings = function(){
		return mappings;
	};

	stateRoleAccessProvider.$get =  function ($q, $rootScope,$cookies,securityHandler) {
        'ngInject'

		var factoryObject = {};

		factoryObject.getAccessMap = function(){
			return mappings;
		};

		factoryObject.hasAccess = function (state) {

			var allowedStates = ["appContainer.mainApp.about", "appContainer.userArea.profile", "appContainer.userArea.changePassword"];

			if($cookies.get('needsToResetPassword') === "true"){
				if(allowedStates.indexOf(state) === -1){
                    return false;
				}else{
					return true;
				}
			}

            if (state) {
                state = state.toLowerCase();
            }
			//if this state does not exist, JUST DOT NOT LET THEM ACCESS!!!!
			if(!mappings[state]){
				return false;
			}

			//if it is a public resource, then show it, regardless of the user role
			if(mappings[state].indexOf('public') !== -1){
				return true;
			}

			//if it is NOT a public resource, then check if user has enough access

			//if the user is not logged in then return false
			if(!securityHandler.isLoggedIn()){
				return false;
			}

			//if this user is logged In but its role does NOT exist in valid role for this resource
			var user = securityHandler.getCurrentUser();
			return mappings[state].indexOf(user.role) !== -1;

		};

		factoryObject.getAllRoles = function(){
			return allRoles;
		};

		return factoryObject;
	};

	return stateRoleAccessProvider;
});


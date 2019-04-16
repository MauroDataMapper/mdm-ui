angular.module('directives').directive('userAccessNew', function () {
	return{
		restrict: 'E',
		replace: true,
		scope: {
            parent: "=",
            parentType: "="
		},
		templateUrl: './userAccessNew.html',

		link: function (scope, element, attrs) {},

        controller: function($scope, securityHandler, $q, resources, messageHandler, validator){
            $scope.users = [];


            $scope.supportedDomainTypes = {
                "DataModel":   {name:"dataModel",   message:"Data Model"},
                "Classifier":  {name:"classifier",  message:"Classifier"},
                "Folder":      {name:"folder",      message:"Folder"},
                "Terminology": {name:"terminology", message:"Terminology"},
            };

            $scope.$watch('parent.id', function (newValue, oldValue, scope) {
                if (newValue !== null && newValue !== oldValue ) {
                    $scope.buildUsers();
                }
            });

            //as users of an element are in two separate lists 'writeableByUsers' and 'readableByUsers'
            //we merge them into one Array here $scope.users
            $scope.buildUsers = function(){
                $scope.users = [];
                var usersMap = {};


                for(var i = 0; $scope.parent.writeableByUsers  && i < $scope.parent.writeableByUsers.length; i++){
                    var user = $scope.parent.writeableByUsers[i];
                    usersMap[user.emailAddress] = {
                        user: user,
                        readAccess : false,
                        writeAccess: true
                    };
                }

                for(var i = 0; $scope.parent.readableByUsers && i < $scope.parent.readableByUsers.length; i++){
                    var user = $scope.parent.readableByUsers[i];
                    if(!usersMap[user.emailAddress]){
                        usersMap[user.emailAddress] = {
                            user: user,
                            readAccess : true,
                            writeAccess: false
                        };
                    }else{
                        usersMap[user.emailAddress].readAccess = true
					}
                }

                for (var key in usersMap) {
                    if (usersMap.hasOwnProperty(key)) {

                        usersMap[key].inEdit = true;

                        usersMap[key].edit = {
                                id: usersMap[key].user.id,
                                user: angular.copy(usersMap[key].user),
                                firstName: usersMap[key].user.firstName,
                                lastName: usersMap[key].user.lastName,
                                writeAccess: usersMap[key].writeAccess,
                                readAccess: usersMap[key].readAccess
                        };

                    	$scope.users.push(usersMap[key]);
                    }
                }
            };

            $scope.save = function(row, index){
                //if nothing's changed, then return
                if(row.writeAccess === row.edit.writeAccess &&
                    row.readAccess  === row.edit.readAccess){
                    return
                }

                var promises = [];
                var name    = $scope.supportedDomainTypes[$scope.parentType].name;
                var message = $scope.supportedDomainTypes[$scope.parentType].message;

                var mId = $scope.parent.id;

                //in edit mode, we save them here
                if(row.edit.user && row.edit.user.id !== -1){
                    var uId = row.edit.user.id;

                    // Delete ReadAccess
                    if(row.readAccess && !row.edit.readAccess) {
                        promises.push(resources[name].delete(mId, "read/user/" + uId));
                    }else{
                        //Put WriteAccess
                        if(!row.writeAccess && row.edit.writeAccess) {
                            promises.push(resources[name].put(mId, "write/user/" + uId));
                        }else{
                            //Delete WriteAccess
                            if(row.writeAccess && !row.edit.writeAccess) {
                                promises.push(resources[name].delete(mId, "write/user/" + uId));
                            }else if(!row.readAccess && row.edit.readAccess) {
                                //Put ReadAccess
                                promises.push(resources[name].put(mId, "read/user/" + uId));
                            }
                        }
                    }
                }else{
                    var resource  = {
                        emailAddress: row.edit.user.emailAddress,
                        firstName: row.edit.user.firstName,
                        lastName: row.edit.user.lastName
                    };
                    //in new mode, it's a completely new user
                    if(row.edit.writeAccess){
                        promises.push(resources[name].put(mId, "write/user/", {resource: resource}));
                    }else if(!row.edit.writeAccess && row.edit.readAccess){
                        //if it's Write, then do not call read
                        promises.push(resources[name].put(mId, "read/user/",  {resource: resource}));
                    }

                }

                $q.all(promises).then(function (result) {
                    row.readAccess  = row.edit.readAccess;
                    row.writeAccess = row.edit.writeAccess;
                    row.user = {
                        id: row.edit.user.id,
                        emailAddress: row.edit.user.emailAddress,
                        firstName: row.edit.user.firstName,
                        lastName: row.edit.user.lastName
                    };

                    //if it's a new User, then we need to find the user's ID
                    //So go through all the users and find the user id by matching the email address
                    if(row.isNew){
                        angular.forEach(result[0].readableByUsers, function (rbu) {
                            if(rbu.emailAddress.toLowerCase() === row.user.emailAddress.toLowerCase()){
                                row.user.id = rbu.id;
                            }
                        });
                    }

                    //if both are false, remove the row
                    if(!row.edit.readAccess && !row.edit.writeAccess){
                        $scope.users.splice(index,1);
                    }else{
                        row.isNew = false;
                        row.inEdit= true;
                        $scope.users[index] = row;
                    }
                    messageHandler.showSuccess(message + ' updated successfully.');
                }).catch(function (error) {
                    messageHandler.showError('There was a problem updating the ' + message +'.', error);
                });
            };

            $scope.add = function() {
                var newRecord = {
                    id:"",
                    user:null,
                    firstName:"",
                    lastName:"",
                    writeAccess: false,
                    readAccess: false,
                    edit:{
                        id:"",
                        user:null,
                        firstName:"",
                        lastName:"",
                        writeAccess: false,
                        readAccess: false
                    },
                    inEdit:true,
                    isNew:true
                };
                
                $scope.users = [].concat([newRecord]).concat($scope.users);
            };

            $scope.cancelEdit = function (record, index) {
                if(record.isNew){
                    $scope.users.splice(index, 1);
                }
            };

            $scope.onUserSelect = function (select, record) {
                delete record.edit.errors;
                //if removed
                if(!select){
                    record.edit.user = null;
                }else{
                    record.edit.user = {
                        id: select.id,
                        emailAddress: select.emailAddress,
                        firstName: select.firstName,
                        lastName: select.lastName
                    }
                }
            };

            $scope.validate = function (record, index) {
                var isValid = true;
                record.edit = record.edit || {};
                record.edit.errors = [];

                if (!record.edit['user']) {
                    record.edit.errors['user'] = "User Email can't be empty!";
                    isValid = false;
                }


                if (record.edit['user'] && !validator.validateEmail(record.edit['user'].emailAddress)) {
                    record.edit.errors['user'] = "Invalid Email";
                    isValid = false;
                }

                if(record.edit['user'] && validator.isEmpty(record.edit['user'].firstName)){
                    record.edit.errors['firstName'] = "FirstName can't be empty!";
                    isValid = false;
                }

                if(record.edit['user'] && validator.isEmpty(record.edit['user'].lastName)){
                    record.edit.errors['lastName'] = "LastName can't be empty!";
                    isValid = false;
                }

                if (isValid) {
                    delete record.edit.errors;
                }
                return isValid;
            };

            $scope.fetchUser = function (text, offset, limit) {
                var deferred = $q.defer();
                limit  = limit ? limit : 10;
                offset = offset ? offset : 0;
                var options = {
                    pageSize: limit,
                    pageIndex: offset,
                    filters: "search=" + text,
                    sortBy: "emailAddress",
                    sortType: "asc"
                };
                resources.catalogueUser.get(null, "search", options).then(function (result) {
                    deferred.resolve({
                        results:result.items,
                        count: result.count,
                        limit: limit,
                        offset: offset
                    });
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            };

            $scope.readAccessChecked = function (record, $index) {
              if(record.edit.readAccess === false) {
                  record.edit.writeAccess = false;
              }
              if(record.inEdit && !record.isNew){
                  $scope.save(record, $index)
              }
            };

            $scope.writeAccessChecked = function (record, $index) {
                if(record.edit.writeAccess === true) {
                    record.edit.readAccess = true;
                }
                if(record.inEdit && !record.isNew){
                    $scope.save(record, $index)
                }
            };

            if($scope.parent){
                $scope.buildUsers();
            }
        }
	};
});



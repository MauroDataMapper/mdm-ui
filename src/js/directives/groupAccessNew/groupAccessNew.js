angular.module('directives').directive('groupAccessNew', function () {
    return{
        restrict: 'E',
        replace: true,
        scope: {
            parent: "=",
            parentType: "="
        },
        templateUrl: './groupAccessNew.html',

        link: function (scope, element, attrs) {},

        controller: function($scope,ngTableParams, securityHandler, $q, resources, messageHandler){
            $scope.groups = [];
            $scope.allGroups = [];

            $scope.supportedDomainTypes = {
                "DataModel":   {name:"dataModel",   message:"Data Model"},
                "Classifier":  {name:"classifier",  message:"Classifier"},
                "Folder":      {name:"folder",      message:"Folder"},
                "Terminology": {name:"terminology", message:"Terminology"}
            };

            $scope.$watch('parent.id', function (newValue, oldValue, scope) {
                if (newValue !== null && newValue !== oldValue ) {
                    $scope.loadAllGroups();
                    $scope.buildGroups();
                }
            });

            $scope.loadAllGroups = function(){
                $scope.allGroups = [];
                securityHandler.isValidSession().then(function (result) {
                    if(result === false){
                        return;
                    }
                    resources.userGroup.get().then(function (data) {
                        $scope.allGroups = data;
                    }).catch(function (error) {
                        messageHandler.showError('There was a problem getting the group list.', error);
                    });
                });
            };

            $scope.buildGroups = function(){
                $scope.groups = [];
                var groupsMap = {};

                for(var i = 0; $scope.parent.writeableByGroups && i < $scope.parent.writeableByGroups.length; i++){
                    var group = $scope.parent.writeableByGroups[i];
                    groupsMap[group.label] = {
                        group: group,
                        readAccess : false,
                        writeAccess: true
                    };
                }

                for(var i = 0; $scope.parent.readableByGroups && i < $scope.parent.readableByGroups.length; i++){
                    var group = $scope.parent.readableByGroups[i];
                    if(!groupsMap[group.label]){
                        groupsMap[group.label] = {
                            group: group,
                            readAccess : true,
                            writeAccess: false
                        };
                    }else{
                        groupsMap[group.label].readAccess = true
                    }
                }

                for (var key in groupsMap) {
                    if (groupsMap.hasOwnProperty(key)) {
                        groupsMap[key].inEdit = true;
                        groupsMap[key].edit = {
                            group: angular.copy(groupsMap[key].group),
                            writeAccess: groupsMap[key].writeAccess,
                            readAccess: groupsMap[key].readAccess
                        };
                        $scope.groups.push(groupsMap[key]);
                    }
                }
            };

            $scope.save = function(row, $index){
                //if nothing's changed, then return
                if(row.writeAccess === row.edit.writeAccess &&
                   row.readAccess  === row.edit.readAccess){
                    return
                }

                var promises = [];
                var name    = $scope.supportedDomainTypes[$scope.parentType].name;
                var message = $scope.supportedDomainTypes[$scope.parentType].message;

                var mId = $scope.parent.id;
                var gId = row.edit.group.id;

                // Delete ReadAccess
                if(row.readAccess && !row.edit.readAccess) {
                    promises.push(resources[name].delete(mId, "read/group/" + gId));
                }else{
                    //Put WriteAccess
                    if(!row.writeAccess && row.edit.writeAccess) {
                        promises.push(resources[name].put(mId, "write/group/" + gId));
                    }else{
                        //Delete WriteAccess
                        if(row.writeAccess && !row.edit.writeAccess) {
                            promises.push(resources[name].delete(mId, "write/group/" + gId));
                        }else if(!row.readAccess && row.edit.readAccess) {
                            //Put ReadAccess
                            promises.push(resources[name].put(mId, "read/group/" + gId));
                        }
                    }
                }

                $q.all(promises).then(function (result) {

                    //if both are false, remove the row
                    if(!row.edit.readAccess && !row.edit.writeAccess){
                        $scope.groups.splice($index,1);
                    }else{
                        row.isNew = false;
                        row.inEdit= true;
                        row.readAccess  = row.edit.readAccess;
                        row.writeAccess = row.edit.writeAccess;
                        row.group = row.edit.group;
                        $scope.groups[$index] = row;
                    }
                    messageHandler.showSuccess(message + ' updated successfully.');
                }).catch(function () {
                    messageHandler.showError('There was a problem updating the ' + message + '.', error);
                });
            };

            $scope.add = function() {
                var newRecord = {
                    group:null,
                    writeAccess: false,
                    readAccess: false,
                    edit:{
                        group:null,
                        writeAccess: false,
                        readAccess: false
                    },
                    inEdit:true,
                    isNew:true
                };
                $scope.groups = [].concat([newRecord]).concat($scope.groups);
            };


            $scope.cancelEdit = function (record, index) {
                if(record.isNew){
                    $scope.groups.splice(index, 1);
                }
            };

            $scope.onGroupSelect = function (select, record) {
                delete record.edit.errors;
                record.edit.group = select;
            };

            $scope.validate = function (record, index) {
                var isValid = true;
                record.edit.errors = [];
                if (!record.edit['group']) {
                    record.edit.errors['group'] = "Group can't be empty!";
                    isValid = false;
                }
                if (isValid) {
                    delete record.edit.errors;
                }
                return isValid;
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
                $scope.loadAllGroups();
                $scope.buildGroups();
            }
        }
    };
});
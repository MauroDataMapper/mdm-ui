angular.module('directives').directive('annotationList', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            parent: "="
        },
        templateUrl: './annotationList.html',
        link: function (scope, iElement, iAttrs, ctrl) {

        },

        controller:  function ($scope, securityHandler, $q, resources, messageHandler) {

            $scope.$watch('parent', function (newValue, oldValue, scope) {
                if (newValue === null || newValue === undefined) {
                    return;
                }
                $scope.access = securityHandler.elementAccess($scope.parent);
            });

            $scope.currentUser = securityHandler.getCurrentUser();

            $scope.annotationFetch = function(pageSize, pageIndex, sortBy, sortType, filters) {
                var options = {
                    pageSize: pageSize,
                    pageIndex:pageIndex,
                    sortBy: sortBy,
                    sortType:sortType,
                    filters: filters
                };
                return resources.facets.get($scope.parent.id, "annotations", options);
            };

            $scope.add = function() {
                var newRecord = {
                    id: "",
                    label: "",
                    description: "",
                    createdBy:{
                        firstName:'',
                        lastName:'',
                        organisation:'',
                        emailAddress:''
                    },
                    edit: {
                        id: "",
                        label: "",
                        description: ""
                    },
                    inEdit: true,
                    isNew: true
                };
                $scope.mcDisplayRecords = [].concat([newRecord]).concat($scope.mcDisplayRecords);
            };

            $scope.cancelEdit = function(record, index) {
                if (record.isNew) {
                    $scope.mcDisplayRecords.splice(index, 1);
                }
            };

            $scope.saveParent = function(record, index) {
                var resource = {
                    label: record.edit.label,
                    description: record.edit.description
                };
                resources.facets
                    .post($scope.parent.id, "annotations",{resource:resource})
                    .then(function(){
                        messageHandler.showSuccess('Comment saved successfully.');
                        $scope.mcTableHandler.fetchForDynamic();
                    },function(error) {
                        messageHandler.showError("There was a problem adding the comment.", error);
                    });
            };


            $scope.addChild = function(annotation) {
                var resource = {
                    description: annotation.newChildText,
                };
                resources.facets
                    .post($scope.parent.id, "annotations/" + annotation.id + "/annotations", {resource: resource})
                    .then(function (response) {
                        annotation.childAnnotations = annotation.childAnnotations || [];
                        annotation.childAnnotations.push(response);
                        annotation.newChildText = "";
                        messageHandler.showSuccess('Comment saved successfully.');
                    }, function (error) {
                        messageHandler.showError('There was a problem saving the comment.', error);
                        //element not found
                        if (error.status === 400) {
                            //viewError
                        }
                    });
            };

            $scope.showChildren = function(annotation){
                if(annotation.show){
                    annotation.show = false;
                }else{
                    annotation.newChildText = "";
                    annotation.show = true;
                }
            };

        }
    };
});

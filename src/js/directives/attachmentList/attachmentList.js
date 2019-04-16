angular.module('directives').directive('attachmentList', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            parent: "="
        },
        templateUrl: './attachmentList.html',
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

            $scope.attachmentFetch = function (pageSize, pageIndex, sortBy, sortType, filters) {
                var options = {
                    pageSize: pageSize,
                    pageIndex: pageIndex,
                    sortBy: sortBy,
                    sortType: sortType,
                    filters: filters
                };
                return resources.facets.get($scope.parent.id, "referenceFiles", options);
            };

            $scope.add = function () {
                var newRecord = {
                    id: "",
                    fileName: "",
                    edit: {
                        id: "",
                        fileName: "",
                        formData: new FormData()
                    },
                    inEdit: true,
                    isNew: true
                };
                $scope.mcDisplayRecords = [].concat([newRecord]).concat($scope.mcDisplayRecords);
            };

            $scope.cancelEdit = function (record, index) {
                if (record.isNew) {
                    $scope.mcDisplayRecords.splice(index, 1);
                }
            };


            $scope.getFile = function (inputFileName) {
                var element = document.getElementById(inputFileName);
                return (element && element.files) ? element.files[0] : '';
            };

            $scope.save = function (record, index) {
                var fileName = "File" + index;
                record.edit.formData.append("file", $scope.getFile(fileName));
                resources.facets.attachReferenceFile($scope.parent.id, record.edit.formData)
                    .then(function (result) {
                        messageHandler.showSuccess('Attachment uploaded successfully.');
                        $scope.mcTableHandler.fetchForDynamic();
                    }, function (error) {
                        messageHandler.showError("There was a problem saving the attachment.", error);
                    });
            };

            $scope.download = function (record) {
                return resources.facets.downloadLinkReferenceFile($scope.parent.id, record.id);
            };


            $scope.delete = function (record) {
                resources.facets.delete($scope.parent.id, "referenceFiles/" + record.id).then(function (result) {
                    messageHandler.showSuccess('Attachment deleted successfully.');
                    $scope.mcTableHandler.fetchForDynamic();
                }, function (error) {
                    messageHandler.showError("There was a problem deleting the attachment.", error);
                });
            };


        }
    };
});

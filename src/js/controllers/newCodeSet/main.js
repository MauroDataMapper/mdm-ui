angular.module('controllers').controller('newCodeSetCtrl', function ($scope, $state, $stateParams, resources, $window, stateHandler, messageHandler, $rootScope) {

        $scope.savingInProgress = false;
        $scope.model = {
            label:"",
            author:"",
            organisation:"",
            description:"",
            classifiers: [],
            parentFolderId: null,
            parentFolder: null,

            terms: [],
        };


        $scope.model.parentFolderId = $stateParams.parentFolderId;
        if (!$stateParams.parentFolderId) {
            stateHandler.NotFound({location: false});
        }
        resources.folder.get($scope.model.parentFolderId).then(function (result) {
            result.domainType = "Folder";
            $scope.model.parentFolder = result;
        }).catch(function (error) {
            messageHandler.showError('There was a problem loading the Folder.', error);
        });




        $scope.onSelectedTermsChange = function (terms) {
            angular.copy(terms, $scope.model.terms);
        };
        $scope.cancelWizard = function () {
            stateHandler.GoPrevious();
        };
        $scope.save =  function () {

            var resource = {
                label:  $scope.model.label,
                author: $scope.model.author,
                organisation: $scope.model.organisation,
                description: $scope.model.description,
                classifiers: $scope.model.classifiers,
                folder: $scope.model.parentFolderId,

                terms: $scope.model.terms,
            };
            resources.codeSet.post(null, null, {resource:resource}).then(function (result) {
                messageHandler.showSuccess('Code Set created successfully.');
                stateHandler.Go("codeset",{id:result.id});
                $rootScope.$broadcast('$reloadFoldersTree');
            }, function (error) {
                messageHandler.showError('There was a problem creating the Code Set.', error);
            });
        };

    });

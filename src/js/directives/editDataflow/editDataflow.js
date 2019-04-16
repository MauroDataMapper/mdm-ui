angular.module('directives').directive('editDataflow', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            mcDataFlow: "=",
            onCancel: "="
        },
        templateUrl: './editDataflow.html',
        link: function (scope, iElement, iAttrs, ctrl) {


        },

        controller: function ($scope, securityHandler, $q, resources, validator, messageHandler) {

            $scope.form = {
                label:"",
                description:"",
            };
            $scope.$watch('dataflow', function (newValue, oldValue, scope) {
                if(!validator.isDefined(newValue)){return;}

                $scope.form.label = newValue.label;
                $scope.form.description = newValue.description;

                $scope.access = securityHandler.elementAccess($scope.dataflow);
            });


            function getTabDetail(tabName) {
                switch (tabName) {
                    case 'details':  return {index:0, name:'details'};
                    case 'properties': 	 return {index:1, name:'properties'};
                    case 'comments':  	 return {index:2, name:'comments'};
                    default: 			 return {index:0, name:'details'};
                }
            }

            $scope.tabSelected = function (itemsName) {
                $scope.activeTab = getTabDetail(itemsName);

                if($scope.activeTab && $scope.activeTab.fetchUrl){
                    $scope[$scope.activeTab.name] = [];
                    $scope.loadingData = true;
                    resources.dataModel.get($stateParams.id, $scope.activeTab.fetchUrl).then(function (data) {
                        $scope[$scope.activeTab.name] = data || [];
                        $scope.loadingData = false;
                    });
                }
            };

            $scope.cancelForm = function () {
                if($scope.onCancel) {
                    $scope.onCancel();
                }
            };

            $scope.saveForm = function () {
                var resource = {
                    label: $scope.mcDataFlow.label,
                    description: $scope.mcDataFlow.description,
                };
                resources.dataFlow.put($scope.mcDataFlow.target.id, $scope.mcDataFlow.id, null, {resource:resource}).then(function (result) {
                    $scope.onCancel();
                    messageHandler.showSuccess('Dataflow updated successfully.');
                },function (error) {
                    messageHandler.showError('There was a problem updating the Dataflow.', error);
                });
            };

        }
    };
});

angular.module("modals").config(["modalHandlerProvider", function (modalHandlerProvider) {

    var factory = ["$uibModal", "args", "securityHandler", function ($uibModal, args, securityHandler) {

        securityHandler.loginModalDisplayed = true;
        var dialogue = $uibModal.open({
            animation: true,
            backdrop: 'static',
            keyboard: false,
            templateUrl: './newDataflowModalForm.html',
            controller: ["$scope", "$uibModalInstance", "$state", "securityHandler", "resources", 'validator', 'messageHandler', function ($scope, $uibModalInstance, $state, securityHandler, resources, validator, messageHandler) {

                $scope.model = {
                    isValid: false,

                    processing:false,

                    hasError:false,
                    errorMessages:null,

                    direction:"from",

                    label:"",
                    description:"",

                    dataModel:args.dataModel,

                    otherDataModel: null
                };

                $scope.onSelect = function (dataModel) {
                    if(dataModel && dataModel.length > 0) {
                        $scope.model.otherDataModel = dataModel[0];
                    }else{
                        $scope.model.otherDataModel = null;
                    }
                    $scope.validate();
                };

                $scope.directionChanged = function(){
                    $scope.model.otherDataModel = null;
                    $scope.validate();
                };

                $scope.validate = function () {
                    $scope.model.isValid = true;
                    $scope.model.hasError = false;
                    $scope.model.errorMessage = null;

                    if($scope.model.otherDataModel && $scope.model.otherDataModel.type !== "Data Asset"){
                        $scope.model.hasError = true;
                        var dir = $scope.model.direction === "to" ? "Target" : "Source";

                        $scope.model.errorMessage = "<strong>" + dir + "</strong> Data Model should be a <strong>Data Asset</strong> <i style='font-size: 9px;' class='fa fa-database'></i> !";
                        $scope.model.errorMessage += "<br>'<strong>"+ $scope.model.otherDataModel.label + "</strong>' is not a Data Asset</strong>.";
                        $scope.model.isValid = false;
                    }else if($scope.model.otherDataModel && $scope.model.direction === "to"  && $scope.model.otherDataModel.finalised){
                        $scope.model.hasError = true;
                        $scope.model.errorMessage = "<strong>Target</strong> Data Model can not be <strong>Finalised</strong>!";
                        $scope.model.errorMessage += "<br>'<strong>"+ $scope.model.otherDataModel.label + "</strong>' is finalised</strong>.";
                        $scope.model.isValid = false;
                    }else if($scope.model.otherDataModel && $scope.model.direction === "from"  && $scope.model.dataModel.finalised){
                        $scope.model.hasError = true;
                        $scope.model.errorMessage = "<strong>Target</strong> Data Model can not be <strong>Finalised</strong>!";
                        $scope.model.errorMessage += "<br>'<strong>"+ $scope.model.dataModel.label + "</strong>' is finalised</strong>.";
                        $scope.model.isValid = false;
                    }else if (validator.isEmpty($scope.model.label) || !$scope.model.otherDataModel) {
                        $scope.model.isValid = false;
                    }

                        return $scope.model.isValid;
                };

                $scope.save = function(){
                    $scope.model.processing = true;

                    var source = null;
                    var target = null;
                    if($scope.model.direction === "to"){
                        source = $scope.model.dataModel;
                        target = $scope.model.otherDataModel;
                    }else{
                        target = $scope.model.dataModel;
                        source = $scope.model.otherDataModel;
                    }

                    var newDF = {
                        label: $scope.model.label,
                        description: $scope.model.description,
                        source: {
                            id: source.id
                        },
                        target: {
                            id: target.id
                        },
                        dataFlowComponents: []
                    };

                    resources.dataFlow.post(target.id, null, null, {resource:newDF}).then(function (result) {
                        $scope.model.processing = false;
                        messageHandler.showSuccess('Dataflow created successfully.');
                        $uibModalInstance.close({success:true, model:$scope.model});
                    },function (error) {
                        $scope.model.processing = false;
                        $uibModalInstance.close({success:false, model:$scope.model});
                        messageHandler.showError('There was a problem saving the dataflow.', error);
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.keyEntered = function (event) {
                    event.preventDefault();
                    return false;
                };

                $scope.close = function () {
                    $uibModalInstance.dismiss();
                };



                $scope.safeApply = function (fn) {
                    var phase = this.$root.$$phase;
                    if (phase === '$apply' || phase === '$digest') {
                        if (fn && (typeof(fn) === 'function')) {
                            fn();
                        }
                    } else {
                        this.$apply(fn);
                    }
                };
            }]
        });
        return dialogue.result;
    }];


    modalHandlerProvider.addModal('newDataflowModalForm', factory);
}]);

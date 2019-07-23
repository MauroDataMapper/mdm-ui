angular.module('controllers').controller('newDataClassStep1Ctrl', function ($scope, multiStepFormInstance, validator, $state,resources, stateHandler, messageHandler, $q, $rootScope) {
    // function ($scope, multiStepFormInstance, validator) {


        multiStepFormInstance.setValidity(false);
        //This is a very very expensive watch as it check 'model' object and all its properties ( as we passed true )...
        //we check if the values are valid and then make the Next button active or inactive
        $scope.$watch('model', function (newValue, oldValue, scope) {
            if (newValue) {
                $scope.multiplicityError = null;
                $scope.validate(newValue);
            }
        }, true);


        $scope.validate = function (newValue) {
            var isValid = true;
            if (newValue && $scope.model.createType === 'new') {
                //check Min/Max
                $scope.multiplicityError = validator.validateMultiplicities(newValue.minMultiplicity, newValue.maxMultiplicity);

                //Check Mandatory fields
                if (!newValue.label || newValue.label.trim().length === 0 || $scope.multiplicityError) {
                    isValid = false;
                }
            }
            if (newValue && $scope.model.createType === 'copy') {
                if ($scope.model.selectedDataClasses.length === 0) {
                    isValid = false;
                }
            }
            multiStepFormInstance.setValidity(isValid);
            return isValid;
        };

        //..............................................................................................................
        $scope.selectedDataClassesStr = "";
        $scope.defaultCheckedMap = $scope.model.selectedDataClassesMap;
        $scope.createSelectedArray = function(){
            $scope.model.selectedDataClasses = [];
            for (var id in $scope.model.selectedDataClassesMap) {
                if ($scope.model.selectedDataClassesMap.hasOwnProperty(id)) {
                    var element = $scope.model.selectedDataClassesMap[id];
                    $scope.model.selectedDataClasses.push(element.node);
                }
            }
        };
        if($scope.model.selectedDataClassesMap){
            $scope.createSelectedArray();
            $scope.validate();
        }
        $scope.onCheck = function (node, parent, checkedMap) {
            $scope.model.selectedDataClassesMap = checkedMap;
            $scope.createSelectedArray();
        };

        // Save DataModel at this step - AS

    $scope.getMultiplicity = function(resource, multiplicity) {
        if($scope.model[multiplicity] == "*"){
            $scope.model[multiplicity] = -1;
        }
        if(!isNaN($scope.model[multiplicity])){
            resource[multiplicity] = parseInt($scope.model[multiplicity]);
        }
    };

    $scope.save = function () {
        if($scope.model.createType === 'new'){
            $scope.saveNewDataClass();
        }else{
            $scope.saveCopiedDataClasses();
        }
    };



    $scope.saveNewDataClass = function () {
        var resource = {
            label: $scope.model.label,
            description: $scope.model.description,
            classifiers: $scope.model.classifiers.map(function (cls) {
                return {id: cls.id};
            }),
            metadata: $scope.model.metadata.map(function (m) {
                return {
                    key: m.key,
                    value: m.value,
                    namespace: m.namespace
                };
            }),
            minMultiplicity: null,
            maxMultiplicity: null
        };

        $scope.getMultiplicity(resource,"minMultiplicity");
        $scope.getMultiplicity(resource,"maxMultiplicity");


        var deferred;
        if($scope.model.parent.domainType === "DataClass"){
            deferred = resources.dataClass.post($scope.model.parent.dataModel, $scope.model.parent.id, "dataClasses", {resource: resource});
        }else{
            deferred = resources.dataModel.post($scope.model.parent.id, "dataClasses", {resource: resource});
        }

        deferred.then(function(response) {
            messageHandler.showSuccess('Data Class saved successfully.');
            $rootScope.$broadcast('$reloadFoldersTree');
            stateHandler.Go("dataClass", {
                dataModelId:response.dataModel,
                dataClassId:response.parentDataClass,
                id: response.id
            }, {reload: true, location: true});
        })
            .catch(function (error) {
                messageHandler.showError('There was a problem saving the Data Class.', error);
            });
    };

    $scope.finalResult = {};
    $scope.successCount = 0;
    $scope.failCount = 0;

    $scope.saveCopiedDataClasses = function () {
        $scope.processing = true;
        $scope.isProcessComplete = false;
        var chain = $q.when();
        angular.forEach($scope.model.selectedDataClasses, function (dc) {
            (function() {
                chain = chain.then(function(result) {
                    $scope.successCount++;
                    $scope.finalResult[dc.id] = {result:result, hasError:false};
                    var link = "dataClasses/" +  dc.dataModel + "/" + dc.id;
                    if($scope.model.parent.domainType === "DataClass"){
                        return resources.dataClass.post($scope.model.parent.dataModel, $scope.model.parent.id, link);
                    }else{
                        return resources.dataModel.post($scope.model.parent.id, link);
                    }
                }).catch(function (error) {
                    $scope.failCount++;
                    var errorText = messageHandler.getErrorText(error);
                    $scope.finalResult[dc.id] = {result:errorText, hasError:true};
                });
            })();
        });
        chain.then(function (all) {
            $scope.processing = false;
            $scope.isProcessComplete = true;
            $rootScope.$broadcast('$reloadFoldersTree');
        }).catch(function (error) {
            $scope.processing = false;
            $scope.isProcessComplete = true;
        });
    };
    });

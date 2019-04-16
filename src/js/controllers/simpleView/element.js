'use strict';

angular.module('controllers').controller('simpleViewElementCtrl', function ($scope, contextSearchHandler, $stateParams, resources, elementTypes, localStorageService, stateHandler, $q, $rootScope) {

	if(!$rootScope.simpleViewSupport){
		stateHandler.Go("home");
		return;
	}

    $scope.allDataTypes = elementTypes.getAllDataTypesMap();
    $scope.element = null;

    if(!$stateParams.id || !$stateParams.domainType){
        stateHandler.NotFound();
        return;
    }

    $scope.load = function(element){
        if(element.domainType === "DataModel") {
            return resources.dataModel.get(element.id);
        }
        if(element.domainType === "DataElement") {
            if(element.breadcrumbs) {
                return resources.dataElement.get(element.breadcrumbs[0].id, element.breadcrumbs[element.breadcrumbs.length - 1].id, element.id);
            }else{
                return resources.dataElement.get(element.dataModelId, element.dataClassId, element.id);
            }
        }
        if(element.domainType === "DataClass") {
            var parentDataClassId = null;
            if(element.breadcrumbs){
                if(element.breadcrumbs.length > 2){
                    parentDataClassId = element.breadcrumbs[element.breadcrumbs.length-1].id;
                }
                return resources.dataClass.get(element.breadcrumbs[0].id, parentDataClassId, element.id);
            }else{
                return resources.dataClass.get(element.dataModelId, element.dataClassId, element.id);
            }
        }
        if(element.domainType === "DataType" || $scope.allDataTypes[element.domainType]){
            if(element.breadcrumbs) {
                return resources.dataType.get(element.breadcrumbs[0].id, element.id);
            }else{
                return resources.dataType.get(element.dataModelId, element.id);
            }
        }
        if(element.domainType === "EnumerationValue") {
            if(element.breadcrumbs){
                return resources.dataType.get(element.breadcrumbs[0].id, element.breadcrumbs[1].id);
            }else{
                return resources.dataType.get(element.dataModelId, element.id);
            }
        }
        if(element.domainType === "Terminology") {
            return resources.terminology.get(element.id);
        }
        if(element.domainType === "Term") {
            return resources.term.get(element.terminologyId, element.id);
        }
        if(element.domainType === "Classifier") {
            var deferred = $q.defer();
            resources.classifier.get(element.id).then(function (result) {
                result.domainType = "Classifier";
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }
    };

    var el = {
        id: $stateParams.id,
        terminologyId: $stateParams.terminologyId,
        dataModelId: $stateParams.dataModelId,
        dataClassId: $stateParams.dataClassId,
        domainType:$stateParams.domainType
    };


    $scope.load(el).then(function(result){
        $scope.element = result;
    });

});


'use strict';

angular.module('controllers').controller('simpleViewResultCtrl', function ($scope, contextSearchHandler, $stateParams, resources, elementTypes, stateHandler, $q, windowHandler, $rootScope) {

	if(!$rootScope.simpleViewSupport){
		stateHandler.Go("home");
		return;
	}


    $scope.allDataTypes = elementTypes.getAllDataTypesMap();
    $scope.formData = {
        loadedElement: null,
        showSearchResult : false,
        loading: false,
        labelOnly:false,
        exactMatch: false,
        selectedDomainTypes : {
            DataModel: false,
            DataClass: false,
            DataElement: false,
            DataType: false,
            EnumerationValue: false
        }
    };
    $scope.firstTime = true;
    $scope.searchInput = "";
    $scope.dataModelType = null;

    //Load settings from URL
    if($stateParams.pageSize){
        $scope.pageSize = ($stateParams.pageSize && parseInt($stateParams.pageSize) )? parseInt($stateParams.pageSize) : null;
        if($scope.pageSize > 50 || $scope.pageSize < 0){
			$scope.pageSize = null;
        }
    }
    if($stateParams.offset !== null && $stateParams.offset !== undefined){
        $scope.offset   = ($stateParams.offset && parseInt($stateParams.offset) )? parseInt($stateParams.offset) : 0;
		if($scope.offset < 0){
			$scope.offset = null;
		}
    }
    if($stateParams.pageIndex !== null && $stateParams.pageIndex !== undefined){
        $scope.pageIndex   = ($stateParams.offset && parseInt($stateParams.pageIndex) )? parseInt($stateParams.pageIndex) : 0;
		if($scope.pageIndex < 0){
			$scope.pageIndex = null;
		}
    }
    if($stateParams.id){
        $scope.selectedElementId = $stateParams.id;
    }
    if($stateParams.domainType){
        $scope.selectedElementDomainType = $stateParams.domainType;
    }
    if($stateParams.criteria){
        $scope.searchInput = $stateParams.criteria;
        setTimeout(function(){
            $scope.mcTableHandler.fetchForDynamic();
        }, 200);
    }
    if($stateParams.dataModelType){
        $scope.dataModelType = $stateParams.dataModelType;
    }



    $("#searchInput").trigger("focus");

    $scope.applyAffix = function(){
        $('div.simpleViewResultElement').affix({
            offset: {
                top: 70,
            }
        });
    };


    $scope.$watch("searchInput", function (newValue, oldVAlue, scope) {
        if (!newValue || (newValue && newValue.trim().length === 0)) {
            $scope.reloadResult(false);
            return;
        }
        $scope.reloadResult(true);
    });

    $scope.reloadResult = function(showSearchResult){
        $scope.formData.showSearchResult = showSearchResult;
        if($scope.mcTableHandler) {
            $scope.mcTableHandler.fetchForDynamic();
        }
    };

    $scope.onFetchCalled = function(data){
        if(!data || (data && data.count === 0)){return;}

        //if we are in small screen then auto select the first element
        if(!windowHandler.isSmallScreen()){
            $scope.onElementClick(null, data.items[0]);
        }
    };

    $scope.dataModelTypeChange = function(){
        if($scope.mcTableHandler) {
            $scope.mcTableHandler.fetchForDynamic();
        }
    };

    $scope.fetch = function (pageSize, offset) {
        if(!$scope.formData.showSearchResult){
            return $.when({count:0, items:[]});
        }

        var searchText = $scope.searchInput;
        if($scope.formData.exactMatch){
            if(searchText[0] !== "\""){
                searchText = "\""+searchText;
            }
            if(searchText[searchText.length - 1 ] !== "\""){
                searchText = searchText + "\"";
            }
        }

        //Update URL
        $scope.pageIndex= (offset / pageSize) + 1;
        $scope.pageSize = pageSize;
        $scope.offset   = offset;
        stateHandler.Go('simpleviewresult', {criteria: $scope.searchInput, pageSize:$scope.pageSize, offset:$scope.offset, pageIndex:$scope.pageIndex, dataModelType:$scope.dataModelType}, {notify: false});

        //If we are here for the first time, then load pagination settings
        if($scope.firstTime){
            $scope.pageSize = ($stateParams.pageSize && parseInt($stateParams.pageSize) )? parseInt($stateParams.pageSize) : pageSize;
            $scope.offset   = ($stateParams.offset && parseInt($stateParams.offset) )? parseInt($stateParams.offset) : offset;
            $scope.firstTime = false;
        }

        return contextSearchHandler.search(
            $scope.context,
            searchText,
            pageSize,
            offset,
            ['DataModel'],
            $scope.formData.labelOnly,
            [$scope.dataModelType]);
    };

    $scope.search = function () {
        if($scope.searchInput.trim().length !== 0){
            $scope.mcTableHandler.fetchForDynamic();
            $scope.applyAffix();
        }
    };

    $scope.onElementClick = function (event, element) {
        $scope.loading = true;
        $scope.loadedElement = null; // the element that we loaded from the backend
        $scope.selectedElementId = element.id; //the element which is clicked on
        $scope.selectedElementDomainType  = element.domainType;


        //When loading, if we are in small screen then open it in new window
        if(windowHandler.isSmallScreen()){
            stateHandler.Go('simpleviewelement', {id:$scope.selectedElementId, domainType:$scope.selectedElementDomainType});
            return;
        }


        //update URL
        stateHandler.Go('simpleviewresult', {criteria: $scope.searchInput, pageSize:$scope.pageSize, offset:$scope.offset, pageIndex:$scope.pageIndex}, {notify: false}).then(function(){
            //Go to Element
            // setTimeout(function () {
            //     stateHandler.Go('simpleviewelement', {id:$scope.selectedElementId, domainType:$scope.selectedElementDomainType});
            // }, 100);

        });

        $scope.applyAffix();
        $scope.load(element).then(function(result){
            $scope.loadedElement = result;
            $scope.loading = false;
            $scope.safeApply();
        }, function (error) {
            $scope.loadedElement = null;
            $scope.loading = false;
            $scope.safeApply();
        });
    };

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
            return resources.term.get(element.terminology, element.id);
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

});


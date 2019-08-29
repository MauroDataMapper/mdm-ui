angular.module('directives').directive('newDataTypeInline', function () {
		return {
            restrict: 'E',
            scope: {
                parentDataModel : "=",
                showParentDataModel: "=",
                showClassification: "=",
                model: "=",

                parentScopeHandler: "="
            },
            templateUrl: './newDataTypeInline.html',

            link: function (scope, element, attrs) {

            },

            controller: function ($scope, resources, $q, elementTypes) {

                $scope.allDataTypes = elementTypes.getAllDataTypesArray();

                $scope.$watch('model', function (newValue, oldValue, scope) {
                    if (newValue) {

                        $scope.validate();
                        if($scope.parentScopeHandler){
                            $scope.parentScopeHandler.$broadcast("newDataTypeInlineUpdated", {model:$scope.model, isValid:$scope.isValid});
                        }
                    }
                }, true);

                $scope.isValid = false;
                $scope.validate = function () {
                    var isValid = true;

                    if (!$scope.model.label || $scope.model.label.trim().length === 0 ) {
                        isValid = false;
                    }
                    //Check if for EnumerationType, at least one value is added
                    if ($scope.model.domainType === "EnumerationType" && $scope.model.enumerationValues.length === 0) {
                        isValid = false;
                    }
                    //Check if for ReferenceType, the dataClass is selected
                    if ($scope.model.domainType === "ReferenceType" && !$scope.model.referencedDataClass) {
                        isValid = false;
                    }

                    //Check if for TerminologyType, the terminology is selected
                    if ($scope.model.domainType === "TerminologyType" && !$scope.model.referencedTerminology) {
                        isValid = false;
                    }

                    $scope.isValid =  isValid;
                };

                $scope.onDataClassSelect = function (dataClasses) {
                    if(dataClasses && dataClasses.length > 0){
                        $scope.model.referencedDataClass = dataClasses[0];
                    }else{
                        $scope.model.referencedDataClass = null;
                    }
                };

                $scope.loadTerminologies = function(){
                    $scope.reloading = true;
                    resources.terminology.get().then(function (data) {
                        $scope.terminologies = data.items;
                        $scope.reloading = false;
                    }, function () {
                        $scope.reloading = false;
                    });
                };
                $scope.loadTerminologies();

                $scope.onTerminologySelect = function (terminology) {
                    $scope.model.referencedTerminology = terminology;
                    $scope.model.terminology = terminology;
                };

                $scope.onEnumListUpdated = function (newEnumList) {
                    $scope.model.enumerationValues = newEnumList;
                };

            }
        };
	});



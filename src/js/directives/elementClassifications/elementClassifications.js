angular.module('directives').directive('elementClassifications', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            classifications: "=",
            editable: "=",
            newWindow: "=",
            onChange: "="
        },
        templateUrl: './elementClassifications.html',
        link: function (scope, element, attrs) {

        },
        controller: function ($scope, resources, elementTypes) {

			$scope.$watch('classifications', function (newValue, oldValue, scope) {
				if (!newValue) {return;}

				if($scope.newWindow){
				    $scope.target = "_blank";
                }

				//create link for them
				angular.forEach($scope.classifications, function (classification) {
					classification.domainType = 'Classifier';
					classification.link = elementTypes.getLinkUrl(classification);
				});

			});

			resources.classifier.get(null, null, {all: true}).then(function (response) {
                $scope.allClassifications = response.items;
            });

			$scope.onClassifierSelect = function(selectedValue, record) {
                if($scope.onChange){
                    $scope.onChange(selectedValue, record);
                }
            };

        }
    };
});



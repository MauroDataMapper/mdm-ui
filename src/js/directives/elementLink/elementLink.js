angular.module('directives').directive('elementLink', function () {
		return {
            restrict: 'E',
            scope: {
                searchCriteria : "=",
                searchExactMatch : "=",
                mcElement: "=",
                showTypeTitle: "@",
                hideVersionNumber:"=",
                showLink: "@",
                showParentDataModelName: "=",
                newWindow: "=",
                disableLink: "=",
                replaceLabelBy: "=",
                justShowCodeForTerm: "="
            },
            template: '<a tooltip-enable="mcElement.documentationVersion" uib-tooltip="{{versionNumber}}" ng-href="{{!disableLink ? getLinkUrl() : null}}"' +
            ' ng-show="{{showLink}}" target="{{openLinkLocation}}">' +
           				 '<span  ng-bind-html="label | mchighlighter:searchCriteria:!searchExactMatch"></span>' +
            	      '</a>' +
            		  '<span ng-if="showTypeTitle" class="MCElementType">{{mcElementTypeTitle}}</span>',

            link: function (scope, element, attrs) {

            },

            controller: function ($scope, $state, elementTypes) {
                $scope.label = "";
                $scope.versionNumber = '';

                $scope.$watch('mcElement', function (newValue, oldValue, scope) {
                    if (newValue === null || newValue === undefined) {return;}

                    if(!$scope.hideVersionNumber) {
                        $scope.versionNumber = $scope.mcElement.documentationVersion ? ('Documentation Version: ' + $scope.mcElement.documentationVersion) : '';
                    }

                    $scope.label = $scope.mcElement.label || $scope.mcElement.definition;
                    if($scope.mcElement.domainType === "Term" && !$scope.justShowCodeForTerm){
                        $scope.label = $scope.mcElement.code + " : "+ $scope.mcElement.definition;
                    }
                    if($scope.mcElement.domainType === "Term" && $scope.justShowCodeForTerm){
                        $scope.label = $scope.mcElement.code;
                    }

                    if($scope.replaceLabelBy){
                        $scope.label = $scope.replaceLabelBy;
                    }

                    if($scope.showParentDataModelName &&
                       $scope.mcElement.domainType !== "DataModel" &&
                       $scope.mcElement.domainType !== "Term" &&
                       $scope.mcElement.domainType !== "Terminology"){
                            var parentDM =  ($scope.mcElement.breadcrumbs && $scope.mcElement.breadcrumbs.length>0) ? $scope.mcElement.breadcrumbs[0] : null;
                            $scope.label = parentDM.label + " : " + $scope.label;
                    }


                    $scope.initTypeLabel();
                });

                $scope.initTypeLabel = function () {
                    $scope.mcElementTypeTitle = "";
                    $scope.types = elementTypes.getTypes();
                    if($scope.mcElement && $scope.mcElement.domainType && $scope.types[$scope.mcElement.domainType]){
                        $scope.mcElementTypeTitle  = $scope.types[$scope.mcElement.domainType].title;
                    }
                };
                $scope.initTypeLabel();

                $scope.initLink = function(){
                    $scope.openLinkLocation = "_self";
                    if($scope.newWindow){
                        $scope.openLinkLocation = "_blank";
                    }
                    //if it's true or it's NOT mentioned then make it true
                    if($scope.showLink === true || !$scope.showLink) {
                        $scope.showLink = true;
                    }
                };
                $scope.initLink();

                $scope.getLinkUrl = function () {
                    return elementTypes.getLinkUrl($scope.mcElement);
                };

            }
        };
	});



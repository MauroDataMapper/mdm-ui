angular.module('directives').directive('elementDataType', function (stateHandler, elementTypes) {
	return{
		restrict: 'E',
		replace: true,
		scope: {
            newWindow:"=",
			elementDataType: "=",
            mcParentDataModel: "=",
			hideName: "=",
			onlyShowRefDataClass: '=',
			hideEnumList: '=',
			initiallyShowEnumList: '=',
		},
		templateUrl: './elementDataType.html',
		link: function (scope, element, attrs) {

			//number of elements that should be displayed
			scope.showCount = 5;

			scope.toggleShowEnums = scope.initiallyShowEnumList;
            // scope.$watch('restrictEnumListHeight', function (newValue, oldValue, scope) {
            //     if (newValue === null ||  newValue ===  undefined) {return}
            //     if(scope.restrictEnumListHeight){
            //         scope.enumHeight = {'max-height': scope.restrictEnumListHeight, 'overflow-y': 'auto'};
            //     }
            // });


            scope.$watch('elementDataType', function (newValue, oldValue, scope) {
                if (newValue !== null &&  newValue !==  undefined) {

                    var parentDataModelId = scope.mcParentDataModel ? scope.mcParentDataModel.id : null;
                    if(!parentDataModelId){
                        parentDataModelId =  scope.elementDataType.dataModel;
                    }

                	if(newValue.domainType === 'ReferenceType' && newValue.referenceClass){
                        scope.referenceClass = newValue.referenceClass;
                        scope.referenceClassLink = stateHandler.getURL("dataclass", {id: newValue.referenceClass.id, dataModelId: parentDataModelId});
					}

					scope.link = elementTypes.getLinkUrl(scope.elementDataType);
                }
            });

			scope.$watch('elementDataType.enumerationValues.length', function (newValue, oldValue, scope) {
				if (newValue !== null) {

					if (scope.elementDataType && scope.elementDataType.domainType === 'EnumerationType') {


					    //Handle Category in enum
                        //...........................................................................
                        scope.categories = [];
                        scope.allRecords = [].concat(scope.elementDataType.enumerationValues);
                        scope.enumsCount = scope.allRecords.length;
                        scope.hasCategory = false;
                        for(var i = 0; i < scope.allRecords.length; i++){
                            if(scope.allRecords[i] && scope.allRecords[i].category){
                                scope.hasCategory = true;
                                break;
                            }
                        }
                        var categories = _.groupBy(scope.allRecords, function(record){
                            if(record) {
                                return record.category;
                            }
                        });

                        var categoryNames = [];
                        var hasEmptyCategory = false;
                        for (var category in categories) {
                            if(category !== "null") {
                                categoryNames.push(category);
                            }else{
                                hasEmptyCategory = true;
                            }
                        }

                        if(hasEmptyCategory){
                            categoryNames.push("null");
                        }

                        scope.allRecordsWithGroups = [];
                        angular.forEach(categoryNames, function (category) {
                            categories[category] = _.sortBy(categories[category], 'index');

                            if(category!=="null") {
                                scope.categories.push({key:category, value:category});
                            }

                            scope.allRecordsWithGroups.push({
                                id: category !== "null" ? category : null,
                                category: category !== "null" ? category : null,
                                isCategoryRow:true
                            });
                            angular.forEach(categories[category], function (row) {
                                scope.allRecordsWithGroups.push(row);
                            });
                        }) ;
                        //...........................................................................

                        if (scope.allRecordsWithGroups.length > scope.showCount) {
							scope.showMoreIcon = true;
							scope.showing = false;
						}
					}

				}
			});

			scope.showMore = function(){
				if(scope.showMoreIcon && !scope.showing) {
					element.find("tr.moreEnumerationKeyValue").removeClass("hiddenMoreEnumerationKeyValue");
					element.find("a.showMoreEnumerations").html("hide <span class='fa fa-caret-up'></span>");
				}else{
					//element.find("tr.moreEnumerationKeyValue").hide();
					element.find("tr.moreEnumerationKeyValue").addClass("hiddenMoreEnumerationKeyValue");
					element.find("a.showMoreEnumerations").html("... more <span class='fa fa-caret-down'></span>");
				}
				scope.showing = !scope.showing;
			};
			
			scope.showEnums = function () {
                scope.toggleShowEnums = !scope.toggleShowEnums;
            };
		}
	};


});
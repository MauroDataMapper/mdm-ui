angular.module('directives').directive('datatypeDetails', function (selectionHandler, $state) {
	return{
		restrict: 'E',
		replace: true,
		scope: {
			mcDataTypeObject: "=",
			mcParentDataModel: "=",
			afterSave: "=",
            openEditForm:"="
		},
        templateUrl: './dataTypeDetails.html',
		link: function(scope, element, attrs) {
		},
		controller: function($scope, resources, $q, messageHandler, elementSelectorDialogue, markdownParser, stateHandler, $rootScope, confirmationModal, elementTypes) {


            $scope.allDataTypes = elementTypes.getAllDataTypesArray();
            $scope.allDataTypesMap = elementTypes.getAllDataTypesMap();

        $scope.$watch('mcDataTypeObject', function (newValue, oldValue, scope) {
            if (newValue) {
                newValue.aliases = newValue.aliases || [];
                newValue.editAliases = angular.copy(newValue.aliases);
            }
        });


            $scope.validateLabel = function(data){
				if (!data || (data && data.trim().length === 0)) {
					return "Data Type name can not be empty";
				}
			};

			$scope.formBeforeSave = function() {
                var d = $q.defer();
                var resource = {
					id: $scope.mcDataTypeObject.id,
					label: $scope.editableForm.$data.label,
					description: $scope.editableForm.$data.description,
          			aliases: $scope.mcDataTypeObject.editAliases,
					domainType:  $scope.mcDataTypeObject.domainType,
                    classifiers: $scope.mcDataTypeObject.classifiers.map(function (cls) {
                        return {id: cls.id}
                    })
				};

				resources.dataType.put($scope.mcParentDataModel.id , $scope.mcDataTypeObject.id, null, {resource:resource})
					.then(function (result) {
						if($scope.afterSave) {
							$scope.afterSave(resource);
						}
						  $scope.mcDataTypeObject.aliases =  angular.copy(result.aliases || []);
						  $scope.mcDataTypeObject.editAliases =  angular.copy($scope.mcDataTypeObject.aliases);
						  messageHandler.showSuccess('Data Type updated successfully.');
						  d.resolve();
					})
					.catch(function (error) {
                        messageHandler.showError('There was a problem updating the Data Type.', error);
                        d.resolve("error");
					});
                return d.promise;
            };


			//send data on server after writing to local model
			$scope.formAfterSave = function() {
				//return "ERROR"
				//string: form will not close (e.g. server error)
				//not string: form will be closed
			};


            $scope.openEditClicked = function (formName) {
                if($scope.openEditForm){
                    $scope.openEditForm(formName);
                }
            };

        $scope.onCancelEdit = function () {
            $scope.mcDataTypeObject.editAliases =  angular.copy($scope.mcDataTypeObject.aliases);
        };

		$scope.delete = function () {
			resources.dataType.delete($scope.mcParentDataModel.id, $scope.mcDataTypeObject.id)
				.then(function (result) {
                    messageHandler.showSuccess('Data Type deleted successfully.');
					stateHandler.Go("dataModel", {id: $scope.mcParentDataModel.id}, {reload: true, location: true});
				})
				.catch(function (error) {
                    messageHandler.showError('There was a problem deleting the Data Type.', error);
				});
		};


		$scope.askToDelete = function () {
			if (!$rootScope.isAdmin()) {
				return;
			}

			//check if it has DataElements
            resources.dataType.get($scope.mcParentDataModel.id, $scope.mcDataTypeObject.id, "dataElements").then(function (result) {
            	var dataElementsCount = result.count;

            	var message = "Are you sure you want to <span class='errorMessage'>permanently</span> delete this Data Type?";
            	if(dataElementsCount > 0){
            		message += "<br>All it's Data Elements <strong>(" + dataElementsCount + ")</strong> will be deleted <span class='errorMessage'>permanently</span> as well:<br>";


                    for (var i = 0; i < Math.min(5, result.items.length); i++) {
                    	var link = elementTypes.getLinkUrl(result.items[i]);

						message += "<a target='_blank' href='" + link +"'>"+ result.items[i].label+"</a><br>";
                    }
                    if(result.count > 5){
                    	message += " ...";
					}

				}

                confirmationModal.open("Data Type", message)
                    .then(function (result) {
                        if(result.status !== "ok"){
                            return;
                        }
                        $scope.delete(true);
                    });
            });

		};



            // $scope.showAddElementToMarkdown = function () {
		// 	var position = jQuery("span.xeditableTextArea").find("textarea").prop("selectionStart");
        //
		// 	elementSelectorDialogue.open([], true).then(function (selectedElement) {
		// 		if(!selectedElement){
		// 			return;
		// 		}
        //
		// 		var markdonwLink = markdownParser.createMarkdownLink(selectedElement);
		// 		var description = $scope.editableForm.$data.description.slice(0, position) + " " + markdonwLink + " " + $scope.editableForm.$data.description.slice(position);
		// 		$scope.editableForm.$data.description = description;
		// 		jQuery("span.xeditableTextArea").find("textarea").val(description);
        //
		// 		$scope.safeApply();
		// 	});
		// };
		// $scope.lastWasShiftKey = null;
		// $scope.descriptionKeyUp = function($event){
		// 	$event.stopImmediatePropagation();
        //
		// 	$scope.currentShiftKey = ($event.keyCode === 16);
        //
		// 	if($scope.lastWasShiftKey && $scope.currentShiftKey){
		// 		$scope.showAddElementToMarkdown();
		// 		$scope.lastWasShiftKey = false;
		// 		return;
		// 	}
        //
		// 	if($scope.currentShiftKey) {
		// 		$scope.lastWasShiftKey = true;
		// 	}else{
		// 		$scope.lastWasShiftKey = false ;
		// 	}
        //
		// };
		// $scope.safeApply = function (fn) {
		// 	var phase = this.$root.$$phase;
		// 	if (phase === '$apply' || phase === '$digest') {
		// 		if (fn && (typeof(fn) === 'function')) {
		// 			fn();
		// 		}
		// 	} else {
		// 		this.$apply(fn);
		// 	}
		// };



    }
	};
});
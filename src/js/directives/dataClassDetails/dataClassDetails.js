angular.module('directives').directive('dataclassDetails', function () {
	return{
		restrict: 'E',
		replace: true,
        scope: false,
		// scope: {
		// 	mcClassObject: "=",
		// 	mcParentDataModel: "=",
		// 	mcParentDataClass: "=",
		// 	hideEditButton: "@",
		// 	hideModelPath: "@",
		// 	afterSave: "=",
         // openEditForm:"="
		// },
        templateUrl: './dataClassDetails.html',
		link: function(scope, element, attrs) {

		},
		controller: function($scope, validator, $q, stateHandler, $rootScope, messageHandler, resources) {


        $scope.$watch('mcClassObject', function (newValue, oldValue, scope) {
            if (newValue) {
                newValue.aliases = newValue.aliases || [];
                newValue.editAliases = angular.copy(newValue.aliases);
            }
        });


			$scope.validateLabel = function(data){
				if (!data || (data && data.trim().length == 0)) {
					return "DataClass name can not be empty";
				}
			};


			$scope.validateMultiplicity = function () {
                var min = "";
                if($scope.editableForm.$data.minMultiplicity != null && $scope.editableForm.$data.minMultiplicity != undefined){
                    min = $scope.editableForm.$data.minMultiplicity + "";
                }
                var max = "";
                if($scope.editableForm.$data.maxMultiplicity != null && $scope.editableForm.$data.maxMultiplicity != undefined){
                    max = $scope.editableForm.$data.maxMultiplicity + "";
                }

                var errorMessage = validator.validateMultiplicities(min, max);
                if(errorMessage){
                    $scope.editableForm.$setError( 'minMultiplicity', 'Error' );
                    return errorMessage
				}
            };


            $scope.validateMaxMultiplicity = function(data){
                return $scope.validateMultiplicity();
			};


			$scope.formBeforeSave = function() {
				//true or undefined: local model will be updated and form will call aftersave
				//false: local model will not be updated and form will just close (e.g. you update local model yourself)
				//string: local model will not be updated and form will not close (e.g. server error)

				//We generally should run sth here and when we're sure we want to savd the values
				//we should call aftersave
                var d = $q.defer();
				var resource = {
					id    : $scope.mcClassObject.id,
					label : $scope.editableForm.$data.label,
					description  : $scope.editableForm.$data.description,
					domainType : $scope.mcClassObject.domainType,
                    aliases: $scope.mcClassObject.editAliases,
                    classifiers: $scope.mcClassObject.classifiers.map(function (cls) {
                        return {id: cls.id}
                    })
				};


                resource.minMultiplicity = null;
                if(!validator.isEmpty($scope.editableForm.$data.minMultiplicity)){
                    if($scope.editableForm.$data.minMultiplicity == "*"){
                        $scope.editableForm.$data.minMultiplicity = "-1";
					}
                    resource.minMultiplicity = parseInt($scope.editableForm.$data.minMultiplicity);
                }

                resource.maxMultiplicity = null;
                if(!validator.isEmpty($scope.editableForm.$data.maxMultiplicity)){
                    if($scope.editableForm.$data.maxMultiplicity == "*"){
                        $scope.editableForm.$data.maxMultiplicity = "-1";
                    }
                    resource.maxMultiplicity = parseInt($scope.editableForm.$data.maxMultiplicity);
				}


                resources.dataClass
                    .put($scope.mcParentDataModel.id, $scope.mcParentDataClass.id, resource.id, null, {resource: resource})
                    .then(function (result) {
                        if ($scope.afterSave) {
                            $scope.afterSave(resource);
                        }
                        $scope.mcClassObject.aliases =  angular.copy(result.aliases || []);
                        $scope.mcClassObject.editAliases =  angular.copy($scope.mcClassObject.aliases);

                        messageHandler.showSuccess('Data Class updated successfully.');
                        $rootScope.$broadcast('$reloadFoldersTree');
                        d.resolve();
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem updating the Data Class.', error);
                        d.resolve("error");
                    });
                return d.promise;
            };

			$scope.delete = function () {
                resources.dataClass
                    .delete($scope.mcParentDataModel.id, $scope.mcParentDataClass.id, $scope.mcClassObject.id)
                    .then(function (result) {
                        messageHandler.showSuccess('Data Class deleted successfully.');
                        stateHandler.Go("dataModel", {id: $scope.mcParentDataModel.id}, {reload: true, location: true});
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem deleting the Data Class.', error);
                    });
            };


			//send data on server after writing to local model
			$scope.formAfterSave = function() {
				//return "ERROR"
				//string: form will not close (e.g. server error)
				//not string: form will be closed
			};

        $scope.onCancelEdit = function () {
            $scope.mcClassObject.editAliases =  angular.copy($scope.mcClassObject.aliases);
        };


        $scope.openEditClicked = function (formName) {
                if($scope.openEditForm){
                    $scope.openEditForm(formName);
                }
            };


        $scope.toggleShowSearch = function () {
            $scope.showSearch = !$scope.showSearch;
        };

        // $scope.showAddElementToMarkdown = function () {
        //     var position = jQuery("span.xeditableTextArea").find("textarea").prop("selectionStart");
        //
        //     elementSelectorDialogue.open([], true).then(function (selectedElement) {
        //         if(!selectedElement){
        //             return;
        //         }
        //
        //         var markdonwLink = markdownParser.createMarkdownLink(selectedElement);
        //         var description = $scope.editableForm.$data.description.slice(0, position) + " " + markdonwLink + " " + $scope.editableForm.$data.description.slice(position);
        //         $scope.editableForm.$data.description = description;
        //         jQuery("span.xeditableTextArea").find("textarea").val(description);
        //
        //         $scope.safeApply();
        //     });
        // };
        // $scope.lastWasShiftKey = null;
        // $scope.descriptionKeyUp = function($event){
        //     $event.stopImmediatePropagation();
        //
        //     $scope.currentShiftKey = ($event.keyCode === 16);
        //
        //     if($scope.lastWasShiftKey && $scope.currentShiftKey){
        //         $scope.showAddElementToMarkdown();
        //         $scope.lastWasShiftKey = false;
        //         return;
        //     }
        //
        //     if($scope.currentShiftKey) {
        //         $scope.lastWasShiftKey = true;
        //     }else{
        //         $scope.lastWasShiftKey = false ;
        //     }
        //
        // };
        // $scope.safeApply = function (fn) {
        //     var phase = this.$root.$$phase;
        //     if (phase === '$apply' || phase === '$digest') {
        //         if (fn && (typeof(fn) === 'function')) {
        //             fn();
        //         }
        //     } else {
        //         this.$apply(fn);
        //     }
        // };


		}
	};
});

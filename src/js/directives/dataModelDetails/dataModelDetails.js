angular.module('directives').directive('datamodelDetails', function () {
	return{
		restrict: 'E',
		replace: true,
        scope: false,
        // scope: {
			// mcModelObject: "=",
			// hideEditButton: "@",
			// afterSave: "=",
        //     openEditForm:"="
        // },
        templateUrl: './dataModelDetails.html',
		link: function(scope, element, attrs) {
		},
		controller: function($scope, resources, exportHandler, ngToast, $rootScope, $state, securityHandler, jointDiagramService, $q, stateHandler, confirmationModal, messageHandler,favouriteHandler, helpDialogueHandler){

			$scope.securitySection = false;
			$scope.processing = false;
			$scope.exportError = null;
            $scope.exportList = [];
            $scope.isAdminUser = $rootScope.isAdmin();
            $scope.isLoggedIn  = securityHandler.isLoggedIn();
            $scope.exportedFileIsReady = false;
            $scope.addedToFavourite = false;

            $scope.showMarkDownPreview = false;


            $scope.$watch('mcModelObject', function (newValue, oldValue, scope) {
                if (newValue) {
                    newValue.aliases = newValue.aliases || [];
                    newValue.editAliases = angular.copy(newValue.aliases);


                    var access = securityHandler.elementAccess($scope.mcModelObject);
                    $scope.showEdit = access.showEdit;
                    $scope.showPermission = access.showPermission;
                    $scope.showNewVersion =  access.showNewVersion;
                    $scope.showFinalise   =  access.showFinalise;
                    $scope.showDelete =  access.showDelete;

                    $scope.addedToFavourite = favouriteHandler.isAdded(newValue);
                }
            });


			$scope.validateLabel = function(data){
				if (!data || (data && data.trim().length === 0)) {
					return "DataModel name can not be empty";
				}
			};

            $scope.compareToList = [];
            $scope.$watch('mcModelObject', function (newValue, oldValue, scope) {
                if (newValue) {
                    angular.forEach($scope.mcModelObject.semanticLinks, function (link) {
                        if(link.linkType === "New Version Of"){
                            $scope.compareToList.push(link.target);
                        }
                    });
                    angular.forEach($scope.mcModelObject.semanticLinks, function (link) {
                        if(link.linkType === "Superseded By"){
                            $scope.compareToList.push(link.target);
                        }
                    });
                }
            });

			$scope.formBeforeSave = function() {
                var d = $q.defer();
                var resource = {
                    id: $scope.mcModelObject.id,
                    label: $scope.editableForm.$data.label,
                    description: $scope.editableForm.$data.description,
                    author: $scope.editableForm.$data.author,
                    organisation: $scope.editableForm.$data.organisation,
                    type: $scope.mcModelObject.type,
                    domainType: $scope.mcModelObject.domainType,
                    aliases: $scope.mcModelObject.editAliases,

                    classifiers: $scope.mcModelObject.classifiers.map(function (cls) {
                        return {id: cls.id}
                    })
                };

                resources.dataModel.put(resource.id, null, {resource: resource})
                    .then(function (result) {
                        if ($scope.afterSave) {
                            $scope.afterSave(resource);
                        }
                        $scope.mcModelObject.aliases =  angular.copy(result.aliases || []);
                        $scope.mcModelObject.editAliases =  angular.copy($scope.mcModelObject.aliases);

                        messageHandler.showSuccess('Data Model updated successfully.');
                        //Reload the tree ONLY IF datamodel label is updated
                        if($scope.mcModelObject.label !== result.label) {
                            $rootScope.$broadcast('$reloadFoldersTree');
                        }
                        d.resolve();
                    })
                    .catch(function (error) {
                        messageHandler.showError('There was a problem updating the Data Model.', error);
                        d.resolve("error");
                    });
                return d.promise;
            };

			$scope.toggleSecuritySection = function(){
				$scope.securitySection = !$scope.securitySection;
			};

			$scope.export = function (exporter) {
				$scope.exportError = null;
				$scope.processing = true;
                $scope.exportedFileIsReady = false;

                var promise = exportHandler.exportDataModel([$scope.mcModelObject], exporter);
                promise.then(function (result) {
                    $scope.exportedFileIsReady = true;

					var aLink = exportHandler.createBlobLink(result.fileBlob, result.fileName);
					//remove if any link exists
                    jQuery("#exportFileDownload a").remove();
                	jQuery("#exportFileDownload").append(jQuery(aLink)[0]);

                    $scope.processing = false;
				},function(response){
					$scope.processing = false;
					//error in saving!!
					console.log(response);
					$scope.exportError = "An error occurred when processing the request.";
				});
			};

			$scope.resetExportError = function(){
				$scope.exportError = null;
			};


            $scope.delete = function(permanent) {
                if (!$rootScope.isAdmin()) {
                    return;
                }
                var queryString = permanent ? "permanent=true" : null;
                $scope.deleteInProgress = true;
                resources.dataModel.delete($scope.mcModelObject.id, null, queryString)
                    .then(function () {
                        if(permanent) {
                            $rootScope.$broadcast('$reloadFoldersTree');
                            stateHandler.Go("allDataModel", {reload: true, location: true});
                        }else{
                            $rootScope.$broadcast('$reloadFoldersTree');
                            stateHandler.reload();
                        }
                    })
                    .catch(function (error) {
                        $scope.deleteInProgress = false;
                        messageHandler.showError('There was a problem deleting the Data Model.', error);
                    });
            };

            $scope.askForSoftDelete = function () {
                if (!$rootScope.isAdmin()) {
                    return
                }
                confirmationModal.open("Data Model", "Are you sure you want to delete this Data Model?<br>The Data Model will be marked as deleted and will not be viewable by users except Administrators.")
                    .then(function (result) {
                        if(result.status !== "ok"){
                            return
                        }
                        $scope.delete();
                    });
            };

            $scope.askForPermanentDelete = function () {
                if (!$rootScope.isAdmin()) {
                    return
                }
                confirmationModal.open("Data Model", "Are you sure you want to <span class='errorMessage'>permanently</span> delete this Data Model?")
                    .then(function (result) {
                        if(result.status !== "ok"){
                            return
                        }
                        confirmationModal.open("Data Model", "<strong>Are you sure?</strong><br>All its 'Data Classes', 'Data Elements' and 'Data Types' will be deleted <span class='errorMessage'>permanently</span>.")
                            .then(function (result) {
                                if(result.status !== "ok"){
                                    return
                                }
                                $scope.delete(true);
                            });
                    });
            };

            $scope.openEditClicked = function (formName) {

                if($scope.openEditForm){
                    $scope.openEditForm(formName);
                }
            };

            $scope.newVersion = function () {
                stateHandler.Go("newVersionDataModel", { dataModelId:$scope.mcModelObject.id }, {location: true});
            };

            $scope.finalise = function () {
                confirmationModal.open(
                    "Are you sure you want to finalise the Data Model ?",
                    "Once you finalise a Data Model, you can not edit it anymore!<br>" +
                    "but you can create new version of it.")
                    .then(function (result) {
                        if(result.status !== "ok"){
                            return
                        }
                        $scope.processing = true;
                        resources.dataModel.put($scope.mcModelObject.id, "finalise")
                            .then(function (response) {
                                $scope.processing = false;
                                messageHandler.showSuccess('Data Model finalised successfully.');
                                stateHandler.Go("datamodel", {id: $scope.mcModelObject.id}, {reload:true});
                            })
                            .catch(function (error) {
                                $scope.processing = false;
                                messageHandler.showError('There was a problem finalising the Data Model.', error);
                            });
                    });

            };

            $scope.compare = function (dataModel) {
              stateHandler.NewWindow("modelscomparison",{
                  sourceId:$scope.mcModelObject.id,
                  targetId: dataModel ? dataModel.id : null
              });
            };

            $scope.onCancelEdit = function () {
                $scope.mcModelObject.editAliases =  angular.copy($scope.mcModelObject.aliases);
            };

            $scope.loadExporterList = function () {
                $scope.exportList = [];
                securityHandler.isValidSession().then(function (result) {
                    if (result === false) {
                        return;
                    }
                    resources.public.dataModelExporterPlugins().then(function (result) {
                        $scope.exportList = result;
                    },function(error){
                        messageHandler.showError('There was a problem loading exporters list.', error);
                    });
                });
            };

            $scope.loadExporterList();


            $scope.toggleFavourite = function () {
                favouriteHandler.toggle($scope.mcModelObject);
            };

            $scope.$on("favourites", function (event, action, dataModel) {
                if(dataModel.id !==  $scope.mcModelObject.id){
                    return;
                }
               $scope.addedToFavourite = action === "add";
            });

            $scope.loadHelp = function () {
                helpDialogueHandler.open("Edit_model_details", { my: "right top", at: "bottom", of: jQuery("#helpIcon") });
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

angular.module('controllers').controller('importCtrl', function ($window, $scope, resources, $state, messageHandler, stateHandler, $rootScope, helpDialogueHandler) {
        $window.document.title = "Import";
        $scope.max = 100;
        $scope.dynamic = 100;
        $scope.formData = new FormData();

        $scope.importingInProgress = false;
        $scope.step = "1";

        $scope.selectedImporterStr = undefined;
        $scope.selectedImporterObj = undefined;

        $scope.selectedImporterGroups = [];
        $scope.importers = [];


        $scope.formOptionsMap = {
            "Integer": "number",
            "String": "text",
            "Password": "password",
            "Boolean": "checkbox",
            "File": "file"
        };


        $scope.loadImporters = function (multiple) {
            resources.public.dataModelImporterPlugins(multiple)
                .then(function (result) {
                    $scope.importers = result;
                }, function (error) {
                    messageHandler.showError('Can not load importers!', error);
                });
        };


        $scope.loadImporterParameters = function (selectedItem) {
            if (!selectedItem) {
                $scope.selectedImporterGroups = [];
                $scope.step = "1";
                return;
            }

            $scope.importerHelp = helpDialogueHandler.getImporterHelp(selectedItem.name);


            var action =
                "parameters" + "/" +
                selectedItem.namespace + "/" +
                selectedItem.name + "/" +
                selectedItem.version;
            resources.importer.get(action).then(function (result) {
                $scope.selectedImporterGroups = result.parameterGroups;


                for (var g = 0; g < $scope.selectedImporterGroups.length; g++) {
                    var parameters = $scope.selectedImporterGroups[g].parameters;

                    for (var i = 0; i < parameters.length; i++) {
                        var option = parameters[i];

                        //add default value
                        option.value = "";

                        if (option.optional === undefined) {
                            option.optional = false;
                        }

                        //When the input is just a checkbox we give it 'false' as the default value
                        //so don't mark it as optional, as the form will be invalid unless the user checks or unChecks the input
                        if (option.type === "Boolean") {
                            option.optional = true;
                            option.value = false;
                        }
                    }
                }
            });
        };


        $scope.importerChanged = function () {
            $scope.step = "2";

            if ($scope.selectedImporterStr.length === 0) {
                $scope.selectedImporterObj = null;
            } else {
                $scope.selectedImporterObj = JSON.parse($scope.selectedImporterStr);
            }
            $scope.loadImporterParameters($scope.selectedImporterObj);
        };


        $scope.loadImporters();

        // function to submit the form after all validation has occurred
        $scope.submitForm = function (isValid) {
            //if the form is not valid, return
            if (!isValid) {
                return;
            }
            $scope.startImport();
        };


        $scope.startImport = function () {
            $scope.importingInProgress = true;
            $scope.importCompleted = false;
            $scope.importResult = null;

            var namespace = $scope.selectedImporterObj.namespace;
            var name = $scope.selectedImporterObj.name;
            var version = $scope.selectedImporterObj.version;
            $scope.formData = new FormData();


            for (var g = 0; g < $scope.selectedImporterGroups.length; g++) {
                var parameters = $scope.selectedImporterGroups[g].parameters;


                for (var i = 0; i < parameters.length; i++) {
                    var param = parameters[i];

                    if (param.type === "File") {
                        $scope.formData.append(param.name, $scope.getFile(param.name));
                    } else if (param.type === "DataModel") {
                        $scope.formData.append(param.name, param.value[0].id);
                    } else if (param.type === "Folder" && param.value && param.value[0]) {
                        $scope.formData.append(param.name, param.value[0].id);
                    } else {
                        $scope.formData.append(param.name, param.value);
                    }
                }

            }


            resources.dataModel.import(namespace + "/" + name + "/" + version, $scope.formData).then(function (result) {
                $scope.importingInProgress = false;
                $scope.importCompleted = true;
                $scope.importResult = result;
                $scope.importHasError = false;
                $scope.importErrors = [];

                messageHandler.showSuccess("Data Model(s) imported successfully");
                $rootScope.$broadcast('$reloadDataModels');

                // $rootScope.$on('$dataModelsLoadCompleted', function (ev, to, toParams, from, fromParams) {
                //   $rootScope.$broadcast('$markNewOnesInDataModels',result.items);
                // });

                if (result && result.count === 1) {
                    stateHandler.Go("datamodel", {id: result.items[0].id}, {reload: true, location: true});
                }

            }, function (error) {

                if(error.status === 422){
                    $scope.importHasError = true;
                    $scope.importErrors = error.data.validationErrors.errors;
                }
                $scope.importingInProgress = false;
                messageHandler.showError("Error in import process");
            });
        };

        $scope.getFile = function (paramName) {
            var element = document.getElementById(paramName);
            return (element && element.files) ? element.files[0] : '';
        };

        $scope.loadHelp = function () {
            helpDialogueHandler.open("Importing_models", {my: "right top", at: "bottom", of: jQuery("#helpIcon")});
        };

        $scope.loadImporterHelp = function () {
            helpDialogueHandler.open($scope.importerHelp, {
                my: "right top",
                at: "bottom",
                of: jQuery("#importerHelpIcon")
            });
        };
    });

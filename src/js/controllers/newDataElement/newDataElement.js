angular.module('controllers').controller('newDataElementCtrl', function ($scope, $stateParams, resources, $window, stateHandler) {
            $window.document.title = "New DataElement";
            $scope.steps = [
                {
                    templateUrl: '../../../views/newDataElement/step0.html',
                    title: 'How to create?',
                    hasForm: 'true',
                    controller: 'newDataElementStep0Ctrl'
                },
                {
                    templateUrl: '../../../views/newDataElement/step1.html',
                    title: 'Element Details',
                    hasForm: 'true',
                    controller: 'newDataElementStep1Ctrl'
                }
                // {
                //     templateUrl: '../../../views/newDataElement/step2.html',
                //     title: 'Properties',
                //     controller: 'newDataElementStep2Ctrl'
                // }
            ];
            $scope.model = {
                metadata: [],
                dataType: undefined,
                description: undefined,
                classifiers: [],
                parentDataModel: {id:$stateParams.parentDataModelId},
                parentDataClass: {id:$stateParams.parentDataClassId},

                createType:"new",
                copyFromDataClass:[],
                selectedDataElements:[],

                inlineDataTypeValid: false,
                showNewInlineDataType: false,
                newlyAddedDataType:{
                    label:"",
                    description:"",

                    metadata: [],
                    domainType: "PrimitiveType",
                    enumerationValues: [],
                    classifiers: [],
                }
            };

            $scope.parentScopeHandler = $scope;


            if (!$stateParams.parentDataClassId || !$stateParams.parentDataModelId) {
                stateHandler.NotFound({location: false});
                return;
            }

            //load dataClass
            resources.dataClass.get($stateParams.parentDataModelId, $stateParams.grandParentDataClassId, $stateParams.parentDataClassId)
                .then(function (result) {
                    $scope.model.parent = result;
                });
            //load count of all dataTypes]
            resources.dataModel.get($stateParams.parentDataModelId, "dataTypes").then(function (result) {
                   $scope.allDataTypesCount = result.count;
                   if(result.count === 0){
                       $scope.model.showNewInlineDataType = true;
                   }
            });


            $scope.cancelWizard = function () {
                stateHandler.GoPrevious();
            };

        });

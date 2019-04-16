'use strict';
angular.module('controllers').controller('dataFlowDM2DMCtrl', function ($scope, $stateParams, resources, $window, $q, elementTypes, userSettingsHandler,dataFlowHandler, stateHandler, securityHandler, messageHandler, exportHandler) {

        $window.document.title = "Dataflow";

        if (!$stateParams.id) {
            stateHandler.NotFound({location:false});
            return;
        }


          $scope.guid = function() {
              function s4() {
                  return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
              }
              return s4();
          };

        $scope.accessHandler = function (dataFlowId, sourceDMId, targetDMId, optName) {
            var deferred = jQuery.Deferred();
            var target = {id:null};

            if(optName === "create") {
                target.id = targetDMId;
            }else if(optName === "remove" || optName === "editDetails") {
                target.id = $scope.dataFlowsMap[dataFlowId].target.id;
            }
            resources.dataModel.get(target.id).then(function(result) {
                if (result.finalised === true) {
                  deferred.resolve("'" + result.label + "'<br> A <strong>finalised</strong> Data Model can't be used as <strong>target</strong>");
                }
                else if (result.editable === false) {
                    deferred.resolve("You need to have 'Write Access' to '" + result.label + "'");
                }
                else {
                  deferred.resolve(null);
                }
            });
            return deferred.promise();
        };


        //$scope.isReadOnly = false;
        $scope.targetTreeLoading = true;
        $scope.selectedElement = null;
        $scope.form = null;
        $scope.source = null;
        $scope.sourceTree = [];
        $scope.allModels = [];
        $scope.dataFlowsMap = {};




        $scope.initialize = function () {
          $scope.dataFlowHandler =  dataFlowHandler.getDM2DMDataFlowLightHandler(jQuery("div.designer"),jQuery("svg.designer"), null, $scope.accessHandler);
          $scope.dataFlowHandler.zoom(1);

          var promises = [];
          promises.push(resources.dataModel.get($stateParams.id, "dataFlows", {all:true, filters:"type=source"}));
          promises.push(resources.dataModel.get($stateParams.id, "dataFlows", {all:true, filters:"type=target"}));
          promises.push(resources.dataModel.get($stateParams.id));
          $q.all(promises).then(function (results) {

              //create a map of all dataFlows based on the IDs
              angular.forEach(results[0].items, function (dataFlow) {
                  if(!$scope.dataFlowsMap[dataFlow.id]){
                      $scope.dataFlowsMap[dataFlow.id] = dataFlow;
                  }
              });
              angular.forEach(results[1].items, function (dataFlow) {
                  if(!$scope.dataFlowsMap[dataFlow.id]){
                      $scope.dataFlowsMap[dataFlow.id] = dataFlow;
                  }
              });

              $scope.sourcesForDF = results[0].items;
              $scope.targetsForDF = results[1].items;

              $scope.source   = results[2];
              $scope.sourceTree = [$scope.source];
              $scope.access = securityHandler.elementAccess($scope.source);

              //$scope.isReadOnly = !securityHandler.showIfRoleIsWritable($scope.source);

              $scope.dataFlowHandler.drawDataFlows($scope.source, $scope.sourcesForDF, $scope.targetsForDF, 50);
              $scope.initializeEventListeners();
          });

          //load all dataModels for right panel
          $scope.targetTreeLoading = true;
          resources.tree.get().then(function(data){
              $scope.targetTreeLoading = false;
              //Do not show DataStandard and Deleted in Dataflow
              // $scope.allModels = $scope.filterDataModels2(data);
              $scope.allModels = {
                  "children": data,
                  isRoot: true
              };


              $scope.filterDataModels2($scope.allModels);

              // $scope.allModels.map(function (model) {
              //     model.children = [];
              // });
          },function(){
              $scope.targetTreeLoading = false;
          });
        };

        $scope.initialize();


        $scope.initializeEventListeners = function () {
            $($scope.dataFlowHandler).off('dataFlowAdded');
            $($scope.dataFlowHandler).on('dataFlowAdded', function(event, dataFlow) {
                var guid = $scope.guid();
                var newDF = {
                    label: "New DataFlow-" + guid,
                    description: "New DataFlow-" + guid,
                    source: {
                        id: dataFlow.source.id
                    },
                    target: {
                        id: dataFlow.target.id
                    },
                    dataFlowComponents: []
                };


                resources.dataFlow.post(newDF.target.id, null, null, {resource:newDF}).then(function (result) {
                    $scope.dataFlowHandler.updateTempPathId(dataFlow.id,result.id);
                    $scope.dataFlowHandler.updateDataFlow(result.id, result.id, result.label, result.description);
                    $scope.dataFlowsMap[result.id] = result;
                    messageHandler.showSuccess('Dataflow created successfully.');
                    $scope.safeApply();
                },function (error) {
                    messageHandler.showError('There was a problem saving the dataflow.', error);
                    $scope.safeApply();
                });
                return false;
            });

            $($scope.dataFlowHandler).off('isReadOnly');
            $($scope.dataFlowHandler).on('isReadOnly', function(event, message) {
                messageHandler.showError(message);
                $scope.safeApply();
            });

            $($scope.dataFlowHandler).off('dataFlowRemoved');
            $($scope.dataFlowHandler).on('dataFlowRemoved', function(event, dataFlowId) {

                var dataFlow = $scope.dataFlowsMap[dataFlowId];

                resources.dataFlow.delete(dataFlow.target.id, dataFlow.id).then(function (result) {
                    delete  $scope.dataFlowsMap[dataFlowId];
                    messageHandler.showSuccess('Dataflow removed successfully.');
                    $scope.safeApply();
                },function (error) {
                    messageHandler.showError('There was a problem deleting the dataflow.', error);
                    $scope.safeApply();
                });
                return false;
            });

            $($scope.dataFlowHandler).off('elementSelected');
            $($scope.dataFlowHandler).on('elementSelected', function(event, element){
                if(!element){
                    $scope.selectedElement = null;
                    $scope.form = {label:'', description:'', id:''};
                    $scope.safeApply();
                    return;
                }


                if(element instanceof Array){
                    $scope.selectedDataFlows = _.filter(element, function (el) {
                        return el.type === "dataFlow";
                    });
                    $scope.selectedDataFlows = $scope.selectedDataFlows.map(function (dataflow) {
                        return dataflow.mcDataFlow;
                    });
                }else if(element && element.type === "dataFlow"){
                    $scope.selectedDataFlows = [element.mcDataFlow]
                }else{
                    $scope.selectedDataFlows = null;
                }

                if(element.type === "dataFlow"){
                    //if it's a temporary ID and we're waiting for server
                    //do not load it's details as it's not saved yet
                    if(element.mcDataFlow.id.indexOf("temp-") === 0){
                        return;
                    }

                    $scope.selectedElement = element;
                    $scope.form = {label:'', description:'', id:'', transformations:[]};
                    $scope.form.label = $scope.selectedElement.mcDataFlow.label;
                    $scope.form.description = $scope.selectedElement.mcDataFlow.description;
                    $scope.form.id = $scope.selectedElement.mcDataFlow.id;
                    $scope.form.targetDataModel = $scope.selectedElement.mcDataFlow.target;

                    $scope.accessHandler($scope.form.id, null, null,"editDetails").then(function (message) {
                        if(message) {
                            $scope.form.isReadOnly = true;
                            $scope.safeApply();
                        }
                    });

                    //load the details of this transformation
                    var targetDataModel = $scope.selectedElement.mcDataFlow.target;
                    resources.dataFlow.get(targetDataModel, $scope.form.id, "dataFlowComponents", {all:true}).then(function(data){
                        $scope.form.dataFlowComponents =  data.items;
                        $scope.safeApply();
                    },function(){

                    });

                }else if (element.type === "dataModel"){
                    $scope.selectedElement = element;
                    //load the details of this dataModel
                    $scope.safeApply();
                }

            });

            $($scope.dataFlowHandler).off('linkDoubleClick');
            $($scope.dataFlowHandler).on('linkDoubleClick', function(event, element){

                if(element.type !== "dataFlow") {
                    return
                }
                //do not open the new window if it's a temp dataFlow (not saved yet)
                if(element.mcDataFlow.id.toLowerCase().indexOf("temp-") === 0){
                    return;
                }
                stateHandler.NewWindow("dataFlowTransformation", {targetDataModel: element.mcDataFlow.target, id: element.mcDataFlow.id})
            });
        };


        $scope.refreshDataFlow = function () {
          if(!$scope.dataFlowHandler){
              return
          }
          jQuery("#exportDataFlowFileDownload a").remove();

          //remove it first
          $scope.dataFlowHandler.remove();
          delete $scope.dataFlowHandler;
          //build it again
          $scope.initialize();
        };




        $scope.saveForm = function () {
            
            if($scope.selectedElement && $scope.selectedElement.type === "dataFlow"){
                var updatedDF = {
                    id: $scope.form.id,
                    label:  $scope.form.label,
                    description: $scope.form.description
                };
                var targetDataModel = $scope.selectedElement.mcDataFlow.target;
                resources.dataFlow.put(targetDataModel, updatedDF.id, null, {resource:updatedDF}).then(function (result) {
                    $scope.dataFlowHandler.updateDataFlow(updatedDF.id,updatedDF.id, updatedDF.label, updatedDF.description);
                    messageHandler.showSuccess('Dataflow updated successfully.');
                    $scope.safeApply();
                },function (error) {
                    messageHandler.showError('There was a problem updating the dataflow.', error);
                    $scope.safeApply();
                });
            }
        };

        $scope.cancelForm = function () {
            if($scope.selectedElement && $scope.selectedElement.type === "dataFlow"){
                $scope.form = {label:'', description:'', id:'', transformations:[]};
                $scope.form.label = $scope.selectedElement.mcDataFlow.label;
                $scope.form.description = $scope.selectedElement.mcDataFlow.description;
                $scope.form.id = $scope.selectedElement.mcDataFlow.id;
                $scope.safeApply();
            }
        };

        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase === '$apply' || phase === '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };


        $scope.divDbClick = function (event) {
          if(jQuery(event.target).hasClass("dataModelTitle")){
            var data = jQuery(event.target).parent().data("mc");
            stateHandler.NewWindow("datamodel",{id:data.dataModel.id});
          }
        };


        $scope.filterDataModels2 = function (node) {
            if(node.domainType === "Folder" || node.isRoot === true){
                if(node.children === undefined || node.deleted){
                    return false;
                }
                var i = node.children.length - 1;
                while(i >= 0){
                    if(!$scope.filterDataModels2(node.children[i])){
                         node.children.splice(i,1);
                    }
                    i--;
                }
                return node.children.length > 0;
            }
            if(node.domainType === "DataModel"){
                if(node.deleted || node.type !== 'Data Asset'){
                    return false;
                }else{
                    return true;
                }
            }
        };

      $scope.filterDataModels = function (allModels) {
        var result = _.filter(allModels, function (model) {
          return !model.deleted && model.type === 'Data Asset'
        });
        return result;
      };

      $scope.loadExporterList = function () {
          $scope.exportersList = [];
          securityHandler.isValidSession().then(function (result) {
              if (result === false) {
                  return
              }
              resources.public.dataFlowExporterPlugins().then(function (result) {
                  $scope.exportersList = result
              },function(error){
                  messageHandler.showError('There was a problem loading exporters list.', error);
              });
          });
      };
      $scope.loadExporterList();

      $scope.loadImporters = function(){
          resources.public.dataFlowImportPlugins().then(function (result) {
              $scope.importersList = result;
          },function(error){
              messageHandler.showError('Can not load importers!', error);
          });
      };
      $scope.loadImporters();

      $scope.export = function (exporter) {
          $scope.dataFlowProcessing = true;
          $scope.exportedFileIsReady = false;

          var dfList = [];
          if($scope.selectedDataFlows){
              dfList = $scope.selectedDataFlows;
          }else{
              dfList = [].concat($scope.sourcesForDF).concat($scope.targetsForDF);
          }

          var promise = exportHandler.exportDataFlows($scope.source, dfList, exporter);
          promise.then(function (result) {
              $scope.exportedFileIsReady = true;

              var aLink = exportHandler.createBlobLink(result.fileBlob, result.fileName);
              //remove if any link exists
              jQuery("#exportDataFlowFileDownload a").remove();
              jQuery("#exportDataFlowFileDownload").append(jQuery(aLink)[0]);

              $scope.dataFlowProcessing = false;
          },function(error){
              $scope.dataFlowProcessing = false;
          });
      };

      $scope.openImportDialogue = function (importer) {
          $scope.selectedImporter = importer;
          jQuery("#dataFlowImportFile").trigger("click");
      };

      $scope.import = function (ev) {
          jQuery("#exportDataFlowFileDownload a").remove();
          $scope.dataFlowProcessing = true;
          var file = ev.currentTarget.files[0];
          if(!file){ return; }

          var formData = new FormData();
          formData.append("importFile", file);

          var namespace = $scope.selectedImporter.namespace;
          var name = $scope.selectedImporter.name;
          var version = $scope.selectedImporter.version;

          resources.dataFlow.import($scope.source.id, namespace + "/" + name + "/" + version, formData).then(function (result) {
              $scope.dataFlowProcessing = false;
              $scope.importResult = result;
              messageHandler.showSuccess("Data Flow(s) imported successfully");
              $scope.refreshDataFlow();
              jQuery("#dataFlowImportFormReset").trigger("click");
          }, function (error) {
              $scope.dataFlowProcessing = false;
              messageHandler.showError("Error in import process", error);
              jQuery("#dataFlowImportFormReset").trigger("click");
          });

      }

	});

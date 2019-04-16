angular.module('directives').directive('mcDataFlowSmall', function () {
	return{
		restrict: 'E',
		scope: {
			parent: "="
		},

		templateUrl: './dataFlowSmall.html',

		link: function(scope, element, attrs){

		},
		controller: function($scope, dataFlowHandler, $q, resources, stateHandler, securityHandler, $sce, importHandler, exportHandler, messageHandler, helpDialogueHandler){

		        $scope.help = $sce.trustAsHtml(
              '<div>' +
                '<div>DoubleClick on designer area to open the editor.</div>' +
                '<br>'+
                '<div>DoubleClick on a Dataflow link to view/edit its transformations.</div>' +
                '<br>'+
                '<div>Select one or more Dataflow links and then export them.</div>' +
                '<br>'+
                '<div>Press export button to export all Dataflows or just the selected one(s).</div>' +
              '</div>'
            );



            $scope.$watch("parent", function (newVal, oldVal, scope) {
                if (newVal !== undefined && newVal !== null){
                    $scope.loadDataFlow();
                    $scope.access = securityHandler.elementAccess($scope.parent);
                }
            });

            $scope.divDbClick = function (event) {
              if(jQuery(event.target).hasClass("designer")){
                stateHandler.NewWindow("dataFlowDM2DM",{id:$scope.parent.id});
              }else if(jQuery(event.target).hasClass("dataModelTitle")){
                var data = jQuery(event.target).parent().data("mc");
                stateHandler.NewWindow("datamodel",{id:data.dataModel.id});
              }
            };

            $scope.loadDataFlow = function () {
                $scope.dataFlowHandler =  dataFlowHandler.getDM2DMDataFlowLightHandler(jQuery("div.designer"),jQuery("svg.designer"), true);
                $scope.dataFlowHandler.zoom(0.8);
                $scope.initEventHandlers();


                var promises = [];
                promises.push(resources.dataModel.get($scope.parent.id, "dataFlows",{all:true, filters:"type=source"}));
                promises.push(resources.dataModel.get($scope.parent.id, "dataFlows",{all:true, filters:"type=target"}));

                $q.all(promises).then(function (results) {

                    $scope.source   = $scope.parent;
                    $scope.sourcesForDF = results[0].items;
                    $scope.targetsForDF = results[1].items;
                    $scope.dataFlowHandler.drawDataFlows($scope.source, $scope.sourcesForDF, $scope.targetsForDF, 50 );
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
                $scope.loadDataFlow();
            };

            $scope.initEventHandlers = function () {

              $($scope.dataFlowHandler).on('linkDoubleClick', function(event, element){
                if(element.type !== "dataFlow") {
                  return
                }
                stateHandler.NewWindow("dataFlowTransformation", {targetDataModel: element.mcDataFlow.target, id: element.mcDataFlow.id})
              });

                $($scope.dataFlowHandler).on('elementSelected', function(event, selectedElement) {
                    if(selectedElement instanceof Array){
                        $scope.selectedDataFlows = _.filter(selectedElement, function (el) {
                            return el.type === "dataFlow";
                        });
                        $scope.selectedDataFlows = $scope.selectedDataFlows.map(function (dataflow) {
                            return dataflow.mcDataFlow;
                        });
                    }else if(selectedElement && selectedElement.type === "dataFlow"){
                        $scope.selectedDataFlows = [selectedElement.mcDataFlow]
                    }else{
                        $scope.selectedDataFlows = null;
                    }
                });

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

                var promise = exportHandler.exportDataFlows($scope.parent, dfList, exporter);
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

                resources.dataFlow.import($scope.parent.id, namespace + "/" + name + "/" + version, formData).then(function (result) {
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

            };


            $scope.loadHelp = function () {
                helpDialogueHandler.open("Importing_DataFlows_Using_Excel", { my: "right top", at: "bottom", of: jQuery("#helpDFImportIcon") });
            };
    }
	};
});







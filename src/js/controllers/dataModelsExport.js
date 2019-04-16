angular.module('controllers').controller('dataModelsExportCtrl', function ($window, $scope, resources, securityHandler, $state, messageHandler, stateHandler, exportHandler, helpDialogueHandler) {
      $window.document.title = "Data Models Export";
      $scope.step = 1;
      $scope.selectedDataModels = null;
      $scope.selectedExporter = null;
      $scope.defaultModels = [];
      $scope.form = {};
      $scope.processing = false;

      $scope.onSelect = function (select) {
          //$scope.selectedDataModels = select;
          if(select && select.length > 0){
              $scope.step = 2;
          }else{
              $scope.step = 1;
          }
      };


      $scope.loadExporterList = function () {
          $scope.exportersList = [];
          securityHandler.isValidSession().then(function (result) {
              if (result === false) {
                  return;
              }
              resources.public.dataModelExporterPlugins().then(function (result) {
                  $scope.exportersList = result;
              }, function (error) {
                  messageHandler.showError('There was a problem loading exporters list.', error);
              });
          });
      };
      $scope.loadExporterList();


      $scope.exporterChanged = function () {
          if($scope.form.selectedExporterStr && $scope.form.selectedExporterStr.length>0){
              $scope.selectedExporterObj = JSON.parse($scope.form.selectedExporterStr);
          }else{
              $scope.selectedExporterObj = null;
          }
          jQuery("#exportFileDownload a").remove();
      };


      $scope.reset = function () {
          $scope.step = 1;
          $scope.selectedDataModels = null;
          $scope.selectedExporter  = null;
          $scope.defaultModels = [];
          jQuery("#exportFileDownload a").remove();
      };

      $scope.export = function () {
          $scope.exportedFileIsReady = false;
          $scope.processing = true;

          var promise = exportHandler.exportDataModel($scope.selectedDataModels, $scope.selectedExporterObj);
          promise.then(function (result) {
              $scope.exportedFileIsReady = true;
              $scope.processing = false;

              var aLink = exportHandler.createBlobLink(result.fileBlob, result.fileName);
              //remove if any link exists
              jQuery("#exportFileDownload a").remove();
              jQuery("#exportFileDownload").append(jQuery(aLink)[0]);

              $scope.processing = false;
              messageHandler.showSuccess('Data Model(s) exported successfully.');
          },function(error){
              $scope.processing = false;
              messageHandler.showError('There was a problem exporting the Data Model(s).', error);
              jQuery("#exportFileDownload a").remove();
          });
      };

      $scope.loadHelp = function () {
          helpDialogueHandler.open("Exporting_models", { my: "right top", at: "bottom", of: jQuery("#helpIcon") });
      };

  });

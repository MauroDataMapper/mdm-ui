import { Injectable } from '@angular/core';
import {ResourcesService} from '../resources.service';

@Injectable({
  providedIn: 'root'
})
export class ExportHandlerService {

  constructor(private resources: ResourcesService) { }

    createFileName(label, exporter) {
      let extension = exporter.fileExtension ? exporter.fileExtension : 'json';
      let rightNow = new Date();
      let res = rightNow.toISOString().slice(0, 19).replace(/-/g, '').replace(/:/g, '');
      // remove space from dataModelLabel and replace all spaces with _ and also add date/time and extension
      return label.trim().toLowerCase().split(' ').join('_') + '_' + res + '.' + extension;
    }

      exportDataModel(dataModels, exporter) {
       // var deferred = $q.defer();
      return  this.resources.dataModel.export(dataModels, exporter, exporter.fileType);

      }

  exportDataModel2(dataModels, exporter) {
    // var deferred = $q.defer();
    this.resources.dataModel.export(dataModels, exporter, exporter.fileType).subscribe(fileBlob => {
      let label = dataModels.length === 1 ? dataModels[0].label : 'data_model_export';
      let fileName = this.createFileName(label, exporter);
      return ({fileBlob, fileName});
    }, error => {
      // throwError
      return error;
    });
    return null;
  }


  // exportDataFlows (dataModel, dataFlows, exporter) {
      //   var deferred = $q.defer();
      //   resources.dataFlow.export(dataModel.id, dataFlows, exporter, exporter.fileType).then(function (fileBlob) {
      //     var fileName = this.createFileName(dataModel.label, exporter);
      //     return deferred.resolve({fileBlob: fileBlob, fileName: fileName});
      //   }, function (response) {
      //     return deferred.reject(response);
      //   });
      //   return deferred.promise;
      // }


      createBlobLink(blob, fileName) {
        // http://jsbin.com/kelijatigo/edit?html,js,output
        // https://github.com/keeweb/keeweb/issues/130
        let url = (window.URL || window.webkitURL).createObjectURL(blob);
        let link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        let linkText = document.createTextNode(fileName);
        link.appendChild(linkText);
        link.setAttribute('title', fileName);
        // DO NOT set target!!!!!
        // link.setAttribute('target', '_blank');
        return link;
      }




}

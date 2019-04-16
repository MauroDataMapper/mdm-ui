angular.module('services').factory('exportHandler', function ($q, resources) {

    function createFileName(label, exporter) {
        var extension = exporter.fileExtension ? exporter.fileExtension : "json";
        var rightNow = new Date();
        var res = rightNow.toISOString().slice(0, 19).replace(/-/g, "").replace(/:/g, "");
        //remove space from dataModelLabel and replace all spaces with _ and also add date/time and extension
        return label.trim().toLowerCase().split(' ').join('_') + "_" + res + "." + extension;
    }


    return {

        exportDataModel: function (dataModels, exporter) {
            var deferred = $q.defer();
            resources.dataModel.export(dataModels, exporter, exporter.fileType).then(function (fileBlob) {
                var label = dataModels.length === 1 ? dataModels[0].label : data_models;
                var fileName = createFileName(label, exporter);
                return deferred.resolve({fileBlob: fileBlob, fileName: fileName});
            }, function (response) {
                return deferred.reject(response);
            });
            return deferred.promise;
        },

        exportDataFlows: function (dataModel, dataFlows, exporter) {
            var deferred = $q.defer();
            resources.dataFlow.export(dataModel.id, dataFlows, exporter, exporter.fileType).then(function (fileBlob) {
                var fileName = createFileName(dataModel.label, exporter);
                return deferred.resolve({fileBlob: fileBlob, fileName: fileName});
            }, function (response) {
                return deferred.reject(response);
            });
            return deferred.promise;
        },


        createBlobLink: function (blob, fileName) {
            //http://jsbin.com/kelijatigo/edit?html,js,output
            //https://github.com/keeweb/keeweb/issues/130
            var url = (window.URL || window.webkitURL).createObjectURL(blob);
            var link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            var linkText = document.createTextNode(fileName);
            link.appendChild(linkText);
            link.setAttribute('title', fileName);
            //DO NOT set target!!!!!
            //link.setAttribute('target', '_blank');
            return link;
        }
    }
});

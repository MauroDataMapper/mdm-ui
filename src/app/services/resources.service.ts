import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { ValidatorService } from './validator.service';
import { RestHandlerService } from './utility/rest-handler.service';
import { SharedService } from './shared.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {
  private subject = new Subject<any>();
  Folderdetails = new Subject<any>();
  FolderPermissions = new Subject<any>();

  constructor(
    private http: HttpClient,
    private validator: ValidatorService,
    public restHandler: RestHandlerService
  ) {}

  SearchResult: any[];

  API = environment.apiEndpoint;

  HistoryGet(id: string, queryString: string): Observable<any> {
    return this.http.get<any>(`${this.API}/folders/a61e88e7-c951-4624-baaf-ec03cd09357b/edits?offset=0&max=20`);
  }

  get(name, id, action, options?): any {
    if (!options) {
      options = {};
    }
    if (name && name[name.length - 1] == '/') {
      name = name.substr(0, name.length - 1);
    }

    if (
      options.filters &&
      options.filters[options.filters.length - 1] === '&'
    ) {
      options.filters = options.filters.substr(0, options.filters.length - 1);
    }
    if (
      options.filters &&
      options.filters[options.filters.length - 1] === '&'
    ) {
      options.filters = options.filters.substr(1, options.filters.length);
    }

        id = !id ? "" : id + "/";
        action = !action ? "" : action;
        var pagination = !options.pageSize ? "" : "offset=" + options.pageIndex + "&max=" + options.pageSize;
        var sort = !options.sortBy ? "" : "&sort=" + options.sortBy + "&order=" + (!options.sortType ? "asc" : options.sortType);
        var filters = !options.filters ? "" : "&" + options.filters;
        var all = !options.all ? "" : "&all=true";
        var qStr = "";

    if (options.queryStringParams) {
      for (const n in options.queryStringParams) {
        if (options.queryStringParams.hasOwnProperty(n)) {
          if (!this.validator.isEmpty(options.queryStringParams[n])) {
            qStr += '&' + n + '=' + options.queryStringParams[n];
          }
        }
      }
    }

    if (pagination || sort || filters || all || qStr) {
      pagination = '?' + pagination;
    }

        return this.request(name + "/" + id + action + pagination + sort + filters + all + qStr, "GET", options.resource, options.contentType);
    }

    post(name, id, action, options, more?): any {
        if (!options) {
            options = {};
        }
        if (name && name[name.length - 1] === '/') {
            name = name.substr(0, name.length - 1);
        }
        id = !id ? "" : id + "/";
        action = !action ? "" : action;
        var pagination = !options.pageSize ? "" : "offset=" + options.pageIndex + "&max=" + options.pageSize;
        var sort = !options.sortBy ? "" : "&sort=" + options.sortBy + "&order=" + (!options.sortType ? "asc" : options.sortType);
        var filters = !options.filters ? "" : "&" + options.filters;
        var qStr = "";

    if (options.queryStringParams) {
      for (const n in options.queryStringParams) {
        if (options.queryStringParams.hasOwnProperty(n)) {
          if (!this.validator.isEmpty(options.queryStringParams[n])) {
            qStr += '&' + n + '=' + options.queryStringParams[n];
          }
        }
      }
    }
    if (pagination || sort || filters || qStr) {
      pagination = '?' + pagination;
    }
    return this.request(
      name + '/' + id + action + pagination + sort + filters + qStr,
      'POST',
      options.resource,
      options.contentType,
      more
    );
  }

  put(name, id, action, options) {
    if (!options) {
      options = {};
    }
    if (name && name[name.length - 1] == '/') {
      name = name.substr(0, name.length - 1);
    }
    id = !id ? '' : id + '/';
    action = !action ? '' : action;
    let pagination = !options.pageSize
      ? ''
      : 'offset=' + options.pageIndex + '&max=' + options.pageSize;
    const sort = !options.sortBy
      ? ''
      : '&sort=' +
        options.sortBy +
        '&order=' +
        (!options.sortType ? 'asc' : options.sortType);
    const filters = !options.filters ? '' : '&' + options.filters;
    let qStr = '';

    if (options.queryStringParams) {
      for (const n in options.queryStringParams) {
        if (options.queryStringParams.hasOwnProperty(n)) {
          if (!this.validator.isEmpty(options.queryStringParams[n])) {
            qStr += '&' + n + '=' + options.queryStringParams[n];
          }
        }
      }
    }

    if (pagination || sort || filters || qStr) {
      pagination = '?' + pagination;
    }
    return this.request(
      name + '/' + id + action + pagination + sort + filters + qStr,
      'PUT',
      options.resource,
      options.contentType
    );
  }

  exportGet(dataModels, exporter, contentType, url): any {
    const more: any = {
      responseType: 'arraybuffer'
    };
    return this.request(url, 'GET', null, contentType, more);
  }

  exportPost(dataModels, exporter, contentType, url): any {
    const more: any = {
      responseType: 'arraybuffer'
    };
    return this.request(url, 'POST', null, contentType, more);
  }

  delete(name, id, action?, queryString?, resource?) {
    if (name && name[name.length - 1] === '/') {
      name = name.substr(0, name.length - 1);
    }
    id = !id ? '' : id + '/';
    action = !action ? '' : action;
    queryString = !queryString ? '' : '?' + queryString;

    return this.request(
      name + '/' + id + action + queryString,
      'DELETE',
      resource,
      null
    );
  }

  request(url, HTTP, resource, contentType, more?): any {
    if (url && url[0] == '/') {
      url = url.substr(1);
    }

    const options: any = {
      url: this.API + '/' + url,
      method: HTTP,
      withCredentials: true,
      headers: {
        'Content-Type': contentType
          ? contentType
          : 'application/json; charset=utf-8'
      }
    };
    if (resource) {
      options.data = resource;
    }
    if (more && more.login == true) {
      options.login = true;
    }
    if (more && more.ignoreAuthModule == true) {
      options.ignoreAuthModule = true;
    }
    if (more && more.responseType) {
      options.responseType = more.responseType;
    }

    return this.restHandler.restHandler(options);
  }

  catalogueItemOld: any = {
    tree: function(id, includeSupersededModels) {
      id = id ? '?id=' + id : '';
      includeSupersededModels = includeSupersededModels
        ? '?includeSupersededModels=true'
        : '';
      return this.request(
        'catalogueItems/tree' + id + includeSupersededModels,
        'GET'
      );
    },
    get: function(id, action, options) {
      return this.get('catalogueItems', id, action, options);
    },
    post: function(id, action, options) {
      return this.post('catalogueItems', id, action, options);
    },
    put: function(id, action, childId, options) {
      if (!options) {
        options = {};
      }
      id = !id ? '' : id;
      action = !action ? '' : action + '/';
      childId = !childId ? '' : childId;
      return this.put('catalogueItems', id, action + childId, options);
    },
    delete: function(id, action, childId) {
      id = !id ? '' : id;
      action = !action ? '' : action + '/';
      childId = !childId ? '' : childId;
      return this.httpDelete('catalogueItems', id, action + childId);
    }
  }

  // dataClass: any = {
  //     post: function (dataModelId, id, action, options) {
  //         return this.post("dataModels/" + dataModelId + "/dataClasses/", id, action, options);
  //     }
  // }

  classifier: Classifier = new Classifier(this);
  terminology: Terminology = new Terminology(this);
  term: Term = new Term(this);
  folder: Folder = new Folder(this);
  catalogueUser: CatalogueUser = new CatalogueUser(this);
  catalogueItem: CatalogueItem = new CatalogueItem(this);
  userGroup: UserGroup = new UserGroup(this);
  enumerationValues: EnumerationValues = new EnumerationValues(this);
  authentication: Authentication = new Authentication(this);
  tree: Tree = new Tree(this);
  metadata: MetaData = new MetaData(this);
  facets: Facets = new Facets(this);
  dataModel: DataModel = new DataModel(this);
  dataClass: DataClass = new DataClass(this);
  dataType: DataType = new DataType(this);
  public: Public = new Public(this);
  admin: Admin = new Admin(this);
  dataElement: DataElement = new DataElement(this);
  importer: Importer = new Importer(this);
  codeSet: CodeSet = new CodeSet(this);
}

class Importer {
  constructor(private resourcesService: ResourcesService) {}

  get(name) {
    return this.resourcesService.get('importer', name, null);
  }
  post(action, options) {
    return this.resourcesService.post('importer', null, action, options);
  }
}

class Classifier {
  constructor(private resourcesService: ResourcesService) {}

  get(id, action, options) {
    return this.resourcesService.get('classifiers', id, action, options);
  }
  delete(id, action) {
    return this.resourcesService.delete('classifiers', id, action);
  }

  put(id, action, options) {
    return this.resourcesService.put('classifiers', id, action, options);
  }

  post(id, action, options) {
    id = !id ? '' : id + '/';
    action = !action ? '' : action;
    return this.resourcesService.post('classifiers', id, action, options);
    // return this.resourcesService.post("classifiers" , id , action,  options.resource)
  }
}

class DataClass {
  constructor(private resourcesService: ResourcesService) {}

  get(dataModel, parentDataClass, id, action, options) {
    if (!options) {
      options = {};
    }
    if (
      ['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action ) !== -1
    ) {
      return this.resourcesService.catalogueItem.get(id, action, options.contentType );
    }

    if (parentDataClass) {
      return this.resourcesService.get(`dataModels/${dataModel}/dataClasses/${parentDataClass}/dataClasses/`, id, action, options);
    } else {
      return this.resourcesService.get(`dataModels/${dataModel}/dataClasses/`, id, action, options);
    }
  }

  post(dataModelId, id, action, options) {
    return this.resourcesService.post(`dataModels/${dataModelId}/dataClasses/`, id, action, options);
  }
  put(dataModelId, parentDataClassId, id, action, options) {
    if (parentDataClassId) {
      return this.resourcesService.put(`dataModels/${dataModelId}/dataClasses/${parentDataClassId}/dataClasses/`, id, action, options);
    } else {
      return this.resourcesService.put(`dataModels/{$}dataModelId}/dataClasses/`, id, action, options );
    }
  }
  delete(dataModelId, parentDataClassId, id) {
    if (parentDataClassId) {
      return this.resourcesService.delete(`dataModels/${dataModelId}/dataClasses/${parentDataClassId}/dataClasses/`, id);
    } else {
      return this.resourcesService.delete(`dataModels/${dataModelId}/dataClasses/`, id);
    }
  }
}

class DataElement {
  constructor(private resourcesService: ResourcesService) {}
  get(dataModelId, dataClassId, id, action, options) {
    if (!options) {
      options = {};
    }
    if (['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1) {
      return this.resourcesService.catalogueItem.get(id, action, options.contentType );
    }

    return this.resourcesService.get(`dataModels/${dataModelId}/dataClasses/${dataClassId}/dataElements/`, id, action, options);
  }
  put(dataModelId, dataClassId, id, action, options) {
    return this.resourcesService.put(`dataModels/${dataModelId}/dataClasses/${dataClassId}/dataElements/`, id, action, options);
  }
  delete(dataModelId, dataClassId, id) {
    return this.resourcesService.delete(`dataModels/${dataModelId}/dataClasses/${dataClassId}/dataElements/`, id);
  }
}

class Folder {
  constructor(private resourcesService: ResourcesService) {}
  get(id, action, options?) {
    if (!options) {
      options = {};
    }

    return this.resourcesService.get('folders', id, action, options);
  }
  post(id, action, options) {
    return this.resourcesService.post('folders', id, action, options);
  }
  put(id, action, options) {
    return this.resourcesService.put('folders', id, action, options);
  }
  delete(id, action, queryString) {
    return this.resourcesService.delete('folders', id, action, queryString, null);
  }
}

class Terminology {
  constructor(private resourcesService: ResourcesService) {}
  get(id, action, options: any = {}) {
    if (!options) {
      options = {};
    }
    if (['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1) {
      return this.resourcesService.catalogueItem.get(id, action, options.contentType);
    }
    return this.resourcesService.get('terminologies', id, action, options);
  }
  post(id, action, options) {
    return this.resourcesService.post('terminologies', id, action, options);
  }

  put(id, action, options) {
    return this.resourcesService.put('terminologies', id, action, options);
  }
  delete(id, action, queryString) {
    return this.resourcesService.delete('terminologies', id, action, queryString);
  }
}

class Term {
  constructor(private resourcesService: ResourcesService) {}

  get(terminologyId, id, action, options: any = {}) {
    if (['metadata', 'annotations', 'classifiers'].indexOf(action) !== -1) {
      return this.resourcesService.catalogueItem.get(id, action, options.contentType);
    }

    return this.resourcesService.get('terminologies/' + terminologyId + '/terms/', id, action, options
    );
  }

  put(terminologyId, id, action, options) {
    return this.resourcesService.put(
      'terminologies/' + terminologyId + '/terms/',
      id,
      action,
      options
    );
  }

    post(terminologyId, id, action, options) {
        return this.resourcesService.post("terminologies/" + terminologyId + "/terms/", id, action, options);
    }

    delete(terminologyId, id) {
        return this.resourcesService.delete("terminologies/" + terminologyId + "/terms/", id);
    }
}

class Admin {
  constructor(private resourcesService: ResourcesService) {}

  get(name, options) {
    return this.resourcesService.get('admin', name, null, options);
  }

  post(action, options) {
    return this.resourcesService.post('admin', null, action, options);
  }
}

class CatalogueUser {
  constructor(private resourcesService: ResourcesService) {}

  get(id, action, options) {
    if (!options) {
      options = {};
    }
    return this.resourcesService.get('catalogueUsers', id, action, options);
  }

  post(id, action, options) {
    return this.resourcesService.post('catalogueUsers', id, action, options);
  }

  put(id, action, options) {
    return this.resourcesService.put('catalogueUsers', id, action, options);
  }

  delete(id, action) {
    return this.resourcesService.delete('catalogueUsers', id, action);
  }
}

class UserGroup {
  constructor(private resourcesService: ResourcesService) {}
  get(id?, action?, options?) {
    return this.resourcesService.get('userGroups', id, action, options);
  }
  post(id, action, options) {
    return this.resourcesService.post('userGroups', id, action, options);
  }
  put(id, action, options) {
    return this.resourcesService.put('userGroups', id, action, options);
  }
  delete(id, action) {
    return this.resourcesService.delete('userGroups', id, action, null, null);
  }
}

class CatalogueItem {
    constructor(private resourcesService: ResourcesService) { }
    tree(id, includeSupersededModels) {
        id = id ? "?id=" + id : "";
        includeSupersededModels = includeSupersededModels ? "?includeSupersededModels=true" : "";
    }
    get(id, action, options) {
        return this.resourcesService.get("catalogueItems", id, action, options);
    }
    post(id, action, options) {
        return this.resourcesService.post("catalogueItems", id, action, options);
    }
    put(id, action, childId, options) {
        if (!options) {
            options = {};
        }
        id = !id ? "" : id;
        action = !action ? "" : action + "/";
        childId = !childId ? "" : childId;
        return this.resourcesService.put("catalogueItems", id, action + childId, options);
    }
    delete(id, action, childId) {
        id = !id ? "" : id;
        action = !action ? "" : action + "/";
        childId = !childId ? "" : childId;
        return this.resourcesService.delete("catalogueItems", id, action + childId, null, null);
    }
}

class Authentication {
  constructor(private resourcesService: ResourcesService) {}

    get(action) {
        return this.resourcesService.get("authentication", null, action, null);
    }
    post(action, options?, more?) {
        return this.resourcesService.post("authentication", null, action, options, more);
    }
}

class Tree {
  constructor(private resourcesService: ResourcesService) {}
  get(id?, action?, options?) {
    return this.resourcesService.get('tree', id, action, options);
  }
}

class Hierarchy {
  constructor(private resourcesService: ResourcesService) {}
  get(id?, action?, options?) {
    return this.resourcesService.get('hierarchy', id, action, options);
  }
}

class MetaData {
    constructor(private resourcesService: ResourcesService) { }
    namespaces: Namespaces = new Namespaces(this.resourcesService);
}

class Namespaces {
    constructor(private resourcesService: ResourcesService) { }
    get(id?, action?) {
        return this.resourcesService.get("metadata/namespaces", id, action);
    }
}

class DataModel {
    constructor(private resourcesService: ResourcesService) {}

    get(id, action?, options?) {
        if (!options) {
            options = {};
        }

        if (['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1) {
            return this.resourcesService.catalogueItem.get(id, action, options.contentType);
        }
        return this.resourcesService.get("dataModels", id, action, options);
    }

    post(id, action, options) {
        return this.resourcesService.post("dataModels", id, action, options);
    }

    put(id, action, options) {
        return this.resourcesService.put("dataModels", id, action, options);
    }

    delete(id, action, queryString, resource) {
        return this.resourcesService.delete("dataModels", id, action, queryString, resource);
    }

    export(dataModels, exporter, contentType) {
        if (dataModels && dataModels.length === 1) {

            var url = "/dataModels/" +
                dataModels[0].id +
                "/export/" +
                exporter.namespace +
                "/" +
                exporter.name +
                "/" +
                exporter.version;
            return this.resourcesService.exportGet(dataModels, exporter, contentType, url);
            //
            //  var deferred;
            // // deferred = $q.defer();
            //  var url = this.backendURL + url ;
            //  this.restHandler.restHandler({
            //      url: url,
            //      method:"GET",
            //      withCredentials: true,
            //      responseType : 'arraybuffer'
            //  }).then(function(response){
            //      var file = new Blob([ response ], {type : contentType});
            //      deferred.resolve(file);
            //  },function(response){
            //      deferred.reject(response);
            //  });
            //  return deferred.promise;
        }
        var url = "/dataModels/export/" + exporter.namespace + "/" + exporter.name + "/" + exporter.version;

        return this.resourcesService.exportPost(dataModels, exporter, contentType, url);
        //  var deferred;
        // // deferred = $q.defer();
        //  url = this.backendURL + url;
        //
        //  restHandler({
        //      url: url,
        //      method: "POST",
        //      withCredentials: true,
        //      responseType: 'arraybuffer',
        //      data: dataModels.map(function(dataModel){return dataModel.id;})
        //  }).then(function (response) {
        //      var file = new Blob([response], {type: contentType});
        //      deferred.resolve(file);
        //  }, function (response) {
        //      deferred.reject(response);
        //  });
        //
        //  return deferred.promise;
    }

    import(importPath, formData) {
        var url = this.resourcesService.API + "/dataModels/import/" + importPath;
        return this.resourcesService.restHandler.restHandler({
            url: url,
            method: "POST",
            withCredentials: true,
            data: formData,
            transformRequest: (data, headersGetterFunction) => {
                return data;
            }
        });
    }
}

class Facets {
    constructor(private resourcesService: ResourcesService) { }

    get(id, action, options) {
        return this.resourcesService.get("facets", id, action, options);
    }
    post(id, action, options) {
        return this.resourcesService.post("facets", id, action, options);
    }
    put(id, action, childId, options) {
        if (!options) {
            options = {};
        }
        id = !id ? "" : id;
        action = !action ? "" : action + "/";
        childId = !childId ? "" : childId;
        return this.resourcesService.put("facets", id, action + childId, options);
    }
    delete(id, action, childId) {
        id = !id ? "" : id;
        action = !action ? "" : action + "/";
        childId = !childId ? "" : childId;
        return this.resourcesService.delete("facets", id, action + childId, null, null);
    }

    attachReferenceFile(id, formData) {

        var url = this.resourcesService.API + "/facets/" + id + "/referenceFiles";


        return this.resourcesService.restHandler.restHandler({
            url: url,
            method: "POST",
            withCredentials: true,
            data: formData,
            transformRequest: (data, headersGetterFunction) => {
                return data;
            }
        });
    }

    downloadLinkReferenceFile(elementId, fileId) {
        return this.resourcesService.API + "/facets/" + elementId + "/referenceFiles/" + fileId;
    }

}

class Public {
    constructor(private resourcesService: ResourcesService) { }

    get(name) {
        return this.resourcesService.get("public", name, null);
    }
    dataFlowExporterPlugins() {
        return this.resourcesService.get("public", null, "plugins/dataFlowExporters");
    }
    dataFlowImportPlugins() {
        return this.resourcesService.get("public", null, "plugins/dataFlowImporters");
    }
    dataModelExporterPlugins(multiple = false) {
        var options: any = {};

        if (multiple === true) {
            options.filters = "multipleDataModels=true"
        }
        return this.resourcesService.get("public", null, "plugins/dataModelExporters", options);
    }
    dataModelImporterPlugins(multiple) {
        var options: any = {};
        if (multiple === true) {
            options.filters = "multipleDataModels=true"
        }
        return this.resourcesService.get("public", null, "plugins/dataModelImporters", options);
    }
}

class DataType {

    constructor(private resourcesService: ResourcesService) { }

    get(dataModelId, id, action, options) {
        if (!options) {
            options = {};
        }
        if (['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1) {
            return this.resourcesService.catalogueItem.get(id, action, options.contentType);
        }
        return this.resourcesService.get("dataModels/" + dataModelId + "/dataTypes/", id, action, options);
	}

    post(dataModelId, id, action, options) {
	    return this.resourcesService.post("dataModels/" + dataModelId + "/dataTypes/", id, action, options);
    }

    put(dataModelId, id, action, options) {
        return this.resourcesService.put("dataModels/" + dataModelId + "/dataTypes/", id, action, options);
    }

    delete(dataModelId, id) {
        return this.resourcesService.delete("dataModels/" + dataModelId + "/dataTypes/", id);
    }
}

class EnumerationValues {

	constructor(private resourcesService: ResourcesService) { }

	delete(dataModelId, dataTypeId, id) {

		return this.resourcesService.delete("dataModels/" + dataModelId + "/enumerationTypes/" + dataTypeId + "/enumerationValues/", id);
	}

	put(dataModelId, dataTypeId, id, action, options) {

		return this.resourcesService.put("dataModels/" + dataModelId + "/enumerationTypes/" + dataTypeId + "/enumerationValues/", id, action, options);
	}

	post(dataModelId, dataTypeId, options) {

		return this.resourcesService.post("dataModels/" + dataModelId + "/enumerationTypes/" + dataTypeId + "/enumerationValues/", null, null, options);
	}
}

class CodeSet {
    constructor(private resourcesService: ResourcesService) { }
    get (id, action, options) {
        if (!options) {
            options = {};
        }

        if (['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1) {
            return this.resourcesService.catalogueItem.get(id, action,  options.contentType);
        }
        return this.resourcesService.get("codeSets", id, action, options);
    }

    post (id, action, options) {
        return this.resourcesService.post("codeSets", id , action, options);
    }

    delete(id, action, queryString, resource) {
        return this.resourcesService.delete("codeSets", id , action, queryString, resource);
    }

    put (id, action, options) {
        return this.resourcesService.put("codeSets", id, action, options);
    }
}

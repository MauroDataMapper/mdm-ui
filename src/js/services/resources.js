
angular.module('services').factory('resources', function (restHandler, $rootScope, $q, $timeout, $cookies, $http, validator) {
        //*********************************************************************************************
        //*********************************************************************************************
        function request(url, HTTP, resource, contentType, more) {
            if(url && url[0] == '/'){
                url = url.substr(1);
            }
            var options = {
                url: $rootScope.backendURL + '/' + url,
                method: HTTP,
                withCredentials: true,
                headers: {
                    'Content-Type': contentType ? contentType : 'application/json; charset=utf-8'
                }
            };
            if(resource){
                options.data = resource;
            }
            if(more && more.login == true){
                options.login = true;
            }
            if(more && more.ignoreAuthModule == true){
                options.ignoreAuthModule = true;
            }
            if(more && more.withCredentials == true){
                options.withCredentials = true;
            }

            return  restHandler(options);
        }

        function get(name, id, action, options) {
            if(!options){
                options = {};
            }
            if(name && name[name.length-1] == '/'){
                name = name.substr(0, name.length-1);
            }

            if(options.filters && options.filters[options.filters.length - 1] === '&'){
                options.filters = options.filters.substr(0, options.filters.length-1);
            }
            if(options.filters && options.filters[options.filters.length - 1] === '&'){
                options.filters = options.filters.substr(1, options.filters.length);
            }

            id = !id ? "" : id + "/";
            action = !action ? "" : action;
            var pagination = !options.pageSize ? "" : "offset=" + options.pageIndex + "&max="+ options.pageSize;
            var sort = !options.sortBy? "" : "&sort=" + options.sortBy + "&order=" + (!options.sortType ? "asc" : options.sortType);
            var filters = !options.filters ? "" : "&" + options.filters;
            var all = !options.all ? "" : "&all=true";


            var qStr = "";
            if(options.queryStringParams){
                for (var n in options.queryStringParams) {
                    if (options.queryStringParams.hasOwnProperty(n)) {
                        if(!validator.isEmpty(options.queryStringParams[n])) {
                            qStr += "&" + n + "=" + options.queryStringParams[n];
                        }
                    }
                }
            }

            if(pagination || sort || filters || all || qStr){
                pagination = "?" + pagination;
            }

            return request(name + "/" + id + action + pagination + sort + filters + all + qStr, "GET", options.resource, options.contentType);
        }

        function put(name, id, action, options) {
            if(!options){
                options = {};
            }
            if(name && name[name.length-1] == '/'){
                name = name.substr(0, name.length-1);
            }
            id = !id ? "" : id + "/";
            action = !action ? "" : action;
            var pagination = !options.pageSize ? "" : "offset=" + options.pageIndex + "&max="+ options.pageSize;
            var sort = !options.sortBy? "" : "&sort=" + options.sortBy + "&order=" + (!options.sortType ? "asc" : options.sortType);
            var filters = !options.filters ? "" : "&" + options.filters;



            var qStr = "";
            if(options.queryStringParams){
                for (var n in options.queryStringParams) {
                    if (options.queryStringParams.hasOwnProperty(n)) {
                        if(!validator.isEmpty(options.queryStringParams[n])) {
                            qStr += "&" + n + "=" + options.queryStringParams[n];
                        }
                    }
                }
            }


            if(pagination || sort || filters || qStr){
                pagination = "?" + pagination;
            }
            return request(name + "/" + id + action + pagination + sort + filters + qStr, "PUT", options.resource, options.contentType);
        }

        function post(name, id, action, options, more) {
            if(!options){
                options = {};
            }
            if(name && name[name.length-1] === '/'){
                name = name.substr(0, name.length-1);
            }
            id = !id ? "" : id + "/";
            action = !action ? "" : action;
            var pagination = !options.pageSize ? "" : "offset=" + options.pageIndex + "&max="+ options.pageSize;
            var sort = !options.sortBy? "" : "&sort=" + options.sortBy + "&order=" + (!options.sortType ? "asc" : options.sortType);
            var filters = !options.filters ? "" : "&" + options.filters;


            var qStr = "";
            if(options.queryStringParams){
                for (var n in options.queryStringParams) {
                    if (options.queryStringParams.hasOwnProperty(n)) {
                        if(!validator.isEmpty(options.queryStringParams[n])) {
                            qStr += "&" + n + "=" + options.queryStringParams[n];
                        }
                    }
                }
            }

            if(pagination || sort || filters || qStr){
                pagination = "?" + pagination;
            }

            return request(name + "/" + id + action + pagination + sort + filters + qStr, "POST", options.resource, options.contentType, more);
        }

        function httpDelete(name, id, action, queryString, resource) {
            if(name && name[name.length-1] === '/'){
                name = name.substr(0, name.length-1);
            }
            id = !id ? "" : id + "/";
            action = !action ? "" : action;
            queryString = !queryString ? "" : ("?" + queryString);

            return request(name + "/" + id + action + queryString, "DELETE", resource);
        }

        //*********************************************************************************************
        //*********************************************************************************************


        var res =  {

            tree: {
                get: function (id, action, options) {
                    return get("tree", id, action, options);
                }

                // get: function (id, includeSupersededModels,domainType) {
                //     id = id ? ("/" + id) : "";
                //     if(includeSupersededModels || domainType){
                //         id += "?";
                //     }
                //     includeSupersededModels = includeSupersededModels ? "includeSupersededModels=true&": "";
                //     domainType = domainType ? "domainType="+domainType : "";
                //     return request("tree" + id + includeSupersededModels + domainType, "GET");
                // }
            },
            metadata: {
                namespaces: {
                    get: function (id, action) {
                        return get("metadata/namespaces", id, action);
                    }
                }
            },

            authentication:{
                get: function(action) {
                    return get("authentication", null, action);
                },
                post: function(action, options, more) {
                    return post("authentication", null, action, options, more);
                }
            },

            facets: {
                get: function (id, action, options) {
                    return get("facets", id, action, options);
                },
                post: function (id, action, options) {
                    return post("facets", id, action, options);
                },
                put: function (id, action, childId, options) {
                    if(!options){
                        options = {};
                    }
                    id = !id ? "" : id;
                    action = !action ? "" : action + "/";
                    childId = !childId ? "":  childId;
                    return put("facets",id , action + childId, options);
                },
                delete: function (id, action, childId) {
                    id = !id ? "" : id;
                    action = !action ? "" : action + "/";
                    childId = !childId ? "":  childId;
                    return httpDelete("facets", id , action + childId);
                },


                attachReferenceFile:function(id, formData) {
                    var url = $rootScope.backendURL + "/facets/" + id + "/referenceFiles";
                    return  restHandler({
                        url: url,
                        method:"POST",
                        withCredentials: true,
                        data:formData,
                        transformRequest: function(data, headersGetterFunction) {
                            return data;
                        },
                        headers: {
                            'Content-Type': undefined
                        }
                    });
                },

                downloadLinkReferenceFile:function(elementId, fileId) {
                    return $rootScope.backendURL + "/facets/" + elementId+ "/referenceFiles/" + fileId;
                }
            },


            features: {
                get: function (id, action, options) {
                    return get("features", id, action, options);
                },
                post: function (id, action, options) {
                    return post("features", id, action, options);
                },
                put: function (id, action, childId, options) {
                    if(!options){
                        options = {};
                    }
                    id = !id ? "" : id;
                    action = !action ? "" : action + "/";
                    childId = !childId ? "":  childId;
                    return put("features",id , action + childId, options);
                },
                delete: function (id, action, childId) {
                    id = !id ? "" : id;
                    action = !action ? "" : action + "/";
                    childId = !childId ? "":  childId;
                    return httpDelete("features", id , action + childId);
                }
            },




            catalogueItem: {
                tree: function (id, includeSupersededModels) {
                    id = id ? "?id="+id : "";
                    includeSupersededModels = includeSupersededModels ? "?includeSupersededModels=true": "";
                    return request("catalogueItems/tree" + id + includeSupersededModels, "GET");
                },
                get: function (id, action, options) {
                    return get("catalogueItems", id, action, options);
                },
                post: function (id, action, options) {
                    return post("catalogueItems", id, action, options);
                },
                put: function (id, action, childId, options) {
                    if(!options){
                        options = {};
                    }
                    id = !id ? "" : id;
                    action = !action ? "" : action + "/";
                    childId = !childId ? "":  childId;
                    return put("catalogueItems",id , action + childId, options);
                },
                delete: function (id, action, childId) {
                    id = !id ? "" : id;
                    action = !action ? "" : action + "/";
                    childId = !childId ? "":  childId;
                    return httpDelete("catalogueItems", id , action + childId);
                }
            },
            classifier: {
                get: function (id, action, options) {
                    return get("classifiers", id, action, options);
                },

                delete: function (id, action) {
                    return httpDelete("classifiers", id, action);
                },

                put: function (id, action, options) {
                    return put("classifiers", id, action, options);
                },

                post: function (id, action, options) {
                    id = !id ? "" : id + "/";
                    action = !action ? "" : action;
                    return request("classifiers/" + id + action, "POST", options ? options.resource : null);
                }
            },

            dataFlow:{
                get: function (dataModelId, id, action, options) {
                    id = !id ? "" : id + "/";
                    action = !action ? "" : action;
                    return get("dataModels", dataModelId, "dataFlows/" + id + action, options);
                },
                post: function (dataModelId, id, action, options) {
                    id = !id ? "" : id + "/";
                    action = !action ? "" : action;
                    return post("dataModels", dataModelId, "dataFlows/" + id + action, options);
                },
                delete: function (dataModelId, id, action) {
                    id = !id ? "" : id + "/";
                    action = !action ? "" : action;
                    return httpDelete("dataModels", dataModelId, "dataFlows/" + id + action);
                },
                put: function (dataModelId, id, action, options) {
                    id = !id ? "" : id + "/";
                    action = !action ? "" : action;
                    return put("dataModels", dataModelId, "dataFlows/" + id + action, options);
                },

                import:function(dataModelId, importPath, formData) {
                    var url = $rootScope.backendURL + "/dataModels/" + dataModelId + "/dataFlows/import/" + importPath;
                    return  restHandler({
                        url: url,
                        method:"POST",
                        withCredentials: true,
                        data:formData,
                        transformRequest: function(data, headersGetterFunction) {
                            return data;
                        },
                        headers: {
                            'Content-Type': undefined
                        }});
                },


                export: function(dataModelId, dataFlows, exporter, contentType){
                    var url = "/dataModels/" + dataModelId + "/dataFlows/export/" + exporter.namespace + "/" + exporter.name + "/" + exporter.version;

                    var deferred;
                    deferred = $q.defer();
                    url = $rootScope.backendURL + url ;
                    restHandler({
                        url: url,
                        method:"POST",
                        withCredentials: true,
                        responseType : 'arraybuffer',
                        data: dataFlows.map(function(dataFlow){return dataFlow.id;})
                    }).then(function(response){
                        var file = new Blob([ response ], {type : contentType});
                        deferred.resolve(file);
                    },function(response){
                        deferred.reject(response);
                    });
                    return deferred.promise;
                }
            },


            folder: {
                get: function (id, action, options) {
                    if (!options) {
                        options = {};
                    }

                    if (['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1) {
                        return res.catalogueItem.get(id, action, null, options.contentType);
                    }
                    return get("folders", id, action, options);
                },
                post: function (id, action, options) {
                    return post("folders", id , action, options);
                },
                delete: function (id, action, queryString) {
                    return httpDelete("folders", id , action, queryString);
                },
                put: function (id, action, options) {
                    return put("folders", id, action, options);
                }
            },

            codeSet: {
                get: function (id, action, options) {
                    if (!options) {
                        options = {};
                    }

                    if (['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1) {
                        return res.catalogueItem.get(id, action, null, options.contentType);
                    }
                    return get("codesets", id, action, options);
                },

                post: function (id, action, options) {
                    return post("codesets", id , action, options);
                },

                delete: function (id, action, queryString, resource) {
                    return httpDelete("codesets", id , action, queryString, resource);
                },

                put: function (id, action, options) {
                    return put("codesets", id, action, options);
                },
            },

            dataModel: {
                get: function(id, action, options) {
                    if(!options){
                        options = {};
                    }

                    if(['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1){
                        return res.catalogueItem.get(id, action, null, options.contentType);
                    }
                    return get("dataModels",id, action, options);
                },
                post: function (id, action, options) {
                    return post("dataModels", id , action, options);
                },

                delete: function (id, action, queryString, resource) {
                    return httpDelete("dataModels", id , action, queryString, resource);
                },

                put: function (id, action, options) {
                    return put("dataModels", id, action, options);
                },

                export: function(dataModels, exporter, contentType){
                    if(dataModels && dataModels.length === 1){
                        var url = "/dataModels/"+ dataModels[0].id +"/export/" + exporter.namespace + "/" + exporter.name + "/" + exporter.version;
                        var deferred;
                        deferred = $q.defer();
                        var url = $rootScope.backendURL + url ;
                        restHandler({
                            url: url,
                            method:"GET",
                            withCredentials: true,
                            responseType : 'arraybuffer'
                        }).then(function(response){
                            var file = new Blob([ response ], {type : contentType});
                            deferred.resolve(file);
                        },function(response){
                            deferred.reject(response);
                        });
                        return deferred.promise;
                    }
                    var url = "/dataModels/export/" + exporter.namespace + "/" + exporter.name + "/" + exporter.version;
                    var deferred;
                    deferred = $q.defer();
                    url = $rootScope.backendURL + url;

                    restHandler({
                        url: url,
                        method: "POST",
                        withCredentials: true,
                        responseType: 'arraybuffer',
                        data: dataModels.map(function(dataModel){return dataModel.id;})
                    }).then(function (response) {
                        var file = new Blob([response], {type: contentType});
                        deferred.resolve(file);
                    }, function (response) {
                        deferred.reject(response);
                    });

                    return deferred.promise;
                },

                import:function(importPath, formData) {
                    var url = $rootScope.backendURL + "/dataModels/import/" + importPath;
                    return  restHandler({
                        url: url,
                        method:"POST",
                        withCredentials: true,
                        data:formData,
                        transformRequest: function(data, headersGetterFunction) {
                            return data;
                        },
                        headers: {
                            'Content-Type': undefined
                        }});
                },

            },


            terminology: {
                get: function (id, action, options) {
                    if (!options) {
                        options = {};
                    }
                    if (['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1) {
                        return res.catalogueItem.get(id, action, null, options.contentType);
                    }
                    return get("terminologies", id, action, options);
                },
                post: function (id, action, options) {
                    return post("terminologies", id, action, options);
                },

                delete: function (id, action, queryString) {
                    return httpDelete("terminologies", id, action, queryString);
                },

                put: function (id, action, options) {
                    return put("terminologies", id, action, options);
                },
            },


            term: {
                get: function(terminologyId, id, action, options) {
                    if(!options){
                        options = {};
                    }
                    if(['metadata', 'annotations', 'classifiers'].indexOf(action) !== -1){
                        return res.catalogueItem.get(id, action, null, options.contentType);
                    }

                    return get("terminologies/" + terminologyId + "/terms/" , id, action, options);
                },

                put: function (terminologyId, id, action, options) {
                    return put("terminologies/" + terminologyId + "/terms/" , id, action, options);
                },

                post: function (terminologyId, id, action, options) {
                    return post("terminologies/" + terminologyId + "/terms/" , id, action, options);
                },

                delete: function (terminologyId, id) {
                    return httpDelete("terminologies/" + terminologyId + "/terms/" , id);
                }
            },

            termRelationshipType: {
                get: function(terminologyId, id, action, options) {
                    if(!options){
                        options = {};
                    }
                    if(['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1){
                        return res.catalogueItem.get(id, action, null, options.contentType);
                    }

                    return get("terminologies/" + terminologyId + "/termRelationshipTypes/" , id, action, options);
                },
            },


            dataClass: {
                get: function(dataModel, parentDataClass, id, action, options) {
                    if(!options){
                        options = {};
                    }
                    if(['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1){
                        return res.catalogueItem.get(id, action, null, options.contentType);
                    }

                    if(parentDataClass) {
                        return get("dataModels/" + dataModel + "/dataClasses/" + parentDataClass + "/dataClasses/", id, action, options);
                    }else{
                        return get("dataModels/" + dataModel + "/dataClasses/", id, action, options);
                    }
                },

                put: function (dataModelId, parentDataClassId, id, action, options) {
                    if(parentDataClassId) {
                        return put("dataModels/" + dataModelId + "/dataClasses/" + parentDataClassId + "/dataClasses/", id, action, options);
                    }else{
                        return put("dataModels/" + dataModelId + "/dataClasses/", id, action, options);
                    }
                },

                post: function (dataModelId, id, action, options) {
                    return post("dataModels/" + dataModelId + "/dataClasses/", id, action, options);
                },

                delete: function (dataModelId, parentDataClassId, id) {
                    if(parentDataClassId) {
                        return httpDelete("dataModels/" + dataModelId + "/dataClasses/" + parentDataClassId + "/dataClasses/", id);
                    }else{
                        return httpDelete("dataModels/" + dataModelId + "/dataClasses/", id);
                    }
                }
            },

            dataElement: {
                get: function (dataModelId, dataClassId, id, action, options) {
                    if(!options){
                        options = {};
                    }
                    if(['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1){
                        return res.catalogueItem.get(id, action, null, options.contentType);
                    }
                    return get("dataModels/" + dataModelId + "/dataClasses/" + dataClassId + "/dataElements/", id, action, options);
                },
                put: function (dataModelId, dataClassId, id, action, options) {
                    return put("dataModels/" + dataModelId + "/dataClasses/"  + dataClassId + "/dataElements/", id, action, options);
                },
                delete: function (dataModelId, dataClassId, id) {
                    return httpDelete("dataModels/" + dataModelId + "/dataClasses/" + dataClassId + "/dataElements/", id);
                }
            },

            dataType: {
                get: function (dataModelId, id, action, options) {
                    if(!options){
                        options = {};
                    }
                    if(['metadata', 'annotations', 'classifiers', 'semanticLinks'].indexOf(action) !== -1){
                        return res.catalogueItem.get(id, action, null, options.contentType);
                    }
                    return get("dataModels/" + dataModelId + "/dataTypes/", id, action, options);
                },

                put: function (dataModelId, id, action, options) {
                    return put("dataModels/" + dataModelId + "/dataTypes/", id, action, options);
                },

                delete: function (dataModelId, id) {
                    return httpDelete("dataModels/" + dataModelId + "/dataTypes/" , id);
                }
            },


            enumerationValues: {
                delete: function (dataModelId, dataTypeId, id) {
                    return httpDelete(
                        "dataModels/" + dataModelId +
                        "/enumerationTypes/"  + dataTypeId +
                        "/enumerationValues/", id);
                },
                put: function (dataModelId, dataTypeId, id, action, options) {
                    return put(
                        "dataModels/" + dataModelId +
                        "/enumerationTypes/"  + dataTypeId +
                        "/enumerationValues/"  ,id, action,options);
                },
                post: function (dataModelId, dataTypeId, options) {
                    return post(
                        "dataModels/" + dataModelId +
                        "/enumerationTypes/"  + dataTypeId +
                        "/enumerationValues/", null, null, options);
                }
            },



            userGroup:{
                get: function (id, action, options) {

                    return get("userGroups", id, action, options);
                },
                post: function (id, action, options) {
                    return post("userGroups", id, action, options);
                },
                put: function (id, action, options) {
                    return put("userGroups", id, action, options);
                },
                delete: function (id, action) {
                    return httpDelete("userGroups", id , action);
                }
            },
            admin:{
                get: function (name) {
                    return get("admin", name);
                },
                post: function (action, options) {
                    return post("admin", null, action, options);
                }
            },

            public:{
                get: function (name) {
                    return get("public", name);
                },
                dataFlowExporterPlugins: function() {
                    return get("public",null , "plugins/dataFlowExporters");
                },
                dataFlowImportPlugins: function() {
                    return get("public",null , "plugins/dataFlowImporters");
                },
                dataModelExporterPlugins: function (multiple) {
                    var options = {};
                    if(multiple === true){
                        options.filters = "multipleDataModels=true"
                    }
                    return get("public",null , "plugins/dataModelExporters", options);
                },
                dataModelImporterPlugins: function (multiple) {
                    var options = {};
                    if(multiple === true){
                        options.filters = "multipleDataModels=true"
                    }
                    return get("public",null , "plugins/dataModelImporters", options);
                }
            },

            importer:{
                get: function (name) {
                    return get("importer", name);
                },
                post: function (action, options) {
                    return post("importer",null, action, options);
                },

            },

            catalogueUser:{
                get: function (id, action, options) {
                    return get("catalogueUsers",id,action, options);
                },
                post: function (id, action, options) {
                    return post("catalogueUsers", id, action, options);
                },
                put: function (id, action, options) {
                    return put("catalogueUsers", id, action, options);
                },
                delete: function (id, action) {
                    return httpDelete("catalogueUsers", id, action);
                }
            },

            youTrack:{
                createIssue: function(summary, description) {
                    //https://www.jetbrains.com/help/youtrack/standalone/Create-New-Issue.html
                    //PUT /rest/issue?{project}&{summary}&{description}&{attachments}&{permittedGroup}
                    var url =
                        $rootScope.youTrack.url +
                        "/rest/issue?" +
                        "project=" + $rootScope.youTrack.project + "&" +
                        "summary=" + summary + "&" +
                        "description=" + description;
                    var config = {
                        url: url,
                        method: "PUT",
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8'
                        }
                    };
                    return  $http(config)
                }
            },


            //*********************************************************************************************
            //*********************************************************************************************
            getMarkdownText: function (path) {
                return restHandler({
                    url: "data/"+path+".md",
                    method:"GET",
                    withCredentials: true,
                    cache: true
                });
            },
            getData: function (path) {
                return restHandler({
                    url: "data/"+path+".json",
                    method:"GET",
                    withCredentials: true,
                    cache: true
                });
            },
            getNotifications: function () {
                return $timeout(function () {
                    return notifications;
                }, 500);
            },

            updateNotification: function (notification) {
                return $q.when(notification);
            }
            //*********************************************************************************************
            //*********************************************************************************************

        };
        return res;
    });

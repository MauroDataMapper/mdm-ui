angular.module('handlers').factory('contextSearchHandler', function (resources, $rootScope, messageHandler, $q, confirmationModal, stateHandler, elementTypes, validator, $filter) {

    return {

        search: function (contextElement, searchText, limit, offset,
                          domainTypes, labelOnly, dataModelTypes,
                          classifiers, classifierFilter,
                          lastUpdatedAfter, lastUpdatedBefore, createdAfter, createdBefore) {

            var dtIndex = domainTypes.indexOf("DataType");
            if( dtIndex !== -1){
                domainTypes.splice(dtIndex, 1);

                var dataTypes = elementTypes.getAllDataTypesArray();
                angular.forEach(dataTypes, function (dt) {
                    domainTypes.push(dt.id);
                });
            };

            var deferred = $q.defer();




            if(validator.isDate(lastUpdatedAfter)){
                lastUpdatedAfter = $filter('date')(lastUpdatedAfter, "yyyy-MM-dd");
            }else{
                lastUpdatedAfter = null;
            }

            if(validator.isDate(lastUpdatedBefore)){
                lastUpdatedBefore = $filter('date')(lastUpdatedBefore, "yyyy-MM-dd");
            }else{
                lastUpdatedBefore = null;
            }

            if(validator.isDate(createdAfter)){
                createdAfter = $filter('date')(createdAfter, "yyyy-MM-dd");
            }else{
                createdAfter = null;
            }

            if(validator.isDate(createdBefore)){
                createdBefore = $filter('date')(createdBefore, "yyyy-MM-dd");
            }else{
                createdBefore = null;
            }



            if(validator.isEmpty(searchText) && (!classifiers || (classifiers && classifiers.length === 0)) && (!classifierFilter || (classifierFilter && classifierFilter.length === 0))){
                return $q.when({
                    items: [],
                    count: 0,
                    limit: limit,
                    offset: offset,
                    domainTypes:domainTypes,
                    dataModelTypes:dataModelTypes
                });
            }

            if(contextElement == null){
                resources.catalogueItem.post(null, "search", {
                    resource:{
                        searchTerm: searchText,
                        limit: limit,
                        offset: offset,
                        domainTypes: domainTypes,
                        labelOnly:labelOnly,
                        dataModelTypes:dataModelTypes,
                        classifiers: classifiers,
                        classifierFilter: classifierFilter,

                        lastUpdatedAfter: lastUpdatedAfter,
                        lastUpdatedBefore: lastUpdatedBefore,

                        createdAfter: createdAfter,
                        createdBefore: createdBefore,
                    }
                }).then(function (result) {
                    deferred.resolve({
                        items:result.items,
                        count: result.count,
                        limit: limit,
                        offset: offset,
                        domainTypes:domainTypes,
                        dataModelTypes:dataModelTypes,
                        classifiers: classifiers
                    });
                }, function (error) {
                    deferred.reject(error);
                });

            }else if(contextElement.domainType === "Folder"){
                resources.folder.post(contextElement.id, "search",{
                    resource:{
                        searchTerm: searchText,
                        limit: limit,
                        offset: offset,
                        domainTypes: domainTypes,
                        labelOnly:labelOnly,
                        dataModelTypes:dataModelTypes,
                        classifiers: classifiers,
                        classifierFilter: classifierFilter,

                        lastUpdatedAfter: lastUpdatedAfter,
                        lastUpdatedBefore: lastUpdatedBefore,

                        createdAfter: createdAfter,
                        createdBefore: createdBefore,
                    }
                }).then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });

            }else if(contextElement.domainType === "DataModel"){
                resources.dataModel.post(contextElement.id, "search",{
                    resource:{
                        searchTerm: searchText,
                        limit: limit,
                        offset: offset,
                        domainTypes: domainTypes,
                        labelOnly:labelOnly,
                        dataModelTypes:dataModelTypes,

                        lastUpdatedAfter: lastUpdatedAfter,
                        lastUpdatedBefore: lastUpdatedBefore,

                        createdAfter: createdAfter,
                        createdBefore: createdBefore,
                    }
                }).then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
            }else if(contextElement.domainType === "DataClass"){
                resources.dataClass.post(contextElement.dataModel, contextElement.id, "search",{
                    resource:{
                        searchTerm: searchText,
                        limit: limit,
                        offset: offset,
                        domainTypes: domainTypes,
                        labelOnly:labelOnly,
                        dataModelTypes:dataModelTypes,

                        lastUpdatedAfter: lastUpdatedAfter,
                        lastUpdatedBefore: lastUpdatedBefore,

                        createdAfter: createdAfter,
                        createdBefore: createdBefore,
                    }
                }).then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
            }else if(contextElement.domainType === "Terminology"){
                resources.terminology.get(contextElement.id,  "terms/search",{
                    queryStringParams: {
                        search:  encodeURIComponent(searchText),
                        limit: limit,
                        offset: offset,
                        labelOnly:labelOnly
                    }
                }).then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });
            }

            return deferred.promise;
        },
    };

});

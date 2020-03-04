import { Injectable } from '@angular/core';
import { ResourcesService } from "./resources.service";
import { ValidatorService } from "./validator.service";
import { ElementTypesService } from "./element-types.service";
import { DatePipe } from '@angular/common';
import { merge, Observable, of as observableOf } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ContentSearchHandlerService {

    constructor(public resources: ResourcesService, public validator: ValidatorService, public elementTypes: ElementTypesService) { }

    search(contextElement, searchText, limit, offset,
        domainTypes, labelOnly, dataModelTypes,
        classifiers, classifierFilter,
        lastUpdatedAfter, lastUpdatedBefore, createdAfter, createdBefore): Observable<any> {

        var dtIndex = domainTypes.indexOf("DataType");
        if (dtIndex !== -1) {
            domainTypes.splice(dtIndex, 1);

            var dataTypes = this.elementTypes.getAllDataTypesArray();
            dataTypes.forEach((dt) => {
                domainTypes.push(dt.id);
            });
        };
        


        if (this.validator.isDate(lastUpdatedAfter)) {
            lastUpdatedAfter = new DatePipe("en-gb").transform(lastUpdatedAfter, "yyyy-MM-dd");
        } else {
            lastUpdatedAfter = null;
        }

        if (this.validator.isDate(lastUpdatedBefore)) {
            lastUpdatedBefore = new DatePipe("en-gb").transform(lastUpdatedBefore, "yyyy-MM-dd");
        } else {
            lastUpdatedBefore = null;
        }

        if (this.validator.isDate(createdAfter)) {
            createdAfter = new DatePipe("en-gb").transform(createdAfter, "yyyy-MM-dd");
        } else {
            createdAfter = null;
        }

        if (this.validator.isDate(createdBefore)) {
            createdBefore = new DatePipe("en-gb").transform(createdBefore, "yyyy-MM-dd");
        } else {
            createdBefore =  null;
        }



        if (this.validator.isEmpty(searchText) && (!classifiers || (classifiers && classifiers.length === 0)) && (!classifierFilter || (classifierFilter && classifierFilter.length === 0))) {
            return new Observable();
        }
        
        if (contextElement == null) {
            return this.resources.catalogueItem.post(null,
                "search",
                {
                    resource: {
                        searchTerm: searchText,
                        limit: limit,
                        offset: offset,
                        domainTypes: domainTypes,
                        labelOnly: labelOnly,
                        dataModelTypes: dataModelTypes,
                        classifiers: classifiers,
                        classifierFilter: classifierFilter,

                        lastUpdatedAfter: lastUpdatedAfter,
                        lastUpdatedBefore: lastUpdatedBefore,

                        createdAfter: createdAfter,
                        createdBefore: createdBefore,
                    },

                    pageSize: limit,
                  //  pageIndex: offset
                   pageIndex: offset * limit
                });
        } else if (contextElement.domainType === "Folder") {
            return this.resources.folder.post(contextElement.id, "search",
                {
                    resource: {
                        searchTerm: searchText,
                        limit: limit,
                        offset: offset,
                        domainTypes: domainTypes,
                        labelOnly: labelOnly,
                        dataModelTypes: dataModelTypes,
                        classifiers: classifiers,
                        classifierFilter: classifierFilter,

                        lastUpdatedAfter: lastUpdatedAfter,
                        lastUpdatedBefore: lastUpdatedBefore,

                        createdAfter: createdAfter,
                        createdBefore: createdBefore,
                    },

                    pageSize: limit,
                    pageIndex: offset * limit

                });
        } else if (contextElement.domainType === "DataModel") {
            return this.resources.dataModel.post(contextElement.id, "search", {
                resource: {
                    searchTerm: searchText,
                    limit: limit,
                    offset: offset,
                    domainTypes: domainTypes,
                    labelOnly: labelOnly,
                    dataModelTypes: dataModelTypes,

                    lastUpdatedAfter: lastUpdatedAfter,
                    lastUpdatedBefore: lastUpdatedBefore,

                    createdAfter: createdAfter,
                    createdBefore: createdBefore,
                },

                pageSize: limit,
                pageIndex: offset * limit

            });
        } else if (contextElement.domainType === "DataClass") {
            return this.resources.dataClass.post(contextElement.dataModel,
                contextElement.id,
                "search",
                {
                    resource: {
                        searchTerm: searchText,
                        limit: limit,
                        offset: offset,
                        domainTypes: domainTypes,
                        labelOnly: labelOnly,
                        dataModelTypes: dataModelTypes,

                        lastUpdatedAfter: lastUpdatedAfter,
                        lastUpdatedBefore: lastUpdatedBefore,

                        createdAfter: createdAfter,
                        createdBefore: createdBefore,
                    },
                    pageSize: limit,
                    pageIndex: offset * limit 
                });
        } else if (contextElement.domainType === "Terminology") {
            return this.resources.terminology.get(contextElement.id,
                "terms/search",
                {
                    queryStringParams: {
                        search: encodeURIComponent(searchText),
                        limit: limit,
                        offset: offset,
                        labelOnly: labelOnly
                    },
                    options: {
                        pageSize: limit,
                        pageIndex: offset  * limit 
                    }
                });
        }
    }
}


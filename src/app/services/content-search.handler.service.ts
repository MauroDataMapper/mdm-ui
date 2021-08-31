/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Injectable } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ValidatorService } from './validator.service';
import { ElementTypesService } from './element-types.service';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ContentSearchHandlerService {

    constructor(public resources: MdmResourcesService, public validator: ValidatorService, public elementTypes: ElementTypesService) { }

    search(contextElement, searchText, limit, offset,
           domainTypes, labelOnly, dataModelTypes,
           classifiers, classifierFilter,
           lastUpdatedAfter, lastUpdatedBefore, createdAfter, createdBefore): Observable<any> {
        const dtIndex = domainTypes.indexOf('DataType');
        if (dtIndex !== -1) {
            domainTypes.splice(dtIndex, 1);

            const dataTypes = this.elementTypes.getAllDataTypesArray();
            dataTypes.forEach((dt) => {
                domainTypes.push(dt.id);
            });
        }


        if (this.validator.isDate(lastUpdatedAfter)) {
            lastUpdatedAfter = new DatePipe('en-gb').transform(lastUpdatedAfter, 'yyyy-MM-dd');
        } else {
            lastUpdatedAfter = null;
        }

        if (this.validator.isDate(lastUpdatedBefore)) {
            lastUpdatedBefore = new DatePipe('en-gb').transform(lastUpdatedBefore, 'yyyy-MM-dd');
        } else {
            lastUpdatedBefore = null;
        }

        if (this.validator.isDate(createdAfter)) {
            createdAfter = new DatePipe('en-gb').transform(createdAfter, 'yyyy-MM-dd');
        } else {
            createdAfter = null;
        }

        if (this.validator.isDate(createdBefore)) {
            createdBefore = new DatePipe('en-gb').transform(createdBefore, 'yyyy-MM-dd');
        } else {
            createdBefore =  null;
        }


        if (this.validator.isEmpty(searchText) && (!classifiers || (classifiers && classifiers.length === 0)) && (!classifierFilter || (classifierFilter && classifierFilter.length === 0))) {
            return new Observable();
        }

        if (contextElement == null) {
          // TODO: not working because there is no 'all' context.
          return this.resources.catalogueItem.search(
                {
                        searchTerm: searchText,
                        limit,
                        offset,
                        domainTypes,
                        labelOnly,
                        dataModelTypes,
                        classifiers,
                        classifierFilter,

                        lastUpdatedAfter,
                        lastUpdatedBefore,

                        createdAfter,
                        createdBefore,

                    pageSize: limit,
                   pageIndex: offset * limit
                });
        }
        else if (contextElement.domainType === 'Folder') {
          return this.resources.folder.search(
            contextElement.id,
            {
              searchTerm: searchText,
              limit,
              offset,
              domainTypes,
              labelOnly,
              dataModelTypes,

              lastUpdatedAfter,
              lastUpdatedBefore,

              createdAfter,
              createdBefore,
              pageSize: limit,
              pageIndex: offset * limit
          });
        } else if (contextElement.domainType === 'DataModel') {
          return this.resources.dataModel.search(contextElement.id, {
                searchTerm: searchText,
                limit,
                offset,
                domainTypes,
                labelOnly,
                dataModelTypes,

                lastUpdatedAfter,
                lastUpdatedBefore,

                createdAfter,
                createdBefore,
                pageSize: limit,
                pageIndex: offset * limit
            });
        } else if (contextElement.domainType === 'DataClass') {
            return this.resources.dataClass.search(contextElement.dataModel, contextElement.id, {
                searchTerm: searchText,
                limit,
                offset,
                domainTypes,
                labelOnly,
                dataModelTypes,

                lastUpdatedAfter,
                lastUpdatedBefore,

                createdAfter,
                createdBefore,
                pageSize: limit,
                pageIndex: offset * limit
            });
        } else if (contextElement.domainType === 'Terminology') {
            return this.resources.terms.search(contextElement.id, {
                          search: encodeURIComponent(searchText),
                          limit,
                          offset,
                          labelOnly,
                          pageSize: limit,
                          pageIndex: offset  * limit
                      });
        }
    }
}


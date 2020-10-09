/*
Copyright 2020 University of Oxford

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
import {ElementTypesService} from '@mdm/services/element-types.service';

@Injectable({
  providedIn: 'root'
})
export class LinkCreatorService {

  constructor(private elementTypes: ElementTypesService) { }

  public createLink(href) {
    const elements = href.split('|');
    const elementType = elements[1];
    let mcElement = {};

    if (elementType === 'FD') {
      mcElement = {
        id: elements[2],
        domainType: 'Folder'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'CS') {
      mcElement = {
        id: elements[2],
        domainType: 'Classifier'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'DM') {
      mcElement = {
        id: elements[2],
        domainType: 'DataModel'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'DC') {
      mcElement = {
        dataModel: elements[2],
        parentDataClass: elements.length === 5 ? elements[3] : null,
        id: elements.length === 5 ? elements[4] : elements[3],
        domainType: 'DataClass'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'DT' || elementType === 'EV') {
      mcElement = {
        dataModel: elements[2],
        id: elements[3],
        domainType: 'DataType'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'DE') {
      mcElement = {
        dataModel: elements[2],
        dataClass: elements[3],
        id: elements[4],
        domainType: 'DataElement'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'TM') {
      mcElement = {
        terminology: elements[2],
        id: elements[3],
        domainType: 'Term'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'TG') {
      mcElement = {
        id: elements[2],
        domainType: 'Terminology'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }
  }
}

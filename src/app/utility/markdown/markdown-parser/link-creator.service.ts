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
import { BroadcastService } from '@mdm/services/broadcast.service';
import { ElementTypesService } from '@mdm/services/element-types.service';

@Injectable({
  providedIn: 'root'
})
export class LinkCreatorService {

  constructor(private elementTypes: ElementTypesService, private broadcastSvc: BroadcastService) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createLink(href, title, text) {
    href = href.split('^').join(' ');

    let elementType = '';
    // let elementName = "";
    const elements = href.split('|');

    let dataModelName = '';
    let dataClassName = '';
    // let dataTypeName = '';
    // let dataElementName = '';
    let terminologyName = '';
    // let codeSetName = '';
    elements.forEach(item => {
      const itmElements = item.split(':');
      if (elements.indexOf(item) === elements.length - 1) {
        elementType = itmElements[0];
        // elementName = itmElements[1];
      }
      if (itmElements.length > 0) {
        if (itmElements[0] === 'dm') {
          dataModelName = itmElements[1];
        }
        if (itmElements[0] === 'dc') {
          dataClassName = itmElements[1];
        }
        // if (itmElements[0] === 'dt') {
        //  dataTypeName = itmElements[1];
        // }
        // if (itmElements[0] === 'de') {
        //  dataElementName = itmElements[1];
        // }
        if (itmElements[0] === 'te') {
          terminologyName = itmElements[1];
        }
        // if (itmElements[0] === 'cs') {
        //  codeSetName = itmElements[1];
        // }
      }
    });

    let mcElement = {};
    if (elementType === 'fd') {
      mcElement = {
        id: href,
        domainType: 'Folder'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'dm') {
      mcElement = {
        id: href,
        domainType: 'DataModel'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'dc') {
      mcElement = {
        model: dataModelName,
        parentDataClass: dataClassName,
        id: href,
        domainType: 'DataClass'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'dt' || elementType === 'ev') {
      mcElement = {
        dataModel: dataModelName,
        id: href,
        domainType: 'DataType'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'de') {
      mcElement = {
        dataModel: dataModelName,
        dataClass: dataClassName,
        id: href,
        domainType: 'DataElement'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'tm') {
      mcElement = {
        terminology: 'te:' + terminologyName,
        id: href,
        domainType: 'Term'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'te') {
      mcElement = {
        id: href,
        domainType: 'Terminology'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'cs') {
      mcElement = {
        id: href,
        domainType: 'CodeSet'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }
  }
}

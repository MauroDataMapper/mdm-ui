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

@Injectable({
  providedIn: 'root'
})
export class SemanticLinkHandlerService {

  constructor(private resources: MdmResourcesService) { }

  post = (source, target, linkType) => {
    return this.action(source, target, null, linkType, 'POST');
  };

  put = (source, target, linkId, linkType) => {
    return this.action(source, target, linkId, linkType, 'PUT');
  };

  private findSemanticLinkType(source, target) {
    if (source.domainType === 'Term') {
      if (target.domainType === 'Term') {
        // Term->Term
        return 'TermSemanticLink';
      } else {
        // Term->CI
        return 'TermCatalogueSemanticLink';
      }
    } else {
      if (source.domainType !== 'Term' && target.domainType === 'Term') {
        // CI->Term
        return 'CatalogueTermSemanticLink';
      } else {
        // CI->CI
        return 'CatalogueSemanticLink';
      }
    }
  }

  private action(source, target, linkId, linkType, operation) {

    const resource = {
      target: { id: target.id },
      linkType,
      domainType: this.findSemanticLinkType(source, target)
    };

    if (operation === 'POST') {
      return this.resources.catalogueItem.saveSemanticLinks(source.domainType, source.id, resource);
    } else {
      return this.resources.catalogueItem.updateSemanticLink(source.domainType, source.id, linkId, resource);
    }

    // if (source.domainType === 'Term') {
    //     if (operation === 'POST') {
    //       return this.resources.term.post(source.terminology, source.id, 'semanticLinks', { resource });
    //     } else {
    //       return this.resources.term.put(source.terminology, source.id, 'semanticLinks/' + linkId, { resource });
    //     }
    // } else {
    //     if (operation === 'POST') {
    //       return this.resources.catalogueItem.post(source.id, 'semanticLinks', { resource });
    //     } else {
    //       return this.resources.catalogueItem.put(source.id, 'semanticLinks', linkId, { resource });
    //     }
    // }
  }
}

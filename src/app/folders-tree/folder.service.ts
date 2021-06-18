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
import { CatalogueItemDomainType, FolderDetailResponse, Uuid, VersionedFolderDetailResponse } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { Observable } from 'rxjs';

@Injectable()
export class FolderService {

  constructor(private resources: MdmResourcesService) {
  }

  async loadModelsToCompare(dataModel) {
    const semanticLinks: any = await this.resources.catalogueItem.listSemanticLinks(dataModel.domainType, dataModel.id, { filters: 'all=true' }).toPromise();
    const compareToList = [];
    if (semanticLinks && semanticLinks.body.items) {
      semanticLinks.body.items.map(link => {
        if (['Superseded By', 'New Version Of'].includes(link.linkType) && link.source.id === dataModel.id) {
          compareToList.push(link.target);
        }
      });
    }
    return compareToList;
  }

  async loadVersions(dataModel) {
    const targetModels = await this.loadModelsToCompare(dataModel);
    return targetModels;
  }

  getFolder(id: Uuid, domainType: CatalogueItemDomainType = CatalogueItemDomainType.Folder): Observable<FolderDetailResponse | VersionedFolderDetailResponse> {
    if (domainType === CatalogueItemDomainType.VersionedFolder) {
      return this.resources.versionedFolder.get(id);
    }

    return this.resources.folder.get(id);
  }

}

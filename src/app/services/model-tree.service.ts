/*
Copyright 2021 University of Oxford

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
import { Node, DOMAIN_TYPE } from '@mdm/folders-tree/flat-node';
import { SubscribedCatalogue, SubscribedCatalogueIndexResponse, SubscribedCatalogueModel, SubscribedCatalogueModelIndexResponse } from '@mdm/model/subscribed-catalogue-model';
import { MdmResourcesService } from '@mdm/modules/resources';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SharedService } from './shared.service';
import { UserSettingsHandlerService } from './utility/user-settings-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ModelTreeService {

  constructor(
    private resources: MdmResourcesService,
    private sharedService: SharedService,
    private userSettingsHandler: UserSettingsHandlerService) { }

  getLocalCatalogueTreeNodes(noCache?: boolean): Observable<Node[]> {
    let options: any = {};
    if (this.sharedService.isLoggedIn()) {
      options = {
        queryStringParams: {
          includeDocumentSuperseded: this.userSettingsHandler.get('includeDocumentSuperseded') || false,
          // includeModelSuperseded: this.userSettingsHandler.get('includeModelSuperseded') || false,
          includeModelSuperseded: true,
          includeDeleted: this.userSettingsHandler.get('includeDeleted') || false
        }
      };
    }
    if (noCache) {
      options.queryStringParams.noCache = true;
    }

    return this.resources.tree
      .list('folders', options.queryStringParams)
      .pipe(
        map((response: any) => <Node[]>response.body)
      );
  }

  getSubscribedCatalogueTreeNodes(): Observable<Node[]> {
    const options = {
      sort: 'label',
      order: 'asc'
    };

    return this.resources.subscribedCatalogues
      .list(options)
      .pipe(
        map((response: SubscribedCatalogueIndexResponse) => response.body.items ?? []),
        map((catalogues: SubscribedCatalogue[]) => catalogues.map(item => Object.assign<{}, Node>({}, {
          id: item.id,
          domainType: DOMAIN_TYPE.SubscribedCatalogue,
          hasChildren: true,
          label: item.label
        })))
      );
  }

  createRootNode(children?: Node[]): Node {
    return Object.assign<{}, Node>({}, {
      id: '',
      domainType: DOMAIN_TYPE.Root,
      children,
      hasChildren: true,
      isRoot: true
    });
  }

  createLocalCatalogueNode(children?: Node[]): Node {
    return Object.assign<{}, Node>({}, {
      id: '4aa2444c-ed08-471b-84dd-96f6b3b4a00a',
      domainType: DOMAIN_TYPE.LocalCatalogue,
      label: 'This catalogue',
      hasChildren: true,
      children
    });
  }

  createExternalCataloguesNode(children?: Node[]): Node {
    return Object.assign<{}, Node>({}, {
      id: '30dca3f9-5cf5-41a8-97eb-fd2dab2d4c20',
      domainType: DOMAIN_TYPE.ExternalCatalogues,
      label: 'External catalogues',
      hasChildren: true,
      children
    });
  }

  getSubscribedCatalogueModelNodes(catalogueId: string): Observable<Node[]>
  {
    return this.resources.subscribedCatalogues
      .listAvailableModels(catalogueId)
      .pipe(
        map((response: SubscribedCatalogueModelIndexResponse) => response.body.items ?? []),
        map((models: SubscribedCatalogueModel[]) => models.map(item => Object.assign<{}, Node>({}, {
          id: item.modelId,
          domainType: DOMAIN_TYPE.FederatedDataModel,
          hasChildren: false,
          label: item.label
        })))
      );
  }
}
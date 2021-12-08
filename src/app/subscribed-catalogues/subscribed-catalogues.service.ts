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
import { AvailableDataModel, AvailableDataModelIndexResponse, SubscribedDataModel, SubscribedDataModelIndexResponse } from '@maurodatamapper/mdm-resources';
import { FederatedDataModel } from '@mdm/model/federated-data-model';
import { MdmResourcesService, MdmRestHandlerOptions } from '@mdm/modules/resources';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubscribedCataloguesService {

  constructor(private resources: MdmResourcesService) { }

  /**
   * Combines the endpoint responses from `listPublishedModels()` and `listSubscribedModels()` to produce a collection of
   * `FederatedDataModel` objects to provide external data models and their subscription status.
   *
   * @param catalogueId The UUID of the subscribed catalogue to search under.
   */
  getFederatedDataModels(catalogueId: string): Observable<FederatedDataModel[]> {
    return combineLatest([
      this.listPublishedModels(catalogueId),
      this.listSubscribedModels(catalogueId)
    ])
    .pipe(
      map(([publishedModels, subscribedModels]) => {
        return publishedModels.map(publishedModel => {
          const subscribed = subscribedModels.find(item => item.subscribedModelId === (publishedModel.modelId ?? ''));
          return new FederatedDataModel(catalogueId, publishedModel, subscribed);
        });
      })
    );
  }

  listPublishedModels(catalogueId: string): Observable<AvailableDataModel[]> {
    // Handle any HTTP errors manually. This covers the scenario where this is unable to
    // get available models from the subscribed catalogue e.g. the subscribed catalogue instance is not
    // available/offline
    const restOptions: MdmRestHandlerOptions = {
      handleGetErrors: false
    };

    return this.resources.subscribedCatalogues
      .listPublishedModels(catalogueId, {}, restOptions)
      .pipe(
        map((response: AvailableDataModelIndexResponse) => response.body.items ?? [])
      );
  }

  listSubscribedModels(catalogId: string): Observable<SubscribedDataModel[]> {
    return this.resources.subscribedCatalogues
      .listSubscribedModels(catalogId)
      .pipe(
        map((response: SubscribedDataModelIndexResponse) => response.body.items ?? [])
      );
  }
}

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
import { AvailableDataModel, AvailableDataModelIndexResponse, FederatedDataModel, SubscribedDataModel, SubscribedDataModelIndexResponse } from '@mdm/model/federated-data-model';
import { MdmResourcesService } from '@mdm/modules/resources';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubscribedCataloguesService {

  constructor(private resources: MdmResourcesService) { }

  /**
   * Combines the endpoint responses from `listAvailableModels()` and `listSubscribedModels()` to produce a collection of
   * `FederatedDataModel` objects to provide external data models and their subscription status.
   * 
   * @param catalogueId The UUID of the subscribed catalogue to search under.
   */
  getFederatedDataModels(catalogueId: string): Observable<FederatedDataModel[]> {
    return combineLatest([
      this.listAvailableModels(catalogueId),
      this.listSubscribedModels(catalogueId)
    ])
    .pipe(
      map(([availableModels, subscribedModels]) => {
        return availableModels.map(available => {
          const subscribed = subscribedModels.find(item => item.subscribedModelId === (available.modelId ?? ''))
          return new FederatedDataModel(catalogueId, available, subscribed);
        });
      })
    );
  }

  listAvailableModels(catalogueId: string): Observable<AvailableDataModel[]> {
    return this.resources.subscribedCatalogues
      .listAvailableModels(catalogueId)
      .pipe(
        map((response: AvailableDataModelIndexResponse) => response.body.items ?? [])
      )
  }

  listSubscribedModels(catalogId: string): Observable<SubscribedDataModel[]> {
    return this.resources.subscribedCatalogues
      .listSubscribedModels(catalogId)
      .pipe(
        map((response: SubscribedDataModelIndexResponse) => response.body.items ?? [])
      );
  }
}

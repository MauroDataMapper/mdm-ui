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
import { AvailableDataModel, CatalogueItemDomainType, SubscribedDataModel } from '@maurodatamapper/mdm-resources';

export class FederatedDataModel {
  catalogueId: string;
  modelId?: string;
  label: string;
  description?: string;
  modelType?: CatalogueItemDomainType;
  subscriptionId?: string;
  folderId?: string;
  folderLabel?: string;
  version? : string;

  constructor(
    catalogueId: string,
    available?: AvailableDataModel,
    subscription?: SubscribedDataModel) {
      this.catalogueId = catalogueId;
      this.modelId = available?.modelId;
      this.label = available?.label;
      this.description = available?.description;
      this.version = available?.version;
      this.modelType = available?.modelType;
      this.subscriptionId = subscription?.id;
      this.folderId = subscription?.folderId;
    }

  get isSubscribed(): boolean {
    return this.subscriptionId !== undefined;
  }
}
/*
Copyright 2020-2023 University of Oxford
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
import {
  CatalogueItemDomainType,
  PublishedDataModel,
  PublishedDataModelLink,
  SubscribedDataModel
} from '@maurodatamapper/mdm-resources';

export class FederatedDataModel {
  catalogueId: string;
  modelId?: string;
  label: string;
  description?: string;
  modelType?: CatalogueItemDomainType;
  dateCreated?: string;
  datePublished?: string;
  lastUpdated?: string;
  links?: PublishedDataModelLink[];
  subscriptionId?: string;
  folderId?: string;
  folderLabel?: string;
  version?: string;
  modelVersionTag?: string;

  constructor(
    catalogueId: string,
    published?: PublishedDataModel,
    subscription?: SubscribedDataModel
  ) {
    this.catalogueId = catalogueId;
    this.modelId = published?.modelId;
    this.label = published?.label;
    this.description = published?.description;
    this.version = published?.version;
    this.modelVersionTag = published?.modelVersionTag;
    this.modelType = published?.modelType;
    this.dateCreated = published?.dateCreated;
    this.datePublished = published?.datePublished;
    this.lastUpdated = published?.lastUpdated;
    this.links = published?.links;
    this.subscriptionId = subscription?.id;
    this.folderId = subscription?.folderId;
  }

  get isSubscribed(): boolean {
    return this.subscriptionId !== undefined;
  }
}

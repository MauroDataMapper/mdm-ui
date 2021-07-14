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

import { CatalogueItemDomainType, ModelDomainType } from "@maurodatamapper/mdm-resources";

export enum  ModelDomainRequestType {
    folders = 'folder',
    dataModels = 'dataModel',
    dataClasses = 'dataClass',
    dataTypes = 'dataType',
    terminologies = 'terminology',
    referenceDataModels = 'referenceDataModel',
    terms = 'term',
    Folders = 'folder',
    DataModels = 'dataModel',
    DataClasses = 'dataClass',
    DataTypes = 'dataType',
    Terminologies = 'terminology',
    ReferenceDataModels = 'referenceDataModel',
    Terms = 'term',
    Folder = 'folder',
    DataModel = 'dataModel',
    DataClass = 'dataClass',
    DataType = 'dataType',
    Terminology = 'terminology',
    ReferenceDataModel = 'referenceDataModel',
    Term = 'term',
}

export const mapCatalogueItemDomainTypeToModelDomainType = (source: CatalogueItemDomainType): ModelDomainType | undefined => {
  switch (source) {
    case CatalogueItemDomainType.Folder:
      return ModelDomainType.Folders;
    case CatalogueItemDomainType.DataModel:
      return ModelDomainType.DataModels;
    case CatalogueItemDomainType.DataClass:
      return ModelDomainType.DataClasses;
    case CatalogueItemDomainType.Terminology:
      return ModelDomainType.Terminologies;
    case CatalogueItemDomainType.ReferenceDataModel:
      return ModelDomainType.ReferenceDataModels;
    case CatalogueItemDomainType.Term:
      return ModelDomainType.Terms;
    case CatalogueItemDomainType.Classification:
      return ModelDomainType.Classifiers;
    case CatalogueItemDomainType.VersionedFolder:
      return ModelDomainType.VersionedFolders;
    default:
      return undefined;
  }
}
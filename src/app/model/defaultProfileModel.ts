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
import {
  CatalogueItemDomainType,
  Container,
  DataTypeReference
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

export interface DefaultProfileModalConfiguration {
  items: Array<DefaultProfileItem>;
  parentCatalogueItem?: any;
}

export interface DefaultProfileModalResponse {
  status: ModalDialogStatus;
  items?: Array<DefaultProfileItem>;
}


export interface DefaultProfileItem {
  displayName: string;
  value?: string | Container[] | string[] | DataTypeReference;
  controlType: ProfileControlTypes;
  minMultiplicity?: number | string;
  maxMultiplicity?: number | string;
  propertyName: string;
}

export enum ProfileControlTypes {
  text = 'Text',
  html = 'HTML',
  aliases = 'Aliases',
  classifications = 'Classifications',
  multiplicity = 'Multiplicity',
  dataType = 'DataType'
}

export  class DefaultProfileControls {

  static renderControls(domainType): string[] {

    const dataModel = [
      'description',
      'author',
      'aliases',
      'organisation',
      'classifications'
    ];
    const dataClass = [
      'description',
      'classifications',
      'multiplicity',
      'aliases'
    ];
    const dataElement = [
      'description',
      'classifications',
      'multiplicity',
      'aliases',
      'dataType'
    ];
    const folder = ['description'];
    const dataType = ['description', 'aliases', 'classifications', 'dataType'];
    const term = ['description', 'aliases',  'classifications', 'url','terminology'];
    const classification = ['description'];


    switch (domainType) {
      case CatalogueItemDomainType.DataModel:
      case CatalogueItemDomainType.ReferenceDataModel:
      case CatalogueItemDomainType.Terminology:
      case CatalogueItemDomainType.CodeSet:
        return dataModel;
      case CatalogueItemDomainType.Term:
        return term;
      case CatalogueItemDomainType.DataClass:
        return dataClass;
      case CatalogueItemDomainType.Folder:
      case CatalogueItemDomainType.VersionedFolder:
        return folder;
      case CatalogueItemDomainType.DataElement:
        return dataElement;
      case CatalogueItemDomainType.ReferenceDataModelType:
      case CatalogueItemDomainType.CodeSetType:
      case CatalogueItemDomainType.ModelDataType:
      case CatalogueItemDomainType.PrimitiveType:
      case CatalogueItemDomainType.TerminologyType:
      case CatalogueItemDomainType.EnumerationType:
      case CatalogueItemDomainType.ReferenceType:
        return dataType;
    case CatalogueItemDomainType.Classifier:
        return classification;
      default:
        return dataModel;
    }
  }
}

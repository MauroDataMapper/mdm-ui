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

export interface DefaultProfile {
  items: Array<DefaultProfileItem>;
  catalogueItem: any;
}

// TODO update classifications with model
export interface DefaultProfileItem {
  displayName: string;
  value?: string | Container[] | string[] | DataTypeReference;
  controlType: ProfileControlTypes;
  minMultiplicity?: number | string;
  maxMultiplicity?: number | string;
}

export enum ProfileControlTypes {
  text = 'Text',
  html = 'HTML',
  aliases = 'Aliases',
  classifications = 'Classifications',
  multiplicity = 'Multiplicity',
  dataType = 'DataType'
}

export class DefaultProfileControls {
  static dataModel = [
    'description',
    'author',
    'aliases',
    'organisation',
    'classifications'
  ];
  static dataClass = [
    'description',
    'classifications',
    'multiplicity',
    'aliases'
  ];
  static dataElement = [
    'description',
    'classifications',
    'multiplicity',
    'aliases',
    'dataType'
  ];
  static folder = ['description'];
  static dataType = ['description', 'aliases', 'classifications', 'dataType'];
  static term = ['description', 'aliases',  'classifications', 'url','terminology'];
  static classification = ['description'];

  static renderControls(domainType): string[] {
    switch (domainType) {
      case (CatalogueItemDomainType.DataModel,
      CatalogueItemDomainType.Terminology,
      CatalogueItemDomainType.CodeSet):
        return DefaultProfileControls.dataModel;
      case CatalogueItemDomainType.Term:
        return DefaultProfileControls.term;
      case CatalogueItemDomainType.DataClass:
        return DefaultProfileControls.dataClass;
      case CatalogueItemDomainType.Folder:
        return DefaultProfileControls.folder;
      case CatalogueItemDomainType.DataElement:
        return DefaultProfileControls.dataElement;
      case (CatalogueItemDomainType.ReferenceDataModelType,
      CatalogueItemDomainType.CodeSetType,
      CatalogueItemDomainType.ModelDataType,
      CatalogueItemDomainType.PrimitiveType,
      CatalogueItemDomainType.TerminologyType,
      CatalogueItemDomainType.EnumerationType,
      CatalogueItemDomainType.ReferenceType):
        return DefaultProfileControls.dataType;
    case CatalogueItemDomainType.Classification:
        return DefaultProfileControls.classification;
      default:
        return DefaultProfileControls.dataModel;
    }
  }
}

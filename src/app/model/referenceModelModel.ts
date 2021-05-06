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
import { CatalogueItemDomainType, Classifier, MdmIndexResponse, MdmResponse } from '@maurodatamapper/mdm-resources';

export class EditableReferenceModel {
  deletePending: boolean;
  label: string;
  description: string;
  classifiers: Classifier[] = [];
  aliases: any[] = [];
  visible: boolean;
  waiting: boolean;
  author: any;
  organisation: any;
  validationError: boolean;

  constructor() { }

  show() { }
  cancel() { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  save(parent: any) { }
}

export class Categories {
  index: number;
  id: string;
  key: string;
  value: string;
  category: string;
}

export interface ReferenceDataType {
  id: string;
  domainType: CatalogueItemDomainType;
  label: string;
  description?: string;
  model?: string;
  [key: string]: any;
}

export interface ReferenceDataTypeEditor {
  label: string;
  description?: string;
  errors: any;
}

export interface ReferenceDataElement {
  id: string;
  domainType: CatalogueItemDomainType;
  label: string;
  description?: string;
  model?: string;
  referenceDataType?: ReferenceDataType;
  [key: string]: any;
}

export interface ReferenceDataElementEditor {
  label: string;
  description?: string;
  referenceDataType?: ReferenceDataType;
  errors: any;
}

export interface ReferenceDataValueColumn {
  id: string;
  rowNumber: number;
  value: string;
  referenceDataElement: ReferenceDataElement;
}

export interface ReferenceDataValueRow {
  columns: ReferenceDataValueColumn[];
  [key: string]: any;
}

export interface ReferenceDataValueIndexBody {
  /**
   * Gets the number of items in the returned list.
   */
  count: number;

  /**
   * Gets the list of items returned from the API.
   */
  rows: ReferenceDataValueRow[];
}

export type ReferenceDataTypeIndexResponse = MdmIndexResponse<ReferenceDataType>;
export type ReferenceDataTypeDetailxResponse = MdmResponse<ReferenceDataType>;

export type ReferenceDataElementIndexResponse = MdmIndexResponse<ReferenceDataElement>;
export type ReferenceDataElementDetailResponse = MdmResponse<ReferenceDataElement>;

export type ReferenceDataValueIndexResponse = MdmResponse<ReferenceDataValueIndexBody>;

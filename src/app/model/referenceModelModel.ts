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
import { MdmResponse, ReferenceDataElement, ReferenceDataType } from '@maurodatamapper/mdm-resources';

export interface ReferenceDataTypeEditor {
  label: string;
  description?: string;
  errors: any;
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

export type ReferenceDataValueIndexResponse = MdmResponse<ReferenceDataValueIndexBody>;

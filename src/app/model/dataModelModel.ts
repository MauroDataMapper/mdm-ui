/*
Copyright 2020 University of Oxford

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
export class DataModelResult {
  id: string;
  domainType: string;
  label: string;
  documentationVersion: any[];
  description: string;
  editable: boolean;
  lastUpdated: string;
  classifiers: Classifiers[];
  type: string;
  finalised: boolean;
  author: string;
  authority: any[];
  organisation: string;
  dateFinalised: string;
  aliases: any[];
  semanticLinks: any[];
  readableByEveryone: boolean;
  deleted: boolean;
  branchName: string;
  modelVersion: any;
}

export class Classifiers {
  id: string;
  label: string;
  lastUpdated: string;
}

export class EditableDataModel {
  deletePending: boolean;
  label: string;
  description: string;
  classifiers: Classifiers[] = [];
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

export interface DataType {
  domainType: string;
  label: string;
  description?: string;
}

export interface DataTypeProvider {
  name: string;
  displayName: string;
  version: string;
  dataTypes: DataType[];
}
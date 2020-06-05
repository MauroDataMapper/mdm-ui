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
export class FolderResult {
  id: string;
  label: string;
  description: string;
  finalised: boolean;
  deleted: boolean;
  writeableByUsers: any[];
  readableByUsers: any[];
  readableByEveryone: boolean;
  lastUpdated: any;
  parentDataModel: string;
  parentDataClass: string;
}

export class SearchResult {
  count: number;
  items: HistoryModel[];
}

export class HistoryModel {
  dateCreated: string;
  createdBy: HistoryPropertiesModel;
  description: string;
}

export class HistoryPropertiesModel {
  id: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  userRole: string;
  disabled: boolean;
}

export class Editable {
  constructor() {}

  deletePending: boolean;
  label: string;
  description: string;
  visible: boolean;
  waiting: boolean;
  validationError: boolean;

  show() {}
  cancel() {}
  save(parent: any) {}
}

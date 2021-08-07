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
import { Branchable, MergeDiffItem } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { MergeItemValueType } from '@mdm/merge-diff/types/merge-item-type';

export interface ConflictEditorModalData {
  source: Branchable;
  target: Branchable;
  item: MergeDiffItem;
  valueType: MergeItemValueType;
}

export interface ConflictEditorModalResult {
  status: ModalDialogStatus;
  resolvedContent?: string;
}
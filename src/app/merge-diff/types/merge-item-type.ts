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
import { MergeDiffItem, MergeConflictResolution } from '@maurodatamapper/mdm-resources';

export const branchNameField = 'branchName';

export type MergeItemValueType = 'undefined' | 'string' | 'number';

export interface MergeItemSelection {
  mergeItem: MergeDiffItem;
  isCommitting: boolean;
}

export interface CommittingMergeDiffItem {
  branchSelected: MergeConflictResolution;
  branchNameSelected?: string;
  mixedContent?: string;
}

/**
 * View model representing the combination of a {@link MergeDiffItem} returned from the backend, and
 * a {@link CommittingMergeDiffItem} to track user changes through the user interface.
 */
export type MergeDiffItemModel = MergeDiffItem & CommittingMergeDiffItem;

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

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MergeDiffItem, MergeDiffType, MergeConflictResolution } from '@maurodatamapper/mdm-resources';
import {
   MergeDiffItemModel} from '../types/merge-item-type';

@Component({
  selector: 'mdm-merge-item-selector',
  templateUrl: './merge-item-selector.component.html',
  styleUrls: ['./merge-item-selector.component.scss']
})
export class MergeItemSelectorComponent implements OnInit {
  @Output() selectedMergeItemChanged = new EventEmitter<MergeDiffItem>();
  @Input() mergeItems: MergeDiffItemModel[];
  @Input() isCommitting: boolean;

  changesList: MergeDiffItem[] = [];

  constructor() {}

  ngOnInit(): void {
  }

  selectedItem(mergeItem: MergeDiffItem) {
    this.selectedMergeItemChanged.emit( mergeItem);
  }

  public get mergeType() {
    return MergeDiffType;
  }

  getBranchSelectedIcon(selected: MergeConflictResolution) {
    switch (selected) {
      case MergeConflictResolution.Source:
        return 'fas fa-file-export';
      case MergeConflictResolution.Target:
        return 'fas fa-file-import';
      case MergeConflictResolution.Mixed:
        return 'fab fa-mixer';
      default:
        return '';
    }
  }

  getBranchSelectedTooltip(selected: MergeConflictResolution) {
    switch (selected) {
      case MergeConflictResolution.Source:
        return 'Take from Source';
      case MergeConflictResolution.Target:
        return 'Take from Target';
      case MergeConflictResolution.Mixed:
        return 'Mixed/combined content';
      default:
        return '';
    }
  }

  getMergeTypeTooltip(type: MergeDiffType) {
    switch (type) {
      case MergeDiffType.Creation:
        return 'Created';
      case MergeDiffType.Deletion:
        return 'Deleted';
      case MergeDiffType.Modification:
        return 'Modified';
      default:
        return '';
    }
  }
}

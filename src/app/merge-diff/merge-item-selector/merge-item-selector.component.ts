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
import { MergeItem, MergeType, MergeUsed } from '@maurodatamapper/mdm-resources';
import {
  CommittingMergeItem} from '../types/merge-item-type';

@Component({
  selector: 'mdm-merge-item-selector',
  templateUrl: './merge-item-selector.component.html',
  styleUrls: ['./merge-item-selector.component.scss']
})
export class MergeItemSelectorComponent implements OnInit {
  @Output() selectedMergeItemChanged = new EventEmitter<MergeItem>();
  @Input() mergeItems : Array<MergeItem & CommittingMergeItem>;
  @Input() isCommitting: boolean;

  changesList = new Array<MergeItem>();


  constructor() {}

  ngOnInit(): void {
  }

  selectedItem(mergeItem: MergeItem) {
    this.selectedMergeItemChanged.emit( mergeItem);
  }

  public get mergeType() {
    return MergeType;
  }

  getBranchSelectedIcon(selected: MergeUsed) {
    switch (selected) {
      case MergeUsed.Source:
        return 'fas fa-forward';
      case MergeUsed.Target:
        return 'fas fa-backward';
      case MergeUsed.Mixed:
        return 'fab fa-mixer';
      default:
        return '';
    }
  }

  getBranchSelectedTooltip(selected: MergeUsed) {
    switch (selected) {
      case MergeUsed.Source:
        return 'Take from Source';
      case MergeUsed.Target:
        return 'Take from Target';
      case MergeUsed.Mixed:
        return 'Mixed/combined content';
      default:
        return '';
    }
  }

  getMergeTypeTooltip(type: MergeType) {
    switch (type) {
      case MergeType.Creation:
        return 'Created';
      case MergeType.Deletion:
        return 'Deleted';
      case MergeType.Modification:
        return 'Modified';
      default:
        return '';
    }
  }
}

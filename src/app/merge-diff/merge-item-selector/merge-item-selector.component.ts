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
import { MergeItem, Merge } from '@maurodatamapper/mdm-resources';
import { MergeItemSource } from '../types/merge-item-type';

@Component({
  selector: 'mdm-merge-item-selector',
  templateUrl: './merge-item-selector.component.html',
  styleUrls: ['./merge-item-selector.component.scss']
})
export class MergeItemSelectorComponent implements OnInit {

  @Input() diffs : Merge;
  @Output() selectedMergeItemChanged = new EventEmitter<MergeItem>();

   changesList = new Array<MergeItem>();
   committingList = new Array<MergeItem>();

  constructor() {
   }

  ngOnInit(): void {

    this.diffs.diffs.forEach((diff : MergeItem) => {
      if(diff.isMergeConflict)
      {
        this.changesList.push(diff);
      }
      else{
        this.committingList.push(diff);
      }
    });
  }

  selectedItem(item: MergeItem)
  {
    this.selectedMergeItemChanged.emit(item);
  }

}

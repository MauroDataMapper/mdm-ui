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

import { Component, OnInit } from '@angular/core';
import { MergeItem, MergeItemSource } from '../types/merge-item-type';

@Component({
  selector: 'mdm-merge-item-selector',
  templateUrl: './merge-item-selector.component.html',
  styleUrls: ['./merge-item-selector.component.scss']
})
export class MergeItemSelectorComponent implements OnInit {

   changesList : Array<MergeItem>;
   committingList: Array<MergeItem>;

  constructor() {

    const testItem1 : MergeItem  = { path: 'Cancer | Description'};
    const testItem2 : MergeItem  = { path: 'Cancer | Lung | Description'};
    const testItem3 : MergeItem  = { path: 'Cancer | Lung | Author', selectSource: MergeItemSource.Source};

    this.changesList = [testItem1,testItem2];
    this.committingList = [testItem3];

   }

  ngOnInit(): void {

  }

}

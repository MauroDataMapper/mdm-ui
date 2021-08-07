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
import { Component, Input, OnInit } from '@angular/core';
import { Branchable, MergeDiffItem } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-number-conflict-editor',
  templateUrl: './number-conflict-editor.component.html',
  styleUrls: ['./number-conflict-editor.component.scss']
})
export class NumberConflictEditorComponent implements OnInit {
  @Input() source: Branchable;
  @Input() target: Branchable;
  @Input() item: MergeDiffItem;

  resolvedValue: number;

  constructor() { }

  ngOnInit(): void {
    this.resolvedValue = Number(this.item.sourceValue);
  }

  getFinalResolvedValue() {
    return this.resolvedValue;
  }

}

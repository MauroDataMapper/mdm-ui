/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

export interface SortByOption {
  value: string;
  displayName: string;
}

export type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'mdm-sort-by',
  templateUrl: './sort-by.component.html',
  styleUrls: ['./sort-by.component.scss'],
})
export class SortByComponent {
  @Input() value?: SortByOption;
  @Input() options?: SortByOption[];
  @Output() valueChange = new EventEmitter<SortByOption>();

  select(change: MatSelectChange) {
    this.valueChange.emit(change.value as SortByOption);
  }
}

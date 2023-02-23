/*
Copyright 2020-2023 University of Oxford and NHS England

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
import { Component } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'mdm-checkbox-cell-renderer',
  templateUrl: './checkbox-cell-renderer.component.html',
  styleUrls: ['./checkbox-cell-renderer.component.scss']
})
export class CheckboxCellRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
    if (typeof this.params.value === 'string') {
      this.params.value = this.params.value === 'true';
    }
  }

  refresh(): boolean {
    // Let agGrid handle refresh
    return false;
  }

  valueChanged(event: MatCheckboxChange) {
    const checked = event.checked;
    const colId = this.params.column.getColId();
    this.params.node.setDataValue(colId, checked);
  }
}
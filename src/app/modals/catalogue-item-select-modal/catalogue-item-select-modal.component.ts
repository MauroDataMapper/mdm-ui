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

import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mdm-catalogue-item-select-modal',
  templateUrl: './catalogue-item-select-modal.component.html',
  styleUrls: ['./catalogue-item-select-modal.component.scss']
})
export class CatalogueItemSelectModalComponent implements OnInit {
  @Input() root: any;

  @Output() itemSelected = new EventEmitter<void>();

  context: any;

  isOkDisabled = true;

  constructor( private dialogRef: MatDialogRef<CatalogueItemSelectModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
 { }

  ngOnInit(): void {

  }

  // When a node on the tree is selected, save it to this.context and enable the OK button
  onContextSelected = (selected) => {
    this.context = null;
    if (selected && selected.length > 0) {
      this.context = selected[0];
    }
    this.isOkDisabled = this.context === null;
  };
}

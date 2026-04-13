/*
Copyright 2020-2025 University of Oxford and NHS England

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

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MergableCatalogueItem, MergableMultiFacetAwareDomainType, Uuid } from '@maurodatamapper/mdm-resources';
import { MergeDiffContainerComponent } from '@mdm/merge-diff/merge-diff-container/merge-diff-container.component';

export interface MergeDiffModalData {
  sourceId: Uuid
  targetId?: Uuid
  catalogueDomainType: MergableMultiFacetAwareDomainType
  source?: MergableCatalogueItem
  target?: MergableCatalogueItem
}

@Component({
  selector: 'mdm-merge-diff-modal',
  templateUrl: './merge-diff-modal.component.html',
  styleUrls: ['./merge-diff-modal.component.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatIconButton,
    MatIcon,
    MergeDiffContainerComponent
  ]
})
export class MergeDiffModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<MergeDiffModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MergeDiffModalData
  ) {}

  ngOnInit(): void {
    // Any initialization logic can go here
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onMergeComplete(): void {
    this.dialogRef.close({ success: true });
  }
}




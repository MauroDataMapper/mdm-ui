/*
Copyright 2020-2026 University of Oxford and NHS England

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
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MergeDiffType, MergeConflictResolution, Branchable, MergableMultiFacetAwareDomainType } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { MergeDiffItemModel } from '@mdm/merge-diff/types/merge-item-type';
import { CheckinModelConfiguration, CheckinModelResult } from './check-in-modal-payload';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { PathNameComponent } from '../../shared/path-name/path-name.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { MatList, MatListItem } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';
import { NgIf, NgClass, UpperCasePipe } from '@angular/common';
import { ModelIconComponent } from '../../shared/model-icon/model-icon.component';

@Component({
    selector: 'mdm-check-in-modal',
    templateUrl: './check-in-modal.component.html',
    styleUrls: ['./check-in-modal.component.scss'],
    standalone: true,
    imports: [MatDialogContent, ModelIconComponent, NgIf, MatTooltip, MatList, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, MatListItem, NgClass, ExtendedModule, PathNameComponent, MatFormField, MatLabel, MatInput, FormsModule, MatCheckbox, MatHint, MatDialogActions, MatButton, UpperCasePipe]
})
export class CheckInModalComponent implements OnInit {
  commitComment: string;
  deleteSourceBranch: boolean;
  items: MergeDiffItemModel[];
  label: string;
  domainType: MergableMultiFacetAwareDomainType;
  isDataAsset: boolean;
  source: Branchable;
  target: Branchable;

  constructor(
    private dialogRef: MatDialogRef<CheckInModalComponent, CheckinModelResult>,
    @Inject(MAT_DIALOG_DATA) public data: CheckinModelConfiguration) { }

  ngOnInit(): void {
    this.commitComment = this.data.commitComment ?? '';
    this.deleteSourceBranch = this.data.deleteSourceBranch ?? false;
    this.items = this.data.items ?? [];
    this.label = this.data.label;
    this.domainType = this.data.domainType;
    this.isDataAsset = this.data.isDataAsset;
    this.source = this.data.source;
    this.target = this.data.target;
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }

  commit() {
    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      deleteSourceBranch: this.deleteSourceBranch,
      commitComment: this.commitComment
    });
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

  public get mergeType() {
    return MergeDiffType;
  }
}

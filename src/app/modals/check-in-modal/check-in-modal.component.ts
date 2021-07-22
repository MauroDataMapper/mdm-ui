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
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MergeDiffType, MergeConflictResolution } from '@maurodatamapper/mdm-resources';
import { FullMergeItem } from '@mdm/merge-diff/types/merge-item-type';
import { SharedService } from '@mdm/services';
import { CheckinModelPayload } from './check-in-modal-payload';

@Component({
  selector: 'mdm-check-in-modal',
  templateUrl: './check-in-modal.component.html',
  styleUrls: ['./check-in-modal.component.scss']
})
export class CheckInModalComponent implements OnInit {

  commitComment: string;
  deleteSourceBranch: boolean;
  isV2: boolean;
  mergeItems: Array<FullMergeItem>;


  constructor(
    private dialogRef: MatDialogRef<CheckInModalComponent, CheckinModelPayload>,
    @Inject(MAT_DIALOG_DATA) public data: CheckinModelPayload,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.commitComment = this.data.commitComment ?? '';
    this.deleteSourceBranch = this.data.deleteSourceBranch ?? false;
    this.mergeItems = this.data.mergeItems ?? Array<FullMergeItem>();
    this.isV2 = this.sharedService.features.useMergeUiV2;
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

  public get mergeType()
  {
    return MergeDiffType;
  }

}

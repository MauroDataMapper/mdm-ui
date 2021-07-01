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
import { Branchable, MergeItem, MergeUsed } from '@maurodatamapper/mdm-resources';
import { FullMergeItem } from '../types/merge-item-type';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { filter } from 'rxjs/operators';
import { CompareEditorStringModalComponent } from '../compare-editors/compare-editor-string-modal/compare-editor-string-modal.component';
import { CompareEditorModalData, CompareEditorModalResult } from '../compare-editors/compare-editors.model';

@Component({
  selector: 'mdm-merge-comparison',
  templateUrl: './merge-comparison.component.html',
  styleUrls: ['./merge-comparison.component.scss']
})
export class MergeComparisonComponent implements OnInit {

  @Input() source: Branchable;
  @Input() target: Branchable;
  @Input() mergeItem : FullMergeItem;
  @Input() isCommitting: boolean;

  @Output() cancelCommitEvent = new EventEmitter<MergeItem>();
  @Output() acceptCommitEvent = new EventEmitter<FullMergeItem>();

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  cancelCommit()
  {
    this.cancelCommitEvent.emit(this.mergeItem);
  }

  acceptCommit(branchUsed: MergeUsed)
  {
     this.mergeItem.branchSelected = branchUsed;
     this.acceptCommitEvent.emit(this.mergeItem);
  }

  openEditor() {
    // TODO: add in possible other editors, not just strings
    this.dialog
      .open<CompareEditorStringModalComponent, CompareEditorModalData, CompareEditorModalResult>(
        CompareEditorStringModalComponent,
        {
          disableClose: true,
          minWidth: '50%',
          maxHeight: '90%',
          maxWidth: '98%',
          data: {
            source: this.source,
            target: this.target,
            item: this.mergeItem
          }
        }
      )
      .afterClosed()
      .pipe(
        filter(result => result.status === ModalDialogStatus.Ok)
      )
      .subscribe(result => {
        // TODO: handle merge conflict result
      });
  }

  public get MergeUsed()
  {
    return MergeUsed;
  }

}

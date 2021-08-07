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
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { MergeItemValueType } from '@mdm/merge-diff/types/merge-item-type';
import { HelpDialogueHandlerService } from '@mdm/services';
import { NumberConflictEditorComponent } from '../number-conflict-editor/number-conflict-editor.component';
import { StringConflictEditorComponent } from '../string-conflict-editor/string-conflict-editor.component';
import { ConflictEditorModalData, ConflictEditorModalResult } from './conflict-editor-modal.model';

@Component({
  selector: 'mdm-conflict-editor-modal',
  templateUrl: './conflict-editor-modal.component.html',
  styleUrls: ['./conflict-editor-modal.component.scss']
})
export class ConflictEditorModalComponent implements OnInit {
  @ViewChild(StringConflictEditorComponent) stringEditor: StringConflictEditorComponent;
  @ViewChild(NumberConflictEditorComponent) numberEditor: NumberConflictEditorComponent;

  state: 'working' | 'confirmCancel' | 'conflictsPending' = 'working';
  valueType: MergeItemValueType = 'string';
  conflictCount = 0;

  constructor(
    private dialogRef: MatDialogRef<ConflictEditorModalComponent, ConflictEditorModalResult>,
    @Inject(MAT_DIALOG_DATA) public data: ConflictEditorModalData,
    private help: HelpDialogueHandlerService) { }

  ngOnInit(): void {
    this.valueType = this.data.valueType;
  }

  loadHelp() {
    this.help.open('Merge_conflicts');
  }

  confirmCancel() {
    this.state = 'confirmCancel';
  }

  abort() {
    this.state = 'working';
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }

  startResolveConflict() {
    if (this.valueType === 'number') {
      this.resolveConflict();
      return;
    }

    this.conflictCount = this.stringEditor.getCurrentConflictCount();
    if (this.conflictCount === 0) {
      this.resolveConflict();
      return;
    }

    this.state = 'conflictsPending';
  }

  resolveConflict() {
    const resolvedValue: any = this.valueType === 'number'
      ? this.numberEditor.getFinalResolvedValue()
      : this.stringEditor.getFinalResolvedContent();

    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      resolvedContent: resolvedValue
    });
  }
}

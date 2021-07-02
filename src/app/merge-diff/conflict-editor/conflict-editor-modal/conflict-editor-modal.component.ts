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
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MergeItem } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { diff_match_patch } from 'diff-match-patch';
import { ConflictEditorModalData, ConflictEditorModalResult } from './conflict-editor-modal.model';

@Component({
  selector: 'mdm-conflict-editor-modal',
  templateUrl: './conflict-editor-modal.component.html',
  styleUrls: ['./conflict-editor-modal.component.scss']
})
export class ConflictEditorModalComponent implements OnInit {
  item: MergeItem;
  sourceText: string;
  targetText: string;
  dmp = new diff_match_patch();

  constructor(
    private dialogRef: MatDialogRef<ConflictEditorModalComponent, ConflictEditorModalResult>,
    @Inject(MAT_DIALOG_DATA) public data: ConflictEditorModalData) { }

  ngOnInit(): void {
    this.item = this.data.item;
    this.sourceText = this.getDiffPrettyHtml(this.item.targetValue, this.item.sourceValue);
    this.targetText = this.getDiffPrettyHtml(this.item.sourceValue, this.item.targetValue);
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }

  private getDiffPrettyHtml(text1: string, text2: string) {
    const diffs = this.dmp.diff_main(text1, text2);
    this.dmp.diff_cleanupSemantic(diffs);
    // Prettify and remove pilcrow (¶ paragraph marks) from the output
    return this.dmp.diff_prettyHtml(diffs).replace(/&para;/g, '');
  }
}

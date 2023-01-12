/*
Copyright 2020-2023 University of Oxford
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
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

export interface FullContentEditDialogData {
  value?: string;
  title?: string;
  subTitle?: string;
}

export interface FullContentEditDialogResponse {
  status: ModalDialogStatus;
  value?: string;
}

@Component({
  selector: 'mdm-full-content-edit-dialog',
  templateUrl: './full-content-edit-dialog.component.html',
  styleUrls: ['./full-content-edit-dialog.component.scss']
})
export class FullContentEditDialogComponent implements OnInit {
  value: string;

  constructor(
    private dialogRef: MatDialogRef<
      FullContentEditDialogComponent,
      FullContentEditDialogResponse
    >,
    @Inject(MAT_DIALOG_DATA) public data: FullContentEditDialogData
  ) {}

  ngOnInit(): void {
    this.value = this.data.value;
  }

  save() {
    this.dialogRef.close({ status: ModalDialogStatus.Ok, value: this.value });
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }
}

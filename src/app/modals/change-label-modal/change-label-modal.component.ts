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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CatalogueItemDetail } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

export interface ChangeLabelModalData {
  item: CatalogueItemDetail;
}

export interface ChangeLabelModalResult {
  status: ModalDialogStatus;
  label?: string;
}

@Component({
  selector: 'mdm-change-label-modal',
  templateUrl: './change-label-modal.component.html',
  styleUrls: ['./change-label-modal.component.scss']
})
export class ChangeLabelModalComponent implements OnInit {
  item: CatalogueItemDetail;
  formGroup = new FormGroup({
    label: new FormControl('', [
      Validators.required // eslint-disable-line @typescript-eslint/unbound-method
    ])
  });

  constructor(
    private dialogRef: MatDialogRef<
      ChangeLabelModalComponent,
      ChangeLabelModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: ChangeLabelModalData
  ) {}

  get label() {
    return this.formGroup.controls.label;
  }

  ngOnInit(): void {
    this.item = this.data.item;

    this.label.setValue(this.item.label);
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }

  change() {
    if (this.formGroup.invalid) {
      return;
    }

    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      label: this.label.value
    });
  }
}

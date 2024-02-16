/*
Copyright 2020-2024 University of Oxford and NHS England

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
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Branchable, Modelable } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

export const defaultBranchName = 'main';

const defaultBranchNameValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    return defaultBranchName.localeCompare(control.value as string, undefined, {
      sensitivity: 'accent'
    }) === 0
      ? { invalidBranchName: { value: control.value } }
      : null;
  };
};

export interface ChangeBranchNameModalData {
  model: Modelable & Branchable;
}

export interface ChangeBranchNameModalResult {
  status: ModalDialogStatus;
  branchName?: string;
}

@Component({
  selector: 'mdm-change-branch-name-modal',
  templateUrl: './change-branch-name-modal.component.html',
  styleUrls: ['./change-branch-name-modal.component.scss']
})
export class ChangeBranchNameModalComponent implements OnInit {
  model: Modelable & Branchable;
  newBranchName: string;
  formGroup = new FormGroup({
    branchName: new FormControl('', [
      Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
      defaultBranchNameValidator()
    ])
  });

  constructor(
    private dialogRef: MatDialogRef<
      ChangeBranchNameModalComponent,
      ChangeBranchNameModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: ChangeBranchNameModalData
  ) {}

  get branchName() {
    return this.formGroup.controls.branchName;
  }

  ngOnInit(): void {
    this.model = this.data.model;
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
      branchName: this.branchName.value
    });
  }
}

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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

export interface AddRuleModalConfig {
  name: string;
  description?: string;
  title?: string;
  message?: string;
  okBtnTitle?: string;
  cancelBtnTitle?: string;
  cancelShown?: boolean;
  btnType?: string;
}

export interface AddRuleModalResult {
  status: ModalDialogStatus;
  name?: string;
  description?: string;
}

@Component({
  selector: 'mdm-add-rule-modal',
  templateUrl: './add-rule-modal.component.html',
  styleUrls: ['./add-rule-modal.component.scss']
})
export class AddRuleModalComponent implements OnInit {
  okBtn: string;
  cancelBtn: string;
  btnType: string;
  modalTitle: string;
  message: string;

  formGroup = new FormGroup({
    name: new FormControl('', Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
    description: new FormControl('')
  });

  get name() {
    return this.formGroup.controls.name;
  }

  get description() {
    return this.formGroup.controls.description;
  }

  constructor(
    private dialogRef: MatDialogRef<AddRuleModalComponent, AddRuleModalResult>,
    @Inject(MAT_DIALOG_DATA) public data: AddRuleModalConfig
  ) {}

  ngOnInit(): void {
    this.okBtn = this.data.okBtnTitle ? this.data.okBtnTitle : 'Save';
    this.btnType = this.data.btnType ? this.data.btnType : 'primary';
    this.cancelBtn = this.data.cancelBtnTitle
      ? this.data.cancelBtnTitle
      : 'Cancel';
    this.modalTitle = this.data.title ? this.data.title : '';
    this.message = this.data.message;

    this.name.setValue(this.data.name);
    this.description.setValue(this.data.description);
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }

  confirm() {
    if (!this.formGroup.valid) {
      return;
    }

    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      name: this.name.value,
      description: this.description.value
    });
  }
}

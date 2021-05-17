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
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

export interface ConfirmationModalConfig {
  title?: string;
  message: string;
  okBtnTitle?: string;
  cancelBtnTitle?: string;
  cancelShown?: boolean;
  btnType?: string;
}

export interface ConfirmationModalResult {
  status: ModalDialogStatus;
}

@Component({
  selector: 'mdm-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.sass']
})
export class ConfirmationModalComponent implements OnInit {
  title: string;
  message: string;
  okTitle: string;
  cancelTitle: string;
  cancelShown: boolean;
  btnType: string;

  constructor(
    private dialogRef: MatDialogRef<ConfirmationModalComponent, ConfirmationModalResult>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationModalConfig
  ) { }

  ngOnInit() {
    this.okTitle = this.data.okBtnTitle ? this.data.okBtnTitle : 'OK';
    this.btnType = this.data.btnType ? this.data.btnType : 'primary';
    this.cancelTitle = this.data.cancelBtnTitle ? this.data.cancelBtnTitle : 'Cancel';
    this.title = this.data.title;
    this.message = this.data.message;
    this.cancelShown = this.data.cancelShown != null ? this.data.cancelShown : true;
  }

  ok = () => this.dialogRef.close({ status: ModalDialogStatus.Ok });

  cancel = () => this.dialogRef.close({ status: ModalDialogStatus.Cancel });
}

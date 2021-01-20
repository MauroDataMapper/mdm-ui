/*
Copyright 2020 University of Oxford

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

export interface ConfirmationModalConfig {
  title?: string;
  message: string;
  okBtnTitle?: string;
  cancelBtnTitle?: string;
  cancelShown?: boolean;
  btnType?: string;
}

export enum ConfirmationModalStatus {
  Ok = 'ok',
  Cancel = 'cancel',
  Close = 'close'
}

export interface ConfirmationModalResult {
  status: 'ok' | 'cancel' | 'close'
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

  ok = () => this.dialogRef.close({ status: ConfirmationModalStatus.Ok });

  cancel = () => this.dialogRef.close({ status: ConfirmationModalStatus.Cancel });

  close = () => this.dialogRef.close({ status: ConfirmationModalStatus.Close });
}

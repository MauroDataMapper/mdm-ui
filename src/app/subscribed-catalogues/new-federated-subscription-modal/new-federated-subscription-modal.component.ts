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
import { FolderDetail } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

export interface NewFederatedSubscriptionModalConfig {
  okBtn?: string;
  cancelBtn?: string;
  btnType?: string;
  modalTitle?: string;
  message?: string;
  inputLabel?: string;
}

export interface NewFederatedSubscriptionModalResponse {
  status: ModalDialogStatus;
  folder?: FolderDetail;
}

@Component({
  selector: 'mdm-new-federated-subscription-modal',
  templateUrl: './new-federated-subscription-modal.component.html',
  styleUrls: ['./new-federated-subscription-modal.component.scss']
})
export class NewFederatedSubscriptionModalComponent implements OnInit {

  okBtn: string;
  cancelBtn: string;
  btnType: string;
  modalTitle: string;
  message: string;
  inputLabel: string;
  selectedFolders: FolderDetail[];

  get folder(): FolderDetail {
    if (this.selectedFolders && this.selectedFolders[0]) {
      return this.selectedFolders[0];
    }

    return undefined;
  }

  constructor(
    private dialogRef: MatDialogRef<NewFederatedSubscriptionModalComponent, NewFederatedSubscriptionModalResponse>,
    @Inject(MAT_DIALOG_DATA) public data: NewFederatedSubscriptionModalConfig) { }

  ngOnInit(): void {
    this.okBtn = this.data.okBtn ? this.data.okBtn : 'Subscribe';
    this.btnType = this.data.btnType ? this.data.btnType : 'primary';
    this.cancelBtn = this.data.cancelBtn ? this.data.cancelBtn : 'Cancel';
    this.inputLabel = this.data.inputLabel ? this.data.inputLabel : '';
    this.modalTitle = this.data.modalTitle ? this.data.modalTitle : '';
    this.message = this.data.message;
  }

  confirm() {
    if (this.folder) {
      this.dialogRef.close({ status: ModalDialogStatus.Ok, folder: this.folder });
    }
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }
}

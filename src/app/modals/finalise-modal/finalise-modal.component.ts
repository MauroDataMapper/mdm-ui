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

import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FinalisePayload } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

export interface FinaliseModalResponse {
  status: ModalDialogStatus;
  request?: FinalisePayload;
}

@Component({
  selector: 'mdm-finalise-modal',
  templateUrl: './finalise-modal.component.html',
  styleUrls: ['./finalise-modal.component.scss']
})
export class FinaliseModalComponent implements OnInit {
  title: string;
  message: string;
  username: string;
  password: string;
  okTitle: string;
  cancelTitle: string;
  cancelShown: boolean;
  btnType: string;
  defaultVersion = 'Major';
  showCustomVersion = false;
  version = '';
  versionMajor = '';
  versionMinor = '';
  versionPatch = '';
  currentVersion = '0.0.0';
  modelVersion = '0.0.0';
  versionTag: string;

  constructor(
    public dialogRef: MatDialogRef<FinaliseModalComponent, FinaliseModalResponse>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private changeRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.okTitle = this.data.okBtnTitle ? this.data.okBtnTitle : 'OK';
    this.btnType = this.data.btnType ? this.data.btnType : 'primary';
    this.cancelTitle = this.data.cancelBtnTitle ? this.data.cancelBtnTitle : 'Cancel';
    this.modelVersion = this.data.modelVersion ? this.data.modelVersion : '0.0.0';
    this.title = this.data.title;
    this.message = this.data.message;
    this.password = '';
    this.cancelShown = this.data.cancelShown != null ? this.data.cancelShown : true;
    this.changeRef.detectChanges();

    this.currentVersion = this.data.modelVersion;
    const nameSplit = this.modelVersion.split('.');
    if (nameSplit.length === 3) {
      this.data.versionList = this.defaultVersion;
      this.versionMajor = `The 'Major' option will finalise the model with version <strong>${parseInt(nameSplit[0], 10) + 1}</strong>.0.0`;
      this.versionMinor = `The 'Minor' option will finalise the model with version ${parseInt(nameSplit[0], 10)}.<strong>${parseInt(nameSplit[1], 10) + 1}</strong>.0`;
      this.versionPatch = `The 'Patch' option will finalise the model with version ${parseInt(nameSplit[0], 10)}.${parseInt(nameSplit[1], 10)}.<strong>${parseInt(nameSplit[2], 10) + 1}</strong>`;
    } else {
      this.data.versionList = 'Custom';
      this.showCustomVersion = true;
      this.versionMajor = 'Example: 1.0.0  <i class="fas fa-long-arrow-alt-right"></i> <strong>  2</strong>.0.0';
      this.versionMinor = 'Example: 1.0.0  <i class="fas fa-long-arrow-alt-right"></i>  1.<strong>1</strong>.0';
      this.versionPatch = 'Example: 1.0.0  <i class="fas fa-long-arrow-alt-right"></i>  1.0.<strong>1</strong>';
    }
  }

  onVersionChange() {
    if (this.data.versionList === 'Custom') {
      this.showCustomVersion = !this.showCustomVersion;
    } else {
      this.showCustomVersion = false;
    }
  }

  ok() {
    const useCustomVersion = this.data.versionList === 'Custom';
    const request: FinalisePayload = {
      version: useCustomVersion ? this.version : undefined,
      versionChangeType: !useCustomVersion ? this.data.versionList : undefined,
      versionTag: this.versionTag
    };

    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      request
    });
  }
  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }
  close() {
    this.dialogRef.close({ status: ModalDialogStatus.Close });
  }
}

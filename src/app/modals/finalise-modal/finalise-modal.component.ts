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

import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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

  constructor(private dialogRef: MatDialogRef<FinaliseModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private changeRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.okTitle = this.data.okBtnTitle ? this.data.okBtnTitle : 'OK';
    this.btnType = this.data.btnType ? this.data.btnType : 'primary';
    this.cancelTitle = this.data.cancelBtnTitle ? this.data.cancelBtnTitle : 'Cancel';
    this.title = this.data.title;
    this.message = this.data.message;
    this.password = '';
    this.cancelShown = this.data.cancelShown != null ? this.data.cancelShown : true;
    this.changeRef.detectChanges();

    this.currentVersion = this.data.modelVersion;
    const nameSplit = this.currentVersion.split('.');
    if (nameSplit.length === 3) {
      this.data.versionList = this.defaultVersion;
      this.versionMajor = `The 'Major' option will finalise the model with version <strong>${parseInt(nameSplit[0]) + 1}</strong>.${nameSplit[1]}.0`;
      this.versionMinor = `The 'Minor' option will finalise the model with version ${parseInt(nameSplit[0])}.<strong>${parseInt(nameSplit[1]) + 1}</strong>.0`;
      this.versionPatch = `The 'Patch' option will finalise the model with version ${parseInt(nameSplit[0])}.${parseInt(nameSplit[1])}.<strong>${parseInt(nameSplit[2]) + 1}</strong>`;
    } else {
      this.data.versionList = 'Custom';
      this.showCustomVersion = true;
      this.versionMajor = `Example: 1.0.0  <i class="fas fa-long-arrow-alt-right"></i> <strong>  2</strong>.0.0`;
      this.versionMinor = `Example: 1.0.0  <i class="fas fa-long-arrow-alt-right"></i>  1.<strong>1</strong>.0`;
      this.versionPatch = `Example: 1.0.0  <i class="fas fa-long-arrow-alt-right"></i>  1.0.<strong>1</strong>`;
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
    if (this.data.versionList === 'Custom') {
      this.data.versionNumber = this.version;
    }
    this.dialogRef.close({ status: 'ok', data: this.data });
  }
  cancel() {
    this.dialogRef.close({ status: 'cancel' });
  }
  close() {
    this.dialogRef.close({ status: 'close' });
  }
}

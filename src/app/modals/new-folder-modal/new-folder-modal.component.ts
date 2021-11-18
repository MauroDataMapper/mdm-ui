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
import { EditingService } from '@mdm/services/editing.service';
import { SharedService } from '@mdm/services';
import { NewFolderModalConfiguration, NewFolderModalResponse } from './new-folder-modal.model';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';


@Component({
  selector: 'mdm-new-folder-modal',
  templateUrl: './new-folder-modal.component.html',
  styleUrls: ['./new-folder-modal.component.scss']
})
export class NewFolderModalComponent implements OnInit {

  okBtn: string;
  cancelBtn: string;
  btnType: ThemePalette;
  modalTitle: string;
  message: string;
  inputLabel: string;
  createRootFolder = false;
  useVersionedFolders = false;

  folderForm = new FormGroup({
    label: new FormControl('', Validators.required),  // eslint-disable-line @typescript-eslint/unbound-method
    isVersioned: new FormControl(false)
  });

  constructor(
    private dialogRef: MatDialogRef<NewFolderModalComponent, NewFolderModalResponse>,
    @Inject(MAT_DIALOG_DATA) public data: NewFolderModalConfiguration,
    private editing: EditingService,
    private shared: SharedService) { }

  get label() {
    return this.folderForm.get('label');
  }

  get isVersioned() {
    return this.folderForm.get('isVersioned');
  }

  ngOnInit(): void {
    this.okBtn = this.data.okBtn ? this.data.okBtn : 'Save';
    this.btnType = this.data.btnType ? this.data.btnType : 'primary';
    this.cancelBtn = this.data.cancelBtn ? this.data.cancelBtn : 'Cancel';
    this.inputLabel = this.data.inputLabel ? this.data.inputLabel : '';
    this.modalTitle = this.data.modalTitle ? this.data.modalTitle : '';
    this.message = this.data.message;
    this.createRootFolder = this.data.createRootFolder;
    this.useVersionedFolders = this.data.canVersion && this.shared.features.useVersionedFolders;
  }

  cancel() {
    this.editing
      .confirmCancelAsync()
      .subscribe(confirm => {
        if (confirm) {
          this.dialogRef.close({ status: ModalDialogStatus.Cancel });
        }
      });
  }

  confirm() {
    if (!this.folderForm.valid) {
      return;
    }

    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      label: this.label.value,
      useVersionedFolders: this.useVersionedFolders,
      isVersioned: this.isVersioned.value
    });
  }
}

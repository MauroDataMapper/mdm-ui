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
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { EditingService } from '@mdm/services/editing.service';

export interface ApiKeysModalConfiguration {
  showName?: boolean;
  showExpiryDay?: boolean;
  showRefreshable?: boolean;
}

export interface ApiKeysModalResponseData {
  name: string;
  expiresInDays: number;
  refreshable: boolean;
}

export interface ApiKeysModalResponse {
  status: ModalDialogStatus;
  data?: ApiKeysModalResponseData;
}

@Component({
  selector: 'mdm-api-keys-modal',
  templateUrl: './api-keys-modal.component.html',
  styleUrls: ['./api-keys-modal.component.scss']
})
export class ApiKeysModalComponent implements OnInit {
  name: string;
  refreshable = false;
  expiresInDays = 365;
  output: ApiKeysModalResponseData;

  showName: boolean;
  showExpiryDay: boolean;
  showRefreshable: boolean;

  constructor(
    private dialogRef: MatDialogRef<ApiKeysModalComponent, ApiKeysModalResponse>,
    @Inject(MAT_DIALOG_DATA) public data: ApiKeysModalConfiguration,
    private editingService: EditingService) { }

  ngOnInit(): void {
    this.showName = this.data.showName ? this.data.showName : false;
    this.showExpiryDay = this.data.showExpiryDay ? this.data.showExpiryDay : false;
    this.showRefreshable = this.data.showRefreshable ? this.data.showRefreshable : false;
  }

  ok() {
    this.output = {
      name: this.name,
      expiresInDays: this.expiresInDays,
      refreshable: this.refreshable
    };

    this.dialogRef.close({ status: ModalDialogStatus.Ok, data: this.output });
  }

  cancel() {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (confirm) {
        this.dialogRef.close({ status: ModalDialogStatus.Cancel });
      }
    });
  }

  enableOk() {
    return this.name && this.name.trim().length !== 0 && this.expiresInDays && this.expiresInDays >= 0;
  }
}

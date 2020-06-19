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

import { Component, OnInit, Input, Inject, AfterViewInit, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResourcesService } from '@mdm/services/resources.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { from } from 'rxjs';

@Component({
  selector: 'mdm-bulk-edit',
  templateUrl: './bulk-edit-modal.component.html',
  styleUrls: ['./bulk-edit-modal.component.scss'],
})
export class BulkEditModalComponent implements OnInit, AfterViewInit {
  @Input() afterSave: any;

  parentDataModel: any;
  parentDataClass: any;

  records: any[] = [];
  isLoadingResults: boolean;
  isValid = false;
  totalItemCount = 0;
  errorCountDataElement = 0;
  errorCountDataClass = 0;

  constructor(
    public dialogRef: MatDialogRef<BulkEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.parentDataModel = this.data.parentDataModel;
    this.parentDataClass = this.data.parentDataClass;

    this.getDataElements();
  }

  getDataElements() {
    this.data.dataElementIdLst.forEach((item: any) => {
      if (item.domainType === 'DataElement') {
        this.resources.dataElement.get(this.parentDataModel.id, this.parentDataClass.id, item.id, null, null).subscribe((result: { body: any }) => {
          if (result !== undefined) {
            this.records.push(result.body);
          }
        }, err => {
          this.messageHandler.showError('There was a problem getting the Data Elements.', err);
        });
      } else if (item.domainType === 'DataClass') {
        this.resources.dataClass.get(this.parentDataModel.id, this.parentDataClass.id, item.id, null, null).subscribe((result: { body: any }) => {
          if (result !== undefined) {
            this.records.push(result.body);
          }
        }, err => {
          this.messageHandler.showError('There was a problem getting the Data Classes.', err);
        });
      }
    });
  }

  cancel = () => {
    this.dialogRef.close();
  };

  saveChanges = () => {
    for (const item of this.records) {
      const resource = {
        id: item.id,
        label: item.label,
        description: item.description
      };
      if (item.domainType === 'DataElement') {
        from(this.resources.dataElement.put(this.parentDataModel.id, this.parentDataClass.id, resource.id, null, { resource })).subscribe((result) => {
          if (this.afterSave) {
            this.afterSave(result);
          }
        }, error => {
          this.errorCountDataElement++;
          this.messageHandler.showError(`There was a problem updating the Data Element ${item.label}`, error);
        });
      }
      if (item.domainType === 'DataClass') {
        from(this.resources.dataClass.put(this.parentDataModel.id, this.parentDataClass.id, resource.id, null, { resource })).subscribe((result) => {
          if (this.afterSave) {
            this.afterSave(result);
          }
        }, error => {
          this.errorCountDataClass++;
          this.messageHandler.showError(`There was a problem updating the Data Class ${item.label}`, error);
        });
      }
    }

    if (!this.errorCountDataElement || !this.errorCountDataClass) {
      this.messageHandler.showSuccess('All records have been updated successfully!');
      this.dialogRef.close({ status: 'ok', callback: this.records});
    }
  };
}

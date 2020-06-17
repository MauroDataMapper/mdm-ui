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
  selector: 'mdm-data-element-bulk-edit-dialog',
  templateUrl: './data-element-bulk-edit-dialog.component.html',
  styleUrls: ['./data-element-bulk-edit-dialog.component.scss']
})
export class DataElementBulkEditDialogComponent implements AfterViewInit {
  @Input() afterSave: any;

  parentDataModel: any;
  parentDataClass: any;

  records: any[] = [];
  isLoadingResults: boolean;
  isValid = false;
  totalItemCount = 0;
  errorsCount = 0;

  constructor(
    public dialogRef: MatDialogRef<DataElementBulkEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService) {

  }

  ngOnInit(): void {}

  ngAfterViewInit() {

    this.parentDataModel = this.data.parentDataModel;
    this.parentDataClass = this.data.parentDataClass;

    this.getDataElements();
  }

  getDataElements() {

    this.data.dataElementIdLst.forEach((item: any) => {

      this.resources.dataElement.get(this.parentDataModel.id, this.parentDataClass.id, item, null, null).subscribe((result: { body: any }) => {

        if (result != undefined) {
          this.records.push(result.body);
        }
      },
        err => {
          this.messageHandler.showError('There was a problem getting the data elements.', err);
        });
    });
  }

  cancel = () => {
    this.dialogRef.close();
  }

  saveChanges = () => {

    for (var i = 0; i < this.records.length; i++) {

      const resource = {
        id: this.records[i].id,
        label: this.records[i].label,
        description: this.records[i].description,
      };
      const call = from(
        this.resources.dataElement.put(
          this.parentDataModel.id,
          this.parentDataClass.id,
          resource.id,
          null,
          { resource }
        )
      ).subscribe(
        result => {

          if (this.afterSave) {
            this.afterSave(result);
          }
        },
        error => {
          this.errorsCount++;
          this.messageHandler.showError(
            'There was a problem updating the Data Element.',
            error
          );
        }
      );
    }

    if (this.errorsCount === 0) {
      this.messageHandler.showSuccess('Data Element updated successfully.');
    }
  }
}

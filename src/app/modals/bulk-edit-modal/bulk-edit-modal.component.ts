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
import { MdmResourcesService } from '@mdm/modules/resources';
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
  successCount = 0;
  failCount = 0;

  processing = false;
  isProcessComplete = false;
  finalResult = {};

  constructor(
    public dialogRef: MatDialogRef<BulkEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.parentDataModel = this.data.parentDataModel;
    this.parentDataClass = this.data.parentDataClass;

    this.getDataElements();

    this.failCount = 0;
    this.successCount = 0;
  }

  getDataElements() {
    this.data.dataElementIdLst.forEach((item: any) => {
      if (item.domainType === 'DataElement') {
        this.resources.dataElement.get(this.parentDataModel.id, this.parentDataClass.id, item.id)
        // this.resources.dataElement.get(this.parentDataModel.id, this.parentDataClass.id, item.id, null, null)
          .subscribe((result: { body: any }) => {
          if (result !== undefined) {
            this.records.push(result.body);
          }
        }, err => {
          this.messageHandler.showError('There was a problem getting the Data Elements.', err);
        });
      } else if (item.domainType === 'DataClass') {
        this.resources.dataClass.getChildDataClass(this.parentDataModel.id, this.parentDataClass.id, item.id)
        // this.resources.dataClass.get(this.parentDataModel.id, this.parentDataClass.id, item.id, null, null)
          .subscribe((result: { body: any }) => {
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


  closeAndRefresh = () => {
    this.dialogRef.close({ status: 'ok' });
  };

  saveChanges = () => {

    this.processing = true;
    this.isProcessComplete = false;

    let promise = Promise.resolve();

    this.records.forEach((item: any) => {promise = promise.then(() => {

        this.successCount++;
        this.finalResult[item.id] = {
          result: `Success`,
          hasError: false
        };

        const resource = {
          id: item.id,
          label: item.label,
          description: item.description
        };
        if (item.domainType === 'DataElement') {
          return this.resources.dataElement.update(this.parentDataModel.id, this.parentDataClass.id, resource.id, resource).toPromise();
          // return this.resources.dataElement.put(this.parentDataModel.id, this.parentDataClass.id, resource.id, null, { resource }).toPromise();
        }
        if (item.domainType === 'DataClass') {
          return this.resources.dataClass.updateChildDataClass(this.parentDataModel.id, this.parentDataClass.id, resource.id, resource).toPromise();
          // return this.resources.dataClass.put(this.parentDataModel.id, this.parentDataClass.id, resource.id, null, { resource }).toPromise();
        }
      }).catch(() => {

        this.failCount++;
        this.finalResult[item.id] = {
          result: `Failed`,
          hasError: true
        };
      });
    });

    promise.then(() => {
      this.processing = false;
      this.isProcessComplete = true;
      //this.dialogRef.close({ status: 'ok' });
      //this.messageHandler.showSuccess('All records have been updated successfully!');
    }).catch(error => {
      //this.dialogRef.close();
     // this.messageHandler.showError('There was a problem updating these records', error);
     this.processing = false;
     this.isProcessComplete = true;
    });

  };
}

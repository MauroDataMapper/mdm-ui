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

import { Component, OnInit, ChangeDetectorRef, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';

@Component({
  selector: 'mdm-bulk-delete',
  templateUrl: './bulk-delete-modal.component.html',
  styleUrls: ['./bulk-delete-modal.component.scss'],
})
export class BulkDeleteModalComponent implements OnInit, AfterViewInit {
  parentDataModel: any;
  parentDataClass: any;
  records: any[] = [];
  successCount = 0;
  failCount = 0;
  processing = false;
  isProcessComplete = false;
  finalResult = {};


  constructor(
    public dialogRef: MatDialogRef<BulkDeleteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private broadcastSvc: BroadcastService,
    private changeRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.parentDataModel = this.data.parentDataModel;
    this.parentDataClass = this.data.parentDataClass;
    this.getData();
  }

  getData = () => {
    this.data.dataElementIdLst.forEach((item: any) => {
      if (item.domainType === 'DataElement') {
        this.resources.dataElement.get(this.parentDataModel.id, this.parentDataClass.id, item.id).subscribe((result: { body: any }) => {
          if (result !== undefined) {
            this.records.push(result.body);
          }
        }, err => {
          this.messageHandler.showError('There was a problem getting the Data Elements.', err);
        });
      } else if (item.domainType === 'DataClass') {
        this.resources.dataClass.getChildDataClass(this.parentDataModel.id, this.parentDataClass.id, item.id).subscribe((result: { body: any }) => {
          if (result !== undefined) {
            this.records.push(result.body);
          }
        }, err => {
          this.messageHandler.showError('There was a problem getting the Data Classes.', err);
        });
      } else if (item.domainType === 'DataType') {
        this.records.push({
          domainType: item.domainType,
          label: item.label,
          id: item.id,
          dataModel: item.dataModel
        });
      }
    });
    this.changeRef.detectChanges();
  }

  closeAndRefresh = () => {
    this.broadcastSvc.broadcast('$reloadFoldersTree');
    this.dialogRef.close({ status: 'ok' });
  };

  saveChanges = () => {
    this.processing = true;
    this.isProcessComplete = false;

    let promise = Promise.resolve();
    this.records.forEach((item: any) => {
      promise = promise.then(() => {
        this.successCount++;
        this.finalResult[item.id] = {
          result: `Success`,
          hasError: false
        };
        if (item.domainType === 'DataClass') {
          return this.resources.dataClass.removeChildDataClass(item.model, item.parentDataClass, item.id).toPromise();
        }
        if (item.domainType === 'DataElement') {
          return this.resources.dataElement.remove(item.model, item.dataClass, item.id).toPromise();
        }
        if (item.domainType === 'DataType') {
          return this.resources.dataType.remove(item.dataModel, item.id).toPromise();
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
    }).catch(() => {
      this.processing = false;
      this.isProcessComplete = true;
    });
  };
}

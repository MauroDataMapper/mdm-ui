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

import { Component, Input, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CatalogueItemDomainType, DataClass, DataElement } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { EditingService } from '@mdm/services/editing.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';

@Component({
  selector: 'mdm-bulk-edit',
  templateUrl: './bulk-edit-modal.component.html',
  styleUrls: ['./bulk-edit-modal.component.scss'],
})
export class BulkEditModalComponent implements AfterViewInit {
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
    private messageHandler: MessageHandlerService,
    private editingService: EditingService) { }


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
      }
    });
  }

  cancel = () => {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (confirm) {
        this.dialogRef.close();
      }
    });
  };

  closeAndRefresh = () => {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (confirm) {
        this.dialogRef.close({ status: 'ok' });
      }
    });
  };

  saveChanges() {
    this.processing = true;
    this.isProcessComplete = false;
    let promise = Promise.resolve();
    this.records.forEach((item: any) => {
      promise = promise.then(() => {
        this.successCount++;
        this.finalResult[item.id] = {
          result: 'Success',
          hasError: false
        };

        if (item.domainType === 'DataElement') {
          const dataElement: DataElement = {
            id: item.id,
            label: item.label,
            description: item.description,
            domainType: CatalogueItemDomainType.DataElement
          };
          return this.resources.dataElement.update(this.parentDataModel.id, this.parentDataClass.id, dataElement.id, dataElement).toPromise();
        }
        if (item.domainType === 'DataClass') {
          const dataClass: DataClass = {
            id: item.id,
            label: item.label,
            description: item.description,
            domainType: CatalogueItemDomainType.DataClass
          };
          return this.resources.dataClass.updateChildDataClass(this.parentDataModel.id, this.parentDataClass.id, dataClass.id, dataClass).toPromise();
        }
      }).catch(() => {
        this.failCount++;
        this.finalResult[item.id] = {
          result: 'Failed',
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

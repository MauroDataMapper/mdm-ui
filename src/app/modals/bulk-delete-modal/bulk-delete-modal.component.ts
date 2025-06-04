import { StateHandlerService } from './../../services/handlers/state-handler.service';
/*
Copyright 2020-2025 University of Oxford and NHS England

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

import { Component, ChangeDetectorRef, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogClose, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { JoinArrayPipe } from '@mdm/pipes/join-array.pipe';
import { MatIconButton, MatButton } from '@angular/material/button';
import { NgIf, NgFor } from '@angular/common';
@Component({
    selector: 'mdm-bulk-delete',
    templateUrl: './bulk-delete-modal.component.html',
    styleUrls: ['./bulk-delete-modal.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        NgIf,
        MatIconButton,
        MatDialogClose,
        MatDialogContent,
        NgFor,
        MatDialogActions,
        MatButton,
        JoinArrayPipe,
    ],
})
export class BulkDeleteModalComponent implements AfterViewInit {
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
    private stateHandler: StateHandlerService,
    private changeRef: ChangeDetectorRef,
  ) { }

  ngAfterViewInit() {
    this.parentDataModel = this.data.parentDataModel;
    this.parentDataClass = this.data.parentDataClass;
    this.getData();
  }

  getData = () => {
    this.records = this.data.dataElementIdLst;
    this.changeRef.detectChanges();
  };

  closeAndRefresh = () => {
    this.stateHandler.reload();
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
          result: 'Success',
          hasError: false
        };

        switch (item.domainType) {
          case CatalogueItemDomainType.DataClass:
            if (item.imported && (!this.parentDataClass || !this.parentDataClass.id)) {
              return this.resources.dataModel.removeImportedDataClass(this.parentDataModel.id as string, item.model as string, item.id as string).toPromise();
            } else if (item.imported && this.parentDataClass?.id !== null) {
              return this.resources.dataClass.removeImportedDataClass(this.parentDataModel.id as string, this.parentDataClass.id as string, item.model as string, item.id as string).toPromise();
            } else if (item.extended && this.parentDataClass) {
              return this.resources.dataClass.removeExtendDataClass(this.parentDataModel.id as string, this.parentDataClass.id as string, item.model as string, item.id as string).toPromise();
            } else {
              return this.resources.dataClass.removeChildDataClass(item.model as string, item.parentDataClass as string, item.id as string).toPromise();
            }
          case CatalogueItemDomainType.DataElement:
            if (item.imported) {
              return this.resources.dataClass.removeImportedDataElement(this.parentDataModel.id as string, this.parentDataClass.id as string, item.model as string, item.dataClass as string, item.id as string).toPromise();
            } else {
              return this.resources.dataElement.remove(item.model as string, item.dataClass as string, item.id as string).toPromise();
            }
          case CatalogueItemDomainType.PrimitiveType:
          case CatalogueItemDomainType.ReferenceType:
          case CatalogueItemDomainType.ModelDataType:
          case CatalogueItemDomainType.CodeSetType:
          case CatalogueItemDomainType.TerminologyType:
          case CatalogueItemDomainType.ReferenceDataModelType:
          case CatalogueItemDomainType.EnumerationType:
            if (item.imported) {
              return this.resources.dataModel.removeImportedDataType(this.parentDataModel.id as string, item.model as string, item.id as string).toPromise();
            } else {
              return this.resources.dataType.remove(item.model as string, item.id as string).toPromise();
            }
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

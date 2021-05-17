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
import { Injectable } from '@angular/core';
import { BulkEditModalComponent } from '@mdm/modals/bulk-edit-modal/bulk-edit-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { EditingService } from './editing.service';

@Injectable({
  providedIn: 'root'
})
export class DataElementBulkEditDialogService {

  messageSource = new BehaviorSubject(false);
  currentMessage = this.messageSource.asObservable();

  constructor(
    public dialog: MatDialog,
    private editingService: EditingService) { }

  open(dataElementIdLst: any, parentDataModel: any, parentDataClass: any) {
    const dg = this.dialog.open(BulkEditModalComponent, {
        data: { dataElementIdLst, parentDataModel, parentDataClass },
        panelClass: 'bulk-edit-modal'
      });

    this.editingService.configureDialogRef(dg);

    return dg.afterClosed();
  }

  refreshParent = (isRefresh: boolean) => {
    this.messageSource.next(isRefresh);
  };
}

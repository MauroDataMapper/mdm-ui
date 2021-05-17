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
import { InputModalComponent } from '../input-modal/input-modal.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService } from '@mdm/services/grid.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { EditingService } from '@mdm/services/editing.service';


@Component({
  selector: 'mdm-new-folder-modal',
  templateUrl: './new-folder-modal.component.html',
  styleUrls: ['./new-folder-modal.component.scss']
})
export class NewFolderModalComponent implements OnInit {

  okBtn: string;
  cancelBtn: string;
  btnType: string;
  inputValue: { label: string; groups: any[]};
  modalTitle: string;
  message: string;
  inputLabel: string;
  allGroups = [];
  selectedGroups = [];

  constructor(
    private dialogRef: MatDialogRef<InputModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private resourcesService: MdmResourcesService,
    private gridService: GridService,
    private messageHandler: MessageHandlerService,
    private editingService: EditingService) {}

  ngOnInit(): void {
    this.okBtn = this.data.okBtn ? this.data.okBtn : 'Save';
    this.btnType = this.data.btnType ? this.data.btnType : 'primary';
    this.cancelBtn = this.data.cancelBtn ? this.data.cancelBtn : 'Cancel';
    this.inputLabel = this.data.inputLabel ? this.data.inputLabel : '';
    this.modalTitle = this.data.modalTitle ? this.data.modalTitle : '';
    this.message = this.data.message;
    this.inputValue = {
      label: '',
      groups: []
    };

    const options = this.gridService.constructOptions(null, null, 'name', 'asc');
    options['all'] = true;

    this.resourcesService.userGroups.list(options).subscribe(res => {
        this.allGroups = res.body.items;
      }, error => {
        this.messageHandler.showError('There was a problem getting the group list', error);
      }
    );
  }

  onGroupSelect = (groups) => {
    this.inputValue.groups = [];
    for (const val of this.allGroups) {
      if (groups.value.includes(val.id)) {
        this.inputValue.groups.push({
          id: val.id,
          // label: val.label
        });
      }
    }
  };

  cancel() {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (confirm) {
        this.dialogRef.close();
      }
    });
  }

  confirm() {
    this.dialogRef.close(this.inputValue);
  }
}

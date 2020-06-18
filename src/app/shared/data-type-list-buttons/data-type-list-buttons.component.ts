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
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataElementBulkEditDialogService } from '@mdm/services/data-element-bulk-edit-dialog.service';

@Component({
  selector: 'mdm-data-type-list-buttons',
  templateUrl: './data-type-list-buttons.component.html',
  styleUrls: ['./data-type-list-buttons.component.sass']
})
export class DataTypeListButtonsComponent implements OnInit {
  constructor(private dataElementBulkEditDialogService: DataElementBulkEditDialogService) { }

  @Output() deleteRows = new EventEmitter<any>();
  @Output() refreshParentGrid = new EventEmitter<any>();
  @Input() add: any;
  @Input() displayRecords: any[];
  @Input() deleteInProgress = false;
  @Input() showContentDropdown = false;
  @Input() addDataClass: any;
  @Input() addDataElement: any;
  @Input() showDeleteButton = true;
  @Input() parentDataModel: any;
  @Input() parentDataClass: any;

  deletePending: boolean;
  textLocation: string;
  deleteWarning: string;
  message: boolean;

  actionNames = [ "Bulk actions",  "Edit" ];
  selectedAction = this.actionNames[0];

  ngOnInit() {
    this.textLocation = 'left';
    this.deletePending = false;
  }

  confirmDeleteClicked = () => {
    if (this.deleteRows) {
      this.deletePending = false;
      this.deleteInProgress = true;

      this.deleteRows.emit();
    }
  };

  onAskDelete = () => {
    let showDelete = false;
    this.displayRecords.forEach(record => {
      if (record.checked === true) {
        showDelete = true;
      }
    });
    if (showDelete) {
      this.deletePending = true;
    } else {
      this.deleteWarning = 'Please select one or more elements.';
    }
  };

  cancelDeleteClicked = () => {
    this.deletePending = false;
  }

  onBulkActionSelected = (option: string) => {
    
    if (option === "Edit") {

      const dataElementIdLst = [];
      
      this.displayRecords.forEach(record => {
        if (record.checked === true) {
          dataElementIdLst.push(record.id);
        }
      });

      this.dataElementBulkEditDialogService.open(dataElementIdLst, this.parentDataModel, this.parentDataClass, null).subscribe(result => {

        this.refreshParentGrid.emit();
      });
    }
  }
}

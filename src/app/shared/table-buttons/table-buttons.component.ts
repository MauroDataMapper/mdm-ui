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
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-table-buttons',
  templateUrl: './table-buttons.component.html',
  styleUrls: ['./table-buttons.component.sass']
})
export class TableButtonsComponent {
  @Input() record: any;
  @Input() index: any;
  @Input() hideDelete: boolean;
  @Input() hideEdit: any;
  @Input() confirmDelete = true;

  @Input() validate: (record: any, index: any) => boolean;
  @Input() records: any;

  @Output() cancelEdit = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() save = new EventEmitter<any>();

  constructor(private editingService: EditingService) {}

  saveClicked(record, index) {
    if (!this.validate) {
      this.save.emit([record, index]);
      return;
    }
    if (this.validate(record, index)) {
      this.save.emit([record, index]);
      return;
    }
  }

  editClicked(record, index) {
    record.inEdit = true;
    record.edit = Object.assign({}, record);
    if (this.edit) {
      this.edit.emit([record, index]);
    }
  }

  editCancelled(record, index) {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (!confirm) {
        return;
      }

      record.inEdit = undefined;
      record.edit = undefined;

      if (this.cancelEdit) {
        this.cancelEdit.emit([record, index]);
      }
    });
  }

  deleteClicked(record) {
    if (this.confirmDelete) {
      record.inDelete = true;
    }
    else {
      this.delete.emit([record, this.index]);
    }
  }

  deleteCancelled(record) {
    record.inDelete = undefined;
  }

  deleteApproved(record, index) {
    if (this.delete) {
      this.delete.emit([record, index]);
    }
  }
}

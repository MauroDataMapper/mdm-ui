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
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-editable-form-buttons',
  templateUrl: './editable-form-buttons.component.html',
   styleUrls: ['./editable-form-buttons.component.scss']
})
export class EditableFormButtonsComponent implements OnInit {
  @Input() deleteIcon = null;
  @Input() deleteTitle  = '';
  @Input() editTitle = '';
  @Input() processing: any;
  @Input() editable: any;
  @Input() onEditClicked: any;
  @Input() onDeleteClicked: any;
  @Input() onConfirmDelete: any;
  @Input() onCancelDelete: any;
  @Input() onCancelEdit: any;
  @Input() onSave: any;
  @Input() hasSeparateEditForm: any;
  @Input() textLocation: any;
  @Input() hideDelete: any;
  @Input() hideEdit: any;
  @Input() hideCancel: any;
  @Output() delete = new EventEmitter<any>();

  public displayDeleteTitle: string = this.deleteTitle;
  public displayDeleteIcon: any = this.deleteIcon;

  public displayEditTitle: string = this.editTitle;

  get isEditorVisible(): boolean {
    return this.editable && (this.editable.visible || this.editable.isEditing);
  }

  constructor(private editingService: EditingService) {}

  ngOnInit() {
    if (!this.displayDeleteTitle) {
      this.displayDeleteTitle = 'Delete';
    }

    if (!this.displayDeleteIcon) {
      this.displayDeleteIcon = 'fa-trash-alt';
    }

    if (!this.displayEditTitle) {
      this.displayEditTitle = 'Edit';
    }

    if (this.onConfirmDelete) {
      this.onConfirmDelete = this.onConfirmDelete();
    }

    if (this.onEditClicked) {
      this.onEditClicked = this.onEditClicked();
    }

    if (this.onCancelEdit) {
      this.onCancelEdit = this.onCancelEdit();
    }

    if (this.editable) {
      this.editable.deletePending = false;
    }
  }

  editClicked() {
    if (this.onEditClicked) {
      this.onEditClicked();
    }
    // if it does not have 'hasSeparateEditForm' && has 'editable'
    if (!this.hasSeparateEditForm && this.editable) {
      this.editable.show();
    }
  }
  /// Delete ----------------------------------------
  deleteClicked() {
    this.editable.deletePending = true;
  }

  cancelDeleteClicked() {
    if (this.editable) {
      this.editable.deletePending = false;
    }
    if (this.onCancelDelete) {
      this.onCancelDelete();
    }
    if (!this.hideDelete) {
      this.editable.deletePending = false;
    }
  }

  confirmDeleteClicked() {
    if (this.editable) {
      this.editable.deletePending = false;
    }
    if (this.onConfirmDelete) {
      this.onConfirmDelete();
    }

    if (this.delete) {
      this.delete.emit();
    }
  }
  /// 	----------------------------------------

  cancelEditClicked() {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (!confirm) {
        return;
      }

      if (this.editable && this.editable.cancel) {
        this.editable.cancel();
      }
      if (this.onCancelEdit) {
        this.onCancelEdit();
      }
    });
  }

  saveClicked(): any {
    if (this.onSave) {
      this.onSave();
    }
    return true; // as it is submit
  }
}

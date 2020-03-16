import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Editable } from '../../model/folderModel';

@Component({
  selector: 'mdm-editable-form-buttons',
  templateUrl: './editable-form-buttons.component.html',
   styleUrls: ['./editable-form-buttons.component.sass']
})
export class EditableFormButtonsComponent implements OnInit {
  @Input() deleteIcon: any;
  @Input() deleteTitle: any;
  @Input() editTitle: any;
  @Input() processing: any;
  @Input() editable: Editable;
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

  constructor() {}

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
    // if (this.onDeleteClicked) {
    //     this.onDeleteClicked();
    // }
    // if (this.editable) {
    //     this.editable.deletePending = true;
    // }
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
    if (this.editable) {
      this.editable.cancel();
    }
    if (this.onCancelEdit) {
      this.onCancelEdit();
    }
  }

  saveClicked(): any {
    if (this.onSave) {
      this.onSave();
    }
    return true; // as it is submit
  }
}

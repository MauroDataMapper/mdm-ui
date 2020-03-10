import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Editable } from '../../model/folderModel';

@Component({
  selector: "editable-form-buttons",
  templateUrl: './editable-form-buttons.component.html',
   styleUrls: ['./editable-form-buttons.component.sass']
})
export class EditableFormButtonsComponent implements OnInit {
  @Input('delete-icon') deleteIcon: any;
  @Input('delete-title') deleteTitle: any;
  @Input('edit-title') editTitle: any;
  @Input('processing') processing: any;
  @Input('editable') editable: Editable;
  @Input('on-edit-clicked') onEditClicked: any;
  @Input('on-delete-clicked') onDeleteClicked: any;
  @Input('on-confirm-delete') onConfirmDelete: any;
  @Input('on-cancel-delete') onCancelDelete: any;
  @Input('on-cancel-edit') onCancelEdit: any;
  @Input('on-save') onSave: any;
  @Input('has-separate-edit-form') hasSeparateEditForm: any;
  @Input('text-location') textLocation: any;
  @Input('hide-delete') hideDelete: any;
  @Input('hide-edit') hideEdit: any;
  @Input('hide-cancel') hideCancel: any;
  @Output('delete') delete = new EventEmitter<any>();

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

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mdm-table-buttons',
  templateUrl: './table-buttons.component.html',
  styleUrls: ['./table-buttons.component.sass']
})
export class TableButtonsComponent implements OnInit {
  @Input() record: any;
  @Input() index: any;
  @Input() hideDelete: boolean;
  @Input() hideEdit: any;

  @Input() validate: (record: any, index: any) => boolean;
  @Input() records: any;

  @Output() cancelEdit = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() save = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {}

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
    record.inEdit = undefined;
    record.edit = undefined;

    if (this.cancelEdit) {
      this.cancelEdit.emit([record, index]);
    }
  }

  deleteClicked(record, index) {
    record.inDelete = true;
  }

  deleteCancelled(record, index) {
    record.inDelete = undefined;
  }

  deleteApproved(record, index) {
    if (this.delete) {
      this.delete.emit([record, index]);
    }
  }
}

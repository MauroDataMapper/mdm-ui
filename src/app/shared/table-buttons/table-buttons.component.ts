import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mdm-table-buttons',
  templateUrl: './table-buttons.component.html',
  styleUrls: ['./table-buttons.component.sass']
})
export class TableButtonsComponent implements OnInit {
  @Input('record') record: any;
  @Input('index') index: any;
  @Input('hide-delete') hideDelete: boolean;
  @Input('hide-edit') hideEdit: any;

  @Input('validate') validate: Function;
  @Input('records') records: any;

  @Output('cancel-edit') cancelEdit = new EventEmitter<any>();
  @Output('on-edit') onEdit = new EventEmitter<any>();
  @Output('delete') delete = new EventEmitter<any>();
  @Output('save') save = new EventEmitter<any>();

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
    if (this.onEdit) {
      this.onEdit.emit([record, index]);
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

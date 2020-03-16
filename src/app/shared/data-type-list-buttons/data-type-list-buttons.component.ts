import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mdm-data-type-list-buttons',
  templateUrl: './data-type-list-buttons.component.html',
  styleUrls: ['./data-type-list-buttons.component.sass']
})
export class DataTypeListButtonsComponent implements OnInit {
  constructor() {}

  @Output() deleteRows = new EventEmitter<any>();
  @Input() add: any;
  @Input() displayRecords: any[];
  @Input() deleteInProgress = false;
  @Input() showContentDropdown = false;
  @Input() addDataClass: any;
  @Input() addDataElement: any;
  @Input() showDeleteButton = true;

  deletePending: boolean;
  textLocation: string;
  deleteWarning: string;

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
}

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InputModalComponent } from '../input-modal/input-modal.component';

@Component({
  selector: 'mdm-select-modal',
  templateUrl: './select-modal.component.html',
  styleUrls: ['./select-modal.component.scss']
})
export class SelectModalComponent implements OnInit {
  okBtn: string;
  cancelBtn: string;
  btnType: string;
  inputValue: string;
  modalTitle: string;
  message: string;
  inputLabel: string;
  items: [];
  selectedItem: any;

  constructor(
    private dialogRef: MatDialogRef<InputModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {} 

  ngOnInit(): void {
    this.okBtn = this.data.okBtn ? this.data.okBtn : 'Save';
    this.btnType = this.data.btnType ? this.data.btnType : 'primary';
    this.cancelBtn = this.data.cancelBtn ? this.data.cancelBtn : 'Cancel';
    this.inputValue = this.data.inputValue ? this.data.inputValue : '';
    this.inputLabel = this.data.inputLabel ? this.data.inputLabel : '';
    this.modalTitle = this.data.modalTitle ? this.data.modalTitle : '';
    this.message = this.data.message;
    this.selectedItem = this.data.selectedItem;
    this.items = this.data.items;
  }

}

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

export interface FullContentEditDialogData {
  value?: string;
  title?: string;
  subTitle?: string;
}

export interface FullContentEditDialogResponse {
  status: ModalDialogStatus;
  value?: string;
}

@Component({
  selector: 'mdm-full-content-edit-dialog',
  templateUrl: './full-content-edit-dialog.component.html',
  styleUrls: ['./full-content-edit-dialog.component.scss']
})
export class FullContentEditDialogComponent implements OnInit {
  value: string;

  constructor(
    private dialogRef: MatDialogRef<
      FullContentEditDialogComponent,
      FullContentEditDialogResponse
    >,
    @Inject(MAT_DIALOG_DATA) public data: FullContentEditDialogData
  ) {}

  ngOnInit(): void {
    this.value = this.data.value;
  }

  save() {
    this.dialogRef.close({ status: ModalDialogStatus.Ok, value: this.value });
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }
}

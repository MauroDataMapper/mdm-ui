import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mdm-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.sass']
})
export class ConfirmationModalComponent implements OnInit {
  title: string;
  message: string;
  username: string;
  password: string;
  okTitle: string;
  cancelTitle: string;
  cancelShown: boolean;

  constructor(
    private dialogRef: MatDialogRef<ConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.okTitle = this.data.okBtnTitle ? this.data.okBtnTitle : 'OK';
    this.cancelTitle = this.data.cancelBtnTitle ? this.data.cancelBtnTitle : 'Cancel';
    this.title = this.data.title;
    this.message = this.data.message;
    // this.username = securityHandler.getEmailFromStorage();
    this.password = '';
    this.cancelShown =
      this.data.cancelShown != null ? this.data.cancelShown : true;
  }

  ok() {
    this.dialogRef.close({ status: 'ok' });
  }

  cancel() {
    this.dialogRef.close({ status: 'cancel' });
  }

  close() {
    this.dialogRef.close({ status: 'close' });
  }
}

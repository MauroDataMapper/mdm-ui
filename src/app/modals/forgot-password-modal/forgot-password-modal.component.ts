import {Component, OnInit} from '@angular/core';
import {SecurityHandlerService} from '../../services/handlers/security-handler.service';
import {ResourcesService} from '../../services/resources.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {RegisterModalComponent} from '../register-modal/register-modal.component';

@Component({
  selector: 'mdm-forgot-password-modal',
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.sass']
})
export class ForgotPasswordModalComponent implements OnInit {
  username: any;
  message: any;

  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordModalComponent>, private securityHandler: SecurityHandlerService, private resources: ResourcesService) {}

  ngOnInit() {
    this.username = this.securityHandler.getEmailFromCookies();
  }

  resetPassword = function() {
    this.resources.catalogueUser.get(this.username, 'resetPasswordLink').subscribe(
      result => {
        this.message = 'success';
        this.dialogRef.close(this.username);
      },
      error => {
        this.message = 'error';
      }
    );
  };
  keyEntered = event => {
    event.preventDefault();
    return false;
  };
  login = () => {
    this.dialogRef.close();
    this.dialog.open(RegisterModalComponent);
  }
}

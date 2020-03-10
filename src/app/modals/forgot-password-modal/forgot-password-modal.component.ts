import {Component, OnInit} from '@angular/core';
import {SecurityHandlerService} from '../../services/handlers/security-handler.service';
import {ResourcesService} from '../../services/resources.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {LoginModalComponent} from '../login-modal/login-modal.component';

@Component({
  selector: 'app-forgot-password-modal',
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

  cancel = () => {
    this.dialogRef.close();
  }

  keyEntered = event => {
    event.preventDefault();
    return false;
  }

  close = () => {
    this.dialogRef.close();
  }

}

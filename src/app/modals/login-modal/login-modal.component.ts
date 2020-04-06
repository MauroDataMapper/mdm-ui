import {Component, OnInit} from '@angular/core';
import {SecurityHandlerService} from '../../services/handlers/security-handler.service';
import {ForgotPasswordModalComponent} from '../forgot-password-modal/forgot-password-modal.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {RegisterModalComponent} from '../register-modal/register-modal.component';

@Component({
  selector: 'mdm-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.sass']
})
export class LoginModalComponent implements OnInit {
  username: any;
  password: any;
  message: any;

  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<LoginModalComponent>, private securityHandler: SecurityHandlerService) {}

  ngOnInit() {
    const un = this.securityHandler.getEmailFromStorage();
    this.username = un === 'undefined' ? '' : un;
    this.password = '';
  }

  login = () => {
    this.securityHandler.login(this.username, this.password).then(user => {
        this.dialogRef.close(user);
        this.securityHandler.loginModalDisplayed = false;
      },
      error => {
        this.securityHandler.loginModalDisplayed = true;
        if (error.status === 401) {
          this.message = 'Invalid username or password!';
        } else if (error.status === 409) {
          this.message = 'A user is already logged in, logout first';
        } else if (error.status === -1) {
          this.message = 'Unable to log in. Please try again later.';
        }
      }
    );
  };

  keyEntered = event => {
    if (event.which === 13) {
      this.login();
    }
  };
  forgotPassword = () => {
    this.dialogRef.close();
    this.dialog.open(ForgotPasswordModalComponent);
  };
  signUp = () => {
    this.dialogRef.close();
    this.dialog.open(RegisterModalComponent);
  };
}

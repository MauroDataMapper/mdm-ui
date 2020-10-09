/*
Copyright 2020 University of Oxford

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Component, OnInit } from '@angular/core';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MatDialogRef } from '@angular/material/dialog';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MessageService } from '@mdm/services/message.service';
import { LoginModel } from './loginModel';
import { ValidatorService } from '@mdm/services/validator.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'mdm-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.sass'],
})
export class LoginModalComponent implements OnInit {
  // @ViewChild('form', { static: false }) form: NgForm;
  public form: FormGroup;
  username = '';
  errors = {
    email: '',
    password: ''
  };
  password = '';
  passwordError = '';
  message = '';
  resource: LoginModel;

  constructor(
    private broadcastService: BroadcastService,
    public dialogRef: MatDialogRef<LoginModalComponent>,
    private securityHandler: SecurityHandlerService,
    private messageService: MessageService,
    private validator: ValidatorService
  ) { }

  ngOnInit() {
    this.resource = {
      username: this.username,
      password: this.password
    };
  }

  async login() {
    this.message = '';
    if (this.validator.validateEmail(this.username)) {
      if (this.password) {
        try {
          this.resource = {
            username: this.username,
            password: this.password
          };
          const user = await this.returnSecurityHandler(this.resource);
          this.dialogRef.close(user);
          this.securityHandler.loginModalDisplayed = false;
          this.messageService.loggedInChanged(true);
          this.errors.password = '';
          this.errors.email = '';
        } catch (error) {
          this.securityHandler.loginModalDisplayed = true;
          if (error.status === 401) {
            this.message = 'Invalid username or password!';
          } else if (error.status === 409) {
            this.message = 'A user is already logged in, logout first';
          } else if (error.status === -1) {
            this.message = 'Unable to log in. Please try again later.';
          }
        }
      } else {
        this.errors.password = 'Invalid password';
      }
    } else {
      this.errors.email = 'Invalid email address';
    }
  }

  returnSecurityHandler = resource => {
    return this.securityHandler.login(resource);
  };

  forgotPassword() {
    this.dialogRef.close();
    this.broadcastService.broadcast('openForgotPasswordModalDialog');
  }

  signUp() {
    this.dialogRef.close();
    this.broadcastService.broadcast('openRegisterModalDialog');
  }
  close = () => {
    this.securityHandler.loginModalDisplayed = false;
    this.dialogRef.close();
  };
}

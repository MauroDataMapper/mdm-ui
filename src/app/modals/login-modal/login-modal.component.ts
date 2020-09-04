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
import {Component, OnInit} from '@angular/core';
import {SecurityHandlerService} from '@mdm/services/handlers/security-handler.service';
import { MatDialogRef} from '@angular/material/dialog';
import { BroadcastService } from '@mdm/services/broadcast.service';
import {MessageService} from '@mdm/services/message.service';

@Component({
  selector: 'mdm-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.sass']
})
export class LoginModalComponent implements OnInit {
  username: string;
  password: string;
  message: string;

  constructor(private broadcastService: BroadcastService, public dialogRef: MatDialogRef<LoginModalComponent>, private securityHandler: SecurityHandlerService, private messageService: MessageService) {}

  ngOnInit() {
    const un = this.securityHandler.getEmailFromStorage();
    this.username = un === 'undefined' ? '' : un;
    this.password = '';
    this.message = '';
  }

  async login() {
    this.message = '';
    try {
      const user = await this.securityHandler.login(this.username, this.password);
      this.dialogRef.close(user);
      this.securityHandler.loginModalDisplayed = false;
      this.messageService.loggedInChanged(true);
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
  }

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
  }
}

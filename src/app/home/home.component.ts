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
import { Title } from '@angular/platform-browser';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { LoginModalComponent } from '../modals/login-modal/login-modal.component';
import { ForgotPasswordModalComponent } from '../modals/forgot-password-modal/forgot-password-modal.component';
import { BroadcastService } from '../services/broadcast.service';
import { RegisterModalComponent } from '../modals/register-modal/register-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mdm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {
  profilePictureReloadIndex = 0;
  profile: any;
  isLoggedIn = false;

  constructor(
    public dialog: MatDialog,
    private securityHandler: SecurityHandlerService,
    private stateHandler: StateHandlerService,
    private broadcastSvc: BroadcastService,
    private title: Title
  ) {
    this.broadcastSvc.subscribe('userLoggedOut', () => {
      this.isLoggedIn = false;
    });

  }

  ngOnInit() {
    if (this.securityHandler.isLoggedIn()) {
      this.isLoggedIn = true;
      this.profile = this.securityHandler.getCurrentUser();
    }
    this.title.setTitle('Mauro Data Mapper - Home');
  }



  login = () => {
    this.dialog.open(LoginModalComponent, { }).afterClosed().subscribe((user) => {
      if (user) {
        if (user.needsToResetPassword) {
          this.broadcastSvc.broadcast('userLoggedIn', { goTo: 'appContainer.userArea.changePassword' });
          return;
        }
        this.profile = user;

        const latestURL = this.securityHandler.getLatestURL();
        if (latestURL) {
          this.broadcastSvc.broadcast('userLoggedIn');
          this.securityHandler.removeLatestURL();
          this.stateHandler.CurrentWindow(latestURL);
          return;
        } else {
          this.broadcastSvc.broadcast('userLoggedIn', { goTo: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel' });
          return;
        }
      }
    });
  };

  forgottenPassword = () => {
    this.dialog.open(ForgotPasswordModalComponent, { });
  };

  register = () => {
    this.dialog.open(RegisterModalComponent, {panelClass: 'register-modal'}).afterClosed().subscribe(user => {
      if (user) {
        if (user.needsToResetPassword) {
          this.broadcastSvc.broadcast('userLoggedIn', { goTo: 'appContainer.userArea.change-password' });
          return;
        }
        this.profile = user;

        const latestURL = this.securityHandler.getLatestURL();
        if (latestURL) {
          this.broadcastSvc.broadcast('userLoggedIn');
          this.securityHandler.removeLatestURL();
          this.stateHandler.CurrentWindow(latestURL);
          return;
        } else {
          this.broadcastSvc.broadcast('userLoggedIn', { goTo: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel' });
          return;
        }
      }
    });
  };
}

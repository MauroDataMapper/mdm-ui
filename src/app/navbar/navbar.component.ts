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
import { LoginModalComponent } from '@mdm/modals/login-modal/login-modal.component';
import { ForgotPasswordModalComponent } from '@mdm/modals/forgot-password-modal/forgot-password-modal.component';
import { SharedService } from '@mdm/services/shared.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatDialog } from '@angular/material/dialog';
import { RegisterModalComponent } from '@mdm/modals/register-modal/register-modal.component';
import { Subscription } from 'rxjs';
import { MessageService } from '@mdm/services/message.service';
import { EditingService } from '@mdm/services/editing.service';
import { ThemingService } from '@mdm/services/theming.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { catchError, map } from 'rxjs/operators';
import { ApiProperty, ApiPropertyIndexResponse } from '@mdm/model/api-properties';

@Component({
  selector: 'mdm-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  profilePictureReloadIndex = 0;
  profile: any;
  logoUrl: string;
  logoWidth?: string;
  backendURL: any;
  imgChanged: boolean;
  simpleViewSupport: any;
  current: any;
  HDFLink: any;
  sideNav: any;
  pendingUsersCount = 0;
  isLoggedIn = this.securityHandler.isLoggedIn();
  subscription: Subscription;
  features = this.sharedService.features;

  constructor(
    private sharedService: SharedService,
    private dialog: MatDialog,
    private securityHandler: SecurityHandlerService,
    private broadcastSvc: BroadcastService,
    private messageService: MessageService,
    private editingService: EditingService,
    private theming: ThemingService,
    private resources: MdmResourcesService) { }

  ngOnInit() {
    this.subscription = this.messageService.loggedInChanged$.subscribe(result => {
      this.isLoggedIn = result;
    });
    if (this.isLoggedIn) {
      this.profile = this.securityHandler.getCurrentUser();
      // if (this.isAdmin()) {
      //   this.getPendingUsers();
      // }
    }
    this.backendURL = this.sharedService.backendURL;

    this.setupLogo();

    this.imgChanged = false;
    this.HDFLink = this.sharedService.HDFLink;
    this.current = this.sharedService.current;
    this.broadcastSvc.subscribe('pendingUserUpdated', () => {
      this.getPendingUsers();
    });

    this.broadcastSvc.subscribe('profileImgUndated', () => {
      this.imgChanged = true;
      setTimeout(() => {
        this.imgChanged = false;
      }, 1000);
    });
  }

  setupLogo() {
    // First default to the static asset, then try to override with a custom API property if available
    this.logoUrl = this.theming.getAssetPath('logo.png');

    this.resources.apiProperties
      .listPublic()
      .pipe(
        map((response: ApiPropertyIndexResponse) => response.body.items.filter(p => p.key.startsWith('theme.logo.'))),
        catchError(() => [])
      )
      .subscribe((properties: ApiProperty[]) => {
        const logoUrl = properties.find(p => p.key === 'theme.logo.url');
        const logoWidth = properties.find(p => p.key === 'theme.logo.width');

        if (logoUrl) {
          this.logoUrl = logoUrl.value;
        }

        if (logoWidth) {
          this.logoWidth = logoWidth.value;
        }
      });
  }

  getPendingUsers = () => {
    this.sharedService.pendingUsersCount().subscribe(data => {
      this.pendingUsersCount = data.body.count;
    });
  };

  isAdmin = () => {
    return this.securityHandler.isAdmin();
  };


  login = () => {
    this.dialog.open(LoginModalComponent, {}).afterClosed().subscribe((user) => {
      if (user) {
        if (user.needsToResetPassword) {
          this.broadcastSvc.broadcast('userLoggedIn', { goTo: 'appContainer.userArea.changePassword' });
          return;
        }
        this.profile = user;
        this.broadcastSvc.broadcast('userLoggedIn', { goTo: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel' });
      }
    });
  };

  logout = () => {
    this.securityHandler.logout();
  };

  forgottenPassword = () => {
    this.dialog.open(ForgotPasswordModalComponent, {});
  };
  register = () => {
    const dialog = this.dialog.open(RegisterModalComponent, { panelClass: 'register-modal' });

    this.editingService.configureDialogRef(dialog);

    dialog.afterClosed().subscribe(user => {
      if (user) {
        if (user.needsToResetPassword) {
          this.broadcastSvc.broadcast('userLoggedIn', { goTo: 'appContainer.userArea.change-password' });
          return;
        }
        this.profile = user;
        this.broadcastSvc.broadcast('userLoggedIn', { goTo: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel' });
      }
    });
  };
}

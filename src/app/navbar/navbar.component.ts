/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { LoginModalComponent } from '@mdm/modals/login-modal/login-modal.component';
import { ForgotPasswordModalComponent } from '@mdm/modals/forgot-password-modal/forgot-password-modal.component';
import { SharedService } from '@mdm/services/shared.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { RegisterModalComponent } from '@mdm/modals/register-modal/register-modal.component';
import { Subject } from 'rxjs';
import { EditingService } from '@mdm/services/editing.service';
import { ThemingService } from '@mdm/services/theming.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { catchError, map, takeUntil } from 'rxjs/operators';
import {
  ApiProperty,
  ApiPropertyIndexResponse
} from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
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
  isLoggedIn = false;
  isAdministrator = false;
  features = this.sharedService.features;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private sharedService: SharedService,
    private dialog: MatDialog,
    private securityHandler: SecurityHandlerService,
    private broadcast: BroadcastService,
    private editingService: EditingService,
    private theming: ThemingService,
    private resources: MdmResourcesService
  ) {}

  ngOnInit() {
    this.broadcast
      .onUserLoggedIn()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.isLoggedIn = true;
        this.securityHandler
          .isAdministrator()
          .subscribe((state) => (this.isAdministrator = state));
      });

    this.broadcast
      .onUserLoggedOut()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.isLoggedIn = false;
        this.isAdministrator = false;
      });

    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.securityHandler
      .isAdministrator()
      .subscribe((state) => (this.isAdministrator = state));

    if (this.isLoggedIn) {
      this.profile = this.securityHandler.getCurrentUser();
    }
    this.backendURL = this.sharedService.backendURL;

    this.setupLogo();

    this.imgChanged = false;
    this.HDFLink = this.sharedService.HDFLink;
    this.current = this.sharedService.current;

    this.broadcast
      .on('pendingUserUpdated')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.getPendingUsers());

    this.broadcast
      .on('profileImageUpdated')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.imgChanged = true;
        setTimeout(() => {
          this.imgChanged = false;
        }, 1000);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setupLogo() {
    // First default to the static asset, then try to override with a custom API property if available
    this.logoUrl = this.theming.getAssetPath('logo.png');

    this.resources.apiProperties
      .listPublic()
      .pipe(
        map((response: ApiPropertyIndexResponse) =>
          response.body.items.filter((p) => p.key.startsWith('theme.logo.'))
        ),
        catchError(() => [])
      )
      .subscribe((properties: ApiProperty[]) => {
        const logoUrl = properties.find((p) => p.key === 'theme.logo.url');
        const logoWidth = properties.find((p) => p.key === 'theme.logo.width');

        if (logoUrl) {
          this.logoUrl = logoUrl.value;
        }

        if (logoWidth) {
          this.logoWidth = logoWidth.value;
        }
      });
  }

  getPendingUsers = () => {
    this.sharedService.pendingUsersCount().subscribe((data) => {
      this.pendingUsersCount = data.body.count;
    });
  };

  login = () => {
    this.dialog
      .open(LoginModalComponent, {})
      .afterClosed()
      .subscribe((user) => {
        if (user) {
          if (user.needsToResetPassword) {
            this.broadcast.userLoggedIn({
              nextRoute: 'appContainer.userArea.changePassword'
            });
            return;
          }
          this.profile = user;
          this.broadcast.userLoggedIn({
            nextRoute:
              'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'
          });
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
    const dialog = this.dialog.open(RegisterModalComponent, {
      panelClass: 'register-modal'
    });

    this.editingService.configureDialogRef(dialog);

    dialog.afterClosed().subscribe((user) => {
      if (user) {
        if (user.needsToResetPassword) {
          this.broadcast.userLoggedIn({
            nextRoute: 'appContainer.userArea.change-password'
          });
          return;
        }
        this.profile = user;
        this.broadcast.userLoggedIn({
          nextRoute: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'
        });
      }
    });
  };
}

/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { SecurityHandlerService } from './handlers/security-handler.service';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MdmResourcesService } from '@mdm/modules/resources';
import { filter } from 'rxjs/operators';
import { FeaturesService } from './features.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  backendURL = environment.apiEndpoint;
  appVersion = environment.version;
  appTitle = environment.appTitle;
  youTrack = environment.youTrack;
  documentation: { url: string; pages: { [key: string]: string }; importers: { [key: string]: string } } = environment.documentation;
  simpleViewSupport = environment.simpleViewSupport;
  checkSessionExpiryTimeout = environment.checkSessionExpiryTimeout;
  HDFLink = environment.HDFLink;
  isAdmin;
  applicationOffline = new Subject<any>();
  current;

  public searchCriteria: string;

  lastDigestRun = new Date();

  constructor(
    public features: FeaturesService,
    private securityHandler: SecurityHandlerService,
    private toaster: ToastrService,
    private resources: MdmResourcesService
  ) {
    this.isAdmin = this.securityHandler.isAdmin();
  }

  logout() {
    this.securityHandler.logout();
  };

  handleRequiredToLogin()
  {
    this.securityHandler.loginRequired();
    this.toaster.info('Please log in to continue.');
  }

  isLoggedIn = (checkServerSession?) => {
    if (checkServerSession !== undefined) {
      this.handleExpiredSession();
    }
    return this.securityHandler.isLoggedIn();
  };

  isAdminUser = () => {
    return this.securityHandler.isAdmin();
  };

  handleExpiredSession(firstTime?) {
    // if 'event:auth-loginRequired' event is fired, then do not check as
    // the event handler will check the status
    if (this.securityHandler.in_AuthLoginRequiredCheck && !firstTime) {
      return;
    }

    if (!this.securityHandler.isLoggedIn()) {
      return;
    }

    this.securityHandler
      .isCurrentSessionExpired()
      .pipe(filter(authenticated => !authenticated))
      .subscribe(() => {
        if (!firstTime) {
          this.toaster.info('You have been automatically logged out due to inactivity. Please log in again to continue.');
        }

        this.securityHandler.logout();
      });
  }

  pendingUsersCount = () => {
    return this.resources.catalogueUser.pending({ disabled: false });
  };
}

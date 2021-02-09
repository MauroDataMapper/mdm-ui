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
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { SecurityHandlerService } from './handlers/security-handler.service';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MdmResourcesService } from '@mdm/modules/resources';

const defaultThemeName = 'default-theme';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  backendURL = environment.apiEndpoint;
  appVersion = environment.version;
  appTitle = environment.appTitle;
  youTrack = environment.youTrack;
  wiki = environment.wiki;
  simpleViewSupport = environment.simpleViewSupport;
  HDFLink = environment.HDFLink;
  isAdmin;
  applicationOffline = new Subject<any>();
  current;

  public searchCriteria: string;

  lastDigestRun = new Date();

  constructor(
    private securityHandler: SecurityHandlerService,
    private toaster: ToastrService,
    private resources: MdmResourcesService
  ) {
    this.isAdmin = this.securityHandler.isAdmin();
    this.applicationOffline.subscribe(() => {
      this.toaster.warning('Application is offline!');
    });
  }

  logout = () => {
    this.securityHandler.logout();
  };

  isLoggedIn = (checkServerSession?) => {
    if (checkServerSession !== undefined) {
      this.handleExpiredSession();
    }
    return this.securityHandler.isLoggedIn();
  };

  isAdminUser = () => {
    return this.securityHandler.isAdmin();
  };

  handleExpiredSession = (firstTime?) => {
    // if 'event:auth-loginRequired' event is fired, then do not check as
    // the event handler will check the status
    if (this.securityHandler.in_AuthLoginRequiredCheck && !firstTime) {
      return;
    }

    this.securityHandler.isCurrentSessionExpired().then(result => {
      if (result === true) {
        this.toaster.error('Your session has expired! Please log in.');

        this.securityHandler.logout();
      }
    });
  };

  pendingUsersCount = () => {
    return this.resources.catalogueUser.pending({ disabled: false });
  };
}

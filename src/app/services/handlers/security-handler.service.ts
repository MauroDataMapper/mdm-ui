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
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService } from './state-handler.service';
import { ElementTypesService } from '../element-types.service';
import { environment } from '@env/environment';
import { MessageService } from '@mdm/services/message.service';
import { BroadcastService } from '@mdm/services/broadcast.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityHandlerService {
  loginModalDisplayed = false;
  in_AuthLoginRequiredCheck = false;
  constructor(
    private elementTypes: ElementTypesService,
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService,
    private messageService: MessageService,
    private broadcastService: BroadcastService
  ) { }

  removeLocalStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('needsToResetPassword');
    localStorage.removeItem('email');
    localStorage.removeItem('userSettings');

  }

  getUserFromLocalStorage() {
    if (localStorage.getItem('username') && localStorage.getItem('username').length > 0) {
      return {
        id: localStorage.getItem('userId'),
        token: localStorage.getItem('token'),
        username: localStorage.getItem('username'),
        email: localStorage.getItem('username'),
        firstName: localStorage.getItem('firstName'),
        lastName: localStorage.getItem('lastName'),
        role: localStorage.getItem('role'),
        needsToResetPassword: localStorage.getItem('needsToResetPassword'),
        isAdmin: localStorage.getItem('isAdmin'),
      };
    }
    return null;
  }

  getEmailFromStorage() {
    return localStorage.getItem('email');
  }

  addToLocalStorage(user) {
    localStorage.setItem('userId', user.id);
    localStorage.setItem('token', user.token);
    localStorage.setItem('firstName', user.firstName);
    localStorage.setItem('lastName', user.lastName);
    localStorage.setItem('username', user.username);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('isAdmin', user.isAdmin);

    // Keep username for 100 days
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 100);
    localStorage.setItem('email', user.username); // , expireDate);
    localStorage.setItem('role', user.role);
    localStorage.setItem('needsToResetPassword', user.needsToResetPassword);
  }

  async login(username, password) {
    // This parameter is very important as we do not want to handle 401 if user credential is rejected on login modal form
    // as if the user credentials are rejected Back end server will return 401, we should not show the login modal form again
    const resource = { username, password };
    const response = await this.resources.security.login(resource).toPromise();
    const admin = await this.resources.session.isApplicationAdministration().toPromise()
    const adminResult = admin.body;
    const result = response.body;
    const currentUser = {
      id: result.id,
      token: result.token,
      firstName: result.firstName,
      lastName: result.lastName,
      username: result.emailAddress,
      role: result.userRole ? result.userRole.toLowerCase() : '',
      isAdmin: adminResult.applicationAdministrationSession ? adminResult.applicationAdministrationSession : false,
      needsToResetPassword: result.needsToResetPassword ? true : false
    };
    this.addToLocalStorage(currentUser);
    return currentUser;
  }

  async logout() {
    try {
      await this.resources.security.logout({ responseType: 'text' }).toPromise();
    } catch (err) {
      if (err.status === 500 && err.message === 'Session has been invalidated') {
        // Something's wrong
      } else {
        console.log(`Status ${err.status}: ${err.message}`);
      }
    }

    // Clear everything on client side whether server acknowledge or not.
    this.removeLocalStorage();
    this.broadcastService.broadcast('userLoggedOut');
    this.messageService.loggedInChanged(false);
    this.stateHandler.Go('appContainer.mainApp.home');
  }

  expireToken() {
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    // return this.resources.authentication.get('isValidSession');
    return this.resources.session.isAuthenticated();
  }


  isLoggedIn() {
    return this.getUserFromLocalStorage() != null;
  }

  isAdmin() {
    if(this.getCurrentUser()){
    return this.getCurrentUser().isAdmin;
    }
    return false;
  }

  getCurrentUser() {
    return this.getUserFromLocalStorage();
  }

  showIfRoleIsWritable(element) {
    // if this app is NOT 'editable', return false
    const isEditable = environment.appIsEditable;
    if (isEditable !== null && isEditable === false) {
      return false;
    } else if (isEditable !== null && isEditable /* === true*/) {
      // Now app is editable, lets check if the user has writable role
      const user = this.getCurrentUser();

      // if the user is not logged-in
      if (!user) {
        return false;
      }

      // if a value is provided, we need to check if the user has writable access to the element
      if (element) {
        if (element.availableActions.includes('update') && !element.finalised) {
          return true;
        }
        return false;
      }

      return true;
    }

    return false;
  }

  async isCurrentSessionExpired() {
    if (this.getCurrentUser()) {
      try {
        const response = await this.isAuthenticated().toPromise();
        const json = response.json();
        if (!json?.authentication) {
          this.removeLocalStorage();
          return true;
        }
      } catch (err) {
        if (err.status === 500 && err.message === 'Session has been invalidated') {
          this.removeLocalStorage();
        }
      }
    }

    return false;

    // const promise = new Promise(resolve => {
    //   if (this.getCurrentUser()) { // Check for valid session when getting user from local storage
    //     // check session and see if it's still valid
    //     this.isAuthenticated().subscribe(response => {
    //       if (response.body.authenticatedSession === false) {
    //         this.removeLocalStorage();
    //       }
    //       resolve(!response.body);
    //     });
    //   } else {
    //     resolve(false);
    //   }
    // });

    // return promise;
  }



  saveLatestURL(url) {
    localStorage.setItem('latestURL', url);
  }
  getLatestURL() {
    return localStorage.getItem('latestURL');
  }
  removeLatestURL() {
    localStorage.removeItem('latestURL');
  }

  dataModelAccess(element) {
    return {
      showEdit: element.availableActions.includes('update'),
      showEditDescription: element.availableActions.includes('editDescription'),
      showNewVersion: element.availableActions.includes('update') && element.finalised,
      showFinalise: element.availableActions.includes('update') && !element.finalised,
      showPermission: element.availableActions.includes('update') || this.isAdmin(),
      showSoftDelete: element.availableActions.includes('softDelete'),
      showPermanentDelete: element.availableActions.includes('delete'),
      canAddAnnotation: element.availableActions.includes('comment'),
      canAddMetadata: this.isLoggedIn(),

      canAddLink: element.availableActions.includes('update') && !element.finalised
    };
  }

  termAccess(element) {
    return {
      showEdit: element.availableActions.includes('update') && !element.finalised,
      showEditDescription: element.availableActions.includes('editDescription'),
      showNewVersion: element.availableActions.includes('update') && element.finalised,
      showFinalise: element.availableActions.includes('update') && !element.finalised,
      showPermission: element.availableActions.includes('update') || this.isAdmin(),
      showDelete: element.availableActions.includes('softDelete') || element.availableActions.includes('delete'),
      showSoftDelete: element.availableActions.includes('softDelete'),
      showPermanentDelete: element.availableActions.includes('delete'),
      canAddAnnotation: this.isLoggedIn(),
      canAddMetadata: this.isLoggedIn(),

      canAddLink: element.availableActions.includes('update')
    };
  }

  dataElementAccess(element) {
    return {
      showEdit: element.availableActions.includes('update'),
      showEditDescription: element.availableActions.includes('editDescription'),
      showDelete: element.availableActions.includes('softDelete') || element.availableActions.includes('delete'),
      showSoftDelete: element.availableActions.includes('softDelete'),
      showPermanentDelete: element.availableActions.includes('delete'),
      canAddAnnotation: this.isLoggedIn(),
      canAddMetadata: this.isLoggedIn(),
      canAddLink: element.availableActions.includes('update') && !element.finalised
    };
  }

  dataClassAccess(element) {
    return {
      showEdit: element.availableActions.includes('update'),
      showEditDescription: element.availableActions.includes('editDescription'),
      showDelete: element.availableActions.includes('softDelete') || element.availableActions.includes('delete'),
      showSoftDelete: element.availableActions.includes('softDelete'),
      showPermanentDelete: element.availableActions.includes('delete'),
      canAddAnnotation: this.isLoggedIn(),
      canAddMetadata: this.isLoggedIn(),

      canAddLink: element.availableActions.includes('update') && !element.finalised
    };
  }

  dataTypeAccess(element) {
    return {
      showEdit: element.availableActions.includes('update'),
      showEditDescription: element.availableActions.includes('editDescription'),
      showDelete: element.availableActions.includes('softDelete') || element.availableActions.includes('delete'),
      showSoftDelete: element.availableActions.includes('softDelete'),
      showPermanentDelete: element.availableActions.includes('delete'),
      canAddAnnotation: this.isLoggedIn(),
      canAddMetadata: this.isLoggedIn(),

      canAddLink: element.availableActions.includes('update') && !element.finalised
    };
  }

  datFlowAccess(dataFlow) {
    return {
      showEdit: dataFlow.availableActions.includes('update'),
      canAddAnnotation: dataFlow.availableActions.includes('update'),
      canAddMetadata: this.isLoggedIn()
    };
  }

  elementAccess(element) {
    if (element.domainType === 'DataModel' || element.domainType === 'Terminology' || element.domainType === 'CodeSet') {
      return this.dataModelAccess(element);
    }

    if (element.domainType === 'Term') {
      return this.termAccess(element);
    }

    if (element.domainType === 'DataElement') {
      return this.dataElementAccess(element);
    }

    if (element.domainType === 'DataClass') {
      return this.dataClassAccess(element);
    }

    const dataTypes = this.elementTypes.getAllDataTypesMap();
    if (dataTypes[element.domainType]) {
      return this.dataTypeAccess(element);
    }

    if (element.domainType === 'DataFlow') {
      return this.datFlowAccess(element);
    }
  }

  folderAccess(folder) {
    return {
      showEdit: folder.availableActions.includes('update'),
      showPermission: folder.availableActions.includes('update') || this.isAdmin(),
      showSoftDelete: folder.availableActions.includes('softDelete'),
      showPermanentDelete: folder.availableActions.includes('delete'),
    };
  }
}

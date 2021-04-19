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
import { AdministrationSessionResponse, AuthenticatedSessionError, AuthenticatedSessionResponse, SignInCredentials, SignInError, SignInResponse, UserDetails } from './security-handler.model';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SecurityHandlerService {
  loginModalDisplayed = false;
  // tslint:disable-next-line: variable-name
  in_AuthLoginRequiredCheck = false;

  constructor(
    private elementTypes: ElementTypesService,
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService,
    private messageService: MessageService,
    private broadcastService: BroadcastService
  ) { }

  private removeUserFromLocalStorage() {
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

  getUserFromLocalStorage(): UserDetails | null {
    const userName = localStorage.getItem('username');
    if (!userName || userName.length === 0) {
      return null;
    }

    return {
      id: localStorage.getItem('userId'),
      token: localStorage.getItem('token'),
      userName,
      email: userName,
      firstName: localStorage.getItem('firstName'),
      lastName: localStorage.getItem('lastName'),      
      role: localStorage.getItem('role'),
      needsToResetPassword: Boolean(localStorage.getItem('needsToResetPassword')),
      isAdmin: JSON.parse(localStorage.getItem('isAdmin')),
    };
  }

  getEmailFromStorage() {
    return localStorage.getItem('email');
  }

  addToLocalStorage(user) {
    // Keep username for 100 days
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 1);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('token', user.token);
    localStorage.setItem('firstName', user.firstName);
    localStorage.setItem('lastName', user.lastName);
    localStorage.setItem('username', JSON.stringify({ username: user.username, expiry: expireDate }));
    localStorage.setItem('userId', user.id);
    localStorage.setItem('isAdmin', user.isAdmin);


    localStorage.setItem('email', JSON.stringify({ email: user.username, expiry: expireDate }));
    localStorage.setItem('role', user.role);
    localStorage.setItem('needsToResetPassword', user.needsToResetPassword);
  }

  /**
   * Sign in a user to the Mauro system.
   *
   * @param credentials The sign-in credentials to use.
   * @returns An observable to return a `UserDetails` object representing the signed in user.
   * @throws `SignInError` in the observable chain if sign-in failed.
   */
  signIn(credentials: SignInCredentials): Observable<UserDetails> {
    // This parameter is very important as we do not want to handle 401 if user credential is rejected on login modal form
    // as if the user credentials are rejected Back end server will return 401, we should not show the login modal form again
    return this.resources.security
      .login(credentials, { login: true })
      .pipe(
        catchError((error: HttpErrorResponse) => throwError(new SignInError(error))),
        switchMap((signInResponse: SignInResponse) =>
          this.resources.session
            .isApplicationAdministration()
            .pipe(
              map((adminResponse: AdministrationSessionResponse) => {
                const signIn = signInResponse.body;
                const admin = adminResponse.body;
                const user: UserDetails = {
                  id: signIn.id,
                  token: signIn.token,
                  firstName: signIn.firstName,
                  lastName: signIn.lastName,
                  email: signIn.emailAddress,
                  userName: signIn.emailAddress,
                  role: signIn.userRole?.toLowerCase() ?? '',
                  isAdmin: admin.applicationAdministrationSession ?? false,
                  needsToResetPassword: signIn.needsToResetPassword ?? false
                };
                this.addToLocalStorage(user);
                return user;
              })
            ))
      );
  }

  async logout() {
    try {
      await this.resources.security
        .logout({ responseType: 'text' })
        .toPromise();
    } catch (err) {
      if (
        err.status === 500 &&
        err.message === 'Session has been invalidated'
      ) {
        // Something's wrong
      } else {
        console.log(`Status ${err.status}: ${err.message}`);
      }
    }

    // Clear everything on client side whether server acknowledge or not.
    this.removeUserFromLocalStorage();
    this.broadcastService.broadcast('userLoggedOut');
    this.messageService.loggedInChanged(false);
    this.stateHandler.Go('appContainer.mainApp.home');
  }

  expireToken() {
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    return this.resources.session.isAuthenticated();
  }

  isLoggedIn() {
    return !!this.getUserFromLocalStorage();
  }  

  isAdmin() {
    if (this.getCurrentUser()) {
      return this.getCurrentUser().isAdmin;
    }
    return false;
  }

  getCurrentUser(): UserDetails | null {
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

  isCurrentSessionExpired(): Observable<boolean> {
    if (!this.getCurrentUser()) {
      return of(false);
    }

    return this.isAuthenticated()
      .pipe(
        catchError((error: AuthenticatedSessionError) => {
          if (error.invalidated) {
            this.removeUserFromLocalStorage();
            return of(true);
          }

          return of(false);
        }),
        map((response: AuthenticatedSessionResponse) => {
          if (!response.body.authenticatedSession) {
            this.removeUserFromLocalStorage();
          }

          return response.body.authenticatedSession;
        })
      );   
  }

  dataModelAccess(element) {
    return {
      showEdit: element.availableActions.includes('update'),
      canEditDescription: element.availableActions.includes('editDescription'),
      showNewVersion: element.finalised,
      showFinalise: element.availableActions.includes('finalise'),
      showPermission: element.availableActions.includes('update') || this.isAdmin(),
      showSoftDelete: element.availableActions.includes('softDelete'),
      showPermanentDelete: element.availableActions.includes('delete'),
      canAddAnnotation: element.availableActions.includes('comment'),
      canAddMetadata: element.availableActions.includes('update'),

      canAddLink: element.availableActions.includes('update'),
    };
  }

  termAccess(element) {
    return {
      showEdit: element.availableActions.includes('update') && !element.finalised,
      canEditDescription: element.availableActions.includes('editDescription'),
      showNewVersion: element.availableActions.includes('update') && element.finalised,
      showFinalise: element.availableActions.includes('finalise'),
      showPermission: element.availableActions.includes('update') || this.isAdmin(),
      showDelete: element.availableActions.includes('softDelete') || element.availableActions.includes('delete'),
      showSoftDelete: element.availableActions.includes('softDelete'),
      showPermanentDelete: element.availableActions.includes('delete'),
      canAddAnnotation: element.availableActions.includes('comment'),
      canAddMetadata: element.availableActions.includes('update'),

      canAddLink: element.availableActions.includes('update'),
    };
  }

  dataElementAccess(element) {
    return {
      showEdit: element.availableActions.includes('update'),
      canEditDescription: element.availableActions.includes('editDescription'),
      showDelete: element.availableActions.includes('softDelete') || element.availableActions.includes('delete'),
      showSoftDelete: element.availableActions.includes('softDelete'),
      showPermanentDelete: element.availableActions.includes('delete'),
      canAddAnnotation: element.availableActions.includes('comment'),
      canAddMetadata: element.availableActions.includes('update'),

      canAddLink: element.availableActions.includes('update')
    };
  }

  dataClassAccess(element) {
    return {
      showEdit: element.availableActions.includes('update'),
      canEditDescription: element.availableActions.includes('editDescription'),
      showDelete: element.availableActions.includes('softDelete') || element.availableActions.includes('delete'),
      showSoftDelete: element.availableActions.includes('softDelete'),
      showPermanentDelete: element.availableActions.includes('delete'),
      canAddAnnotation: element.availableActions.includes('comment'),
      canAddMetadata: element.availableActions.includes('update'),
      canAddLink: element.availableActions.includes('update')
    };
  }

  dataTypeAccess(element) {
    return {
      showEdit: element.availableActions.includes('update'),
      canEditDescription: element.availableActions.includes('editDescription'),
      showDelete: element.availableActions.includes('softDelete') || element.availableActions.includes('delete'),
      showSoftDelete: element.availableActions.includes('softDelete'),
      showPermanentDelete: element.availableActions.includes('delete'),
      canAddAnnotation: element.availableActions.includes('comment'),
      canAddMetadata: element.availableActions.includes('update'),

      canAddLink: element.availableActions.includes('update'),
    };
  }

  datFlowAccess(dataFlow) {
    return {
      showEdit: dataFlow.availableActions.includes('update'),
      canAddAnnotation: dataFlow.availableActions.includes('comment'),
      canAddMetadata: dataFlow.availableActions.includes('update')
    };
  }

  elementAccess(element) {
    if (element.domainType === 'DataModel' || element.domainType === 'Terminology' || element.domainType === 'CodeSet' || element.domainType === 'ReferenceDataModel') {
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

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
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService } from './state-handler.service';
import { environment } from '@env/environment';
import { MessageService } from '@mdm/services/message.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import {
  AuthenticatedSessionError,
  SignInError,
  UserDetails
} from './security-handler.model';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  AdminSessionResponse,
  AuthenticatedResponse,
  Finalisable,
  LoginPayload,
  LoginResponse,
  OpenIdConnectLoginPayload,
  PublicOpenIdConnectProvider,
  Securable
} from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';

@Injectable({
  providedIn: 'root'
})
export class SecurityHandlerService {
  loginModalDisplayed = false;
  // tslint:disable-next-line: variable-name
  in_AuthLoginRequiredCheck = false;

  constructor(
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService,
    private messageService: MessageService,
    private broadcast: BroadcastService
  ) { }

  removeUserFromLocalStorage() {
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
      needsToResetPassword: Boolean(
        localStorage.getItem('needsToResetPassword')
      ),
      isAdmin: JSON.parse(localStorage.getItem('isAdmin'))
    };
  }

  getEmailFromStorage() {
    return localStorage.getItem('email');
  }

  loginRequired() {
    if (this.isLoggedIn) {
      this.logout();
    }
    this.stateHandler.Go('appContainer.mainApp.home');
  }

  addToLocalStorage(user) {
    // Keep username for 100 days
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 1);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('token', user.token);
    localStorage.setItem('firstName', user.firstName);
    localStorage.setItem('lastName', user.lastName);
    localStorage.setItem(
      'username',
      JSON.stringify({ username: user.username, expiry: expireDate })
    );
    localStorage.setItem('userId', user.id);
    localStorage.setItem('isAdmin', user.isAdmin);

    localStorage.setItem(
      'email',
      JSON.stringify({ email: user.username, expiry: expireDate })
    );
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
  signIn(credentials: LoginPayload): Observable<UserDetails> {
    // This parameter is very important as we do not want to handle 401 if user credential is rejected on login modal form
    // as if the user credentials are rejected Back end server will return 401, we should not show the login modal form again
    return this.resources.security.login(credentials, { login: true }).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(new SignInError(error))
      ),
      switchMap((signInResponse: LoginResponse) =>
        this.resources.session.isApplicationAdministration().pipe(
          map((adminResponse: AdminSessionResponse) => {
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
        )
      )
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
    this.broadcast.userLoggedOut();
    this.messageService.loggedInChanged(false);
    this.stateHandler.Go('appContainer.mainApp.home');
  }

  /**
   * Authenticate a user by redirecting to an external OpenID Connect provider to initiate authentication.
   *
   * @param provider The OpenID Connect provider to redirect to.
   *
   * @see {@link SecurityHandlerService.authorizeOpenIdConnectSession}
   */
  authenticateWithOpenIdConnect(provider: PublicOpenIdConnectProvider) {
    // Track which provider was used, will be needed once redirected back to Mauro
    localStorage.setItem('openIdConnectProviderId', provider.id);

    const authUrl = new URL(provider.authorizationEndpoint);

    // Set the page URL to come back to once the provider has authenticated the user
    const redirectUri = this.getOpenIdAuthorizeUrl();
    authUrl.searchParams.append('redirect_uri', redirectUri.toString());

    window.open(authUrl.toString(), '_self');
  }

  /**
   * Sign in a user that was authenticated via an OpenID Connect provider.
   *
   * @param params The session state parameters provided by the OpenID Connect provider.
   * @returns An observable to return a `UserDetails` object representing the signed in user.
   * @throws `SignInError` in the observable chain if sign-in failed.
   *
   * @see {@link SecurityHandlerService.authenticateWithOpenIdConnect}
   */
  authorizeOpenIdConnectSession(params: { state: string; sessionState: string; code: string }): Observable<UserDetails> {
    const providerId = localStorage.getItem('openIdConnectProviderId');
    if (!providerId) {
      return throwError('Cannot retrieve OpenID Connect provider identifier.');
    }

    const redirectUri = this.getOpenIdAuthorizeUrl();

    const payload: OpenIdConnectLoginPayload = {
      openidConnectProviderId: providerId,
      state: params.state,
      sessionState: params.sessionState,
      code: params.code,
      redirectUri: redirectUri.toString()
    };

    return this.signIn(payload);
  }

  expireToken() {
    localStorage.removeItem('token');
  }

  isAuthenticated(): Observable<AuthenticatedResponse> {
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

  showIfRoleIsWritable(element: Securable & Finalisable) {
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

    return this.isAuthenticated().pipe(
      catchError((error: AuthenticatedSessionError) => {
        if (error.invalidated) {
          this.removeUserFromLocalStorage();
          return of(true);
        }

        return of(false);
      }),
      map((response: AuthenticatedResponse) => {
        if (!response.body.authenticatedSession) {
          this.removeUserFromLocalStorage();
        }

        return response.body.authenticatedSession;
      })
    );
  }

  elementAccess(element: Securable | (Securable & Finalisable)): Access {
    const baseRtn: Access = {
      showEdit: element.availableActions?.includes('update'),
      canEditDescription: element.availableActions?.includes('editDescription'),
      showFinalise: element.availableActions?.includes('finalise'),
      showPermission: element.availableActions?.includes('update') || this.isAdmin(),
      showSoftDelete: element.availableActions?.includes('softDelete'),
      showPermanentDelete: element.availableActions?.includes('delete'),
      canAddAnnotation: element.availableActions?.includes('comment'),
      canAddMetadata: element.availableActions?.includes('update'),
      showDelete: element.availableActions?.includes('softDelete') || element.availableActions?.includes('delete'),
      canAddLink: element.availableActions?.includes('update'),
      canCreateFolder: element.availableActions?.includes('createFolder'),
      canCreateVersionedFolder: element.availableActions?.includes('createVersionedFolder'),
      canCreateFolderContainer: element.availableActions?.includes('createFolder') || element.availableActions?.includes('createVersionedFolder'),
      canCreateModel: element.availableActions?.includes('createModel'),
      canCreateModelItem: element.availableActions?.includes('createModelItem'),
      canCreate: element.availableActions?.includes('createFolder')
        || element.availableActions?.includes('createVersionedFolder')
        || element.availableActions?.includes('createModel')
        || element.availableActions?.includes('createModelItem'),
      canMoveToFolder: element.availableActions?.includes('moveToFolder'),
      canMoveToVersionedFolder: element.availableActions?.includes('moveToVersionedFolder'),
      canReadAfterFinalised: element.availableActions?.includes('finalisedReadActions'),
      canEditAfterFinalise: element.availableActions?.includes('finalisedEditActions'),
      canMergeInto: element.availableActions?.includes('mergeInto')
    };

    if ((element as Finalisable).finalised !== undefined) {
      const isFinalised = (element as Finalisable).finalised;
      baseRtn.showNewVersion = isFinalised && element.availableActions?.includes('createNewVersions');
    }

    return baseRtn;
  }

  public getOpenIdAuthorizeUrl() {
    // Redirect authorization URL refers to a static page route found in `/src/static-pages`. See the `assets`
    // configuration in `angular.json`.
    //
    // The reason why a static page is used instead of a component route is to avoid the hash location strategy that all
    // component routes use. An Angular component route would include a `#`, which represents a fragment in an absolute URI.
    // URI fragments are not allowed according to [RFC3986] Section 4.3. This was discovered when adding Microsoft
    // Azure Active Directory as an OpenID Connect endpoint.
    //
    // The static page is therefore a landing point so that it can immediately redirect to the correct authentication component
    // route and do the real work.
    const authorizationUrl = '/redirects/open-id-connect-redirect.html';
    const baseUrl = window.location.href.slice(0, window.location.href.indexOf('/#/'));
    return new URL(baseUrl + authorizationUrl);
  }
}

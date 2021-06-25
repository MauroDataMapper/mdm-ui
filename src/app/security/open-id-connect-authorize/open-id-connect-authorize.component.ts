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
import { Component, OnInit } from '@angular/core';
import { BroadcastService, MessageService, SecurityHandlerService } from '@mdm/services';
import { SignInError, SignInErrorType } from '@mdm/services/handlers/security-handler.model';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'mdm-open-id-connect-authorize',
  templateUrl: './open-id-connect-authorize.component.html',
  styleUrls: ['./open-id-connect-authorize.component.scss']
})
export class OpenIdConnectAuthorizeComponent implements OnInit {
  authorizing = true;
  errorMessage: string;

  constructor(
    private securityHandler: SecurityHandlerService,
    private messages: MessageService,
    private broadcast: BroadcastService) { }

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const state = params.get('state');
    const sessionState = params.get('session_state');
    const code = params.get('code');

    this.securityHandler
      .authorizeOpenIdConnectSession({
        state,
        sessionState,
        code
      })
      .pipe(
        catchError((error: SignInError) => {
          switch (error.type) {
            case SignInErrorType.InvalidCredentials:
              this.errorMessage = 'Invalid username or password!';
              break;
            case SignInErrorType.AlreadySignedIn:
              this.errorMessage = 'A user is already signed in, please sign out first.';
              break;
            default:
              this.errorMessage = 'Unable to sign in. Please try again later.';
              break;
          }

          return EMPTY;
        }),
        finalize(() => this.authorizing = false)
      )
      .subscribe(() => {
        this.messages.loggedInChanged(true);
        this.broadcast.userLoggedIn({ nextRoute: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel' });
      });
  }
}

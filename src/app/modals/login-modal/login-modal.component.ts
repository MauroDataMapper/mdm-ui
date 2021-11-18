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
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MatDialogRef } from '@angular/material/dialog';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MessageService } from '@mdm/services/message.service';
import { ValidatorService } from '@mdm/services/validator.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
import { SignInError, SignInErrorType } from '@mdm/services/handlers/security-handler.model';
import { EMPTY } from 'rxjs';
import { MdmHttpHandlerOptions, MdmResourcesService } from '@mdm/modules/resources';
import { PublicOpenIdConnectProvider, PublicOpenIdConnectProvidersIndexResponse } from '@maurodatamapper/mdm-resources';
import { MessageHandlerService, SharedService } from '@mdm/services';

@Component({
  selector: 'mdm-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit {
  message = '';
  authenticating = false;

  signInForm!: FormGroup;

  openIdConnectProviders?: PublicOpenIdConnectProvider[];

  constructor(
    private broadcast: BroadcastService,
    public dialogRef: MatDialogRef<LoginModalComponent>,
    private securityHandler: SecurityHandlerService,
    private messageService: MessageService,
    private validator: ValidatorService,
    private resources: MdmResourcesService,
    private shared: SharedService,
    private messageHandler: MessageHandlerService) { }

  get userName() {
    return this.signInForm.get('userName');
  }

  get password() {
    return this.signInForm.get('password');
  }


  ngOnInit() {
    this.signInForm = new FormGroup({
      userName: new FormControl('', [
        Validators.required,  // eslint-disable-line @typescript-eslint/unbound-method
        Validators.pattern(this.validator.emailPattern)
      ]),
      password: new FormControl('', [
        Validators.required // eslint-disable-line @typescript-eslint/unbound-method
      ])
    });

    if (this.shared.features.useOpenIdConnect) {
      // If unable to get OpenID Connect providers, silently fail and ignore
      const requestOptions: MdmHttpHandlerOptions = {
        handleGetErrors: false
      };

      this.resources.pluginOpenIdConnect
        .listPublic({}, requestOptions)
        .pipe(
          catchError(() => EMPTY)
        )
        .subscribe((response: PublicOpenIdConnectProvidersIndexResponse) => {
          this.openIdConnectProviders = response.body;
        });
    }
  }

  login() {
    this.message = '';

    if (this.signInForm.invalid) {
      return;
    }

    this.authenticating = true;
    this.signInForm.disable();

    this.securityHandler
      .signIn({
        username: this.userName?.value,
        password: this.password?.value
      })
      .pipe(
        catchError((error: SignInError) => {
          switch (error.type) {
            case SignInErrorType.InvalidCredentials:
              this.message = 'Invalid username or password!';
              break;
            case SignInErrorType.AlreadySignedIn:
              this.message = 'A user is already signed in, please sign out first.';
              break;
            default:
              this.message = 'Unable to sign in. Please try again later.';
              break;
          }

          return EMPTY;
        }),
        finalize(() => {
          this.authenticating = false;
          this.signInForm.enable();
        })
      )
      .subscribe(user => {
        this.dialogRef.close(user);
        this.securityHandler.loginModalDisplayed = false;
        this.messageService.loggedInChanged(true);
      });
  }

  forgotPassword() {
    this.dialogRef.close();
    this.broadcast.dispatch('openForgotPasswordModalDialog');
  }

  signUp() {
    this.dialogRef.close();
    this.broadcast.dispatch('openRegisterModalDialog');
  }

  close() {
    this.securityHandler.loginModalDisplayed = false;
    this.dialogRef.close();
  }

  authenticateWithOpenIdConnect(provider: PublicOpenIdConnectProvider) {
    if (!provider.authorizationEndpoint) {
      this.messageHandler.showError(`Unable to authenticate with ${provider.label} because of a missing endpoint. Please contact your administrator for further support.`);
      return;
    }

    this.securityHandler.authenticateWithOpenIdConnect(provider);
  }
}

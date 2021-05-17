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
import { Title } from '@angular/platform-browser';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateService } from '@uirouter/core';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'mdm-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  errors: any;
  confirmed = false;
  processing = false;
  message: string;
  user = {
    password: '',
    confirmPassword: ''
  };
  uid: any;
  token: any;

  constructor(
    private title: Title,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private stateService: StateService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.title.setTitle('Reset Password');
    // tslint:disable-next-line: deprecation
    this.uid = this.stateService.params.uid;
    // tslint:disable-next-line: deprecation
    this.token = this.stateService.params.token;

    if (!this.uid || !this.token || this.sharedService.isLoggedIn()) {
      this.stateHandler.Go('home');
    }
  }

  validate = () => {
    this.errors = null;
    let isValid = true;

    if (this.user.password.trim().length < 4) {
      this.errors.password = 'Password must be at least 4 characters long!';
      isValid = false;
    }
    if (this.user.password.trim() !== this.user.confirmPassword.trim()) {
      this.errors.password = ' ';
      this.errors.confirmPassword = 'These passwords don\'t match';
      isValid = false;
    }
    if (isValid) {
      delete this.errors;
    }
    return isValid;
  };

  cancel = () => {
    this.stateHandler.Go('home');
  };

  save = () => {
    if (!this.validate()) {
      return;
    }

    const resource = {
      newPassword: this.user.password.trim(),
      resetToken: this.token
    };

    this.processing = true;

    this.resources.catalogueUser.resetPassword(this.uid, resource).subscribe(() => {
      this.message = 'success';
      this.stateHandler.Go('home');
    }, response => {
      this.message = response.error.errors[0].message;
      this.processing = false;
      this.confirmed = false;
    });
  };
}

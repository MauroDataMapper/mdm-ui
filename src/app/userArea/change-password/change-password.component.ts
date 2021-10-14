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
import { Component, OnInit, ViewChild } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UserDetailsResult } from '@mdm/model/userDetailsModel';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { environment } from '@env/environment';
import { Title } from '@angular/platform-browser';
import { StateHandlerService } from '@mdm/services';

@Component({
  selector: 'mdm-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.sass']
})
export class ChangePasswordComponent implements OnInit {
  @ViewChild('changePasswordForm', { static: false }) changePasswordForm;
  user: UserDetailsResult;
  currentUser: any;
  oldPassword: string;
  newPassword: string;
  confirm: string;
  message: string;
  afterSave: (result: { body: { id: any } }) => void;

  backendUrl: string = environment.apiEndpoint;

  constructor(
    private resourcesService: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private title: Title
    ) {
    this.currentUser = this.securityHandler.getCurrentUser();
    this.newPassword = '';
    this.oldPassword = '';
    this.confirm = '';
    this.message = '';
  }

  ngOnInit() {
    this.title.setTitle('Change password');
  }

  disabled = () => {
    return this.newPassword !== this.confirm || this.newPassword === this.oldPassword || this.newPassword === '' || this.oldPassword === '';
  };

  changePassword = () => {
    const body = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };

    this.resourcesService.catalogueUser.changePassword(this.currentUser.id, body).subscribe(() => {
        this.messageHandler.showSuccess('Password updated successfully.');
        this.stateHandler.Go('appContainer.userArea.profile');
      }, error => {
        this.message = `Error : ${error.error.errors[0].message}`;
    });
  };
}

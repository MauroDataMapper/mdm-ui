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
import {Component, OnInit} from '@angular/core';
import {SecurityHandlerService} from '@mdm/services/handlers/security-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import {MatDialogRef} from '@angular/material/dialog';
import { BroadcastService } from '@mdm/services/broadcast.service';

@Component({
  selector: 'mdm-forgot-password-modal',
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.sass']
})
export class ForgotPasswordModalComponent implements OnInit {
  username: string;
  message: string;

  constructor(
    public broadcast: BroadcastService,
    public dialogRef: MatDialogRef<ForgotPasswordModalComponent>,
    private securityHandler: SecurityHandlerService,
    private resources: MdmResourcesService) {}

  ngOnInit() {
    this.username = this.securityHandler.getEmailFromStorage();
  }

  resetPassword() {
    this.resources.catalogueUser.resetPasswordLink(this.username).subscribe(() => {
        this.message = 'success';
        this.dialogRef.close(this.username);
      }, () => {
        this.message = 'error';
    });
  }

  login() {
    this.dialogRef.close();
    this.broadcast.dispatch('openLoginModalDialog');
  }
  close = () => {
    this.securityHandler.loginModalDisplayed = false;
    this.dialogRef.close();
  };
}

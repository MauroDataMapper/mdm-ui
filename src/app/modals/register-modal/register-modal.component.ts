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
import { MdmResourcesService } from '@mdm/modules/resources';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.sass']
})
export class RegisterModalComponent implements OnInit {
  email: any;
  firstName: any;
  lastName: any;
  organisation: any;
  roleInOrganisation: any;
  password: any;
  confirmPassword: any;
  message: any;

  constructor(
    public broadcast: BroadcastService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<RegisterModalComponent>,
    private resources: MdmResourcesService,
    private editingService: EditingService) {}

  ngOnInit() {
    this.email = '';
    this.firstName = '';
    this.lastName = '';
    this.organisation = '';
    this.roleInOrganisation = '';
    this.password = '';
    this.confirmPassword = '';
  }

  register() {
    const resource = {
      emailAddress: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      organisation: this.organisation,
      roleInOrganisation: this.roleInOrganisation,
      password: this.password,
      confirmPassword: this.confirmPassword
    };

    this.resources.catalogueUser.save(resource).subscribe(() => {
        this.dialogRef.close();
        this.registerSuccess();
      },
      error => {
        let firstError: string = error.error.errors[0].message;

        if (firstError.indexOf('Property [emailAddress] of class [class ox.softeng.metadatacatalogue.core.user.CatalogueUser] with value') >= 0 && firstError.indexOf('must be unique') >= 0) {
          firstError = `The email address ${this.email} has already been registered.`;
        }
        this.message = 'Error in registration: ' + firstError;
      }
    );
  }

  registerSuccess() {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Registration successful',
          message: `<p class="marginless">You have successfully requested access to the Mauro Data Mapper. </p>
                    <p class="marginless">You will receive an email (to ${this.email}) containing your login details </p>
                    <p class="marginless">once an administrator has approved your request.</p>`,
          cancelShown: false,
          okBtnTitle: 'Close modal',
          btnType: 'warn',
        }
      })
      .subscribe(() => { /* TODO */ });
  }

  login() {
    this.dialogRef.close();
    this.broadcast.dispatch('openLoginModalDialog');
  }

  close() {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (confirm) {
        this.dialogRef.close();
      }
    });
  }
}

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
import { Title } from '@angular/platform-browser';
import { ROLES } from '@mdm/constants/roles';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { StateService } from '@uirouter/core';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { ValidatorService } from '@mdm/services/validator.service';
import { GridService } from '@mdm/services/grid.service';
import { EditingService } from '@mdm/services/editing.service';
import { Uuid } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  id: Uuid;
  result = [];
  allGroups = [];
  selectedGroups = [];
  errors = {
    id: null,
    emailAddress: '',
    firstName: '',
    lastName: '',
    organisation: '',
    jobTitle: '',
    userRole: 'EDITOR',
    groups: []
  };
  user = {
    id: null,
    emailAddress: '',
    firstName: '',
    lastName: '',
    organisation: '',
    jobTitle: '',
    userRole: 'EDITOR',
    groups: []
  };

  roles: any[];

  constructor(
    private role: ROLES,
    private title: Title,
    private resourcesService: MdmResourcesService,
    private stateSvc: StateService,
    private messageHandler: MessageHandlerService,
    private validator: ValidatorService,
    private stateHandler: StateHandlerService,
    private gridService: GridService,
    private editingService: EditingService) { }

  ngOnInit() {
    this.editingService.start();
    this.title.setTitle('Admin - Add User');
    this.roles = this.role.notPendingArray;

    // tslint:disable-next-line: deprecation
    this.id = this.stateSvc.params.id;

    if (this.id) {
      this.resourcesService.catalogueUser.get(this.id).subscribe(res => {
        const user = res.body;
        this.user = user;
        this.title.setTitle('Admin - Edit User');

          if (this.user.groups) {
            for (const val of this.user.groups) {
              this.selectedGroups.push(val.id);
            }
          }
      });
    }


    const options = this.gridService.constructOptions(null, null, 'name', 'asc');
    options['all'] = true;

    this.resourcesService.userGroups.list(options).subscribe(res => {
      this.allGroups = res.body.items;
    }, error => {
      this.messageHandler.showError('There was a problem getting the group list', error);
    }
    );
  }
  validateEmail = () => {
    let isValid = true;
    if (!this.user.emailAddress.trim().length) {
      this.errors.emailAddress = 'Email can\'t be empty!';
      isValid = false;
    }

    if (isValid) {
      const parts = this.user.emailAddress.split('@');
      const username = parts[0];
      const delimiters = ['.', '-', '_'];
      let fname = '';
      let lname = '';

      delimiters.forEach((key) => {
        const partsName = username.replace(/\d+/g, '');
        const num = partsName.indexOf(key);
        if (num > -1) {
          fname = partsName.substring(0, (num));
          lname = partsName.substring(num + 1, (partsName.length));

          fname = fname.toLowerCase();
          lname = lname.toLowerCase();

          fname = fname.charAt(0).toUpperCase() + fname.slice(1);
          lname = lname.charAt(0).toUpperCase() + lname.slice(1);
        }
      });
      this.user.lastName = lname;
      this.user.firstName = fname;
    }
  };


  validate = () => {
    let isValid = true;
    if (!this.user.emailAddress.trim().length) {
      this.errors.emailAddress = 'Email can\'t be empty!';
      isValid = false;
    }

    if (this.user.emailAddress && !this.validator.validateEmail(this.user.emailAddress)) {
      this.errors.emailAddress = 'Invalid Email';
      isValid = false;
    }

    if (!this.user.firstName.trim().length) {
      this.errors.firstName = 'First Name can\'t be empty!';
      isValid = false;
    }
    if (!this.user.lastName.trim().length) {
      this.errors.lastName = 'Last Name can\'t be empty!';
      isValid = false;
    }
    if (isValid) {
      delete this.errors;
    }
    return isValid;
  };

  save = () => {
    if (this.validate()) {
      const resource = {
        emailAddress: this.user.emailAddress,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        organisation: this.user.organisation,
        jobTitle: this.user.jobTitle,
        groups: this.user.groups || []
      };
      // it's in edit mode
      if (this.user.id) {
        // it's in edit mode (update)
        this.resourcesService.catalogueUser.update(this.user.id as Uuid, resource).subscribe(() => {
        this.messageHandler.showSuccess('User updated successfully.');
        this.navigateToParent();
        }, error => {
        this.messageHandler.showError('There was a problem updating the user.', error);
      });
    } else {
      // it's in new mode (create)
        this.resourcesService.catalogueUser.adminRegister(resource).subscribe(() => {
          this.messageHandler.showSuccess('User saved successfully.');
          this.navigateToParent();
        },
          error => {
            this.messageHandler.showError('There was a problem saving the user.', error);
          });
      }
    }
  };

  cancel = () => {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (confirm) {
        this.navigateToParent();
      }
    });
  };

  onGroupSelect = (groups) => {
    this.user.groups = [];
    for (const val of this.allGroups) {
      if (groups.value.includes(val.id)) {
        this.user.groups.push(
          val.id
          // label: val.label
        );
      }
    }
  };

  private navigateToParent() {
    this.editingService.stop();
    this.stateHandler.Go('admin.users');
  }
}

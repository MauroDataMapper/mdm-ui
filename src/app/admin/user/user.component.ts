import { Component, OnInit } from '@angular/core';
import { ResourcesService } from '@mdm/services/resources.service';
import { Title } from '@angular/platform-browser';
import { ROLES } from '@mdm/constants/roles';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { StateService } from '@uirouter/core';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { ValidatorService } from '@mdm/services/validator.service';

@Component({
  selector: 'mdm-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  id: any;
  result = [];
  allGroups = [];
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
    private resourcesService: ResourcesService,
    private stateSvc: StateService,
    private messageHandler: MessageHandlerService,
    private validator: ValidatorService,
    private stateHandler: StateHandlerService
  ) {}

  ngOnInit() {
    this.title.setTitle('Admin - Add User');
    this.roles = this.role.notPendingArray;

    this.id = this.stateSvc.params.id;

    if (this.id) {
      this.resourcesService.catalogueUser.get(this.id, null, null).subscribe(res => {
          const user = res.body;
          this.user = user;
          this.title.setTitle('Admin - Edit User');
        });
    }

    const limit = 0;
    const offset = 0;
    const options = {
      pageSize: limit,
      pageIndex: offset,
      filters: null,
      // sortBy: "label",
      sortType: 'asc'
    };

    this.resourcesService.userGroup.get(null, null, options).subscribe(res => {
        this.allGroups = res.body.items;
      },
      error => {
        this.messageHandler.showError('There was a problem getting the group list', error);
      }
    );
  }

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
    if (!this.user.userRole.trim().length) {
      this.errors.userRole = 'Role can\'t be empty!';
      isValid = false;
    }
    if (isValid) {
      delete this.errors;
    }
    return isValid;
  };

  save = () => {
    if (!this.validate()) {
      return;
    }
    const resource = {
      emailAddress: this.user.emailAddress,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      organisation: this.user.organisation,
      jobTitle: this.user.jobTitle,
      userRole: this.user.userRole,
      groups: this.user.groups || []
    };
    // it's in edit mode
    if (this.user.id) {
      // it's in edit mode (update)
      this.resourcesService.catalogueUser.put(this.user.id, null, { resource }).subscribe(() => {
          this.messageHandler.showSuccess('User updated successfully.');
          this.stateHandler.Go('admin.users');
        },
        error => {
          this.messageHandler.showError('There was a problem updating the user.', error);
      });
    } else {
      // it's in new mode (create)
      this.resourcesService.catalogueUser.post(null, 'adminRegister', { resource }).subscribe(() => {
          this.messageHandler.showSuccess('User saved successfully.');
          this.stateHandler.Go('admin.users');
        },
        error => {
          this.messageHandler.showError('There was a problem saving the user.', error);
      });
    }
  };

  cancel = () => {
    this.stateHandler.Go('admin.users');
  };

  onGroupSelect = groups => {
    this.user.groups = groups.map(group => {
      return { id: group.id, label: group.label };
    });
  }
}

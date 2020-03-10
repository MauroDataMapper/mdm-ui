import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StateHandlerService } from '../../services/handlers/state-handler.service';
import { ResourcesService } from '../../services/resources.service';
import { StateService } from '@uirouter/core';
import { MessageHandlerService } from '../../services/utility/message-handler.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  errors: any;
  group = {
    label: '',
    description: '',
    groupMembers: {},
    id: ''
  };

  constructor(
    private messageHandler: MessageHandlerService,
    private title: Title,
    private stateHandler: StateHandlerService,
    private stateService: StateService,
    private resources: ResourcesService
  ) {}

  ngOnInit() {
    this.title.setTitle('Admin - Group');
    const id = this.stateService.params.id;
    if (id) {
      this.resources.userGroup.get(id).subscribe(result => {
        const group = result.body;
        this.group = group;
        this.group.groupMembers = group.groupMembers || [];
        this.title.setTitle('Admin - Edit Group');
      });
    }
  }

  validate = () => {
    let isValid = true;
    this.errors = [];
    if (this.group.label.trim().length === 0) {
      this.errors.label = 'Name can\'t be empty!';
      isValid = false;
    }
    if (isValid) {
      delete this.errors;
    }
    return isValid;
  }

  save = () => {
    if (!this.validate()) {
      return;
    }
    // it's in edit mode
    if (this.group.id) {
      // it's in edit mode (update)
      this.resources.userGroup
        .put(this.group.id, null, { resource: this.group })
        .subscribe(
          () => {
            this.messageHandler.showSuccess('Group updated successfully.');
            this.stateHandler.Go('admin.groups');
          },
          error => {
            this.messageHandler.showError(
              'There was a problem updating the group.',
              error
            );
          }
        );
    } else {
      // it's in new mode (create)
      this.resources.userGroup
        .post(null, null, { resource: this.group })
        .subscribe(
          () => {
            this.messageHandler.showSuccess('Group saved successfully.');
            this.stateHandler.Go('admin.groups');
          },
          error => {
            this.messageHandler.showError(
              'There was a problem saving the group.',
              error
            );
          }
        );
    }
  }

  cancel = () => {
    this.stateHandler.Go('admin.groups');
  }
}

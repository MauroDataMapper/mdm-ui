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
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateService } from '@uirouter/core';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { EditingService } from '@mdm/services/editing.service';
import { Uuid } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  errors: any;
  group = {
    name: '',
    description: '',
    groupMembers: [],
    id: ''
  };
  groupId: Uuid;

  constructor(
    private messageHandler: MessageHandlerService,
    private title: Title,
    private stateHandler: StateHandlerService,
    private stateService: StateService,
    private resources: MdmResourcesService,
    private editingService: EditingService) { }

  ngOnInit() {
    this.editingService.start();
    // tslint:disable-next-line: deprecation
    this.groupId = this.stateService.params.id;
    if (this.groupId) {
      this.title.setTitle('Group - Edit Group');
      this.resources.userGroups.get(this.groupId).subscribe(result => {
        this.group = result.body;
      });
      this.resources.catalogueUser.listInUserGroup(this.groupId).subscribe(result => {
        this.group.groupMembers = result.body.items || [];
      });
    } else {
      this.title.setTitle('Group - Add Group');
    }
  }

  onUpdateGroupMembers = groupMembers => { // triggered when the Members table is updated
    this.group.groupMembers = groupMembers;
  };

  validate = () => {
    let isValid = true;
    this.errors = [];
    if (this.group.name.trim().length === 0) {
      this.errors.name = 'Name can\'t be empty!';
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

    if (this.group.id) { // it's in edit mode (update)
      this.resources.userGroups.update(this.group.id, this.group).subscribe(() => {
        this.messageHandler.showSuccess('Group updated successfully.');
        this.navigateToParent();
      }, error => {
        this.messageHandler.showError('There was a problem updating the group.', error);
      });
    } else { // it's in new mode (create)
      this.resources.userGroups.save(this.group).subscribe(() => {
        this.messageHandler.showSuccess('Group saved successfully.');
        this.navigateToParent();
      }, error => {
        this.messageHandler.showError('There was a problem saving the group.', error);
      });
    }
  };

  cancel = () => {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (confirm) {
        this.navigateToParent();
      }
    });
  };

  private navigateToParent() {
    this.editingService.stop();
    this.stateHandler.Go('admin.groups');
  }
}

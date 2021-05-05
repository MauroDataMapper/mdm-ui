/*
Copyright 2020 University of Oxford

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
import { MdmResourcesService } from '@mdm/modules/resources';
import { Editable, FolderResult } from '../model/folderModel';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UIRouterGlobals } from '@uirouter/core';
import { MessageService } from '../services/message.service';
import { Subscription } from 'rxjs';
import { SharedService } from '../services/shared.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { ProfileBaseComponent } from '@mdm/profile-base/profile-base.component';
import { BroadcastService, MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import { MatDialog } from '@angular/material/dialog';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css'],
})
export class FolderComponent extends ProfileBaseComponent implements OnInit, OnDestroy {

  readonly domainType = 'folders';

  folder: FolderResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  editableForm: Editable;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  activeTab: any;
  showExtraTabs = false;
  showEdit = false;
  showDelete = false;
  showEditDescription = false;
  historyItemCount = 0;
  isLoadingHistory = true;
  rulesItemCount = 0;
  isLoadingRules = true;
  access: any;

  constructor(
    private resources: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private broadcastSvc: BroadcastService,
    private title: Title,
    dialog: MatDialog,
    editingService: EditingService,
    messageHandler: MessageHandlerService
  ) {
    super(resources, dialog, editingService, messageHandler);
  }

  ngOnInit() {
    if (this.isGuid(this.uiRouterGlobals.params.id) && !this.uiRouterGlobals.params.id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (this.uiRouterGlobals.params.edit === 'true') {
      this.editMode = true;
    }
    this.title.setTitle('Folder');
    this.showExtraTabs = this.sharedService.isLoggedIn();

    this.editableForm = new Editable();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    this.editableForm.show = () => {
      this.setEditableForm();
      this.editingService.start();
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editingService.stop();
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.setEditableForm();
    };

    this.folderDetails(this.uiRouterGlobals.params.id);
    this.subscription = this.messageService.changeUserGroupAccess.subscribe((message: boolean) => {
      this.showSecuritySection = message;
    });
    this.subscription = this.messageService.changeSearch.subscribe((message: boolean) => {
      this.showSearch = message;
    });
    this.afterSave = (result: { body: { id: any } }) => this.folderDetails(result.body.id);

    this.activeTab = this.getTabDetailByName(this.uiRouterGlobals.params.tabView);
  }

  folderDetails(id: string) {
    this.resources.folder.get(id).subscribe((result: { body: FolderResult }) => {
      this.folder = result.body;
      this.catalogueItem = this.folder;

      this.parentId = this.folder.id;

      this.access = this.securityHandler.elementAccess(this.folder);
      this.showEdit = this.access.showEdit;
      this.showDelete = this.access.showPermanentDelete || this.access.showSoftDelete;

      if (this.sharedService.isLoggedIn(true)) {
        this.folderPermissions(id);
      } else {
        this.messageService.FolderSendMessage(this.folder);
        this.messageService.dataChanged(this.folder);
      }
    });
  }

  folderPermissions(id: any) {
    this.resources.security.permissions('folders', id).subscribe((permissions: { body: { [x: string]: any } }) => {
      Object.keys(permissions.body).forEach((attrname) => {
        this.folder[attrname] = permissions.body[attrname];
      });
      // Send it to message service to receive in child components
      this.messageService.FolderSendMessage(this.folder);
      this.messageService.dataChanged(this.folder);
    });
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  ngOnDestroy() {
    if (this.subscription) {
      // unsubscribe to ensure no memory leaks
      this.subscription.unsubscribe();
    }
  }

  tabSelected(itemsName) {
    const tab = this.getTabDetail(itemsName);
    this.stateHandler.Go(
      'folder',
      { tabView: tab.name },
      { notify: false, location: tab.index !== 0 }
    );
  }

  getTabDetail(tabIndex) {
    switch (tabIndex) {
      case 0:
        return { index: 0, name: 'access' };
      case 1:
        return { index: 1, name: 'history' };
      default:
        return { index: 0, name: 'access' };
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'access':
        return { index: 0, name: 'access' };
      case 'history':
        return { index: 1, name: 'history' };
      default:
        return { index: 0, name: 'access' };
    }
  }

  setEditableForm() {
    this.editableForm.description = this.folder.description;
  }

  showDescription() {
    this.editingService.start();
    this.showEditDescription = true;
    this.editableForm.show();
  };

  edit() {
    this.showEditDescription = false;
    this.editableForm.show();
  };

  onCancelEdit() {
    if (this.folder) {
      this.showEditDescription = false;
    }
  };

  formBeforeSave() {
    let resource: any = {};
    this.editingService.stop();

    if (!this.showEditDescription) {
      resource = {
        id: this.folder.id,
        label: this.editableForm.label,
        description: this.editableForm.description,
        domainType: this.folder.domainType
      };
    }
    else {
      resource = {
        id: this.folder.id,
        description: this.editableForm.description || ''
      };
    }

    this.resourcesService.folder.update(resource.id, resource).subscribe(
      (res) => {
        this.folder = res.body;        

        this.editableForm.visible = false;
        this.editingService.stop();

        this.messageHandler.showSuccess('Folder updated successfully.');
        this.broadcastSvc.broadcast('$reloadFoldersTree');
      },
      (error) => {
        this.messageHandler.showError(
          'There was a problem updating the folder.',
          error
        );
      }
    );
  }

  historyCountEmitter($event) {
    this.isLoadingHistory = false;
    this.historyItemCount = $event;
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }
}



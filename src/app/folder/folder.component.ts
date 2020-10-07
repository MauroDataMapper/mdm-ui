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
import { FolderResult } from '../model/folderModel';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateService } from '@uirouter/core';
import { MessageService } from '../services/message.service';
import { Subscription } from 'rxjs';
import { SharedService } from '../services/shared.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css'],
})
export class FolderComponent implements OnInit, OnDestroy {
  result: FolderResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  activeTab: any;

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private title: Title
  ) { }

  ngOnInit() {
    // tslint:disable-next-line: deprecation
    if (!this.stateService.params.id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    // tslint:disable-next-line: deprecation
    if (this.stateService.params.edit === 'true') {
      this.editMode = true;
    }
    this.title.setTitle(`Folder`);
    // tslint:disable-next-line: deprecation
    this.folderDetails(this.stateService.params.id);
    this.subscription = this.messageService.changeUserGroupAccess.subscribe((message: boolean) => {
      this.showSecuritySection = message;
    });
    this.subscription = this.messageService.changeSearch.subscribe((message: boolean) => {
      this.showSearch = message;
    });
    this.afterSave = (result: { body: { id: any } }) => this.folderDetails(result.body.id);

    // tslint:disable-next-line: deprecation
    this.activeTab = this.getTabDetailByName(this.stateService.params.tabView);
  }

  folderDetails(id: any) {
    this.resourcesService.folder.get(id).subscribe((result: { body: FolderResult }) => {
      this.result = result.body;

      this.parentId = this.result.id;
      if (this.sharedService.isLoggedIn(true)) {
        this.folderPermissions(id);
      } else {
        this.messageService.FolderSendMessage(this.result);
        this.messageService.dataChanged(this.result);
      }
    });
  }

  folderPermissions(id: any) {
    this.resourcesService.security.permissions('folders', id).subscribe((permissions: { body: { [x: string]: any } }) => {
      Object.keys(permissions.body).forEach((attrname) => {
        this.result[attrname] = permissions.body[attrname];
      });
      // Send it to message service to receive in child components
      this.messageService.FolderSendMessage(this.result);
      this.messageService.dataChanged(this.result);
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
}



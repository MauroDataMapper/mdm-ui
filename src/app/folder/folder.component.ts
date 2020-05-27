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
import {ResourcesService} from '../services/resources.service';
import {FolderResult} from '../model/folderModel';
import {Component, OnInit, Input, EventEmitter, Output, Inject, OnDestroy} from '@angular/core';
import {StateService} from '@uirouter/core';
import {MessageService} from '../services/message.service';
import {Subscription} from 'rxjs';
import {SharedService} from '../services/shared.service';
import {ToastrService} from 'ngx-toastr';
import {StateHandlerService} from '../services/handlers/state-handler.service';

@Component({
  selector: 'mdm-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css']
})
export class FolderComponent implements OnInit, OnDestroy {
  result: FolderResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any; }; }) => void;
  editMode = false;
  activeTab: any;

  constructor(private resourcesService: ResourcesService, private messageService: MessageService, private sharedService: SharedService, private stateService: StateService, private stateHandler: StateHandlerService) {
    // this.toaster.success('toast test');
  }

  ngOnInit() {

    if (!this.stateService.params.id) {
      this.stateHandler.NotFound({location: false});
      return;
    }

    if (this.stateService.params.edit === 'true') {
      this.editMode = true;
    }

    // if(this.stateService.params.edit === "true"){ //Call this if using message service.
    //     // this.editMode = true;
    //     this.messageService.showEditMode(true);
    // }
    // else
    //     this.messageService.showEditMode(false);
    window.document.title = 'Folder';
    this.folderDetails(this.stateService.params.id);
    this.subscription = this.messageService.changeUserGroupAccess.subscribe((message: boolean) => {
      this.showSecuritySection = message;
    });
    this.subscription = this.messageService.changeSearch.subscribe((message: boolean) => {
      this.showSearch = message;
    });
    this.afterSave = (result: { body: { id: any; }; }) => this.folderDetails(result.body.id);

    this.activeTab = this.getTabDetailByName(this.stateService.params.tabView);
  }

  folderDetails(id: any) {
    this.resourcesService.folder.get(id, null, null).subscribe((result: { body: FolderResult; }) => {
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
    this.resourcesService.folder.get(id, 'permissions', null).subscribe((permissions: { body: { [x: string]: any; }; }) => {
      Object.keys(permissions.body).forEach(attrname => {
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

  // Use this if we want to Make API call from resource file & child component read from the resource file too
  //     FolderGet():any { //NG
  //         this.resourcesService.FoldersGet();
  //     }
  //     function getTabDetail(tabName) { TODO, check if we need to add Tab from tabView from stateService.
  //         switch (tabName) {
  //             case 'access': 	 return {index:0, name:'access'};
  //             case 'history':  return {index:1, name:'history'};
  //             default: 		 return {index:0, name:'access'};
  //         }
  //     }

  ngOnDestroy() {
    if (this.subscription) {
      // unsubscribe to ensure no memory leaks
      this.subscription.unsubscribe();
    }
  }

  tabSelected(itemsName) {
    const tab = this.getTabDetail(itemsName);
    this.stateHandler.Go('folder', {tabView: tab.name}, {notify: false, location: tab.index !== 0});
  }

  getTabDetail(tabIndex) {

    switch (tabIndex) {
      case 0:
        return {index: 0, name: 'access'};
      case 1:
        return {index: 1, name: 'history'};
      default:
        return {index: 0, name: 'access'};
    }
  }

  getTabDetailByName(tabName) {

    switch (tabName) {
      case 'access':
        return {index: 0, name: 'access'};
      case 'history':
        return {index: 1, name: 'history'};
      default:
        return {index: 0, name: 'access'};
    }
  }
}



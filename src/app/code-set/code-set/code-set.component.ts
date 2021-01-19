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
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { CodeSetResult } from '@mdm/model/codeSetModel';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-code-set',
  templateUrl: './code-set.component.html',
  styleUrls: ['./code-set.component.scss'],
})
export class CodeSetComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  codeSetModel: CodeSetResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  editMode = false;
  showExtraTabs = false;
  activeTab: any;
  dataModel4Diagram: any;
  cells: any;
  rootCell: any;
  semanticLinks: any[] = [];

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private title: Title,
    private editingService: EditingService) { }  

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
    // tslint:disable-next-line: deprecation
    this.parentId = this.stateService.params.id;

    this.title.setTitle('Code Set');
    this.codeSetDetails(this.parentId);

    this.subscription = this.messageService.changeSearch.subscribe((message: boolean) => {
      this.showSearch = message;
    });
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  codeSetDetails(id: any) {
    let arr = [];
    this.resourcesService.codeSet.get(id).subscribe(async (result: { body: CodeSetResult }) => {

      // Get the guid
      this.codeSetModel = result.body;
      // this.parentId = this.codeSetModel.id;

      await this.resourcesService.versionLink.list('codeSets', this.codeSetModel.id).subscribe(response => {
        if (response.body.count > 0) {
          arr = response.body.items;
          for (const val in arr) {
            if (this.codeSetModel.id !== arr[val].targetModel.id) {
              this.semanticLinks.push(arr[val]);
            }
          }
        }
      });


      this.showExtraTabs = !this.sharedService.isLoggedIn() || !this.codeSetModel.editable || this.codeSetModel.finalised;
      if (this.sharedService.isLoggedIn(true)) {
        this.CodeSetPermissions(this.parentId);
      } else {
        this.messageService.FolderSendMessage(this.codeSetModel);
        this.messageService.dataChanged(this.codeSetModel);
      }

      this.tabGroup.realignInkBar();
      // tslint:disable-next-line: deprecation
      this.activeTab = this.getTabDetailByName(this.stateService.params.tabView).index;
      this.tabSelected(this.activeTab);
    });
  }

  CodeSetPermissions(id: any) {
    this.resourcesService.security.permissions('codeSets', id).subscribe((permissions: { body: { [x: string]: any } }) => {
      Object.keys(permissions.body).forEach((attrname) => {
        this.codeSetModel[attrname] = permissions.body[attrname];
      });
      // Send it to message service to receive in child components
      this.messageService.FolderSendMessage(this.codeSetModel);
      this.messageService.dataChanged(this.codeSetModel);
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

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'terminology':
        return { index: 0, name: 'terminology' };
      case 'properties':
        return { index: 1, name: 'properties' };
      case 'comments':
        return { index: 2, name: 'comments' };
      case 'history':
        return { index: 3, name: 'history' };
      case 'links':
        return { index: 4, name: 'links' };
      case 'attachments':
        return { index: 5, name: 'attachments' };
      default:
        return { index: 0, name: 'terminology' };
    }
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'terminology' };
      case 1:
        return { index: 1, name: 'properties' };
      case 2:
        return { index: 2, name: 'comments' };
      case 3:
        return { index: 3, name: 'history' };
      case 4:
        return { index: 4, name: 'links' };
      case 5:
        return { index: 5, name: 'attachments' };
      default:
        return { index: 0, name: 'terminology' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go(
      'codeSet',
      { tabView: tab.name },
      { notify: false, location: tab.index !== 0 }
    );
    this.activeTab = tab.index;
  }
}

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

import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { ReferenceModelResult } from '@mdm/model/referenceModelModel';
import { Subscription } from 'rxjs/internal/Subscription';
import { MatTabGroup } from '@angular/material/tabs';
import { SharedService } from '@mdm/services/shared.service';
import { MessageService } from '@mdm/services/message.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-reference-data',
  templateUrl: './reference-data.component.html',
  styleUrls: ['./reference-data.component.scss']
})
export class ReferenceDataComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  referenceModel: ReferenceModelResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  parentId: string;
  isEditable: boolean;
  showExtraTabs = false;
  activeTab: any;
  semanticLinks: any[] = [];

  constructor(private resourcesService: MdmResourcesService,
              private sharedService: SharedService,
              private messageService: MessageService,
              private stateService: StateService,
              private stateHandler: StateHandlerService,
              private title: Title,
              private editingService: EditingService) { }  

  ngOnInit(): void {
    // tslint:disable-next-line: deprecation
    this.parentId = this.stateService.params.id;
    if (!this.parentId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.showExtraTabs = this.sharedService.isLoggedIn();
    this.title.setTitle('Reference Data Model');

    // tslint:disable-next-line: deprecation
    this.referenceModelDetails(this.parentId);
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  referenceModelDetails(id: any) {
    this.resourcesService.referenceDataModel.get(id).subscribe((result: { body: ReferenceModelResult }) => {
      this.referenceModel = result.body;
      this.isEditable = this.referenceModel['availableActions'].includes('update');
      this.parentId = this.referenceModel.id;

      if (this.sharedService.isLoggedIn(true)) {
        this.ReferenceModelPermissions(id);
      } else {
        this.messageService.dataChanged(this.referenceModel);
        this.messageService.FolderSendMessage(this.referenceModel);
      }
      this.messageService.dataChanged(this.referenceModel);

      this.tabGroup.realignInkBar();
      // tslint:disable-next-line: deprecation
      this.activeTab = this.getTabDetailByName(this.stateService.params.tabView).index;
      this.tabSelected(this.activeTab);
    });
  }

  ReferenceModelPermissions(id: any) {
    this.resourcesService.security.permissions('referenceDataModels', id).subscribe((permissions: { body: { [x: string]: any } }) => {
      Object.keys(permissions.body).forEach(attrname => {
        this.referenceModel[attrname] = permissions.body[attrname];
      });
      // Send it to message service to receive in child components
      this.messageService.FolderSendMessage(this.referenceModel);
      this.messageService.dataChanged(this.referenceModel);
    });
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe(); // unsubscribe to ensure no memory leaks
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'elements':
        return { index: 0, name: 'elements' };
      case 'types':
        return { index: 1, name: 'types' };
      case 'values':
        return { index: 2, name: 'values' };
      case 'properties':
        return { index: 3, name: 'properties' };
      case 'comments':
        return { index: 4, name: 'comments' };
      case 'history':
        return { index: 5, name: 'history' };
      case 'attachments':
        return { index: 6, name: 'attachments' };
      default:
        return { index: 0, name: 'elements' };
    }
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'elements' };
      case 1:
        return { index: 1, name: 'types' };
      case 2:
        return { index: 2, name: 'values' };
      case 3:
        return { index: 3, name: 'properties' };
      case 4:
        return { index: 4, name: 'comments' };
      case 5:
        return { index: 5, name: 'history' };
      case 6:
        return { index: 6, name: 'attachments' };
      default:
        return { index: 0, name: 'elements' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go('referencedatamodel', { tabView: tab.name }, { notify: false });
    this.activeTab = tab.index;
  }
}

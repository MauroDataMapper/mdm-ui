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
import { Component, OnInit, ViewChild } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { DataClassResult } from '@mdm/model/dataClassModel';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-data-class',
  templateUrl: './data-class.component.html',
  styleUrls: ['./data-class.component.sass']
})
export class DataClassComponent implements OnInit {
  dataClass: DataClassResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  showExtraTabs = false;
  activeTab: any;
  parentDataClass = { id: null };
  parentDataModel = {};
  isEditable: boolean;

  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private title: Title
  ) {}

  async ngOnInit() {
    // tslint:disable-next-line: deprecation
    if (!this.stateService.params.id || !this.stateService.params.dataModelId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    // tslint:disable-next-line: deprecation
    if (this.stateService.params.id && this.stateService.params.dataClassId && this.stateService.params.dataClassId.trim() !== '') {
      // tslint:disable-next-line: deprecation
      this.parentDataClass = { id: this.stateService.params.dataClassId };
    }

    // tslint:disable-next-line: deprecation
    if (this.stateService.params.edit === 'true') {
      this.editMode = true;
    }

    // tslint:disable-next-line: deprecation
    this.activeTab = this.getTabDetailByName(this.stateService.params.tabView).index;

    this.showExtraTabs = this.sharedService.isLoggedIn() ;

    // tslint:disable-next-line: deprecation
    this.parentId = this.stateService.params.id;
    this.title.setTitle(`Data Class`);
    // tslint:disable-next-line: deprecation
    this.dataClassDetails(this.stateService.params.dataModelId, this.parentDataClass.id, this.stateService.params.id);
    this.subscription = this.messageService.changeSearch.subscribe((message: boolean) => {
        this.showSearch = message;
    });
    this.afterSave = (result: { body: { id: any } }) =>
    // tslint:disable-next-line: deprecation
      this.dataClassDetails(this.stateService.params.dataModelId, this.parentDataClass.id, result.body.id);
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'content':
        return { index: 0, name: 'content' };
      case 'properties':
        return { index: 1, name: 'properties' };
      case 'comments':
        return { index: 2, name: 'comments' };
      case 'links':
        return { index: 3, name: 'links' };
      case 'summaryMetadata':
        return { index: 4, name: 'summaryMetadata' };
      case 'attachments':
        return { index: 5, name: 'attachments' };
      default:
        return { index: 0, name: 'content' };
    }
  }

  dataClassDetails(dataModelId: any, parentDataClassId, id) {
    this.resourcesService.dataClass.getChildDataClass(dataModelId, parentDataClassId, id).subscribe((result: { body: DataClassResult }) => {
        this.dataClass = result.body;
        this.dataClass.parentDataModel = dataModelId;
        this.dataClass.parentDataClass = parentDataClassId;
        this.parentDataModel = {
          id: dataModelId,
          finalised: this.dataClass.breadcrumbs[0].finalised
        };
        this.isEditable = this.dataClass['availableActions'].includes('update');
        this.messageService.FolderSendMessage(this.dataClass);
        this.messageService.dataChanged(this.dataClass);

        if (this.dataClass) {
          this.tabGroup.realignInkBar();
          // tslint:disable-next-line: deprecation
          this.activeTab = this.getTabDetailByName(this.stateService.params.tabView).index;
          this.tabSelected(this.activeTab);
        }
      });
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'content' };
      case 1:
        return { index: 1, name: 'properties' };
      case 2:
        return { index: 2, name: 'comments' };
      case 3:
        return { index: 3, name: 'links' };
      case 4:
        return { index: 4, name: 'summaryMetadata' };
      case 5:
        return { index: 5, name: 'attachments' };
      default:
        return { index: 0, name: 'content' };
    }
  }
  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go('dataClass', { tabView: tab.name }, { notify: false, location: tab.index !== 0 });
    this.activeTab = tab.index;
  }
}

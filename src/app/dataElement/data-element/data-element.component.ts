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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';
import {
  GridService,
  MessageHandlerService,
  SecurityHandlerService
} from '@mdm/services';
import { McSelectPagination } from '@mdm/utility/mc-select/mc-select.component';
import {
  DataElement,
  DataElementDetail,
  DataElementDetailResponse,
  DataTypeReference
} from '@maurodatamapper/mdm-resources';
import {
  DefaultProfileItem,
  ProfileControlTypes
} from '@mdm/model/defaultProfileModel';
import { TabCollection } from '@mdm/model/ui.model';
import { BaseComponent } from '@mdm/shared/base/base.component';

@Component({
  selector: 'mdm-data-element',
  templateUrl: './data-element.component.html',
  styleUrls: ['./data-element.component.sass']
})
export class DataElementComponent
  extends BaseComponent
  implements OnInit, AfterViewInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  dataElementOutput: DataElementDetail;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  showEdit = false;
  showDelete = false;
  showExtraTabs = false;
  activeTab: any;
  dataClass = { id: null };
  dataModel = { id: null };
  isDataLoaded = false;
  aliases: any[] = [];
  max: any;
  min: any;
  error: any;
  newMinText: any;
  newMaxText: any;
  pagination: McSelectPagination;
  descriptionView = 'default';
  annotationsView = 'default';
  showEditDescription = false;
  showNewInlineDataType = false;
  dataTypeErrors = '';
  isValid = false;
  rulesItemCount = 0;
  isLoadingRules = true;
  access: any;
  tabs = new TabCollection([
    'description',
    'links',
    'summaryMetadata',
    'rules',
    'annotations'
  ]);
  newlyAddedDataType = {
    label: '',
    description: '',

    metadata: [],
    domainType: 'PrimitiveType',
    enumerationValues: [],
    classifiers: [],
    referencedDataClass: '',
    referencedTerminology: ''
  };

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private uiRouterGlobals: UIRouterGlobals,
    private sharedService: SharedService,
    private stateHandler: StateHandlerService,
    private messageHandler: MessageHandlerService,
    private gridService: GridService,
    private title: Title,
    private securityHandler: SecurityHandlerService,
    private editingService: EditingService
  ) {
    super();
    if (
      this.isGuid(this.uiRouterGlobals.params.id) &&
      (!this.uiRouterGlobals.params.id ||
        !this.uiRouterGlobals.params.dataModelId ||
        !this.uiRouterGlobals.params.dataClassId)
    ) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (
      this.uiRouterGlobals.params.id &&
      this.uiRouterGlobals.params.dataModelId &&
      this.uiRouterGlobals.params.dataModelId.trim() !== ''
    ) {
      this.dataModel = { id: this.uiRouterGlobals.params.dataModelId };
    }

    if (
      this.uiRouterGlobals.params.id &&
      this.uiRouterGlobals.params.dataClassId &&
      this.uiRouterGlobals.params.dataClassId.trim() !== ''
    ) {
      this.dataClass = { id: this.uiRouterGlobals.params.dataClassId };
    }

    if (this.uiRouterGlobals.params.edit === 'true') {
      this.editMode = true;
    }
  }

  ngOnInit() {
    this.activeTab = this.tabs.getByName(this.uiRouterGlobals.params.tabView as string).index;
    this.tabSelected(this.activeTab);

    this.showExtraTabs = this.sharedService.isLoggedIn();
    this.title.setTitle('Data Element');

    this.dataElementDetails(
      this.uiRouterGlobals.params.dataModelId,
      this.dataClass.id,
      this.uiRouterGlobals.params.id
    );
    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  fetchDataTypes = (text, loadAll, offset, limit) => {
    const options = this.gridService.constructOptions(
      limit,
      offset,
      'label',
      'asc',
      { label: text }
    );
    this.pagination = {
      limit: options['limit'],
      offset: options['offset']
    };
    return this.resourcesService.dataType.list(this.dataModel.id, options);
  };

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'description':
        return { index: 0, name: 'description' };
      case 'annotations':
        return { index: 1, name: 'annotations' };
      case 'links':
        return { index: 2, name: 'links' };
      case 'summaryMetadata':
        return { index: 3, name: 'summaryMetadata' };
      case 'rules':
        return { index: 4, name: 'rules' };
      default:
        return { index: 0, name: 'description' };
    }
  }

  save(saveItems: Array<DefaultProfileItem>) {
    const resource: DataElement = {
      id: this.dataElementOutput.id,
      label: this.dataElementOutput.label,
      domainType: this.dataElementOutput.domainType
    };

    saveItems.forEach((item: DefaultProfileItem) => {
      if (item.controlType === ProfileControlTypes.multiplicity) {
        if ((item.minMultiplicity as string) === '*') {
          item.minMultiplicity = -1;
        }

        if ((item.maxMultiplicity as string) === '*') {
          item.maxMultiplicity = -1;
        }

        resource.minMultiplicity = item.minMultiplicity as number;
        resource.maxMultiplicity = item.maxMultiplicity;
      } else if (item.controlType === ProfileControlTypes.dataType) {
        resource.dataType = item.value as DataTypeReference;
      } else {
        resource[item.propertyName] = item.value;
      }
    });

    this.resourcesService.dataElement
      .update(
        this.dataModel.id,
        this.dataClass.id,
        this.dataElementOutput.id,
        resource
      )
      .subscribe(
        (result: DataElementDetailResponse) => {
          this.dataElementOutput = null;

          setTimeout(() => {
            this.dataElementOutput = result.body;
          }, 250);

          this.catalogueItem = result.body;
          this.messageHandler.showSuccess('Data Element updated successfully.');
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem updating the Data Element.',
            error
          );
        }
      );
  }

  dataElementDetails(dataModelId: any, dataClassId, id) {
    this.resourcesService.dataElement
      .get(dataModelId, dataClassId, id)
      .subscribe((result: DataElementDetailResponse) => {
        this.dataElementOutput = result.body;

        this.catalogueItem = result.body;
        this.dataModel.id = result.body.model;
        this.dataClass.id = result.body.dataClass;

        this.watchDataElementObject();

        this.messageService.FolderSendMessage(this.dataElementOutput);
        this.messageService.dataChanged(this.dataElementOutput);

        if (this.dataElementOutput) {
          // tslint:disable-next-line: deprecation
          this.activeTab = this.getTabDetailByName(
            this.uiRouterGlobals.params.tabView as string
          ).index;
          this.tabSelected(this.activeTab);
        }

        this.isDataLoaded = true;
      });
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }

  toggleShowNewInlineDataType() {
    this.showNewInlineDataType = !this.showNewInlineDataType;
    this.dataTypeErrors = '';
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go(
      'dataElement',
      { tabView: tab.name },
      { notify: false }
    );
  }

  watchDataElementObject() {
    this.access = this.securityHandler.elementAccess(this.dataElementOutput);
    if (this.access !== undefined) {
      this.showEdit = this.access.showEdit;
      this.showDelete =
        this.access.showPermanentDelete || this.access.showSoftDelete;
    }
  }
}

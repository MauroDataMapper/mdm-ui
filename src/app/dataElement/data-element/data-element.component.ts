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
import { StateService, UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import {
  EditableDataElement
} from '@mdm/model/dataElementModel';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';
import { MatDialog } from '@angular/material/dialog';
import {
  GridService,
  MessageHandlerService,
  SecurityHandlerService,
  ValidatorService
} from '@mdm/services';
import { McSelectPagination } from '@mdm/utility/mc-select/mc-select.component';
import { ProfileBaseComponent } from '@mdm/profile-base/profile-base.component';
import { DataElement, DataElementDetail, DataElementDetailResponse } from '@maurodatamapper/mdm-resources';
import { TabCollection } from '@mdm/model/ui.model';

@Component({
  selector: 'mdm-data-element',
  templateUrl: './data-element.component.html',
  styleUrls: ['./data-element.component.sass']
})
export class DataElementComponent
  extends ProfileBaseComponent
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
  editableForm: EditableDataElement;
  descriptionView = 'default';
  annotationsView = 'default';
  showEditDescription = false;
  showNewInlineDataType = false;
  dataTypeErrors = '';
  isValid = false;
  rulesItemCount = 0;
  isLoadingRules = true;
  access:any;
  tabs = new TabCollection(['description', 'links', 'summaryMetadata', 'rules', 'annotations']);
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
    resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private uiRouterGlobals: UIRouterGlobals,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    dialog: MatDialog,
    private validator: ValidatorService,
    messageHandler: MessageHandlerService,
    private gridService: GridService,
    private title: Title,
    private securityHandler: SecurityHandlerService,
    editingService: EditingService
  ) {
    super(resourcesService, dialog, editingService, messageHandler);
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
    this.activeTab = this.tabs.getByName(this.uiRouterGlobals.params.tabView).index;
    this.tabSelected(this.activeTab);

    this.showExtraTabs = this.sharedService.isLoggedIn();
    this.title.setTitle('Data Element');

    this.dataElementDetails(
      this.uiRouterGlobals.params.dataModelId,
      this.dataClass.id,
      this.stateService.params.id
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

  validate() {
    let isValid = true;

    if (!this.showNewInlineDataType) {
      return true;
    }
    if (
      !this.newlyAddedDataType.label ||
      this.newlyAddedDataType.label.trim().length === 0
    ) {
      isValid = false;
    }
    // Check if for EnumerationType, at least one value is added
    if (
      this.newlyAddedDataType.domainType === 'EnumerationType' &&
      this.newlyAddedDataType.enumerationValues.length === 0
    ) {
      isValid = false;
    }
    // Check if for ReferenceType, the dataClass is selected
    if (
      this.newlyAddedDataType.domainType === 'ReferenceType' &&
      !this.newlyAddedDataType.referencedDataClass
    ) {
      isValid = false;
    }

    // Check if for TerminologyType, the terminology is selected
    if (
      this.newlyAddedDataType.domainType === 'TerminologyType' &&
      !this.newlyAddedDataType.referencedTerminology
    ) {
      isValid = false;
    }

    this.isValid = isValid;
    if (!this.isValid) {
      this.dataTypeErrors = '';
      this.dataTypeErrors =
        'Please fill in all required values for the new Data Type';
      return false;
    } else {
      return true;
    }
  }

  onDataTypeSelect(dataType) {
    this.dataElementOutput.dataType = dataType;
  }

  formBeforeSave() {
    if (!this.validate()) {
      return;
    }

    this.editingService.stop();
    this.editMode = false;
    const classifiers = [];
    this.editableForm.classifiers.forEach((cls) => {
      classifiers.push(cls);
    });
    const aliases = [];
    this.editableForm.aliases.forEach((alias) => {
      aliases.push(alias);
    });

    if (this.validateMultiplicity(this.min, this.max)) {
      if (
        this.min != null &&
        this.min !== '' &&
        this.max != null &&
        this.max !== ''
      ) {
        if (this.newMinText === '*') {
          this.newMinText = -1;
        }

        if (this.max === '*') {
          this.max = -1;
        }
      }

      let dataType;
      if (!this.showNewInlineDataType) {
        dataType = { id: this.dataElementOutput.dataType['id'] };
      } else {
        dataType = this.newlyAddedDataType;
      }

      const resource: DataElement = {
        id: this.dataElementOutput.id,
        label: this.editableForm.label,
        domainType: this.dataElementOutput.domainType,
        description: this.editableForm.description || ''
      };

      if (!this.showEditDescription) {
        resource.aliases = aliases;
        resource.dataType = dataType;
        resource.classifiers = classifiers;
        resource.minMultiplicity = parseInt(this.min, 10);
        resource.maxMultiplicity = parseInt(this.max, 10);
      }

      this.resourcesService.dataElement
        .update(
          this.dataModel.id,
          this.dataClass.id,
          this.dataElementOutput.id,
          resource
        )
        .subscribe(
          (result: DataElementDetailResponse) => {
            this.editingService.stop();
            this.dataElementOutput = result.body;
            this.setValues();
            this.messageHandler.showSuccess(
              'Data Element updated successfully.'
            );
            this.editableForm.visible = false;
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Data Element.',
              error
            );
          }
        );
    }
  }

  validateMultiplicity(minVal, maxVal) {
    let min = '';
    if (minVal != null && minVal !== undefined) {
      min = `${minVal}`;
    }
    let max = '';
    if (maxVal != null && maxVal !== undefined) {
      max = `${maxVal}`;
    }

    const errorMessage = this.validator.validateMultiplicities(min, max);
    if (errorMessage) {
      this.error = errorMessage;
      return false;
    }
    return true;
  }

  dataElementDetails(dataModelId: any, dataClassId, id) {
    this.resourcesService.dataElement
      .get(dataModelId, dataClassId, id)
      .subscribe((result: DataElementDetailResponse) => {
        this.dataElementOutput = result.body;

        this.editableForm = new EditableDataElement();
        this.editableForm.visible = false;
        this.editableForm.deletePending = false;

        this.setValues();

        this.editableForm.show = () => {
          this.editingService.start();
          this.editableForm.visible = true;
          if (this.min === '*') {
            this.min = '-1';
          }

          if (this.max === '*') {
            this.max = '-1';
          }
        };

        this.editableForm.cancel = () => {
          this.editingService.stop();
          this.editableForm.visible = false;
          this.editableForm.validationError = false;
          this.onCancelEdit();

          this.editableForm.label = this.dataElementOutput.label;
          this.editableForm.description = this.dataElementOutput.description;
          if (this.dataElementOutput.classifiers) {
            this.dataElementOutput.classifiers.forEach((item) => {
              this.editableForm.classifiers.push(item);
            });
          }
          this.editableForm.aliases = [];
          this.aliases = [];
          if (this.dataElementOutput.aliases) {
            this.dataElementOutput.aliases.forEach((item) => {
              this.aliases.push(item);
              this.editableForm.aliases.push(item);
            });
          }

          if (this.min === '-1') {
            this.min = '*';
          }

          if (this.max === '-1') {
            this.max = '*';
          }
        };

        this.catalogueItem = result.body;
        this.dataModel.id = result.body.model;
        this.dataClass.id = result.body.dataClass;

        this.UnUsedProfiles('dataElements', id);
        this.UsedProfiles('dataElements', id);
        this.watchDataElementObject();

        this.messageService.FolderSendMessage(this.dataElementOutput);
        this.messageService.dataChanged(this.dataElementOutput);

        if (this.dataElementOutput) {
          // tslint:disable-next-line: deprecation
          this.activeTab = this.getTabDetailByName(
            this.stateService.params.tabView
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

  setValues() {
    this.editableForm.label = this.dataElementOutput.label;
    this.editableForm.description = this.dataElementOutput.description;
    if (this.dataElementOutput.classifiers) {
      this.dataElementOutput.classifiers.forEach((item) => {
        this.editableForm.classifiers.push(item);
      });
    }
    this.aliases = [];
    if (this.dataElementOutput.aliases) {
      this.dataElementOutput.aliases.forEach((item) => {
        this.aliases.push(item);
      });
    }

    if (
      this.dataElementOutput.minMultiplicity &&
      this.dataElementOutput.minMultiplicity === -1
    ) {
      this.min = '*';
    } else {
      this.min = this.dataElementOutput.minMultiplicity;
    }

    if (
      this.dataElementOutput.maxMultiplicity &&
      this.dataElementOutput.maxMultiplicity === -1
    ) {
      this.max = '*';
    } else {
      this.max = this.dataElementOutput.maxMultiplicity;
    }
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

  onCancelEdit() {
    this.error = '';
    this.editMode = false; // Use Input editor whe adding a new folder.
    this.showEditDescription = false;
  }

  showDescription = () => {
    this.editingService.start();
    this.showEditDescription = true;
    this.editableForm.show();
  };

  watchDataElementObject() {
    this.access = this.securityHandler.elementAccess(
      this.dataElementOutput
    );
    if (this.access !== undefined) {
      this.showEdit = this.access.showEdit;
      this.showDelete = this.access.showPermanentDelete || this.access.showSoftDelete;
    }
  }

  edit = () => {
    this.showEditDescription = false;
    this.editableForm.show();
   };
}

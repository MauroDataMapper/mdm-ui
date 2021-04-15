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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SharedService } from '../services/shared.service';
import { MatTabGroup } from '@angular/material/tabs';
import { EditingService } from '@mdm/services/editing.service';
import { EditableDataModel } from '@mdm/model/dataModelModel';
import {
  ElementTypesService,
  MessageHandlerService,
  SecurityHandlerService
} from '@mdm/services';
import { MatDialog } from '@angular/material/dialog';
import { ProfileBaseComponent } from '@mdm/profile-base/profile-base.component';

@Component({
  selector: 'mdm-data-type',
  templateUrl: './data-type.component.html',
  styleUrls: ['./data-type.component.scss']
})
export class DataTypeComponent
  extends ProfileBaseComponent
  implements OnInit, AfterViewInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  dataType: any;
  dataModelId: any;
  dataModel: any;
  id: any;
  tabView: any;
  activeTab: any;
  showExtraTabs: boolean;
  showEditForm = false;

  loadingData = false;

  schemaView = 'list';
  descriptionView = 'default';
  contextView = 'default';
  rulesItemCount = 0;
  isLoadingRules = true;
  editableForm: EditableDataModel;
  errorMessage: any;
  elementType: any;
  showEdit: boolean;
  showEditDescription = false;
  access:any;

  allDataTypes = this.elementTypes.getAllDataTypesArray();
  allDataTypesMap = this.elementTypes.getAllDataTypesMap();

  constructor(
    private title: Title,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    resource: MdmResourcesService,
    private sharedService: SharedService,
    messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    dialog: MatDialog,
    private elementTypes: ElementTypesService,
    editingService: EditingService
  ) {
    super(resource, dialog, editingService, messageHandler);
  }

  ngOnInit() {
    // tslint:disable-next-line: deprecation
    this.id = this.stateService.params.id;
    // tslint:disable-next-line: deprecation
    this.dataModelId = this.stateService.params.dataModelId;
    // tslint:disable-next-line: deprecation
    this.tabView = this.stateService.params.tabView;

    if (this.isGuid(this.id) && (!this.id || !this.dataModelId)) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.title.setTitle('Data Type');
    this.dataModel = { id: this.dataModelId };
    this.loadingData = true;

    this.resourcesService.dataType.get(this.dataModelId, this.id).subscribe(
      (result) => {
        const data = result.body;

        // If the Id is a path get the actual Id
        this.dataModelId = data.model;
        this.id = data.id;

        this.UnUsedProfiles('dataType', data.id);
        this.UsedProfiles('dataType', data.id);

        this.dataType = data;
        this.catalogueItem = this.dataType;

        this.watchDataTypeObject();

        this.editableForm = new EditableDataModel();
        this.editableForm.visible = false;
        this.editableForm.deletePending = false;
        this.editableForm.description = this.dataType.description;
        this.editableForm.label = this.dataType.label;
        this.title.setTitle(`Data Type - ${this.dataType?.label}`);

        this.editableForm.cancel = () => {
          this.editingService.stop();
          this.editableForm.visible = false;
          this.editableForm.validationError = false;
          this.errorMessage = '';
          this.editableForm.description = this.dataType.description;
          this.editableForm.label = this.dataType.label;
          if (this.dataType.classifiers) {
            this.dataType.classifiers.forEach((item) => {
              this.editableForm.classifiers.push(item);
            });
          }
          if (this.dataType.aliases) {
            this.dataType.aliases.forEach((item) => {
              this.editableForm.aliases.push(item);
            });
          }
        };

        this.editableForm.show = () => {
          this.editableForm.visible = true;
        };

        if (
          this.dataType.domainType === 'ModelDataType' &&
          this.dataType.modelResourceDomainType === 'Terminology'
        ) {
          this.resourcesService.terminology
            .get(this.dataModelId.modelResourceId)
            .subscribe((termResult) => {
              this.elementType = termResult.body;
            });
        } else if (
          this.dataType.domainType === 'ModelDataType' &&
          this.dataType.modelResourceDomainType === 'CodeSet'
        ) {
          this.resourcesService.codeSet
            .get(this.dataType.modelResourceId)
            .subscribe((elmResult) => {
              this.elementType = elmResult.body;
            });
        } else if (
          this.dataType.domainType === 'ModelDataType' &&
          this.dataType.modelResourceDomainType === 'ReferenceDataModel'
        ) {
          this.resourcesService.referenceDataModel
            .get(this.dataType.modelResourceId)
            .subscribe((dataTypeResult) => {
              this.elementType = dataTypeResult.body;
            });
        }

        this.dataType.classifiers = this.dataType.classifiers || [];
        this.loadingData = false;
        this.activeTab = this.getTabDetail(this.tabView);
        this.showExtraTabs =
          !this.sharedService.isLoggedIn() || !this.dataType.editable;
      },
      () => {
        this.loadingData = false;
      }
    );
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  watchDataTypeObject() {
    this.access = this.securityHandler.elementAccess(this.dataType);
    if (this.access !== undefined) {
      this.showEdit = this.access.showEdit;
    }
  }

  tabSelected = (itemsName) => {
    const tab = this.getTabDetail(itemsName);
    this.stateHandler.Go(
      'dataType',
      { tabView: itemsName },
      { notify: false, location: tab.index !== 0 }
    );
    this[itemsName] = [];

    this.activeTab = this.getTabDetail(itemsName);
    if (this.activeTab && this.activeTab.fetchUrl) {
      this[this.activeTab.name] = [];
      this.loadingData = true;
      this.resourcesService.dataType
        .get(this.dataModelId, this.id)
        .subscribe((data) => {
          this[this.activeTab.name] = data || [];
          this.loadingData = false;
        });
    }
  };

  edit = () => {
    this.showEditDescription = false;
    this.editableForm.show();
  };

  showDescription = () => {
    this.editingService.start();
    this.showEditDescription = true;
    this.editableForm.show();
  };

  getTabDetail = (tabName) => {
    switch (tabName) {
      case 'properties':
        return { index: 0, name: 'properties' };
      case 'dataElements':
        return { index: 1, name: 'dataElements' };
      case 'comments':
        return { index: 2, name: 'comments' };
      case 'links':
        return { index: 3, name: 'links' };
      case 'attachments':
        return { index: 4, name: 'attachments' };
      case 'history':
        return { index: 5, name: 'history', fetchUrl: null };
      default:
        return { index: 0, name: 'properties' };
    }
  };

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }

  onCancelEdit = () => {
    this.dataType.editAliases = Object.assign([], this.dataType.aliases);
    this.showEditDescription = false;
  };

  formBeforeSave = () => {
    const aliases = [];
    this.editableForm.aliases.forEach((alias) => {
      aliases.push(alias);
    });

    let resource = {};
    if (!this.showEditDescription) {
      resource = {
        id: this.dataType.id,
        label: this.editableForm.label,
        description: this.editableForm.description || '',
        aliases,
        domainType: this.dataType.domainType,
        classifiers: this.dataType.classifiers.map((cls) => ({ id: cls.id }))
      };
    }

    if (this.showEditDescription) {
      resource = {
        id: this.dataType.id,
        description: this.editableForm.description || ''
      };
    }

    this.resourcesService.dataType
      .update(this.dataModel.id, this.dataType.id, resource)
      .subscribe(
        (res) => {
          const result = res.body;

          this.dataType.aliases = Object.assign([], result.aliases);
          this.dataType.editAliases = Object.assign([], this.dataType.aliases);
          this.dataType.label = result.label;
          this.dataType.description = result.description;
          this.messageHandler.showSuccess('Data Type updated successfully.');
          this.editingService.stop();
          this.editableForm.visible = false;
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem updating the Data Type.',
            error
          );
        }
      );
  };
}

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
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { EditableDataClass } from '@mdm/model/dataClassModel';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';
import { MatDialog } from '@angular/material/dialog';
import {
  MessageHandlerService,
  SecurityHandlerService,
  ValidatorService
} from '@mdm/services';
import { ProfileBaseComponent } from '@mdm/profile-base/profile-base.component';
import {
  DataClass,
  DataClassDetail,
  DataClassDetailResponse
} from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-data-class',
  templateUrl: './data-class.component.html',
  styleUrls: ['./data-class.component.sass']
})
export class DataClassComponent
  extends ProfileBaseComponent
  implements OnInit, AfterViewInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  dataClass: DataClassDetail;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  showExtraTabs = false;
  activeTab: any;
  parentDataClass = { id: null };
  parentDataModel = {};
  isEditable: boolean;
  max: any;
  min: any;
  error = '';
  editableForm: EditableDataClass;
  aliases: any[] = [];
  access: any;

  newMinText: any;
  newMaxText: any;

  descriptionView = 'default';
  annotationsView = 'default';

  showEditDescription = false;

  constructor(
    resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private title: Title,
    editingService: EditingService,
    dialog: MatDialog,
    messageHandler: MessageHandlerService,
    private validator: ValidatorService
  ) {
    super(resourcesService, dialog, editingService, messageHandler);
  }

  ngOnInit() {
    // tslint:disable-next-line: deprecation
    if (
      this.isGuid(this.stateService.params.id) &&
      (!this.stateService.params.id || !this.stateService.params.dataModelId)
    ) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    // tslint:disable-next-line: deprecation
    if (
      this.stateService.params.id &&
      this.stateService.params.dataClassId &&
      this.stateService.params.dataClassId.trim() !== ''
    ) {
      // tslint:disable-next-line: deprecation
      this.parentDataClass = { id: this.stateService.params.dataClassId };
    }

    // tslint:disable-next-line: deprecation
    this.activeTab = this.getTabDetailByName(
      this.stateService.params.tabView
    ).index;

    this.showExtraTabs = this.sharedService.isLoggedIn();

    this.title.setTitle('Data Class');

    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );

    // tslint:disable-next-line: deprecation
    this.dataClassDetails(
      this.stateService.params.dataModelId,
      this.stateService.params.id,
      this.parentDataClass.id
    );
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'description':
        return { index: 0, name: 'description' };
      case 'annotations':
        return { index: 1, name: 'annotations' };
      case 'elements':
        return { index: 2, name: 'elements' };
      case 'context':
        return { index: 3, name: 'context' };
      case 'history':
        return { index: 4, name: 'history' };
      case 'data':
        return { index: 5, name: 'data' };
      case 'rules':
        return { index: 6, name: 'rules' };
      default:
        return { index: 0, name: 'description' };
    }
  }

  dataClassDetails(model, id, parentDataClass?) {
    if (!parentDataClass) {
      this.resourcesService.dataClass
        .get(model, id)
        .subscribe((result: DataClassDetailResponse) => {
          this.dataClass = result.body;

          this.access = this.securityHandler.elementAccess(this.dataClass);

          this.catalogueItem = this.dataClass;
          this.isEditable = this.dataClass.availableActions?.includes('update');

          this.createEditableForm();

          this.parentDataModel = {
            id: result.body.model,
            finalised: this.dataClass.breadcrumbs[0].finalised
          };

          this.UsedProfiles('dataClass', id);
          this.UnUsedProfiles('dataClass', id);
          this.messageService.FolderSendMessage(this.dataClass);
          this.messageService.dataChanged(this.dataClass);

          this.tabGroup.realignInkBar();
          // tslint:disable-next-line: deprecation
          this.activeTab = this.getTabDetailByName(
            this.stateService.params.tabView
          ).index;
          this.tabSelected(this.activeTab);

          if (this.dataClass.classifiers) {
            this.dataClass.classifiers.forEach((item) => {
              this.editableForm.classifiers.push(item);
            });
          }
          this.aliases = [];
          if (this.dataClass.aliases) {
            this.dataClass.aliases.forEach((item) => {
              this.aliases.push(item);
            });
          }

          if (
            this.dataClass.minMultiplicity &&
            this.dataClass.minMultiplicity === -1
          ) {
            this.min = '*';
          } else {
            this.min = this.dataClass.minMultiplicity;
          }

          if (
            this.dataClass.maxMultiplicity &&
            this.dataClass.maxMultiplicity === -1
          ) {
            this.max = '*';
          } else {
            this.max = this.dataClass.maxMultiplicity;
          }
        });
    } else {
      this.resourcesService.dataClass
        .getChildDataClass(model, parentDataClass, id)
        .subscribe((result: DataClassDetailResponse) => {
          this.dataClass = result.body;
          this.createEditableForm();
          this.parentDataModel = {
            id: result.body.model,
            finalised: this.dataClass.breadcrumbs[0].finalised
          };
          this.isEditable = this.dataClass.availableActions?.includes('update');

          this.createEditableForm();

          this.messageService.FolderSendMessage(this.dataClass);
          this.messageService.dataChanged(this.dataClass);

          if (this.dataClass) {
            this.tabGroup.realignInkBar();
            // tslint:disable-next-line: deprecation
            this.activeTab = this.getTabDetailByName(
              this.stateService.params.tabView
            ).index;
            this.tabSelected(this.activeTab);
          }
        });
    }
  }

  createEditableForm() {
    this.editableForm = new EditableDataClass();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;
    this.editableForm.description = this.dataClass.description;

    this.editableForm.show = () => {
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

      this.error = '';

      this.setEditableForm();

      if (this.dataClass.classifiers) {
        this.dataClass.classifiers.forEach((item) => {
          this.editableForm.classifiers.push(item);
        });
      }
      this.editableForm.aliases = [];
      this.aliases = [];
      if (this.dataClass.aliases) {
        this.dataClass.aliases.forEach((item) => {
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
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'description' };
      case 1:
        return { index: 1, name: 'annotations' };
      case 2:
        return { index: 2, name: 'elements' };
      case 3:
        return { index: 3, name: 'context' };
      case 4:
        return { index: 4, name: 'history' };
      case 5:
        return { index: 5, name: 'data' };
      case 6:
        return { index: 6, name: 'rules' };
      default:
        return { index: 0, name: 'description' };
    }
  }
  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go('dataClass', { tabView: tab.name }, { notify: false });
    this.activeTab = tab.index;
  }

  setEditableForm() {
    this.editableForm.description = this.dataClass?.description;
    this.editableForm.label = this.dataClass?.label;
    this.min = this.dataClass?.minMultiplicity;
    this.max = this.dataClass?.maxMultiplicity;
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

  formBeforeSave = () => {
    this.error = '';

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

      const resource: DataClass = {
        id: this.dataClass.id,
        label: this.editableForm.label,
        domainType: this.dataClass.domainType,
        description: this.editableForm.description || ''
      };

      if (!this.showEditDescription) {
        resource.aliases = aliases;
        resource.classifiers = classifiers;
        resource.minMultiplicity = parseInt(this.min, 10);
        resource.maxMultiplicity = parseInt(this.max, 10);
      }

      if (!this.dataClass.parentDataClass) {
        this.resourcesService.dataClass
          .update(this.dataClass.model, this.dataClass.id, resource)
          .subscribe(
            (result: DataClassDetailResponse) => {
              this.dataClass = result.body;
              this.messageHandler.showSuccess(
                'Data Class updated successfully.'
              );
              this.editingService.stop();
              this.editableForm.visible = false;
              this.messageService.dataChanged(result.body);
              this.setEditableForm();
            },
            (error) => {
              this.messageHandler.showError(
                'There was a problem updating the Data Class.',
                error
              );
            }
          );
      } else {
        this.resourcesService.dataClass
          .updateChildDataClass(
            this.dataClass.model,
            this.dataClass.parentDataClass,
            this.dataClass.id,
            resource
          )
          .subscribe(
            (result: DataClassDetailResponse) => {
              this.dataClass = result.body;
              this.messageHandler.showSuccess(
                'Data Class updated successfully.'
              );
              this.editableForm.visible = false;
              this.editingService.stop();
              this.messageService.dataChanged(result.body);
              this.setEditableForm();
            },
            (error) => {
              this.messageHandler.showError(
                'There was a problem updating the Data Class.',
                error
              );
            }
          );
      }
    }
  };

  showDescription = () => {
    this.editingService.start();
    this.showEditDescription = true;
    this.editableForm.show();
  };

  onCancelEdit() {
    this.error = '';
    this.showEditDescription = false;
  }

  edit = () => {
    this.showEditDescription = false;
    this.editableForm.show();
  };
}

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
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { DataElementResult, EditableDataElement } from '@mdm/model/dataElementModel';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { BaseComponent } from '@mdm/shared/base/base.component';
import { EditingService } from '@mdm/services/editing.service';
import { AddProfileModalComponent } from '@mdm/modals/add-profile-modal/add-profile-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileModalComponent } from '@mdm/modals/edit-profile-modal/edit-profile-modal.component';
import { GridService, MessageHandlerService, SecurityHandlerService, ValidatorService } from '@mdm/services';
import { McSelectPagination } from '@mdm/utility/mc-select/mc-select.component';

@Component({
  selector: 'mdm-data-element',
  templateUrl: './data-element.component.html',
  styleUrls: ['./data-element.component.sass']
})
export class DataElementComponent extends BaseComponent implements OnInit, AfterViewInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  dataElementOutput: DataElementResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  showEdit = false;
  showExtraTabs = false;
  activeTab: any;
  dataClass = { id: null };
  dataModel = { id: null };
  isDataLoaded = false;
  aliases: any[] = [];
  max: any;
  min: any;
  error:any;
  newMinText: any;
  newMaxText: any;
  pagination: McSelectPagination;
  editableForm: EditableDataElement;
  allUsedProfiles: any[] = [];
  allUnUsedProfiles: any[] = [];
  currentProfileDetails: any[];
  descriptionView = 'default';
  showEditDescription = false;
  showNewInlineDataType = false;
  dataTypeErrors = '';
  isValid = false;
  rulesItemCount = 0;
  isLoadingRules = true;
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
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private dialog: MatDialog,
    private validator: ValidatorService,
    private messageHandler: MessageHandlerService,
    private gridService: GridService,
    private title: Title,
    private securityHandler: SecurityHandlerService,
    private editingService: EditingService) {
    super();
    // tslint:disable-next-line: deprecation
    if (this.isGuid(this.stateService.params.id) && (!this.stateService.params.id || !this.stateService.params.dataModelId || !this.stateService.params.dataClassId)) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    // tslint:disable-next-line: deprecation
    if (this.stateService.params.id && this.stateService.params.dataModelId && this.stateService.params.dataModelId.trim() !== '') {
      // tslint:disable-next-line: deprecation
      this.dataModel = { id: this.stateService.params.dataModelId };
    }

    // tslint:disable-next-line: deprecation
    if (this.stateService.params.id && this.stateService.params.dataClassId && this.stateService.params.dataClassId.trim() !== '') {
      // tslint:disable-next-line: deprecation
      this.dataClass = { id: this.stateService.params.dataClassId };
    }

    // tslint:disable-next-line: deprecation
    if (this.stateService.params.edit === 'true') {
      this.editMode = true;
    }
  }

  ngOnInit() {
    // tslint:disable-next-line: deprecation
    this.activeTab = this.getTabDetailByName(this.stateService.params.tabView).index;
    this.showExtraTabs = this.sharedService.isLoggedIn();
    this.title.setTitle('Data Element');
    // tslint:disable-next-line: deprecation
    this.dataElementDetails(this.stateService.params.dataModelId, this.dataClass.id, this.stateService.params.id);
    this.subscription = this.messageService.changeSearch.subscribe((message: boolean) => {
      this.showSearch = message;
    });
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  fetchDataTypes = (text, loadAll, offset, limit) => {
    const options = this.gridService.constructOptions(limit, offset, 'label', 'asc', { label: text });
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
      case 'comments':
        return { index: 1, name: 'comments' };
      case 'links':
        return { index: 2, name: 'links' };
      case 'summaryMetadata':
        return { index: 3, name: 'summaryMetadata' };
      case 'attachments':
        return { index: 4, name: 'attachments' };
        case 'rules':
          return { index: 5, name: 'rules' };
      default:
        return { index: 0, name: 'description' };
    }
  }

  validate() {
    let isValid = true;

    if (!this.showNewInlineDataType) {
      return true;
    }
    if (!this.newlyAddedDataType.label || this.newlyAddedDataType.label.trim().length === 0) {
      isValid = false;
    }
    // Check if for EnumerationType, at least one value is added
    if (this.newlyAddedDataType.domainType === 'EnumerationType' && this.newlyAddedDataType.enumerationValues.length === 0) {
      isValid = false;
    }
    // Check if for ReferenceType, the dataClass is selected
    if (this.newlyAddedDataType.domainType === 'ReferenceType' && !this.newlyAddedDataType.referencedDataClass) {
      isValid = false;
    }

    // Check if for TerminologyType, the terminology is selected
    if (this.newlyAddedDataType.domainType === 'TerminologyType' && !this.newlyAddedDataType.referencedTerminology) {
      isValid = false;
    }

    this.isValid = isValid;
    if (!this.isValid) {
      this.dataTypeErrors = '';
      this.dataTypeErrors = 'Please fill in all required values for the new Data Type';
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

    this.editMode = false;
    const classifiers = [];
    this.editableForm.classifiers.forEach(cls => {
      classifiers.push(cls);
    });
    const aliases = [];
    this.editableForm.aliases.forEach(alias => {
      aliases.push(alias);
    });

    if (this.validateMultiplicity(this.min, this.max)) {
      if (this.min != null && this.min !== '' && this.max != null && this.max !== '') {
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
      let resource = {};
      if (!this.showEditDescription) {
        resource = {
          id: this.dataElementOutput.id,
          label: this.editableForm.label,
          description: this.editableForm.description || '',
          domainType: this.dataElementOutput.domainType,
          aliases,
          dataType,
          classifiers,
          minMultiplicity: parseInt(this.min, 10),
          maxMultiplicity: parseInt(this.max, 10)
        };
      }

      if (this.showEditDescription) {
        resource = {
          id: this.dataElementOutput.id,
          description: this.editableForm.description || ''
        };
      }
      this.resourcesService.dataElement.update(this.dataModel.id, this.dataClass.id, this.dataElementOutput.id, resource).subscribe((result:any) => {
        this.editingService.stop();
        this.dataElementOutput = result.body;
        this.setValues();
        this.messageHandler.showSuccess('Data Element updated successfully.');
        this.editableForm.visible = false;
      }, error => {
        this.messageHandler.showError('There was a problem updating the Data Element.', error);
      });
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

  editProfile = (isNew: boolean) => {
    if (this.descriptionView === 'default') {
      this.showEditDescription = false;
      this.editableForm.show();
    } else {
      let prof = this.allUsedProfiles.find(
        (x) => x.value === this.descriptionView
      );

      if (!prof) {
        prof = this.allUnUsedProfiles.find(
          (x) => x.value === this.descriptionView
        );
      }

      const dialog = this.dialog.open(EditProfileModalComponent, {
        data: {
          profile: this.currentProfileDetails,
          profileName: prof.display
        },
        disableClose: true,
        panelClass: 'full-width-dialog'
      });

      dialog.afterClosed().subscribe((result) => {
        if (result) {
          const splitDescription = prof.value.split('/');
          const data = JSON.stringify(result);
          this.resourcesService.profile
            .saveProfile(
              'dataElements',
              this.dataElementOutput.id,
              splitDescription[0],
              splitDescription[1],
              data
            )
            .subscribe(
              () => {
                this.loadProfile();
                if (isNew) {
                  this.messageHandler.showSuccess('Profile Added');
                  this.elementUsedProfiles(this.dataElementOutput.id);
                } else {
                  this.messageHandler.showSuccess(
                    'Profile Edited Successfully'
                  );
                }
              },
              (error) => {
                this.messageHandler.showError('error saving', error.message);
              }
            );
        } else if (isNew) {
          this.descriptionView = 'default';
          this.changeProfile();
        }
      });
    }
  };

  loadProfile() {
    const splitDescription = this.descriptionView.split('/');
    this.resourcesService.profile
      .profile(
        'dataElements',
        this.dataElementOutput.id,
        splitDescription[0],
        splitDescription[1]
      )
      .subscribe((body) => {
        this.currentProfileDetails = body.body;
      });
  }

  changeProfile() {
    if (
      this.descriptionView !== 'default' &&
      this.descriptionView !== 'other' &&
      this.descriptionView !== 'addnew'
    ) {
      this.loadProfile();
    } else if (this.descriptionView === 'addnew') {
      const dialog = this.dialog.open(AddProfileModalComponent, {
        data: {
          domainType: 'dataElements',
          domainId: this.dataElementOutput.id
        }
      });

      dialog.afterClosed().subscribe((newProfile) => {
        if (newProfile) {
          const splitDescription = newProfile.split('/');
          this.resourcesService.profile
            .profile(
              'dataElements',
              this.dataElementOutput.id,
              splitDescription[0],
              splitDescription[1],
              ''
            )
            .subscribe(
              (body) => {
                this.descriptionView = newProfile;
                this.currentProfileDetails = body.body;
                this.editProfile(true);
              },
              (error) => {
                this.messageHandler.showError('error saving', error.message);
              }
            );
        }
      });
    } else {
      this.currentProfileDetails = null;
    }
  }


  async elementUsedProfiles(id: any) {
    await this.resourcesService.profile
      .usedProfiles('dataElements', id)
      .subscribe((profiles: { body: { [x: string]: any } }) => {
        profiles.body.forEach((profile) => {
          const prof: any = [];
          prof['display'] = profile.displayName;
          prof['value'] = `${profile.namespace}/${profile.name}`;
          this.allUsedProfiles.push(prof);
        });
      });
  }

  async elementUnUsedProfiles(id: any) {
    await this.resourcesService.profile
      .unusedProfiles('dataElements', id)
      .subscribe((profiles: { body: { [x: string]: any } }) => {
        this.allUnUsedProfiles = [];
        profiles.body.forEach((profile) => {
          const prof: any = [];
          prof['display'] = profile.displayName;
          prof['value'] = `${profile.namespace}/${profile.name}`;
          this.allUnUsedProfiles.push(prof);
        });
      });
  }

  dataElementDetails(dataModelId: any, dataClassId, id) {
    this.resourcesService.dataElement.get(dataModelId, dataClassId, id).subscribe((result: { body: DataElementResult }) => {
      this.dataElementOutput = result.body;


      this.editableForm = new EditableDataElement();
      this.editableForm.visible = false;
      this.editableForm.deletePending = false;

      this.setValues();

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
        this.onCancelEdit();

        this.editableForm.label = this.dataElementOutput.label;
        this.editableForm.description = this.dataElementOutput.description;
        if (this.dataElementOutput.classifiers) {
          this.dataElementOutput.classifiers.forEach(item => {
            this.editableForm.classifiers.push(item);
          });
        }
        this.editableForm.aliases = [];
        this.aliases = [];
        if (this.dataElementOutput.aliases) {
          this.dataElementOutput.aliases.forEach(item => {
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

      this.dataModel.id = result.body.model;
      this.dataClass.id = result.body.dataClass;

      this.elementUnUsedProfiles(id);
      this.elementUsedProfiles(id);
      this.watchDataElementObject();

      this.messageService.FolderSendMessage(this.dataElementOutput);
      this.messageService.dataChanged(this.dataElementOutput);

      if (this.dataElementOutput) {
        // tslint:disable-next-line: deprecation
        this.activeTab = this.getTabDetailByName(this.stateService.params.tabView).index;
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
      this.dataElementOutput.classifiers.forEach(item => {
        this.editableForm.classifiers.push(item);
      });
    }
    this.aliases = [];
    if (this.dataElementOutput.aliases) {
      this.dataElementOutput.aliases.forEach(item => {
        this.aliases.push(item);
      });
    }

    if (this.dataElementOutput.minMultiplicity && this.dataElementOutput.minMultiplicity === -1) {
      this.min = '*';
    } else {
      this.min = this.dataElementOutput.minMultiplicity;
    }

    if (this.dataElementOutput.maxMultiplicity && this.dataElementOutput.maxMultiplicity === -1) {
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

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'description' };
      case 1:
        return { index: 1, name: 'comments' };
      case 2:
        return { index: 2, name: 'links' };
      case 3:
        return { index: 3, name: 'summaryMetadata' };
      case 4:
        return { index: 4, name: 'attachments' };
        case 5:
          return { index: 5, name: 'rules' };
      default:
        return { index: 0, name: 'description' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go(
      'dataElement',
      { tabView: tab.name },
      { notify: false, location: tab.index !== 0 }
    );
    this.activeTab = tab.index;
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
    const access: any = this.securityHandler.elementAccess(this.dataElementOutput);
    if (access !== undefined) {
      this.showEdit = access.showEdit;
    }
  }
}

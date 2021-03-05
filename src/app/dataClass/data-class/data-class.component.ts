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
import { AfterViewInit, Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { DataClassResult, EditableDataClass } from '@mdm/model/dataClassModel';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { BaseComponent } from '@mdm/shared/base/base.component';
import { EditingService } from '@mdm/services/editing.service';
import { EditProfileModalComponent } from '@mdm/modals/edit-profile-modal/edit-profile-modal.component';
import { AddProfileModalComponent } from '@mdm/modals/add-profile-modal/add-profile-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MessageHandlerService, ValidatorService } from '@mdm/services';

@Component({
  selector: 'mdm-data-class',
  templateUrl: './data-class.component.html',
  styleUrls: ['./data-class.component.sass']
})
export class DataClassComponent extends BaseComponent implements OnInit, AfterViewInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  @ViewChildren('editableText') editForm: QueryList<any>;
  dataClass: DataClassResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  editMode = false;
  showExtraTabs = false;
  activeTab: any;
  parentDataClass = { id: null };
  parentDataModel = {};
  isEditable: boolean;

  showEditDescription = false;
  max: any;
  min: any;
  error = '';
  editableForm: EditableDataClass;
  aliases: any[] = [];
  allUsedProfiles: any[] = [];
  allUnUsedProfiles: any[] = [];
  newMinText: any;
  newMaxText: any;
  currentProfileDetails: any[];

  descriptionView = 'default';

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private title: Title,
    private editingService: EditingService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private validator: ValidatorService
  ) {
    super();
  }

  ngOnInit() {
    this.editableForm = new EditableDataClass();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    this.editableForm.show = () => {
      this.editForm.forEach(x =>
        x.edit({
          editing: true,
          focus: x.name === 'moduleName' ? true : false
        })
      );
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
      this.editForm.forEach(x => x.edit({ editing: false }));
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
 
      this.error = '';

      this.setEditableForm();

      if (this.dataClass.classifiers) {
        this.dataClass.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      this.editableForm.aliases = [];
      this.aliases = [];
      if (this.dataClass.aliases) {
        this.dataClass.aliases.forEach(item => {
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

    // tslint:disable-next-line: deprecation
    if (this.isGuid(this.stateService.params.id) && (!this.stateService.params.id || !this.stateService.params.dataModelId)) {
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

    this.showExtraTabs = this.sharedService.isLoggedIn();

    this.title.setTitle('Data Class');
    // tslint:disable-next-line: deprecation
    this.dataClassDetails(this.stateService.params.dataModelId, this.stateService.params.id, this.parentDataClass.id);
    this.subscription = this.messageService.changeSearch.subscribe((message: boolean) => {
      this.showSearch = message;
    });

    this.setEditableForm();
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
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
        case 'rules':
          return { index: 6, name: 'rules' };
      default:
        return { index: 0, name: 'content' };
    }
  }

  dataClassDetails(model, id, parentDataClass?) {
    if (!parentDataClass) {
      this.resourcesService.dataClass.get(model, id).subscribe((result: { body: DataClassResult }) => {
        this.dataClass = result.body;

        this.DataModelUsedProfiles(id);
        this.DataModelUnUsedProfiles(id);

        this.parentDataModel = {
          id: result.body.model,
          finalised: this.dataClass.breadcrumbs[0].finalised
        };
        this.isEditable = this.dataClass['availableActions']?.includes('update');
        this.messageService.FolderSendMessage(this.dataClass);
        this.messageService.dataChanged(this.dataClass);

        if (this.dataClass) {
          this.tabGroup.realignInkBar();
          // tslint:disable-next-line: deprecation
          this.activeTab = this.getTabDetailByName(this.stateService.params.tabView).index;
          this.tabSelected(this.activeTab);
        }

        this.editableForm.description = this.dataClass?.description;
        this.editableForm.label = this.dataClass.label;

        if (this.dataClass.classifiers) {
          this.dataClass.classifiers.forEach(item => {
            this.editableForm.classifiers.push(item);
          });
        }
        this.aliases = [];
        if (this.dataClass.aliases) {
          this.dataClass.aliases.forEach(item => {
            this.aliases.push(item);
          });
        }

        if (this.dataClass.minMultiplicity && this.dataClass.minMultiplicity === -1) {
          this.min = '*';
        } else {
          this.min = this.dataClass.minMultiplicity;
        }

        if (this.dataClass.maxMultiplicity && this.dataClass.maxMultiplicity === -1) {
          this.max = '*';
        } else {
          this.max = this.dataClass.maxMultiplicity;
        }

        // this.watchDataClassObject();
      });
    } else {
      this.resourcesService.dataClass.getChildDataClass(model, parentDataClass, id).subscribe((result: { body: DataClassResult }) => {
        this.dataClass = result.body;
        this.parentDataModel = {
          id: result.body.model,
          finalised: this.dataClass.breadcrumbs[0].finalised
        };
        this.isEditable = this.dataClass['availableActions']?.includes('update');
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
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'description' };
      case 1:
        return { index: 1, name: 'elements' };
      case 2:
        return { index: 2, name: 'constraints' };
      case 3:
        return { index: 3, name: 'history' };
      case 4:
        return { index: 4, name: 'context' };
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
              'dataClass',
              this.dataClass.id,
              splitDescription[0],
              splitDescription[1],
              data
            )
            .subscribe(
              () => {
                this.loadProfile();
                if (isNew) {
                  this.messageHandler.showSuccess('Profile Added');
                  this.DataModelUsedProfiles(this.dataClass.id);
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

      let resource = {};
      if (!this.showEditDescription) {
        resource = {
          id: this.dataClass.id,
          label: this.editableForm.label,
          description: this.editableForm.description,
          aliases,
          classifiers,
          minMultiplicity: parseInt(this.min, 10),
          maxMultiplicity: parseInt(this.max, 10)
        };
      }

      if (this.showEditDescription) {
        resource = {
          id: this.dataClass.id,
          description: this.editableForm.description || ''
        };
      }

      if (!this.dataClass.parentDataClass) {
        this.resourcesService.dataClass.update(this.dataClass.model, this.dataClass.id, resource).subscribe(result => {
          this.dataClass = result.body;
          this.messageHandler.showSuccess('Data Class updated successfully.');
               this.editableForm.visible = false;
          this.editForm.forEach(x => x.edit({ editing: false }));
          this.editingService.stop();
          this.messageService.dataChanged(result.body);
          this.setEditableForm();
        }, error => {
          this.messageHandler.showError('There was a problem updating the Data Class.', error);
        });
      } else {
        this.resourcesService.dataClass.updateChildDataClass(this.dataClass.model, this.dataClass.parentDataClass, this.dataClass.id, resource).subscribe(result => {
          this.dataClass = result.body;
          this.messageHandler.showSuccess('Data Class updated successfully.');
          this.editableForm.visible = false;
          this.editForm.forEach(x => x.edit({ editing: false }));
          this.editingService.stop();
          this.messageService.dataChanged(result.body);
          this.setEditableForm();
        }, error => {
          this.messageHandler.showError('There was a problem updating the Data Class.', error);
        });
      }
    }
  };

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
          domainType: 'dataClass',
          domainId: this.dataClass.id
        },
        height: '250px'
      });

      dialog.afterClosed().subscribe((newProfile) => {
        if (newProfile) {
          const splitDescription = newProfile.split('/');
          this.resourcesService.profile
            .profile(
              'dataClass',
              this.dataClass.id,
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

  showDescription = () => {
    this.editingService.start();
    this.showEditDescription = true;
    this.editableForm.show();
  };

  loadProfile() {
    const splitDescription = this.descriptionView.split('/');
    this.resourcesService.profile
      .profile(
        'dataClass',
        this.dataClass.id,
        splitDescription[0],
        splitDescription[1]
      )
      .subscribe((body) => {
        this.currentProfileDetails = body.body;
      });
  }

  async DataModelUsedProfiles(id: any) {
    await this.resourcesService.profile
      .usedProfiles('dataClass', id)
      .subscribe((profiles: { body: { [x: string]: any } }) => {
        profiles.body.forEach((profile) => {
          const prof: any = [];
          prof['display'] = profile.displayName;
          prof['value'] = `${profile.namespace}/${profile.name}`;
          this.allUsedProfiles.push(prof);
        });
      });
  }

  async DataModelUnUsedProfiles(id: any) {
    await this.resourcesService.profile
      .unusedProfiles('dataClass', id)
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


  onCancelEdit() {
    this.error = '';
    this.editMode = false; // Use Input editor whe adding a new folder.
    this.showEditDescription = false;
  }
}

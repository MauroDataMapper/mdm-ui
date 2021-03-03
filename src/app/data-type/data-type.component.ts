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
import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SharedService } from '../services/shared.service';
import { BaseComponent } from '@mdm/shared/base/base.component';
import { MatTabGroup } from '@angular/material/tabs';
import { EditingService } from '@mdm/services/editing.service';
import { EditableDataModel } from '@mdm/model/dataModelModel';
import { ElementTypesService, MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import { AddProfileModalComponent } from '@mdm/modals/add-profile-modal/add-profile-modal.component';
import { EditProfileModalComponent } from '@mdm/modals/edit-profile-modal/edit-profile-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mdm-data-type',
  templateUrl: './data-type.component.html',
  styleUrls: ['./data-type.component.scss']
})
export class DataTypeComponent extends BaseComponent implements OnInit, AfterViewInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  @ViewChildren('editableText') editForm: QueryList<any>;

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
  allUsedProfiles: any[] = [];
  allUnUsedProfiles: any[] = [];
  currentProfileDetails: any;
  showEdit: boolean;

  allDataTypes = this.elementTypes.getAllDataTypesArray();
  allDataTypesMap = this.elementTypes.getAllDataTypesMap();


  constructor(
    private title: Title,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private resource: MdmResourcesService,
    private sharedService: SharedService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private dialog: MatDialog,
    private elementTypes: ElementTypesService,
    private editingService: EditingService) {
    super();
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


    this.resource.dataType.get(this.dataModelId, this.id).subscribe(result => {
      const data = result.body;

      // If the Id is a path get the actual Id
      this.dataModelId = data.model;
      this.id = data.id;

      this.dataType = data;

      this.watchDataTypeObject();

      this.editableForm = new EditableDataModel();
      this.editableForm.visible = false;
      this.editableForm.deletePending = false;
      this.editableForm.description = this.dataType.description;
      this.editableForm.label = this.dataType.label;
      this.title.setTitle(`Data Type - ${this.dataType?.label}`);



    this.editableForm.cancel = () => {
      this.editingService.stop();
      this.editForm.forEach(x => x.edit({ editing: false }));
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.errorMessage = '';
      this.editableForm.description = this.dataType.description;
      this.editableForm.label = this.dataType.label;
      if (this.dataType.classifiers) {
        this.dataType.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      if (this.dataType.aliases) {
        this.dataType.aliases.forEach(item => {
          this.editableForm.aliases.push(item);
        });
      }
    };

      this.editableForm.show = () => {
        this.editForm.forEach(x => x.edit({
          editing: true,
          focus: x.name === 'moduleName' ? true : false,
        }));
        this.editableForm.visible = true;
      };

      if (this.dataType.domainType === 'ModelDataType' && this.dataType.modelResourceDomainType === 'Terminology') {
        this.resource.terminology.get(this.dataModelId.modelResourceId).subscribe(termResult => {
          this.elementType = termResult.body;
        });
      } else if (this.dataType.domainType === 'ModelDataType' && this.dataType.modelResourceDomainType === 'CodeSet') {
        this.resource.codeSet.get(this.dataType.modelResourceId).subscribe(elmResult => {
          this.elementType = elmResult.body;
        });
      } else if (this.dataType.domainType === 'ModelDataType' && this.dataType.modelResourceDomainType === 'ReferenceDataModel') {
        this.resource.referenceDataModel.get(this.dataType.modelResourceId).subscribe(dataTypeResult => {
          this.elementType = dataTypeResult.body;
        });
      }

      this.dataType.classifiers = this.dataType.classifiers || [];
      this.loadingData = false;
      this.activeTab = this.getTabDetail(this.tabView);
      this.showExtraTabs = !this.sharedService.isLoggedIn() || !this.dataType.editable;
    }, () => {
      this.loadingData = false;
    });
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  watchDataTypeObject() {
    const access: any = this.securityHandler.elementAccess(this.dataType);
    if (access !== undefined) {
      this.showEdit = access.showEdit;
    }
  }


  tabSelected = itemsName => {
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
      this.resource.dataType.get(this.dataModelId, this.id).subscribe(data => {
        this[this.activeTab.name] = data || [];
        this.loadingData = false;
      });
    }
  };

  getTabDetail = tabName => {
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

  openEditForm = (formName: any) => {
    this.showEditForm = true;
    this.editForm = formName;
  };

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }

  onCancelEdit = () => {
    this.dataType.editAliases = Object.assign([], this.dataType.aliases);
  };

  async DataModelUsedProfiles(id: any) {
    await this.resource.profile
      .usedProfiles('DataType', id)
      .subscribe((profiles: { body: { [x: string]: any } }) => {
        this.allUsedProfiles = [];
        profiles.body.forEach((profile) => {
          const prof: any = [];
          prof['display'] = profile.displayName;
          prof['value'] = `${profile.namespace}/${profile.name}`;
          this.allUsedProfiles.push(prof);
        });
      });
  }

  async DataModelUnUsedProfiles(id: any) {
    await this.resource.profile
      .unusedProfiles('DataType', id)
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

  loadProfile() {
    const splitDescription = this.descriptionView.split('/');
    this.resource.profile
      .profile(
        'DataType',
        this.dataType.id,
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
          domainType: 'DataType',
          domainId: this.dataModel.id
        },
        height: '250px'
      });

      this.editingService.configureDialogRef(dialog);


      dialog.afterClosed().subscribe((newProfile) => {
        if (newProfile) {
          const splitDescription = newProfile.split('/');
          this.resource.profile
            .profile(
              'DataType',
              this.dataModel.id,
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

  editProfile = (isNew: boolean) => {
    this.editingService.start();
    if (this.descriptionView === 'default') {
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

      this.editingService.configureDialogRef(dialog);

      dialog.afterClosed().subscribe((result) => {
        if (result) {
          const splitDescription = prof.value.split('/');
          const data = JSON.stringify(result);
          this.resource.profile
            .saveProfile(
              'DataModel',
              this.dataModel.id,
              splitDescription[0],
              splitDescription[1],
              data
            )
            .subscribe(
              () => {
                this.editingService.stop();
                this.loadProfile();
                if (isNew) {
                  this.messageHandler.showSuccess('Profile Added');
                  this.DataModelUsedProfiles(this.dataModel.id);
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

  formBeforeSave = () => {
    const aliases = [];
    this.editableForm.aliases.forEach(alias => {
      aliases.push(alias);
    });

    const resource = {
        id: this.dataType.id,
        label: this.editableForm.label,
        description: this.editableForm.description || '',
        aliases,
        domainType: this.dataType.domainType,
        classifiers: this.dataType.classifiers.map(cls => ({ id: cls.id }))
      };


    this.resource.dataType.update(this.dataModel.id, this.dataType.id, resource).subscribe((res) => {
      const result = res.body;

      this.dataType.aliases = Object.assign([], result.aliases);
      this.dataType.editAliases = Object.assign([], this.dataType.aliases);
      this.dataType.label = result.label;
      this.dataType.description = result.description;
      this.dataType.showSuccess('Data Type updated successfully.');
      this.editingService.stop();
      this.editableForm.visible = false;
    }, error => {
      this.messageHandler.showError('There was a problem updating the Data Type.', error);
    }
    );


  };
}

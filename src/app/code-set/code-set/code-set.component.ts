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
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { CodeSetResult } from '@mdm/model/codeSetModel';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { EditableDataModel } from '@mdm/model/dataModelModel';
import { AddProfileModalComponent } from '@mdm/modals/add-profile-modal/add-profile-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileModalComponent } from '@mdm/modals/edit-profile-modal/edit-profile-modal.component';
import { MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-code-set',
  templateUrl: './code-set.component.html',
  styleUrls: ['./code-set.component.scss']
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
  currentProfileDetails: any;
  editableForm: EditableDataModel;
  descriptionView = 'default';
  allUsedProfiles: any[] = [];
  allUnUsedProfiles: any[] = [];
  rulesItemCount = 0;
  isLoadingRules = true;
  termsItemCount = 0;
  isLoadingTerms = true;
  showEdit:boolean;

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private title: Title,
    private editingService: EditingService,
    private title: Title,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private editingService: EditingService,
    private securityHandler: SecurityHandlerService
  ) {}

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

    this.editableForm = new EditableDataModel();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    this.editableForm.show = () => {
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editingService.stop();
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.editableForm.description = this.codeSetModel.description;
      if (this.codeSetModel.classifiers) {
        this.codeSetModel.classifiers.forEach((item) => {
          this.editableForm.classifiers.push(item);
        });
      }
      if (this.codeSetModel.aliases) {
        this.codeSetModel.aliases.forEach((item) => {
          this.editableForm.aliases.push(item);
        });
      }
    };

    this.title.setTitle('Code Set');
    this.codeSetDetails(this.parentId);

    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  formBeforeSave = async () => {
    this.editMode = false;

    const classifiers = [];
    this.editableForm.classifiers.forEach((cls) => {
      classifiers.push(cls);
    });
    const aliases = [];
    this.editableForm.aliases.forEach((alias) => {
      aliases.push(alias);
    });

    const resource = {
      id: this.codeSetModel.id,
      label: this.codeSetModel.label,
      description: this.editableForm.description || '',
      author: this.codeSetModel.author,
      organisation: this.codeSetModel.organisation,
      aliases,
      classifiers
    };

    await this.resourcesService.codeSet
      .update(this.codeSetModel.id, resource)
      .subscribe(
        (res) => {
          this.editingService.stop();
          this.messageHandler.showSuccess('Code Set updated successfully.');
          this.editableForm.visible = false;
          this.codeSetModel.description = res.body.description;
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem updating the Code Set.',
            error
          );
        }
      );
  };

  codeSetDetails(id: any) {
    let arr = [];
    this.resourcesService.codeSet
      .get(id)
      .subscribe(async (result: { body: CodeSetResult }) => {
        // Get the guid
        this.codeSetModel = result.body;
        // this.parentId = this.codeSetModel.id;

        this.editableForm = new EditableDataModel();
        this.editableForm.visible = false;
        this.editableForm.deletePending = false;

        this.codeSetUsedProfiles(id);
        this.codsetUnUsedProfiles(id);

        const access: any = this.securityHandler.elementAccess(this.codeSetModel);
        this.showEdit = access.showEdit;

        await this.resourcesService.versionLink
          .list('codeSets', this.codeSetModel.id)
          .subscribe((response) => {
            if (response.body.count > 0) {
              arr = response.body.items;
              for (const val in arr) {
                if (this.codeSetModel.id !== arr[val].targetModel.id) {
                  this.semanticLinks.push(arr[val]);
                }
              }
            }
          });

        this.showExtraTabs =
          !this.sharedService.isLoggedIn() ||
          !this.codeSetModel.editable ||
          this.codeSetModel.finalised;
        if (this.sharedService.isLoggedIn(true)) {
        this.CodeSetPermissions();
        } else {
          this.messageService.FolderSendMessage(this.codeSetModel);
          this.messageService.dataChanged(this.codeSetModel);
        }

        this.tabGroup.realignInkBar();
        // tslint:disable-next-line: deprecation
        this.activeTab = this.getTabDetailByName(
          this.stateService.params.tabView
        ).index;
        this.tabSelected(this.activeTab);
      });
  }

  async codeSetUsedProfiles(id: any) {
    await this.resourcesService.profile
      .usedProfiles('codeSets', id)
      .subscribe((profiles: { body: { [x: string]: any } }) => {
        profiles.body.forEach((profile) => {
          const prof: any = [];
          prof['display'] = profile.displayName;
          prof['value'] = `${profile.namespace}/${profile.name}`;
          this.allUsedProfiles.push(prof);
        });
      });
  }

  onCancelEdit() {
    this.editMode = false; // Use Input editor whe adding a new folder.
  }

  async codsetUnUsedProfiles(id: any) {
    await this.resourcesService.profile
      .unusedProfiles('codeSets', id)
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

  changeProfile() {
    if (
      this.descriptionView !== 'default' &&
      this.descriptionView !== 'other' &&
      this.descriptionView !== 'addnew'
    ) {
      const splitDescription = this.descriptionView.split('/');
      this.resourcesService.profile
        .profile(
          'codeSets',
          this.codeSetModel.id,
          splitDescription[0],
          splitDescription[1]
        )
        .subscribe((body) => {
          this.currentProfileDetails = body.body;
        });
    } else if (this.descriptionView === 'addnew') {
      const dialog = this.dialog.open(AddProfileModalComponent, {
        data: {
          domainType: 'codeSets',
          domainId: this.codeSetModel.id
        },
        height: '250px'
      });

      dialog.afterClosed().subscribe((newProfile) => {
        if (newProfile) {
          const splitDescription = newProfile.split('/');
          this.resourcesService.profile
            .profile(
              'codeSets',
              this.codeSetModel.id,
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

      dialog.afterClosed().subscribe((result) => {
        if (result) {
          const splitDescription = prof.value.split('/');
          const data = JSON.stringify(result);
          this.resourcesService.profile
            .saveProfile(
              'codeSets',
              this.codeSetModel.id,
              splitDescription[0],
              splitDescription[1],
              data
            )
            .subscribe(
              () => {
                this.loadProfile();
                if (isNew) {
                  this.messageHandler.showSuccess('Profile Added');
                  this.codeSetUsedProfiles(this.codeSetModel.id);
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
        'codeSets',
        this.codeSetModel.id,
        splitDescription[0],
        splitDescription[1]
      )
      .subscribe((body) => {
        this.currentProfileDetails = body.body;
      });
  }

  CodeSetPermissions(id: any) {
    this.resourcesService.security
      .permissions('codeSets', id)
      .subscribe((permissions: { body: { [x: string]: any } }) => {
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
        return { index: 1, name: 'terminology' };
      case 'description':
        return { index: 0, name: 'description' };
      case 'comments':
        return { index: 2, name: 'comments' };
      case 'history':
        return { index: 3, name: 'history' };
      case 'links':
        return { index: 4, name: 'links' };
      case 'attachments':
        return { index: 5, name: 'attachments' };
      case 'rules':
        return { index: 6, name: 'rules' };
      default:
        return { index: 0, name: 'terminology' };
    }
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 1:
        return { index: 1, name: 'terminology' };
      case 0:
        return { index: 0, name: 'description' };
      case 2:
        return { index: 2, name: 'comments' };
      case 3:
        return { index: 3, name: 'history' };
      case 4:
        return { index: 4, name: 'links' };
      case 5:
        return { index: 5, name: 'attachments' };
      case 6:
        return { index: 6, name: 'rules' };
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

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }

  termsCountEmitter($event) {
    this.isLoadingTerms = false;
    this.termsItemCount = $event;
  }
}

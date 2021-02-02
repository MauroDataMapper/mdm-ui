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
import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Editable, FolderResult } from '../model/folderModel';
import { Subscription } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '../services/message.service';
import { SharedService } from '../services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { MatTabGroup } from '@angular/material/tabs';
import { EditingService } from '@mdm/services/editing.service';
import { AddProfileModalComponent } from '@mdm/modals/add-profile-modal/add-profile-modal.component';
import { EditProfileModalComponent } from '@mdm/modals/edit-profile-modal/edit-profile-modal.component';
import { MessageHandlerService } from '@mdm/services';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mdm-classification',
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.sass']
})
export class ClassificationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  @Input() afterSave: any;
  @Input() editMode = false;

  @Input() mcClassification;
  classifier = null;

  result: FolderResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  activeTab: any;
  catalogueItemsCount: any;
  terminologiesCount: any;
  termsCount: any;
  codeSetsCount: any;
  loading = false;
  catalogueItems: any;

  descriptionView = 'default';
  editableForm: Editable;
  allUsedProfiles: any[] = [];
  allUnUsedProfiles: any[] = [];
  currentProfileDetails: any;

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private title: Title,
    private editingService: EditingService,
    private messageHandler: MessageHandlerService,
    private dialog: MatDialog) { }

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
    this.title.setTitle('Classifier');
    // tslint:disable-next-line: deprecation
    this.classifierDetails(this.stateService.params.id);

    this.editableForm = new Editable();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    this.editableForm.show = () => {
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editingService.stop();
      this.editableForm.label = this.result.label;
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.editableForm.description = this.result.description;
    };

    this.subscription = this.messageService.changeUserGroupAccess.subscribe(
      (message: boolean) => {
        this.showSecuritySection = message;
      }
    );

    this.subscription = this.messageService.changeUserGroupAccess.subscribe(
      (message: boolean) => {
        this.showSecuritySection = message;
      }
    );
    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
    this.afterSave = (result: { body: { id: any } }) => this.classifierDetails(result.body.id);

    // tslint:disable-next-line: deprecation
    this.activeTab = this.getTabDetailByName(this.stateService.params.tabView);
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  showForm() {
    this.editingService.start();
    this.editableForm.show();
  }

  onCancelEdit() {
    this.editMode = false; // Use Input editor whe adding a new folder.
  }

  classifierDetails(id: any) {
    this.resourcesService.classifier.get(id).subscribe((response: { body: FolderResult }) => {
      this.result = response.body;

      this.parentId = this.result.id;
      this.editableForm.description = this.result.description;

      // Will Be added later
      // this.ClassifierUsedProfiles(this.result.id);
      // this.ClassifierUnUsedProfiles(this.result.id);

      if (this.sharedService.isLoggedIn(true)) {
        this.classifierPermissions(id);
      } else {
        this.messageService.FolderSendMessage(this.result);
        this.messageService.dataChanged(this.result);
      }
    });
  }
  classifierPermissions(id: any) {
    this.resourcesService.security.permissions('classifiers', id).subscribe((permissions: { body: { [x: string]: any } }) => {
      Object.keys(permissions.body).forEach(attrname => {
        this.result[attrname] = permissions.body[attrname];
      });
      // Send it to message service to receive in child components
      this.messageService.FolderSendMessage(this.result);
      this.messageService.dataChanged(this.result);
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

  tabSelected(itemsName) {
    this.getTabDetail(itemsName);
    // this.stateHandler.Go("folder", { tabView: tab.name }, { notify: false, location: tab.index !== 0 });
  }

  async ClassifierUsedProfiles(id: any) {
    await this.resourcesService.profile
      .usedProfiles('classifiers', id)
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

  async ClassifierUnUsedProfiles(id: any) {
    await this.resourcesService.profile
      .unusedProfiles('classifiers', id)
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

  formBeforeSave = () => {
    this.editMode = false;

    const resource = {
      description: this.editableForm.description
    };

      this.resourcesService.classifier.update(this.result.id, resource).subscribe((result) => {
        this.messageHandler.showSuccess('Classifier updated successfully.');
        this.editingService.stop();
        this.editableForm.visible = false;
        this.result = result.body;
      }, error => {
        this.messageHandler.showError('There was a problem updating the Classifier.', error);
      });
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
          domainType: 'classifiers',
          domainId: this.classifier.id
        },
        height: '250px'
      });

      this.editingService.configureDialogRef(dialog);


      dialog.afterClosed().subscribe((newProfile) => {
        if (newProfile) {
          const splitDescription = newProfile.split('/');
          this.resourcesService.profile
            .profile(
              'classifiers',
              this.classifier.id,
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
          this.resourcesService.profile
            .saveProfile(
              'classifiers',
              this.classifier.id,
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
                  this.ClassifierUsedProfiles(this.classifier.id);
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
        'Classifier',
        this.classifier.id,
        splitDescription[0],
        splitDescription[1]
      )
      .subscribe((body) => {
        this.currentProfileDetails = body.body;
      });
  }

  getTabDetail(tabIndex) {
    switch (tabIndex) {
      case 0:
        return { index: 0, name: 'access' };
      case 1:
        return { index: 1, name: 'history' };
      default:
        return { index: 0, name: 'access' };
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'classifiedElements':
        return { index: 0, name: 'classifiedElements' };
      case 'classifiedTerminologies':
        return { index: 1, name: 'classifiedTerminologies' };
      case 'classifiedTerms':
        return { index: 2, name: 'classifiedTerms' };
      case 'classifiedCodeSets':
        return { index: 3, name: 'classifiedCodeSets' };
      case 'history': {
        let index = 4;
        if (this.terminologiesCount === 0) {
          index--;
        }
        if (this.termsCount === 0) {
          index--;
        }
        if (this.codeSetsCount === 0) {
          index--;
        }
        return { index, name: 'history' };
      }
    }
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'classifiedElements' };
      case 1:
        return { index: 1, name: 'classifiedTerminologies' };
      case 2:
        return { index: 2, name: 'classifiedTerms' };
      case 3:
        return { index: 3, name: 'classifiedCodeSets' };
      case 4:
        return { index: 4, name: 'history' };
      default:
        return { index: 0, name: 'classifiedElements' };
    }
  }
}

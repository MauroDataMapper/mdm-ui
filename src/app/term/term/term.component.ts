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
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { EditableTerm, TermResult } from '@mdm/model/termModel';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { DOMAIN_TYPE } from '@mdm/folders-tree/flat-node';
import { EditingService } from '@mdm/services/editing.service';
import { AddProfileModalComponent } from '@mdm/modals/add-profile-modal/add-profile-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileModalComponent } from '@mdm/modals/edit-profile-modal/edit-profile-modal.component';
import { MessageHandlerService } from '@mdm/services';

@Component({
  selector: 'mdm-term',
  templateUrl: './term.component.html',
  styleUrls: ['./term.component.scss']
})
export class TermComponent implements OnInit, AfterViewInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  terminology = null;
  term: TermResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  showExtraTabs = false;
  activeTab: any;
  result: TermResult;
  hasResult = false;
  showEditForm = false;
  editableForm: EditableTerm;
  descriptionView = 'default';
  allUsedProfiles: any[] = [];
  allUnUsedProfiles: any[] = [];
  currentProfileDetails: any;
  showEditDescription = false;
  rulesItemCount = 0;
  isLoadingRules = true;

  constructor(
    private resources: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private broadcast: BroadcastService,
    private changeRef: ChangeDetectorRef,
    private title: Title,
    private dialog: MatDialog,
    private editingService: EditingService
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
    this.title.setTitle('Term');
    this.termDetails(this.parentId);
    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }


  termDetails = (id) => {
    const terms = [];

    // tslint:disable-next-line: deprecation
    terms.push(
      this.resources.terminology.get(this.stateService.params.terminologyId)
    );
    // tslint:disable-next-line: deprecation
    terms.push(
      this.resources.terminology.terms.get(
        this.stateService.params.terminologyId,
        id
      )
    );

    forkJoin(terms).subscribe((results: any) => {
      this.terminology = results[0].body;
      this.term = results[1].body;

      this.resources.catalogueItem
        .listSemanticLinks(DOMAIN_TYPE.Term, this.term.id)
        .subscribe((resp) => {
          this.term.semanticLinks = resp.body.items;
        });

      this.DataModelUsedProfiles(this.term.id);
      this.DataModelUnUsedProfiles(this.term.id);

      this.term.finalised = this.terminology.finalised;
      this.term.editable = this.terminology.editable;

      this.term.classifiers = this.term.classifiers || [];
      this.term.terminology = this.terminology;
      this.activeTab = this.getTabDetailByName(
        // tslint:disable-next-line: deprecation
        this.stateService.params.tabView
      );

      this.editableForm = new EditableTerm();
      this.editableForm.visible = false;
      this.editableForm.deletePending = false;
      this.setEditableForm();

      this.editableForm.show = () => {
        this.editableForm.visible = true;
      };

      this.editableForm.cancel = () => {
        this.editingService.stop();
        this.setEditableForm();
      };

      this.result = this.term;
      if (this.result.terminology) {
        this.hasResult = true;
      }
      this.messageService.FolderSendMessage(this.result);
      this.messageService.dataChanged(this.result);
      this.changeRef.detectChanges();
    });

    // tslint:disable-next-line: deprecation
    this.activeTab = this.getTabDetailByName(
      this.stateService.params.tabView
    ).index;
    this.tabSelected(this.activeTab);
  };

   setEditableForm() {
    this.editableForm.visible = false;
    this.editableForm.validationError = false;
    this.editableForm.description = this.term.description;
    this.editableForm.url = this.term.url;
    if (this.term.classifiers) {
      this.term.classifiers.forEach((item) => {
        this.editableForm.classifiers.push(item);
      });
    }
    if (this.term.aliases) {
      this.term.aliases.forEach((item) => {
        this.editableForm.aliases.push(item);
      });
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'description':
        return { index: 0, name: 'description' };
      case 'links':
        return { index: 1, name: 'links' };
      case 'attachments':
        return { index: 2, name: 'attachments' };
        case 'rules':
          return { index: 3, name: 'rules' };

      default:
        return { index: 0, name: 'description' };
    }
  }

  Save(updatedResource) {
    this.broadcast.broadcast('$elementDetailsUpdated', updatedResource);
  }

  loadProfile() {
    const splitDescription = this.descriptionView.split('/');
    this.resources.profile
      .profile('Term', this.term.id, splitDescription[0], splitDescription[1])
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
          domainType: 'Term',
          domainId: this.term.id
        }
      });

      this.editingService.configureDialogRef(dialog);

      dialog.afterClosed().subscribe((newProfile) => {
        if (newProfile) {
          const splitDescription = newProfile.split('/');
          this.resources.profile
            .profile(
              'Term',
              this.term.id,
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
          this.resources.profile
            .saveProfile(
              'Term',
              this.term.id,
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
                  this.DataModelUsedProfiles(this.term.id);
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

  async DataModelUsedProfiles(id: any) {
    await this.resources.profile
      .usedProfiles('term', id)
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
    await this.resources.profile
      .unusedProfiles('term', id)
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

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'description' };
      case 1:
        return { index: 1, name: 'links' };
      case 2:
        return { index: 2, name: 'attachments' };
      case 3:
        return { index: 3, name: 'rules' };
      default:
        return { index: 0, name: 'description' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go(
      'term',
      { tabView: tab.name },
      { notify: false, location: tab.index !== 0 }
    );
    this.activeTab = tab.index;
  }

  onCancelEdit() {
    this.editMode = false; // Use Input editor whe adding a new folder.
  }

  formBeforeSave = () => {
    this.editMode = false;

    const classifiers = [];
    this.editableForm.classifiers.forEach((cls) => {
      classifiers.push(cls);
    });
    const aliases = [];
    this.editableForm.aliases.forEach((alias) => {
      aliases.push(alias);
    });

    this.term['aliases'] = aliases;
    this.term['classifiers'] = classifiers;
    this.term['description'] = this.editableForm.description;

    this.resources.term
      .update(this.term.terminology.id, this.term.id, this.term)
      .subscribe(
        () => {
          this.messageHandler.showSuccess('Term updated successfully.');
          this.editingService.stop();
          this.editableForm.visible = false;
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem updating the Term.',
            error
          );
        }
      );
  };
}

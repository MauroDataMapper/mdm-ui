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
  OnDestroy,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { StateService } from '@uirouter/core';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BroadcastService } from '../services/broadcast.service';
import { McSelectPagination } from '../utility/mc-select/mc-select.component';
import { MatTabGroup } from '@angular/material/tabs';
import { EditingService } from '@mdm/services/editing.service';
import { EditableTerm } from '@mdm/model/termModel';
import { Subscription } from 'rxjs';
import { MessageHandlerService, MessageService } from '@mdm/services';
import { AddProfileModalComponent } from '@mdm/modals/add-profile-modal/add-profile-modal.component';
import { EditProfileModalComponent } from '@mdm/modals/edit-profile-modal/edit-profile-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mdm-terminology',
  templateUrl: './terminology.component.html',
  styleUrls: ['./terminology.component.sass']
})
export class TerminologyComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  terminology: any;
  diagram: any;
  activeTab: any;
  loadingData: boolean;
  searchTerm: any;
  pagination: McSelectPagination;
  showEditForm = false;
  editForm = null;
  allUsedProfiles: any[] = [];
  allUnUsedProfiles: any[] = [];
  descriptionView = 'default';
  currentProfileDetails: any;
  editableForm: EditableTerm;
  showSearch = false;
  subscription: Subscription;
  rulesItemCount = 0;
  isLoadingRules = true;
  historyItemCount = 0;
  isLoadingHistory = true;


  constructor(
    private stateHandler: StateHandlerService,
    private stateService: StateService,
    private title: Title,
    private resources: MdmResourcesService,
    private broadcastSvc: BroadcastService,
    private messageService: MessageService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private editingService: EditingService
  ) {}

  ngOnInit() {
    // tslint:disable-next-line: deprecation
    const id = this.stateService.params.id;
    if (!id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }
    this.editableForm = new EditableTerm();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;
    this.terminology = null;
    this.diagram = null;
    this.title.setTitle('Terminology');
    this.resources.terminology.get(id).subscribe((result) => {
      const data = result.body;

      this.DataModelUsedProfiles(id);
      this.DataModelUnUsedProfiles(id);

      this.terminology = data;
      this.terminology.classifiers = this.terminology.classifiers || [];
      // tslint:disable-next-line: deprecation
      this.activeTab = this.getTabDetail(this.stateService.params.tabView);
    });

    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
  }

  async DataModelUsedProfiles(id: any) {
    await this.resources.profile
      .usedProfiles('Terminology', id)
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
      .unusedProfiles('Terminology', id)
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

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  changeProfile() {
    if (
      this.descriptionView !== 'default' &&
      this.descriptionView !== 'other' &&
      this.descriptionView !== 'addnew'
    ) {
      const splitDescription = this.descriptionView.split('/');
      this.resources.profile
        .profile(
          'terminology',
          this.terminology.id,
          splitDescription[0],
          splitDescription[1]
        )
        .subscribe((body) => {
          this.currentProfileDetails = body.body;
        });
    } else if (this.descriptionView === 'addnew') {
      const dialog = this.dialog.open(AddProfileModalComponent, {
        data: {
          domainType: 'Terminology',
          domainId: this.terminology.id
        },
        height: '250px'
      });

      dialog.afterClosed().subscribe((newProfile) => {
        if (newProfile) {
          const splitDescription = newProfile.split('/');
          this.resources.profile
            .profile(
              'Terminology',
              this.terminology.id,
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
        this.resources.profile
          .saveProfile(
            'Terminology',
            this.terminology.id,
            splitDescription[0],
            splitDescription[1],
            data
          )
          .subscribe(
            () => {
              this.loadProfile();
              if (isNew) {
                this.messageHandler.showSuccess('Profile Added');
                this.DataModelUsedProfiles(this.terminology.id);
              } else {
                this.messageHandler.showSuccess('Profile Edited Successfully');
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
  };

  loadProfile() {
    const splitDescription = this.descriptionView.split('/');
    this.resources.profile
      .profile(
        'Terminology',
        this.terminology.id,
        splitDescription[0],
        splitDescription[1]
      )
      .subscribe((body) => {
        this.currentProfileDetails = body.body;
      });
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  getTabDetail = (tabName) => {
    switch (tabName) {
      case 'properties':
        return { index: 0, name: 'properties' };
      case 'comments':
        return { index: 1, name: 'comments' };
      case 'attachments':
        return { index: 2, name: 'attachments' };
      case 'history':
        return { index: 3, name: 'history' };
      case 'rules':
        return { index: 4, name: 'rules' };
      default:
        return { index: 0, name: 'properties' };
    }
  };

  getTabDetailIndex = (tabIndex) => {
    switch (tabIndex) {
      case 0:
        return { index: 0, name: 'properties' };
      case 1:
        return { index: 1, name: 'comments' };
      case 2:
        return { index: 2, name: 'attachments' };
      case 3:
        return { index: 3, name: 'history' };
      case 4:
        return { index: 4, name: 'rules' };
      default:
        return { index: 0, name: 'properties' };
    }
  };

  save = (updatedResource?) => {
    this.broadcastSvc.broadcast('$elementDetailsUpdated', updatedResource);
  };

  tabSelected = (tabIndex) => {
    const tab = this.getTabDetailIndex(tabIndex);
    this.stateHandler.Go(
      'terminologyNew',
      { tabView: tab.name },
      { notify: false, location: tab.index !== 0 }
    );
    this[tab.name] = [];
    this.activeTab = tab.index;

    if (this.activeTab && this.activeTab.fetchUrl) {
      this[this.activeTab.name] = [];
      this.loadingData = true;
      // tslint:disable-next-line: deprecation
      this.resources.dataModel
        .get(this.stateService.params.id, this.activeTab.fetchUrl)
        .then((data) => {
          this[this.activeTab.name] = data || [];
          this.loadingData = false;
        });
    }
  };

  openEditForm = (formName) => {
    this.showEditForm = true;
    this.editForm = formName;
  };

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  closeEditForm = () => {
    this.showEditForm = false;
    this.editForm = null;
  };

  fetch = (text, loadAll, offset, limit) => {
    limit = limit ? limit : 30;
    offset = offset ? offset : 0;
    this.pagination = {
      limit,
      offset
    };

    this.searchTerm = text;
    return this.resources.terminology.terms.search(this.terminology.id, {
      search: encodeURIComponent(text),
      limit,
      offset
    });
  };

  onTermSelect = (term) => {
    this.stateHandler.NewWindow(
      'term',
      { terminologyId: term.terminology, id: term.id },
      null
    );
  };

  ngOnDestroy() {
    if (this.subscription) {
      // unsubscribe to ensure no memory leaks
      this.subscription.unsubscribe();
    }
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }

  historyCountEmitter($event) {
    this.isLoadingHistory = false;
    this.historyItemCount = $event;
  }
}

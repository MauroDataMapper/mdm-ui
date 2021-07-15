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
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DoiSubmissionResponse, DoiSubmissionState, Modelable, ModelableDetail, ModelDomainType, Profile, ProfileResponse, ProfileSummaryIndexResponse, Securable, Uuid } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { AddProfileModalComponent } from '@mdm/modals/add-profile-modal/add-profile-modal.component';
import { DefaultProfileEditorModalComponent } from '@mdm/modals/default-profile-editor-modal/default-profile-editor-modal.component';
import { EditProfileModalComponent } from '@mdm/modals/edit-profile-modal/edit-profile-modal.component';
import { EditProfileModalConfiguration, EditProfileModalResult } from '@mdm/modals/edit-profile-modal/edit-profile-modal.model';
import { DefaultProfileItem, DefaultProfileModalConfiguration, DefaultProfileModalResponse } from '@mdm/model/defaultProfileModel';
import { mapCatalogueItemDomainTypeToModelDomainType } from '@mdm/model/model-domain-type';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, SecurityHandlerService, SharedService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { doiProfileNamespace, getDefaultProfileData, ProfileDataViewType, ProfileSummaryListItem } from './profile-data-view.model';

@Component({
  selector: 'mdm-profile-data-view',
  templateUrl: './profile-data-view.component.html',
  styleUrls: ['./profile-data-view.component.scss']
})
export class ProfileDataViewComponent implements OnInit, OnChanges {
  @Input() catalogueItem: Modelable & ModelableDetail & Securable & { [key: string]: any };

  @Output() savingDefault = new EventEmitter<DefaultProfileItem[]>();

  currentView: ProfileDataViewType | string = 'default';
  lastView?: ProfileDataViewType | string;
  usedProfiles: ProfileSummaryListItem[] = [];
  unusedProfiles: ProfileSummaryListItem[] = [];
  currentProfile?: Profile;
  canEdit = false;
  canDeleteProfile = false;
  canAddMetadata = false;

  get isCurrentViewCustomProfile() {
    return this.currentView !== 'default' && this.currentView !== 'other' && this.currentView !== 'addnew';
  }

  get isDoiProfile() {
    return this.shared.features.useDigitalObjectIdentifiers && this.currentProfile?.namespace === doiProfileNamespace;
  }

  get canSubmitForDoi() {
    // TODO: add other conditions for submitting DOIs - finalised, public etc
    // Wait for `availableActions` to send back correct values
    return this.shared.features.useDigitalObjectIdentifiers;
  }

  get showAdditionalActions() {
    const showDoiSubmitAction = this.canSubmitForDoi;
    const showRemoveAction = this.isCurrentViewCustomProfile && this.canDeleteProfile;
    return showRemoveAction || showDoiSubmitAction;
  }

  get modelDomainType(): ModelDomainType {
    return mapCatalogueItemDomainTypeToModelDomainType(this.catalogueItem.domainType);
  }

  constructor(
    private resources: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private editing: EditingService,
    private shared: SharedService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.catalogueItem && this.catalogueItem) {
      this.setAccess();

      if (this.shared.isLoggedIn(true)) {
        this.loadUsedProfiles(this.catalogueItem.domainType, this.catalogueItem.id);
        this.loadUnusedProfiles(this.catalogueItem.domainType, this.catalogueItem.id);
      }
    }
  }

  changeProfile() {
    if (this.currentView === 'default' || this.currentView === 'other') {
      this.lastView = this.currentView;
      this.currentProfile = null;
      return;
    }

    if (this.currentView === 'addnew') {
      this.addNewProfile();
      return;
    }

    this.selectCustomProfile();
  }

  editDefaultProfileDescription() {
    this.editDefaultProfile(getDefaultProfileData(this.catalogueItem, true));
  }

  editDefaultProfileFull() {
    this.editDefaultProfile(getDefaultProfileData(this.catalogueItem, false));
  }

  editCustomProfile(isNew?: boolean) {
    const selected = this.usedProfiles
      .concat(this.unusedProfiles)
      .find(item => item.value === this.currentView);

    this.editing
      .openDialog<EditProfileModalComponent, EditProfileModalConfiguration, EditProfileModalResult>(
        EditProfileModalComponent,
        {
          data: {
            profile: this.currentProfile,
            profileName: selected.display,
            catalogueItem: this.catalogueItem,
            isNew: isNew ?? false
          },
          disableClose: true,
          panelClass: 'full-width-dialog'
        })
      .afterClosed()
      .pipe(
        tap(result => {
          if (!result.profile && isNew) {
            this.currentView = 'default';
            this.changeProfile();
          }
        }),
        filter(result => result.status === ModalDialogStatus.Ok),
        switchMap(result => {
          const data = JSON.stringify(result.profile);
          return this.resources.profile
            .saveProfile(
              this.catalogueItem.domainType,
              this.catalogueItem.id,
              selected.namespace,
              selected.name,
              data);
        }),
        catchError(error => {
          this.messageHandler.showError('There was a problem saving the profile.', error);
          return EMPTY;
        })
      )
      .subscribe((response: ProfileResponse) => {
        this.currentProfile = response.body;
        this.currentProfile.namespace = selected.namespace;
        this.currentProfile.name = selected.name;

        if (isNew) {
          this.messageHandler.showSuccess('Profile added.');
          this.loadUsedProfiles(this.catalogueItem.domainType, this.catalogueItem.id);
          this.loadUnusedProfiles(this.catalogueItem.domainType, this.catalogueItem.id);
        }
        else {
          this.messageHandler.showSuccess(
            'Profile edited successfully.'
          );
        }
      });
  }

  deleteCustomProfile() {
    if (!this.currentProfile) {
      return;
    }

    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Are you sure you want to remove this Profile?',
          okBtnTitle: 'Yes, remove',
          btnType: 'warn',
          message: `<p class="marginless">${this.currentProfile.name} will be removed, are you sure? </p>`
        }
      })
      .pipe(
        switchMap(() => {
          return this.resources.profile.deleteProfile(
            this.catalogueItem.domainType,
            this.catalogueItem.id,
            this.currentProfile.namespace,
            this.currentProfile.name
          );
        }),
        catchError(error => {
          this.messageHandler.showError('Unable to remove profile', error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('Profile removed successfully');
        this.currentView = 'default';
        this.loadUsedProfiles(this.catalogueItem.domainType, this.catalogueItem.id);
        this.loadUnusedProfiles(this.catalogueItem.domainType, this.catalogueItem.id);
        this.changeProfile();
      });
  }

  submitForDoi(state: DoiSubmissionState) {
    const selected = this.usedProfiles
      .concat(this.unusedProfiles)
      .find(item => item.namespace === doiProfileNamespace);

    if (!selected) {
      this.messageHandler.showWarning('Unable to find the Digital Object Identifier profile. Please check with your administrator if it is enabled.');
      return;
    }

    const doiProfileInUse = this.usedProfiles.find(item => item.value === selected.value);

    const description = doiProfileInUse
      ? `Before submitting this object to receive a '${state}' Digital Object Identifier (DOI), please check all profile information below to ensure it is correct, then click the 'Submit' button.`
      : `To receive a '${state}' Digital Object Identifier (DOI), please fill in the profile information below, then click the 'Submit' button.`;

    this.resources.profile
      .profile(this.catalogueItem.domainType, this.catalogueItem.id, selected.namespace, selected.name, '')
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem getting the selected profile.', error);
          return EMPTY;
        }),
        switchMap((response: ProfileResponse) => {
          return this.editing
            .openDialog<EditProfileModalComponent, EditProfileModalConfiguration, EditProfileModalResult>(
              EditProfileModalComponent,
              {
                data: {
                  profile: response.body,
                  profileName: selected.display,
                  catalogueItem: this.catalogueItem,
                  isNew: !doiProfileInUse,
                  description,
                  okBtn: 'Submit'
                },
                disableClose: true,
                panelClass: 'full-width-dialog'
              })
            .afterClosed();
        }),
        filter((result: EditProfileModalResult) => result.status === ModalDialogStatus.Ok),
        switchMap((result: EditProfileModalResult) => {
          const data = JSON.stringify(result.profile);
          return this.resources.profile
            .saveProfile(
              this.catalogueItem.domainType,
              this.catalogueItem.id,
              selected.namespace,
              selected.name,
              data);
        }),
        catchError(error => {
          this.messageHandler.showError('There was a problem saving the profile.', error);
          return EMPTY;
        }),
        switchMap(() => {
          return this.resources.pluginDoi.save(
            ModelDomainType.DataModels,
            this.catalogueItem.id,
            {
              submissionType: state
            });
        }),
        catchError(error => {
          this.messageHandler.showError('There was a problem submitting the profile to generate a Digital Object Identifier (DOI).', error);
          return EMPTY;
        }),
      )
      .subscribe((response: DoiSubmissionResponse) => {
        this.messageHandler.showSuccess('A Digital Object Identifier (DOI) was successfully stored in this profile.');
      });
  }

  private setAccess() {
    const access = this.securityHandler.elementAccess(this.catalogueItem);
    this.canEdit = access.showEdit;
    this.canDeleteProfile = access.showDelete;
    this.canAddMetadata = access.canAddMetadata;
  }

  private loadUsedProfiles(domainType: ModelDomainType | string, id: Uuid) {
    this.loadProfileItems('used', domainType, id)
      .subscribe(items => this.usedProfiles = items);
  }

  private loadUnusedProfiles(domainType: ModelDomainType | string, id: any) {
    this.loadProfileItems('unused', domainType, id)
      .subscribe(items => this.unusedProfiles = items);
  }

  private loadProfileItems(
    type: 'used' | 'unused',
    domainType: ModelDomainType | string,
    id: any): Observable<ProfileSummaryListItem[]> {
    const request: Observable<ProfileSummaryIndexResponse> = type === 'used'
      ? this.resources.profile.usedProfiles(domainType, id)
      : this.resources.profile.unusedProfiles(domainType, id);

    return request.pipe(
      catchError(error => {
        this.messageHandler.showError('There was a problem getting the list of unused profiles.', error);
        return EMPTY;
      }),
      map((response: ProfileSummaryIndexResponse) => {
        return response.body.map(summary => {
          return {
            display: summary.displayName,
            value: `${summary.namespace}/${summary.name}`,
            namespace: summary.namespace,
            name: summary.name
          };
        })
      })
    );
  }

  private editDefaultProfile(items: DefaultProfileItem[]) {
    this.editing
      .openDialog<
        DefaultProfileEditorModalComponent,
        DefaultProfileModalConfiguration,
        DefaultProfileModalResponse
      >(DefaultProfileEditorModalComponent, {
        data: {
          items,
          parentCatalogueItem: this.catalogueItem.breadcrumbs ? this.catalogueItem.breadcrumbs[0] : null
        },
        panelClass: 'full-width-dialog'
      })
      .afterClosed()
      .pipe(
        filter(result => result.status === ModalDialogStatus.Ok)
      )
      .subscribe(result => {
        this.savingDefault.emit(result.items);
      });
  }

  private selectCustomProfile() {
    this.lastView = this.currentView;

    const [namespace, name] = this.getNamespaceAndName(this.currentView);

    this.resources.profile
      .profile(this.catalogueItem.domainType, this.catalogueItem.id, namespace, name)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem getting the selected profile.', error);
          return EMPTY;
        })
      )
      .subscribe((response: ProfileResponse) => {
        this.currentProfile = response.body;
        this.currentProfile.namespace = namespace;
        this.currentProfile.name = name;
      });
  }

  private addNewProfile() {
    if (!this.lastView) {
      this.lastView = 'default';
    }

    this.editing
      .openDialog(AddProfileModalComponent, {
        data: {
          domainType: this.catalogueItem.domainType,
          domainId: this.catalogueItem.id
        }
      })
      .afterClosed()
      .subscribe((newProfile) => {
        if (newProfile) {
          const [namespace, name] = this.getNamespaceAndName(newProfile);
          this.resources.profile
            .profile(this.catalogueItem.domainType, this.catalogueItem.id, namespace, name, '')
            .pipe(
              catchError(error => {
                this.messageHandler.showError('There was a problem getting the selected profile.', error);
                return EMPTY;
              })
            )
            .subscribe((response: ProfileResponse) => {
              this.currentView = newProfile;
              this.currentProfile = response.body;
              this.currentProfile.namespace = namespace;
              this.currentProfile.name = name;
              this.editCustomProfile(true);
            });
        }
        else {
          this.currentView = this.lastView;
          this.changeProfile();
        }
      });
  }

  private getNamespaceAndName(viewName: string): [string, string] {
    const split = viewName.split('/');
    return [split[0], split[1]];
  }
}

/*
Copyright 2020-2022 University of Oxford
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
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ApiProperty,
  ApiPropertyIndexResponse,
  CatalogueItem,
  CatalogueItemDomainType,
  catalogueItemToMultiFacetAware,
  DoiState,
  DoiStatusResponse,
  DoiSubmissionState,
  Finalisable,
  isDataType,
  MdmResponse,
  Modelable,
  ModelableDetail,
  MultiFacetAwareDomainType,
  Profile,
  ProfileResponse,
  ProfileSummaryIndexResponse,
  SecurableModel,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import {
  AddProfileModalComponent,
  AddProfileModalConfiguration
} from '@mdm/modals/add-profile-modal/add-profile-modal.component';
import { DefaultProfileEditorModalComponent } from '@mdm/modals/default-profile-editor-modal/default-profile-editor-modal.component';
import { EditProfileModalComponent } from '@mdm/modals/edit-profile-modal/edit-profile-modal.component';
import {
  EditProfileModalConfiguration,
  EditProfileModalResult
} from '@mdm/modals/edit-profile-modal/edit-profile-modal.model';
import {
  DefaultProfileItem,
  DefaultProfileModalConfiguration,
  DefaultProfileModalResponse
} from '@mdm/model/defaultProfileModel';
import {
  MdmHttpHandlerOptions,
  MdmResourcesService
} from '@mdm/modules/resources';
import {
  MessageHandlerService,
  SecurityHandlerService,
  SharedService
} from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { EMPTY, from, Observable, Subject, zip } from 'rxjs';
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  tap
} from 'rxjs/operators';
import {
  doiProfileNamespace,
  getDefaultProfileData,
  ProfileDataViewType,
  ProfileSummaryListItem
} from './profile-data-view.model';
import { GridService } from '@mdm/services/grid.service';

@Component({
  selector: 'mdm-profile-data-view',
  templateUrl: './profile-data-view.component.html',
  styleUrls: ['./profile-data-view.component.scss']
})
export class ProfileDataViewComponent implements OnInit, OnChanges {
  @Input() catalogueItem: Modelable &
    ModelableDetail &
    SecurableModel &
    Finalisable & {
      [key: string]: any;
      model?: Uuid;
    };

  @Output() savingDefault = new EventEmitter<DefaultProfileItem[]>();

  currentView: ProfileDataViewType | string;
  lastView?: ProfileDataViewType | string;
  usedProfiles: ProfileSummaryListItem[] = [];
  unusedProfiles: ProfileSummaryListItem[] = [];
  currentProfile?: Profile;
  canEdit = false;
  canDeleteProfile = false;
  canAddMetadata = false;
  isEditablePostFinalise = false;
  isReadableByEveryone = false;
  doiState: DoiState = 'not submitted';
  defaultProfileMetadataNamespace: string;
  defaultProfileView: string;
  otherDefaultProfileView: string;
  useDefaultProfileSimplifiedEntry = false;
  showCanEditPropertyAlert = true;

  private readonly defaultProfileNamespacePropertyKey =
    'ui.default.profile.namespace';
  private readonly useDefaultProfileSimplifiedEntryPropertyKey =
    'ui.default.profile.simplified_entry';
  private readonly showCanEditPropertyAlertKey =
    'ui.show_can_edit_property_alert';


  get canEditCustomProfile() {
    if (
      this.currentView === 'default' ||
      this.currentView === 'other' ||
      this.currentView === 'addnew'
    ) {
      return false;
    }

    const profileSummary = this.usedProfiles.find(
      (summary) => summary.value === this.currentView
    );

    return this.canEdit || profileSummary?.editableAfterFinalisation;
  }

  get canAddProfilesAfterFinalisation() {
    if (!this.catalogueItem.finalised) {
      return false;
    }

    return this.unusedProfiles.some(
      (profile) => profile.editableAfterFinalisation
    );
  }

  get isCurrentViewCustomProfile() {
    return (
      this.currentView !== 'default' &&
      this.currentView !== 'other' &&
      this.currentView !== 'addnew'
    );
  }

  get isDoiProfile() {
    return (
      this.shared.features.useDigitalObjectIdentifiers &&
      this.currentProfile?.namespace === doiProfileNamespace
    );
  }

  get canSubmitForDoi() {
    // DOI profiles can only be submitted for finalised, public items
    return (
      this.shared.features.useDigitalObjectIdentifiers &&
      this.isEditablePostFinalise &&
      this.isReadableByEveryone &&
      this.doiState !== 'retired'
    );
  }

  get showAdditionalActions() {
    const showDoiSubmitAction = this.canSubmitForDoi;
    const showRemoveAction =
      this.isCurrentViewCustomProfile && this.canDeleteProfile;
    return showRemoveAction || showDoiSubmitAction;
  }

  get multiFacetAwareDomainType(): MultiFacetAwareDomainType {
    return catalogueItemToMultiFacetAware(this.catalogueItem.domainType);
  }

  constructor(
    private resources: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private editing: EditingService,
    private gridService: GridService,
    private shared: SharedService
  ) {}

  ngOnInit(): void {
    this.resources.apiProperties
      .listPublic()
      .pipe(
        catchError((errors) => {
          this.messageHandler.showError(
            'There was a problem getting the configuration properties.',
            errors
          );
          return [];
        })
      )
      .subscribe((response: ApiPropertyIndexResponse) => {
        this.loadDefaultCustomProfile(response.body.items);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.catalogueItem && this.catalogueItem) {
      this.setAccess();
      if (!this.catalogueItem.domainType) {
        this.catalogueItem.domainType =
          changes.catalogueItem.previousValue.domainType;
      }
      this.loadUsedProfiles(
        this.catalogueItem.domainType,
        this.catalogueItem.id
      );
      this.loadUnusedProfiles(
        this.catalogueItem.domainType,
        this.catalogueItem.id
      );

      if (this.shared.features.useDigitalObjectIdentifiers) {
        this.getDoiStatus();

        if (this.catalogueItem.model) {
          this.loadParentModelForDoiState();
        }
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
      .find((item) => item.value === this.currentView);

    const oldProfile: Profile = JSON.parse(JSON.stringify(this.currentProfile));

    this.editing
      .openDialog<
        EditProfileModalComponent,
        EditProfileModalConfiguration,
        EditProfileModalResult
      >(EditProfileModalComponent, {
        data: {
          profile: this.currentProfile,
          profileName: selected.display,
          catalogueItem: this.catalogueItem,
          isNew: isNew ?? false,
          finalised: this.catalogueItem.finalised
        },
        disableClose: true,
        panelClass: 'full-width-dialog'
      })
      .afterClosed()
      .pipe(
        tap((result) => {
          if (!result.profile && isNew) {
            this.currentView = this.lastView;
            this.changeProfile();
          }
          if (result.status !== ModalDialogStatus.Ok && !isNew) {
            this.currentProfile = oldProfile;
          }
        }),
        filter((result) => result.status === ModalDialogStatus.Ok),
        switchMap((result) => {
          return this.resources.profile.saveProfile(
            this.catalogueItem.domainType,
            this.catalogueItem.id,
            selected.namespace,
            selected.name,
            result.profile,
            selected.version
          );
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem saving the profile.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((response: ProfileResponse) => {
        this.currentProfile = response.body;
        this.currentProfile.namespace = selected.namespace;
        this.currentProfile.name = selected.name;

        if (isNew) {
          this.messageHandler.showSuccess('Profile added.');
          this.loadUsedProfiles(
            this.catalogueItem.domainType,
            this.catalogueItem.id
          );
          this.loadUnusedProfiles(
            this.catalogueItem.domainType,
            this.catalogueItem.id
          );
        } else {
          this.messageHandler.showSuccess('Profile edited successfully.');
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
            this.currentProfile.name,
            this.currentProfile.version
          );
        }),
        catchError((error) => {
          this.messageHandler.showError('Unable to remove profile', error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        let notCurrentOtherDefaultProfileView: string;
        if (
          this.otherDefaultProfileView !== undefined &&
          this.currentView !== this.otherDefaultProfileView
        ) {
          notCurrentOtherDefaultProfileView = this.otherDefaultProfileView;
        }
        this.messageHandler.showSuccess('Profile removed successfully');
        this.currentView =
          this.usedProfiles.find(
            (e) =>
              e.value === this.defaultProfileView &&
              !(
                e.namespace === this.currentProfile.namespace &&
                e.name === this.currentProfile.name &&
                e.version === this.currentProfile.version
              )
          )?.value ??
          notCurrentOtherDefaultProfileView ??
          'default';
        this.loadUsedProfiles(
          this.catalogueItem.domainType,
          this.catalogueItem.id
        );
        this.loadUnusedProfiles(
          this.catalogueItem.domainType,
          this.catalogueItem.id
        );
        this.changeProfile();
      });
  }

  submitForDoi(state: DoiSubmissionState) {
    if (!this.shared.features.useDigitalObjectIdentifiers) {
      return;
    }

    if (state === 'retire') {
      this.retireDoi();
      return;
    }

    this.submitCatalogueItemForDoi(state);
  }

  private setAccess() {
    const access = this.securityHandler.elementAccess(this.catalogueItem);
    this.canEdit = access.showEdit;
    this.canDeleteProfile = access.showDelete;
    this.canAddMetadata = access.canAddMetadata;
    this.isEditablePostFinalise = access.canEditAfterFinalise;
    this.isReadableByEveryone = this.catalogueItem.readableByEveryone;
  }

  private loadUsedProfiles(domainType: CatalogueItemDomainType, id: Uuid) {
    this.loadProfileItems('used', domainType, id).subscribe((items) => {
      if (items && items.length > 0) {
        this.usedProfiles = items;

        // Set a default value
        this.loadDefaultProfilePropertyValue(domainType, id).subscribe(
          (defaultValues) => {
            if (defaultValues && defaultValues.length > 0) {
              this.defaultProfileView = defaultValues[0].value;
              if (defaultValues.length > 1) {
                this.otherDefaultProfileView = defaultValues[1].value;
              } else {
                this.otherDefaultProfileView = undefined;
              }
            }
            if (!this.currentView && this.defaultProfileView) {
              // Get the item in usedProfiles that matches the otherProperties value
              this.currentView =
                this.usedProfiles.find(
                  (e) => e.value === this.defaultProfileView
                )?.value ?? 'default';
            } else if (!this.currentView) {
              this.currentView = 'default';
            }
            this.changeProfile();
          }
        );
      } else {
        this.usedProfiles = items;
        if (!this.currentView) {
          this.currentView = 'default';
        }
      }
      this.changeProfile();
    });
  }

  private loadUnusedProfiles(domainType: CatalogueItemDomainType, id: any) {
    this.loadProfileItems('unused', domainType, id).subscribe(
      (items) => (this.unusedProfiles = items)
    );
  }

  private loadParentModelForDoiState() {
    const request = this.getParentModel();
    if (!request) {
      return;
    }

    request
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem getting the parent model.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((response) => {
        const parentModel = response.body;

        // Fetch the parent model to find out if that is a public, finalised model. Required to know if
        // DOI submission actions can be displayed. Overwrites the values set in setAccess()
        // for `this.catalogueItem`
        const access = this.securityHandler.elementAccess(parentModel);
        this.isEditablePostFinalise = access.canEditAfterFinalise;
        this.isReadableByEveryone = parentModel.readableByEveryone;
      });
  }

  private getParentModel():
    | Observable<MdmResponse<CatalogueItem & SecurableModel & Finalisable>>
    | undefined {
    if (
      isDataType(this.catalogueItem.domainType) ||
      this.catalogueItem.domainType === CatalogueItemDomainType.DataClass ||
      this.catalogueItem.domainType === CatalogueItemDomainType.DataElement
    ) {
      return this.resources.dataModel.get(this.catalogueItem.model);
    }

    if (this.catalogueItem.domainType === CatalogueItemDomainType.Term) {
      return this.resources.terminology.get(this.catalogueItem.model);
    }

    return undefined;
  }

  private loadProfileItems(
    type: 'used' | 'unused',
    domainType: CatalogueItemDomainType,
    id: any
  ): Observable<ProfileSummaryListItem[]> {
    const request: Observable<ProfileSummaryIndexResponse> =
      type === 'used'
        ? this.resources.profile.usedProfiles(domainType, id)
        : this.resources.profile.unusedProfiles(domainType, id);

    return request.pipe(
      catchError((error) => {
        this.messageHandler.showError(
          'There was a problem getting the list of unused profiles.',
          error
        );
        return EMPTY;
      }),
      map((response: ProfileSummaryIndexResponse) => {
        return response.body.map((summary) => {
          return {
            display: `${summary.displayName} (${summary.version})`,
            value: `${summary.namespace}/${summary.name}/${summary.version}`,
            namespace: summary.namespace,
            name: summary.name,
            version: summary.version,
            editableAfterFinalisation: summary.editableAfterFinalisation
          };
        });
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
          parentCatalogueItem: this.catalogueItem.breadcrumbs
            ? this.catalogueItem.breadcrumbs[0]
            : null
        },
        panelClass: 'full-width-dialog'
      })
      .afterClosed()
      .pipe(filter((result) => result.status === ModalDialogStatus.Ok))
      .subscribe((result) => {
        this.savingDefault.emit(result.items);
      });
  }

  private selectCustomProfile() {
    this.lastView = this.currentView;

    const [namespace, name, version] = this.getNamespaceNameAndVersion(
      this.currentView
    );

    if (namespace && name && version) {
      this.resources.profile
        .profile(
          this.catalogueItem.domainType,
          this.catalogueItem.id,
          namespace,
          name,
          version
        )
        .pipe(
          catchError((error) => {
            this.messageHandler.showError(
              'There was a problem getting the selected profile.',
              error
            );
            return EMPTY;
          })
        )
        .subscribe((response: ProfileResponse) => {
          this.currentProfile = response.body;
          this.currentProfile.namespace = namespace;
          this.currentProfile.name = name;
          this.currentProfile.version = version;
        });
    }
  }

  private addNewProfile() {
    if (!this.lastView) {
      this.lastView = 'default';
    }

    this.editing
      .openDialog<
        AddProfileModalComponent,
        AddProfileModalConfiguration,
        string
      >(AddProfileModalComponent, {
        data: {
          domainType: this.catalogueItem.domainType,
          domainId: this.catalogueItem.id,
          finalised: this.catalogueItem.finalised
        }
      })
      .afterClosed()
      .subscribe((newProfile) => {
        if (newProfile) {
          const [namespace, name, version] = this.getNamespaceNameAndVersion(
            newProfile
          );
          this.resources.profile
            .profile(
              this.catalogueItem.domainType,
              this.catalogueItem.id,
              namespace,
              name,
              version
            )
            .pipe(
              catchError((error) => {
                this.messageHandler.showError(
                  'There was a problem getting the selected profile.',
                  error
                );
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
        } else {
          this.currentView = this.lastView;
          this.changeProfile();
        }
      });
  }

  private getNamespaceNameAndVersion(
    viewName: string
  ): [string, string, string] {
    if (!viewName) {
      return [null, null, null];
    }
    const split = viewName.split('/');
    return [split[0], split[1], split[2]];
  }

  private getDoiStatus() {
    // A 404 will be returned if no DOI state information is available. Avoid triggering the
    // "not found" route and handle this case manually
    const options: MdmHttpHandlerOptions = {
      handleGetErrors: false
    };

    this.resources.pluginDoi
      .get(this.catalogueItem.domainType, this.catalogueItem.id, {}, options)
      .pipe(
        catchError(() => {
          this.doiState = 'not submitted';
          return EMPTY;
        })
      )
      .subscribe((response: DoiStatusResponse) => {
        this.doiState = response.body.status;
      });
  }

  private submitCatalogueItemForDoi(state: DoiSubmissionState) {
    const doiProfileSummary = this.usedProfiles
      .concat(this.unusedProfiles)
      .find((item) => item.namespace === doiProfileNamespace);

    if (!doiProfileSummary) {
      this.messageHandler.showWarning(
        'Unable to find the Digital Object Identifier profile. Please check with your administrator if it is enabled.'
      );
      return;
    }

    const doiProfileInUse = this.usedProfiles.find(
      (item) => item.value === doiProfileSummary.value
    );

    const description = doiProfileInUse
      ? `Before submitting this object to receive a '${state}' Digital Object Identifier (DOI), please check all profile information below to ensure it is correct, then click the 'Submit' button.`
      : `To receive a '${state}' Digital Object Identifier (DOI), please fill in the profile information below, then click the 'Submit' button.`;

    this.resources.profile
      .profile(
        this.catalogueItem.domainType,
        this.catalogueItem.id,
        doiProfileSummary.namespace,
        doiProfileSummary.name,
        ''
      )
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem getting the selected profile.',
            error
          );
          return EMPTY;
        }),
        switchMap((response: ProfileResponse) => {
          const profile = response.body;
          // Namespace and name of profile are not supplied in response, but required for other components to work
          profile.namespace = doiProfileSummary.namespace;
          profile.name = doiProfileSummary.name;

          return this.editing
            .openDialog<
              EditProfileModalComponent,
              EditProfileModalConfiguration,
              EditProfileModalResult
            >(EditProfileModalComponent, {
              data: {
                profile: response.body,
                profileName: doiProfileSummary.display,
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
        filter(
          (result: EditProfileModalResult) =>
            result.status === ModalDialogStatus.Ok
        ),
        switchMap((result: EditProfileModalResult) => {
          return this.resources.profile.saveProfile(
            this.catalogueItem.domainType,
            this.catalogueItem.id,
            doiProfileSummary.namespace,
            doiProfileSummary.name,
            result.profile
          );
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem saving the profile.',
            error
          );
          return EMPTY;
        }),
        switchMap(() => {
          return this.resources.pluginDoi.save(
            this.catalogueItem.domainType,
            this.catalogueItem.id,
            {
              submissionType: state
            }
          );
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem submitting the profile to generate a Digital Object Identifier (DOI).',
            error
          );
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          'A Digital Object Identifier (DOI) was successfully stored in this profile.'
        );
        this.getDoiStatus();
        this.loadUsedProfiles(
          this.catalogueItem.domainType,
          this.catalogueItem.id
        );
        this.loadUnusedProfiles(
          this.catalogueItem.domainType,
          this.catalogueItem.id
        );
        if (this.isDoiProfile) {
          // If the DOI profile is currently visible, refresh the view
          this.selectCustomProfile();
        }
      });
  }

  private retireDoi() {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Confirm',
          message:
            'Are you sure you want to retire the Digital Object Identifier (DOI) for this catalogue item? Once retired, this cannot be undone.',
          okBtnTitle: 'Yes, retire',
          cancelBtnTitle: 'No',
          btnType: 'warn'
        }
      })
      .pipe(
        switchMap(() => {
          return this.resources.pluginDoi.save(
            this.catalogueItem.domainType,
            this.catalogueItem.id,
            {
              submissionType: 'retire'
            }
          );
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem retiring the Digital Object Identifier (DOI).',
            error
          );
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          'The Digital Object Identifier (DOI) was successfully retired.'
        );
        this.getDoiStatus();
        if (this.isDoiProfile) {
          // If the DOI profile is currently visible, refresh the view
          this.selectCustomProfile();
        }
      });
  }

  private loadDefaultCustomProfile(properties: ApiProperty[]) {
    this.defaultProfileMetadataNamespace = this.getContentProperty(
      properties,
      this.defaultProfileNamespacePropertyKey
    );
    this.useDefaultProfileSimplifiedEntry =
      this.getContentProperty(
        properties,
        this.useDefaultProfileSimplifiedEntryPropertyKey
      ) === 'true';

    this.showCanEditPropertyAlert =
      JSON.parse(this.getContentProperty(properties,
        this.showCanEditPropertyAlertKey));

  }

  private getContentProperty(properties: ApiProperty[], key: string): string {
    return properties?.find((p) => p.key === key)?.value;
  }

  private getCatalogueItemHierarchy() {
    let catalogueHierarchy = [];
    catalogueHierarchy.push({
      id: this.catalogueItem.id,
      domainType: this.catalogueItem.domainType
    });
    if (this.catalogueItem.hasOwnProperty('breadcrumbs')) {
      catalogueHierarchy = catalogueHierarchy.concat(
        this.catalogueItem.breadcrumbs.map((breadcrumb) => {
          return { id: breadcrumb.id, domainType: breadcrumb.domainType };
        })
      );
    }

    return catalogueHierarchy;
  }

  private loadDefaultProfilePropertyValue(
    domainType: CatalogueItemDomainType,
    id: any
  ) {
    const catalogueHierarchy = this.getCatalogueItemHierarchy();

    // Get metadata for each catalogueItem in the hierarchy
    const options = this.gridService.constructOptions(20, 0, null, null, null);
    // const request: Observable<any> =
    this.resources.profile.otherMetadata(domainType, id, options);

    const properties = from(catalogueHierarchy).pipe(
      catchError((error) => {
        this.messageHandler.showError(
          'There was a problem getting the list of other properties.',
          error
        );
        return EMPTY;
      }),
      mergeMap((param) => this.getPropertiesFromCatalogueItem(param))
    );

    const observable = zip(properties);

    let responses = [];
    const subject = new Subject<any>();
    observable.subscribe({
      next: (defaultProfileProperties) => {
        const namespace = defaultProfileProperties[0].find(
          (property) => property.key === 'namespace'
        );
        const name = defaultProfileProperties[0].find(
          (property) => property.key === 'name'
        );
        const version = defaultProfileProperties[0].find(
          (property) => property.key === 'version'
        );
        if (
          !this.useDefaultProfileSimplifiedEntry &&
          namespace !== undefined &&
          name !== undefined &&
          version !== undefined
        ) {
          responses = this.usedProfiles
            .filter(
              (usedProfile) =>
                usedProfile.namespace === namespace.value &&
                usedProfile.name === name.value &&
                usedProfile.version === version.value
            )
            .concat(responses);
        } else {
          for (const property_item of defaultProfileProperties[0]) {
            if (property_item !== undefined) {
              //
              responses = this.usedProfiles
                .filter(
                  (usedProfile) =>
                    decodeURIComponent(usedProfile.name) +
                      '/' +
                      usedProfile.version ===
                    property_item.value
                )
                .concat(responses);
            }
          }
        }
      },
      complete: () => {
        subject.next(responses);
      }
    });

    return subject.asObservable();
  }

  private getPropertiesFromCatalogueItem(param) {
    const options = this.gridService.constructOptions(20, 0, null, null, null);
    const request: Observable<any> = this.resources.profile.otherMetadata(
      param.domainType,
      param.id,
      options
    );

    return request.pipe(
      catchError((error) => {
        this.messageHandler.showError(
          'There was a problem getting the list of other properties.',
          error
        );
        return EMPTY;
      }),
      map((data: any) => {
        const tempItems = data.body.items;
        const items = tempItems.filter(
          (o) => o.namespace === this.defaultProfileMetadataNamespace
        );
        return items;
      })
    );
  }
}

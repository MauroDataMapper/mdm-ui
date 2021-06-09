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
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CodeSetDetail,
  Container,
  DataElementDetail,
  DataModelDetail,
  DataTypeReference,
  FolderDetail,
  ModelDomainType,
  TermDetail,
  TerminologyDetail,
  VersionedFolderDetail
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { AddProfileModalComponent } from '@mdm/modals/add-profile-modal/add-profile-modal.component';
import { DefaultProfileEditorModalComponent } from '@mdm/modals/default-profile-editor-modal/default-profile-editor-modal.component';
import { EditProfileModalComponent } from '@mdm/modals/edit-profile-modal/edit-profile-modal.component';
import {
  DefaultProfileItem,
  ProfileControlTypes,
  DefaultProfileControls,
  DefaultProfileModalConfiguration,
  DefaultProfileModalResponse
} from '@mdm/model/defaultProfileModel';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { BaseComponent } from '@mdm/shared/base/base.component';

@Component({
  template: ''
})
export abstract class ProfileBaseComponent extends BaseComponent {
  allUsedProfiles: any[] = [];
  allUnUsedProfiles: any[] = [];
  currentProfileDetails: any = {};
  descriptionView = 'default';
  lastDescriptionView: string;

  catalogueItem:
    | DataModelDetail
    | TermDetail
    | CodeSetDetail
    | TerminologyDetail
    | FolderDetail
    | DataElementDetail
    | VersionedFolderDetail;

  constructor(
    protected resourcesService: MdmResourcesService,
    protected dialog: MatDialog,
    protected editingService: EditingService,
    protected messageHandler: MessageHandlerService
  ) {
    super();
  }

  deleteProfile() {
    if (this.currentProfileDetails) {
      this.dialog
        .openConfirmationAsync({
          data: {
            title: 'Are you sure you want to delete this Profile?',
            okBtnTitle: 'Yes, delete',
            btnType: 'warn',
            message: `<p class="marginless">${this.currentProfileDetails.name} will be deleted, are you sure? </p>`
          }
        })
        .subscribe(() => {
          this.resourcesService.profile
            .deleteProfile(
              this.catalogueItem.domainType,
              this.catalogueItem.id,
              this.currentProfileDetails.namespace,
              this.currentProfileDetails.name
            )
            .subscribe(
              () => {
                this.messageHandler.showSuccess('Profile deleted successfully');
                this.descriptionView = 'default';
                this.UsedProfiles(
                  this.catalogueItem.domainType,
                  this.catalogueItem.id
                );
                this.UnUsedProfiles(
                  this.catalogueItem.domainType,
                  this.catalogueItem.id
                );
                this.changeProfile();
              },
              (error) => {
                this.messageHandler.showError(
                  'Unable to Delete Profile',
                  error
                );
              }
            );
        });
    }
  }

  edit(isDescriptionOnly: boolean) {
    this.editingService
      .openDialog<
        DefaultProfileEditorModalComponent,
        DefaultProfileModalConfiguration,
        DefaultProfileModalResponse
      >(DefaultProfileEditorModalComponent, {
        data: {
          items: this.setDefaultProfileData(isDescriptionOnly),
          parentCatalogueItem: this.catalogueItem.breadcrumbs[0]
        }
      })
      .afterClosed().subscribe((result) => {
        if(result.status === ModalDialogStatus.Ok)
        {
          this.save(result.items);
        }
      });
  }

  editProfile = (isNew: boolean) => {
    this.editingService.start();
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
        profileName: prof.display,
        catalogueItem: this.catalogueItem,
        isNew
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
            this.catalogueItem.domainType,
            this.catalogueItem.id,
            splitDescription[0],
            splitDescription[1],
            data
          )
          .subscribe(
            () => {
              this.editingService.stop();
              this.resourcesService.profile
                .profile(
                  this.catalogueItem.domainType,
                  this.catalogueItem.id,
                  splitDescription[0],
                  splitDescription[1]
                )
                .subscribe((body) => {
                  this.currentProfileDetails = body.body;
                  this.currentProfileDetails.namespace = splitDescription[0];
                  this.currentProfileDetails.name = splitDescription[1];
                  if (isNew) {
                    this.messageHandler.showSuccess('Profile Added');
                    this.UsedProfiles(
                      this.catalogueItem.domainType,
                      this.catalogueItem.id
                    );
                  } else {
                    this.messageHandler.showSuccess(
                      'Profile Edited Successfully'
                    );
                  }
                });
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

  async UsedProfiles(domainType: ModelDomainType | string, id: any) {
    await this.resourcesService.profile
      .usedProfiles(domainType, id)
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

  async UnUsedProfiles(domainType: ModelDomainType | string, id: any) {
    await this.resourcesService.profile
      .unusedProfiles(domainType, id)
      .subscribe((profiles: { body: { [x: string]: any } }) => {
        profiles.body.forEach((profile) => {
          const prof: any = [];
          prof['display'] = profile.displayName;
          prof['value'] = `${profile.namespace}/${profile.name}`;
          this.allUnUsedProfiles.push(prof);
        });
      });
  }

  async changeProfile() {
    if (
      this.descriptionView !== 'default' &&
      this.descriptionView !== 'other' &&
      this.descriptionView !== 'addnew'
    ) {
      this.lastDescriptionView = this.descriptionView;
      const splitDescription = this.descriptionView.split('/');
      const response = await this.resourcesService.profile
        .profile(
          this.catalogueItem.domainType,
          this.catalogueItem.id,
          splitDescription[0],
          splitDescription[1]
        )
        .toPromise();

      this.currentProfileDetails = response.body;
      this.currentProfileDetails.namespace = splitDescription[0];
      this.currentProfileDetails.name = splitDescription[1];
    } else if (this.descriptionView === 'addnew') {
      if (!this.lastDescriptionView) {
        this.lastDescriptionView = 'default';
      }
      const dialog = this.dialog.open(AddProfileModalComponent, {
        data: {
          domainType: this.catalogueItem.domainType,
          domainId: this.catalogueItem.id
        }
      });

      this.editingService.configureDialogRef(dialog);

      dialog.afterClosed().subscribe((newProfile) => {
        if (newProfile) {
          const splitDescription = newProfile.split('/');
          this.resourcesService.profile
            .profile(
              this.catalogueItem.domainType,
              this.catalogueItem.id,
              splitDescription[0],
              splitDescription[1],
              ''
            )
            .subscribe(
              (body) => {
                this.descriptionView = newProfile;
                this.currentProfileDetails = body.body;
                this.currentProfileDetails.namespace = splitDescription[0];
                this.currentProfileDetails.name = splitDescription[1];
                this.editProfile(true);
              },
              (error) => {
                this.messageHandler.showError('error saving', error.message);
              }
            );
        } else {
          this.descriptionView = this.lastDescriptionView;
          this.changeProfile();
        }
      });
    } else {
      this.currentProfileDetails = null;
      this.lastDescriptionView = this.descriptionView;
    }
  }

  setDefaultProfileData(isDescriptionOnly: boolean): Array<DefaultProfileItem> {
    const items = new Array<DefaultProfileItem>();
    const controls = DefaultProfileControls.renderControls(
      this.catalogueItem.domainType
    );

    items.push(
      this.createDefaultProfileItem(
        this.catalogueItem.description,
        'Description',
        ProfileControlTypes.html,
        'description'
      )
    );

    if (!isDescriptionOnly) {
      if (this.showControl(controls, 'label'))
        items.push(
          this.createDefaultProfileItem(
            this.catalogueItem.label,
            'Label',
            ProfileControlTypes.text,
            'label'
          )
        );
      if (
        'organisation' in this.catalogueItem &&
        this.showControl(controls, 'organisation')
      ) {
        items.push(
          this.createDefaultProfileItem(
            this.catalogueItem.organisation,
            'Organisation',
            ProfileControlTypes.text,
            'organisation'
          )
        );
      }
      if (
        'author' in this.catalogueItem &&
        this.showControl(controls, 'author')
      ) {
        items.push(
          this.createDefaultProfileItem(
            this.catalogueItem.author,
            'Author',
            ProfileControlTypes.text,
            'author'
          )
        );
      }
      if (this.showControl(controls, 'aliases')) {
        items.push(
          this.createDefaultProfileItem(
            this.catalogueItem.aliases || [],
            'Aliases',
            ProfileControlTypes.aliases,
            'aliases'
          )
        );
      }
      if (this.showControl(controls, 'classifications')) {
        items.push(
          this.createDefaultProfileItem(
            this.catalogueItem.classifiers || [],
            'Classifications',
            ProfileControlTypes.classifications,
            'classifications'
          )
        );
      }
      if (this.showControl(controls, 'multiplicity')) {
        items.push({
          controlType: ProfileControlTypes.multiplicity,
          displayName: 'Multiplicity',
          maxMultiplicity:
            this.catalogueItem.maxMultiplicity === -1
              ? '*'
              : this.catalogueItem.maxMultiplicity,
          minMultiplicity: this.catalogueItem.minMultiplicity,
          propertyName: 'multiplicity'
        });
      }
      if (this.showControl(controls, 'dataType')) {
        items.push(
          this.createDefaultProfileItem(
            this.catalogueItem.dataType,
            'Data Type',
            ProfileControlTypes.dataType,
            'dataType'
          )
        );
      }
      if (this.showControl(controls, 'url')) {
        items.push(
          this.createDefaultProfileItem(
            this.catalogueItem.url,
            'URL',
            ProfileControlTypes.text,
            'url'
          )
        );
      }
    }

    return items;
  }

  showControl(controls: string[], controlName: string): boolean {
    return controls.findIndex((x) => x === controlName) !== -1;
  }

  createDefaultProfileItem(
    value: string | Container[] | string[] | DataTypeReference,
    displayName: string,
    controlType: ProfileControlTypes,
    propertyName: string
  ): DefaultProfileItem {
    return {
      controlType,
      displayName,
      value,
      propertyName
    };
  }

  /**
  * Save operation for default profile
  *
  * @param saveItems properties which are going to be updated
  */
  abstract save(saveItems: Array<DefaultProfileItem>);
}

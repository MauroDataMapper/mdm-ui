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
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CatalogueItem, Container, DataTypeReference, ModelDomainType, Profile, ProfileResponse, ProfileSummary, ProfileSummaryIndexResponse, Securable, Uuid } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { AddProfileModalComponent } from '@mdm/modals/add-profile-modal/add-profile-modal.component';
import { DefaultProfileEditorModalComponent } from '@mdm/modals/default-profile-editor-modal/default-profile-editor-modal.component';
import { DefaultProfileControls, DefaultProfileItem, DefaultProfileModalConfiguration, DefaultProfileModalResponse, ProfileControlTypes } from '@mdm/model/defaultProfileModel';
import { mapCatalogueItemDomainTypeToModelDomainType } from '@mdm/model/model-domain-type';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ProfileDataViewType, ProfileSummaryListItem } from './profile-data-view.model';

@Component({
  selector: 'mdm-profile-data-view',
  templateUrl: './profile-data-view.component.html',
  styleUrls: ['./profile-data-view.component.scss']
})
export class ProfileDataViewComponent implements OnInit, OnChanges {
  @Input() catalogueItem: CatalogueItem & Securable & { [key: string]: any };

  currentView: ProfileDataViewType | string = 'default';
  lastView?: ProfileDataViewType | string;
  usedProfiles: ProfileSummaryListItem[] = [];
  unusedProfiles: ProfileSummaryListItem[] = [];
  currentProfile?: Profile;
  canEdit = false;
  canDeleteProfile = false;
  canAddMetadata = false;

  get modelDomainType(): ModelDomainType {
    return mapCatalogueItemDomainTypeToModelDomainType(this.catalogueItem.domainType);
  }

  constructor(
    private resources: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private editing: EditingService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.catalogueItem && this.catalogueItem) {
      this.setAccess();
      this.loadUsedProfiles(this.catalogueItem.domainType, this.catalogueItem.id);
      this.loadUnusedProfiles(this.catalogueItem.domainType, this.catalogueItem.id);
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
    this.editDefaultProfile(this.getDefaultProfileData(true));
  }

  editDefaultProfileFull() {
    this.editDefaultProfile(this.getDefaultProfileData(false));
  }

  editCustomProfile() {

  }

  deleteCustomProfile() {
    if (!this.currentProfile) {
      return;
    }

    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Are you sure you want to delete this Profile?',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p class="marginless">${this.currentProfile.name} will be deleted, are you sure? </p>`
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
          this.messageHandler.showError('Unable to Delete Profile', error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('Profile deleted successfully');
        this.currentView = 'default';
        this.loadUsedProfiles(this.catalogueItem.domainType, this.catalogueItem.id);
        this.loadUnusedProfiles(this.catalogueItem.domainType, this.catalogueItem.id);
        this.changeProfile();
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
            value: `${summary.namespace}/${summary.name}`
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
      .subscribe((result) => {
        if (result.status === ModalDialogStatus.Ok) {
          //this.save(result.items);
        }
      });
  }

  private getDefaultProfileData(isDescriptionOnly: boolean): DefaultProfileItem[] {
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
      if (this.showControl(controls, 'label')) {
        items.push(
          this.createDefaultProfileItem(
            this.catalogueItem.label,
            'Label',
            ProfileControlTypes.text,
            'label'
          )
        );
      }

      if (
        'organisation' in this.catalogueItem &&
        this.showControl(controls, 'organisation')) {
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
        this.showControl(controls, 'author')) {
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
        const aliasesCopy = Object.assign([], this.catalogueItem.aliases);
        items.push(
          this.createDefaultProfileItem(
            aliasesCopy,
            'Aliases',
            ProfileControlTypes.aliases,
            'aliases'
          )
        );
      }

      if (this.showControl(controls, 'classifications')) {
        const classificationsCopy = Object.assign([], this.catalogueItem.classifiers);
        items.push(
          this.createDefaultProfileItem(
            classificationsCopy,
            'Classifications',
            ProfileControlTypes.classifications,
            'classifiers'
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

  private showControl(controls: string[], controlName: string): boolean {
    return controls.findIndex((x) => x === controlName) !== -1;
  }

  private createDefaultProfileItem(
    value: string | Container[] | string[] | DataTypeReference,
    displayName: string,
    controlType: ProfileControlTypes,
    propertyName: string): DefaultProfileItem {
    return {
      controlType,
      displayName,
      value,
      propertyName
    };
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
              this.editCustomProfile();
            },
            );
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

/*
Copyright 2020-2024 University of Oxford and NHS England

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
/* eslint-disable id-blacklist */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  CatalogueItemDomainType,
  ProfileSummary,
  ProfileSummaryIndexResponse,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { map } from 'rxjs/operators';

export interface AddProfileModalConfiguration {
  domainId: Uuid;
  domainType: CatalogueItemDomainType;
  finalised?: boolean;
  selectedProfile?: ProfileSummary;
}

@Component({
  selector: 'mdm-add-profile-modal',
  templateUrl: './add-profile-modal.component.html',
  styleUrls: ['./add-profile-modal.component.scss']
})
export class AddProfileModalComponent implements OnInit {
  profiles: ProfileSummary[];

  constructor(
    public dialogRef: MatDialogRef<AddProfileModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddProfileModalConfiguration,
    protected resourcesSvc: MdmResourcesService
  ) {}

  ngOnInit(): void {
    this.resourcesSvc.profile
      .unusedProfiles(this.data.domainType, this.data.domainId)
      .pipe(
        map((response: ProfileSummaryIndexResponse) => {
          if (this.data.finalised) {
            // If the catalogue item is finalised, only allow profiles that are allowed
            // to be edited
            return response.body.filter(
              (profile) => profile.editableAfterFinalisation
            );
          }

          return response.body;
        }),
        map((profiles: ProfileSummary) =>
          profiles.map((profile) => {
            return {
              ...profile,
              display: `${profile.displayName} (${profile.version})`,
              value: `${profile.namespace}/${profile.name}/${profile.version}`
            };
          })
        )
      )
      .subscribe((profiles: ProfileSummary[]) => {
        this.profiles = profiles;
      });
  }

  save() {
    this.dialogRef.close(this.data.selectedProfile);
  }

  onCancel() {
    this.dialogRef.close();
  }
}

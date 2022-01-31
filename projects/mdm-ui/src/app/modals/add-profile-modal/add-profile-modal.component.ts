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
/* eslint-disable id-blacklist */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';

@Component({
  selector: 'mdm-add-profile-modal',
  templateUrl: './add-profile-modal.component.html',
  styleUrls: ['./add-profile-modal.component.scss']
})
export class AddProfileModalComponent implements OnInit {
  allUnusedProfiles: Array<any> = [];
  showProfileSelector = false;

  constructor(
    public dialogRef: MatDialogRef<AddProfileModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    protected resourcesSvc: MdmResourcesService
  ) {}

  ngOnInit(): void {
    this.resourcesSvc.profile
      .unusedProfiles(this.data.domainType, this.data.domainId)
      .subscribe((profiles: { body: { [x: string]: any } }) => {
        profiles.body.forEach((profile) => {
          const prof: any = [];
          prof['display'] = profile.displayName;
          prof['value'] = `${profile.namespace}/${profile.name}`;
          this.allUnusedProfiles.push(prof);
          this.showProfileSelector = true;
        });
      });
  }

  save() {
    // Save Changes
    this.dialogRef.close(this.data.selectedProfile);
  }

  onCancel() {
    this.dialogRef.close();
  }
}

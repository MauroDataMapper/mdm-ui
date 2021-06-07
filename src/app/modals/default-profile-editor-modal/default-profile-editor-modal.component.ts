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

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  DefaultProfile,
  DefaultProfileItem,
  ProfileControlTypes
} from '@mdm/model/defaultProfileModel';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ValidatorService } from '@mdm/services';

@Component({
  selector: 'mdm-default-profile-editor-modal',
  templateUrl: './default-profile-editor-modal.component.html',
  styleUrls: ['./default-profile-editor-modal.component.sass']
})
export class DefaultProfileEditorModalComponent implements OnInit {
  error: string;

  constructor(
    public dialogRef: MatDialogRef<DefaultProfileEditorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DefaultProfile,
    protected resourcesSvc: MdmResourcesService,
    protected validator: ValidatorService
  ) {}

  ngOnInit(): void {}

  save() {
    // Save Changes

    let hasError = false;

    this.data.items.forEach((item: DefaultProfileItem) => {
      if (item.minMultiplicity !== undefined) {
        const valResult = this.validator.validateMultiplicities(
          item.minMultiplicity.toString(),
          item.maxMultiplicity.toString()
        );
        if (valResult) {
          this.error = valResult;
          hasError = true;
        }
      }
    });

    if (!hasError) {
      this.dialogRef.close(this.data.items);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  public get profileControlType(): typeof ProfileControlTypes {
    return ProfileControlTypes;
  }
}

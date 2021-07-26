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

/* eslint-disable id-blacklist */
import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Profile, ProfileField, ProfileResponse } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ElementSelectorComponent } from '@mdm/utility/element-selector.component';
import { MarkdownParserService } from '@mdm/utility/markdown/markdown-parser/markdown-parser.service';
import { MarkupDisplayModalComponent } from '../markup-display-modal/markup-display-modal.component';
import { EditProfileModalConfiguration, EditProfileModalResult } from './edit-profile-modal.model';
@Component({
  selector: 'mdm-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent implements OnInit {
  profileData: Profile;
  description?: string;
  okBtnText: string;

  formOptionsMap = {
    INTEGER: 'number',
    STRING: 'text',
    BOOLEAN: 'checkbox',
    INT: 'number',
    DATE: 'date',
    TIME: 'time',
    DATETIME: 'datetime',
    DECIMAL: 'number'
  };

  constructor(
    public dialogRef: MatDialogRef<EditProfileModalComponent, EditProfileModalResult>,
    @Inject(MAT_DIALOG_DATA) public data: EditProfileModalConfiguration,
    private markdownParser: MarkdownParserService,
    protected resources: MdmResourcesService,
    private dialog: MatDialog) {
    data.profile.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (data.isNew && field.defaultValue) {
          field.currentValue = field.defaultValue;
        }

        if (field.dataType === 'FOLDER') {
          if (
            field.currentValue === '[]' ||
            field.currentValue === '""' ||
            field.currentValue === ''
          ) {
            field.currentValue = null;
          } else {
            field.currentValue = JSON.parse(field.currentValue);
          }
        }
      });
    });

    this.profileData = data.profile;
    this.description = data.description;
    this.okBtnText = data.okBtn ?? 'Save';
  }

  ngOnInit(): void { }

  save() {
    // Save Changes
    const returnData: Profile = JSON.parse(JSON.stringify(this.profileData));

    returnData.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (
          field.dataType === 'FOLDER' &&
          field.currentValue &&
          field.currentValue.length > 0
        ) {
          field.currentValue = JSON.stringify(field.currentValue);
        }
      });
    });

    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      profile: returnData
    });
  }

  onCancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }

  showInfo(field: any) {
    this.dialog.open(MarkupDisplayModalComponent, {
      data: {
        content: field.description,
        title: field.fieldName
      }
    });
  }

  validate() {
    const data = JSON.parse(JSON.stringify(this.profileData));
    this.resources.profile
      .validateProfile(
        this.data.profile.namespace,
        this.data.profile.name,
        this.data.catalogueItem.domainType,
        this.data.catalogueItem.id,
        data
      )
      .subscribe((response: ProfileResponse) => {
        this.profileData = response.body;
      });
  }

  showAddElementToMarkdown(field: ProfileField) {
    const dg = this.dialog.open(ElementSelectorComponent, {
      data: { validTypesToSelect: ['DataModel'], notAllowedToSelectIds: [] },
      panelClass: 'element-selector-modal'
    });

    dg.afterClosed().subscribe((dgData) => {
      this.markdownParser.createMarkdownLink(dgData).then((mkData) => {
        field.currentValue = mkData;
      });
    });
  };
}

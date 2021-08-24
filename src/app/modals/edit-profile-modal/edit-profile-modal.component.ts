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
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Profile, ProfileField, ProfileValidationError, ProfileValidationErrorList } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ElementSelectorComponent } from '@mdm/utility/element-selector.component';
import { MarkdownParserService } from '@mdm/utility/markdown/markdown-parser/markdown-parser.service';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  validationErrors: ProfileValidationErrorList = {
    total: 0,
    errors: []
  };

  formOptionsMap = {
    integer: 'number',
    string: 'text',
    boolean: 'checkbox',
    int: 'number',
    date: 'date',
    time: 'time',
    datetime: 'datetime',
    decimal: 'number'
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

        if (field.dataType === 'folder') {
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

    this.validate();
  }

  ngOnInit(): void { }

  save() {
    // Save Changes
    const returnData: Profile = JSON.parse(JSON.stringify(this.profileData));

    returnData.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (
          field.dataType === 'folder' &&
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

  validate() {
    this.resources.profile
      .validateProfile(
        this.data.profile.namespace,
        this.data.profile.name,
        this.data.catalogueItem.domainType,
        this.data.catalogueItem.id,
        this.profileData
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.validationErrors = error.error as ProfileValidationErrorList;
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.validationErrors = {
          total: 0,
          errors: []
        };
      });
  }

  getValidationError(fieldName: string): ProfileValidationError | undefined {
    if (this.validationErrors.total === 0) {
      return undefined;
    }

    return this.validationErrors.errors.find(e => e.fieldName === fieldName);
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

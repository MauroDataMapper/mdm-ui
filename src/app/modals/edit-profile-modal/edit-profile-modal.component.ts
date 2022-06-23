/*
Copyright 2020-2023 University of Oxford
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
import {
  ApiProperty,
  ApiPropertyIndexResponse,
  Profile,
  ProfileField,
  ProfileValidationError,
  ProfileValidationErrorList
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ElementSelectorComponent } from '@mdm/utility/element-selector.component';
import { MessageHandlerService } from '@mdm/services';
import { MarkdownParserService } from '@mdm/content/markdown/markdown-parser/markdown-parser.service';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import {
  EditProfileModalConfiguration,
  EditProfileModalResult
} from './edit-profile-modal.model';
import { EditingService } from '@mdm/services/editing.service';
@Component({
  selector: 'mdm-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent implements OnInit {
  profileData: Profile;
  description?: string;
  okBtnText: string;
  showCanEditPropertyAlert = true;
  validationErrors: ProfileValidationErrorList = {
    total: 0,
    fieldTotal: 0,
    errors: []
  };
  isValidated = false;
  private readonly showCanEditPropertyAlertKey =
    'ui.show_can_edit_property_alert';

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
    public dialogRef: MatDialogRef<
      EditProfileModalComponent,
      EditProfileModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: EditProfileModalConfiguration,
    private markdownParser: MarkdownParserService,
    protected resources: MdmResourcesService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    protected editing: EditingService
  ) {
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

        this.attachReadOnlyPropertyToField(field);
      });
    });

    this.profileData = data.profile;
    this.description = data.description;
    this.okBtnText = data.okBtn ?? 'Save';
  }

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

  save() {
    this.validateData()
      .pipe(
        switchMap((errorList) => {
          this.validationErrors = errorList;

          if (errorList.fieldTotal > 0) {
            return this.dialog
              .openConfirmation({
                data: {
                  title: 'Validation issues',
                  message: `There were ${errorList.fieldTotal} validation issue(s) found. Are you sure you want to save your changes?`,
                  okBtnTitle: 'Yes, continue',
                  cancelBtnTitle: 'No'
                }
              })
              .afterClosed();
          }

          // No validation issues, continue
          return of({ status: ModalDialogStatus.Ok });
        }),
        switchMap((dialogResult) => {
          if (dialogResult.status !== ModalDialogStatus.Ok) {
            return EMPTY;
          }

          // Continue to next step
          return of({});
        })
      )
      .subscribe(() => {
        const returnData: Profile = JSON.parse(
          JSON.stringify(this.profileData)
        );

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
      });
  }

  onCancel() {
    this.editing.confirmCancelAsync().subscribe((confirm) => {
      if (confirm) {
        this.dialogRef.close({ status: ModalDialogStatus.Cancel });
      }
    });
  }

  validate() {
    this.validateData().subscribe(
      (errorList) => (this.validationErrors = errorList)
    );
  }

  getValidationError(
    metadataPropertyName: string
  ): ProfileValidationError | undefined {
    if (this.validationErrors.fieldTotal === 0) {
      return undefined;
    }

    return this.validationErrors.errors.find(
      (e) => e.metadataPropertyName === metadataPropertyName
    );
  }

  sortBy(items: []) {
    return items.sort((a, b) => (a > b ? 1 : a === b ? 0 : -1));
  }

  showAddElementToMarkdown(field: ProfileField) {
    const dg = this.dialog.open(ElementSelectorComponent, {
      data: { validTypesToSelect: ['DataModel'], notAllowedToSelectIds: [] },
      panelClass: 'element-selector-modal'
    });

    dg.afterClosed().subscribe((dgData) => {
      this.markdownParser.createMarkdownLink(dgData).subscribe((mkData) => {
        field.currentValue = mkData;
      });
    });
  }

  private attachReadOnlyPropertyToField(field: ProfileField) {
    field.readOnly =
      field.uneditable ||
      (this.data.finalised && !field.editableAfterFinalisation);
  }

  private validateData(): Observable<ProfileValidationErrorList> {
    return this.resources.profile
      .validateProfile(
        this.data.profile.namespace,
        this.data.profile.name,
        this.data.catalogueItem.domainType,
        this.data.catalogueItem.id,
        this.profileData,
        this.data.profile.version
      )
      .pipe(
        map<unknown, ProfileValidationErrorList>(() => {
          return {
            total: 0,
            fieldTotal: 0,
            errors: []
          };
        }),
        catchError((error: HttpErrorResponse) => {
          return of(error.error as ProfileValidationErrorList);
        }),
        finalize(() => (this.isValidated = true))
      );
  }

  private loadDefaultCustomProfile(properties: ApiProperty[]) {
    this.showCanEditPropertyAlert = JSON.parse(
      this.getContentProperty(properties, this.showCanEditPropertyAlertKey)
    );
  }

  private getContentProperty(properties: ApiProperty[], key: string): string {
    return properties?.find((p) => p.key === key)?.value;
  }
}

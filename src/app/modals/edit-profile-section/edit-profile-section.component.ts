/*
Copyright 2020-2025 University of Oxford and NHS England

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

import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ApiProperty,
  ApiPropertyIndexResponse, Pathable,
  Profile,
  ProfileField, ProfileSection,
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
} from './edit-profile-section.model';
import { EditingService } from '@mdm/services/editing.service';
import { MauroItem } from '@mdm/mauro/mauro-item.types';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatFormField, MatError } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatInput } from '@angular/material/input';
import { ContentEditorComponent } from '@mdm/content/content-editor/content-editor.component';
import { MatTooltip } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';

@Component({
    selector: '[mdm-edit-profile-section]',
    templateUrl: './edit-profile-section.component.html',
    styleUrls: ['./edit-profile-section.component.scss'],
    standalone: true,
    imports: [NgIf, FormsModule, NgFor, MatTooltip, ContentEditorComponent, MatInput, NgClass, ExtendedModule, MatButton, MatFormField, MatSelect, MatOption, ModelSelectorTreeComponent, MatError]
})
export class EditProfileSectionComponent implements OnInit {
  @Input() profileSection: ProfileSection;

  description?: string;
  okBtnText: string;
  showCanEditPropertyAlert = true;
  validationErrors: ProfileValidationErrorList = {
    total: 0,
    fieldTotal: 0,
    errors: []
  };

  isValidated = false;

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

  private readonly showCanEditPropertyAlertKey
    = 'ui.show_can_edit_property_alert';

  constructor(
    public dialogRef: MatDialogRef<
      EditProfileSectionComponent,
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
        if (field.dataType === 'boolean') {
          if (field.currentValue !== 'true') {
            field.currentValue = 'false';
          }
        }
        if (field.dataType === 'folder') {
          if (
            field.currentValue === '[]'
            || field.currentValue === '""'
            || field.currentValue === ''
          ) {
            field.currentValue = null;
          }
 else {
            field.currentValue = JSON.parse(field.currentValue);
          }
        }

        this.attachReadOnlyPropertyToField(field);
      });
    });

    this.description = data.description;
    this.okBtnText = data.okBtn ?? 'Save';
  }

  ngOnInit(): void {
  }

  save() {
  }

  getValidationError(
    metadataPropertyName: string
  ): ProfileValidationError | undefined {
    if (this.validationErrors.fieldTotal === 0) {
      return undefined;
    }

    return this.validationErrors.errors.find(
      e => e.metadataPropertyName === metadataPropertyName
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
      const link = this.markdownParser.createMarkdownLink(dgData as MauroItem & Pathable);
      field.currentValue = link;
    });
  }

  private attachReadOnlyPropertyToField(field: ProfileField) {
    field.readOnly
      = field.uneditable
        || (this.data.finalised && !field.editableAfterFinalisation);
  }

}

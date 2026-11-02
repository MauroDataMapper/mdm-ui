/*
Copyright 2020-2026 University of Oxford and NHS England

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
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Pathable,
  ProfileField,
  ProfileSection,
  Term
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ElementSelectorComponent } from '@mdm/utility/element-selector.component';
import { GridService, MessageHandlerService } from '@mdm/services';
import { MarkdownParserService } from '@mdm/content/markdown/markdown-parser/markdown-parser.service';
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
import { SourceCodeEditorComponent } from '@mdm/shared/source-code/source-code-editor.component';
import { isSourceCodeProfileDataType } from '@mdm/shared/source-code/source-code-value';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import {
  getProfileAllowedValueOptions,
  ProfileAllowedValueOption
} from '@mdm/shared/profile-field-values';

type SelectedTerminologyTerm = Pick<Term, 'code'> & Partial<Pick<Term, 'definition'>>;

@Component({
    selector: '[mdm-edit-profile-section]',
    templateUrl: './edit-profile-section.component.html',
    styleUrls: ['./edit-profile-section.component.scss'],
    standalone: true,
    imports: [NgIf, FormsModule, NgFor, MatTooltip, ContentEditorComponent, SourceCodeEditorComponent, MatInput, NgClass, ExtendedModule, MatButton, MatFormField, MatSelect, MatOption, ModelSelectorTreeComponent, MatError, McSelectComponent]
})
export class EditProfileSectionComponent implements OnInit {
  @Input() profileSection: ProfileSection;
  @Input() showValidationErrors = false;

  description?: string;
  okBtnText: string;
  showCanEditPropertyAlert = true;
  private readonly selectedTerminologyTerms = new Map<
    ProfileField,
    SelectedTerminologyTerm[]
  >();

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
    private gridService: GridService,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    protected editing: EditingService
  ) {
    data.profile.sections.forEach((section) => {
      if (section.fields) {
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
      }
    });

    this.description = data.description;
    this.okBtnText = data.okBtn ?? 'Save';
  }

  ngOnInit(): void {
    this.profileSection.fields?.forEach((field) => {
      if (this.isTerminologyField(field)) {
        this.selectedTerminologyTerms.set(
          field,
          this.parseTerminologyCodes(field.currentValue).map(code => ({ code }))
        );
      }
    });
  }

  save() {
  }

  getValidationErrors(field: ProfileField): string[] {
    if (!this.showValidationErrors) {
      return [];
    }

    const errors = field['errors'];
    return Array.isArray(errors)
      ? errors.filter((error): error is string => typeof error === 'string')
      : [];
  }

  getAllowedValueOptions(field: ProfileField): ProfileAllowedValueOption[] {
    return getProfileAllowedValueOptions(field.allowedValues);
  }

  isSourceCode(field: ProfileField): boolean {
    return isSourceCodeProfileDataType(field.dataType as string);
  }

  isTerminologyField(field: ProfileField): boolean {
    return field.dataType as string === 'terminology';
  }

  hasReferenceTerminology(field: ProfileField): boolean {
    return !!this.referenceTerminologyId(field);
  }

  supportsMultipleTerminologyTerms(field: ProfileField): boolean {
    return field.maxMultiplicity === -1 || field.maxMultiplicity > 1;
  }

  getSelectedTerminologyTerms(
    field: ProfileField
  ): SelectedTerminologyTerm | SelectedTerminologyTerm[] | null {
    const selectedTerms = this.selectedTerminologyTerms.get(field) ?? [];
    return this.supportsMultipleTerminologyTerms(field)
      ? selectedTerms
      : selectedTerms[0] ?? null;
  }

  fetchTerminologyTerms = (
    text: string,
    _loadAll: boolean,
    offset: number,
    limit: number,
    field: ProfileField
  ) => {
    const terminologyId = this.referenceTerminologyId(field);
    if (!terminologyId) {
      throw new Error(`No terminology is configured for profile field "${field.fieldName}".`);
    }

    const options = this.gridService.constructOptions(
      limit,
      offset,
      'code',
      'asc',
      text?.trim() ? { code: text } : {}
    );
    return this.resources.terms.list(terminologyId, options);
  };

  onTerminologyTermsSelected(
    selected: SelectedTerminologyTerm | SelectedTerminologyTerm[] | null,
    field: ProfileField
  ): void {
    const selectedTerms = Array.isArray(selected)
      ? selected
      : selected
        ? [selected]
        : [];
    this.selectedTerminologyTerms.set(field, selectedTerms);
    field.currentValue = JSON.stringify(selectedTerms.map(term => term.code));
  }

  getTerminologyCodes(value?: string): string[] {
    return this.parseTerminologyCodes(value);
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

  private referenceTerminologyId(field: ProfileField): string | undefined {
    return (
      field as ProfileField & { referenceTerminology?: string }
    ).referenceTerminology;
  }

  private parseTerminologyCodes(value?: string): string[] {
    if (!value) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((code): code is string => typeof code === 'string');
      }
      return typeof parsed === 'string' ? [parsed] : [];
    }
    catch {
      return [value];
    }
  }
}

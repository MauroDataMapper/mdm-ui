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

// TODO update to use reactive forms

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import {
  CatalogueItemDomainType,
  DataType
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import {
  DefaultProfileModalConfiguration,
  DefaultProfileModalResponse,
  DefaultProfileItem,
  ProfileControlTypes
} from '@mdm/model/defaultProfileModel';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService, ValidatorService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { McSelectPagination } from '@mdm/utility/mc-select/mc-select.component';
import { HighlighterPipe } from '@mdm/pipes/highlighter.pipe';
import { ElementClassificationsComponent } from '../../utility/element-classifications/element-classifications.component';
import { ElementLinkComponent } from '../../utility/element-link/element-link.component';
import { McSelectComponent } from '../../utility/mc-select/mc-select.component';
import { NewDataTypeInlineComponent } from '../../utility/new-data-type-inline/new-data-type-inline.component';
import { MatButton } from '@angular/material/button';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { InlineTextEditComponent } from '../../shared/inline-text-edit/inline-text-edit.component';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { ContentEditorComponent } from '../../content/content-editor/content-editor.component';
import { ElementAliasComponent } from '../../utility/element-alias/element-alias.component';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { EscapeHtmlPipe } from '@mdm/pipes/escapeHtml.pipe';

@Component({
    selector: 'mdm-default-profile-editor-modal',
    templateUrl: './default-profile-editor-modal.component.html',
    styleUrls: ['./default-profile-editor-modal.component.sass'],
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, NgFor, NgIf, ElementAliasComponent, ContentEditorComponent, MatInput, FormsModule, InlineTextEditComponent, NgClass, ExtendedModule, MatButton, NewDataTypeInlineComponent, McSelectComponent, ElementLinkComponent, ElementClassificationsComponent, MatDialogActions, HighlighterPipe, EscapeHtmlPipe]
})
export class DefaultProfileEditorModalComponent implements OnInit {
  multiplicityError: string;
  dataTypeErrors: string;
  showNewInlineDataType = false;
  pagination: McSelectPagination;
  newDataTypeHasErrors = false;
  constructor(
    public dialogRef: MatDialogRef<
      DefaultProfileEditorModalComponent,
      DefaultProfileModalResponse
    >,
    @Inject(MAT_DIALOG_DATA) public data: DefaultProfileModalConfiguration,
    protected resourcesSvc: MdmResourcesService,
    protected validator: ValidatorService,
    protected gridService: GridService,
    protected resources: MdmResourcesService,
    protected editing: EditingService
  ) {}

  public get profileControlType(): typeof ProfileControlTypes {
    return ProfileControlTypes;
  }

  ngOnInit(): void {}

  save() {
    let hasError = false;

    this.data.items.forEach((item: DefaultProfileItem) => {
      if (item.controlType === ProfileControlTypes.multiplicity) {
        const valResult = this.validator.validateMultiplicities(
          item.minMultiplicity === undefined
            ? ''
            : item.minMultiplicity.toString(),
          item.maxMultiplicity === undefined
            ? ''
            : item.maxMultiplicity.toString()
        );
        if (valResult) {
          this.multiplicityError = valResult;
          hasError = true;
        }
      }
 else if (item.controlType === ProfileControlTypes.dataType) {
        hasError = this.newDataTypeHasErrors;
      }
    });

    if (!hasError) {
      this.dialogRef.close({
        status: ModalDialogStatus.Ok,
        items: this.data.items
      });
    }
  }

  onCancel() {
    this.editing.confirmCancelAsync().subscribe((confirm) => {
      if (confirm) {
        this.dialogRef.close({ status: ModalDialogStatus.Cancel });
      }
    });
  }

  fetchDataTypes = (text, loadAll, offset: number, limit: number) => {
    const options = this.gridService.constructOptions(
      limit,
      offset,
      'label',
      'asc',
      { label: text, loadAll }
    );
    this.pagination = {
      limit: options['limit'],
      offset: options['offset']
    };
    return this.resources.dataType.list(
      this.data.parentCatalogueItem.id as string,
      options
    );
  };

  onDataTypeSelect(dataType, item) {
    item.value = dataType;
  }

  toggleShowNewInlineDataType(item) {
    this.showNewInlineDataType = !this.showNewInlineDataType;
    this.dataTypeErrors = '';
    if (this.showNewInlineDataType) {
      const newDT: DataType = {
        label: item.value.label,
        description: '',
        domainType: CatalogueItemDomainType.PrimitiveType,
        classifiers: []
      };

      item.value = newDT;
    }
  }

  validationStatusEventHandler(value: string) {
    const hasErrors = value === 'true' ? true : false;
    this.newDataTypeHasErrors = hasErrors;

    if (this.newDataTypeHasErrors) {
      this.dataTypeErrors = '';
      this.dataTypeErrors
        = 'Please fill in all required values for the new Data Type';
    }
  }

  classificationChanged(classifications, item) {
    item.value = classifications;
  }
}

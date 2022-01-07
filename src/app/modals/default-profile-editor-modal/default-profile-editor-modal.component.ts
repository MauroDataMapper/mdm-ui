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

// TODO update to use reactive forms

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
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

@Component({
  selector: 'mdm-default-profile-editor-modal',
  templateUrl: './default-profile-editor-modal.component.html',
  styleUrls: ['./default-profile-editor-modal.component.sass']
})
export class DefaultProfileEditorModalComponent implements OnInit {
  multiplicityError: string;
  dataTypeErrors: string;
  showNewInlineDataType = false;
  pagination: McSelectPagination;

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
      } else if (item.controlType === ProfileControlTypes.dataType) {
        hasError = !this.validateDataType(item);
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

  public get profileControlType(): typeof ProfileControlTypes {
    return ProfileControlTypes;
  }

  validateDataType(item: any) {
    let isValid = true;

    if (!this.showNewInlineDataType) {
      return true;
    }
    if (!item.value.label || item.value.label.trim().length === 0) {
      isValid = false;
    }
    // Check if for EnumerationType, at least one value is added
    if (
      item.value.domainType === CatalogueItemDomainType.EnumerationType &&
      item.value.enumerationValues.length === 0
    ) {
      isValid = false;
    }
    // Check if for ReferenceType, the dataClass is selected
    if (
      item.value.domainType === CatalogueItemDomainType.ReferenceType &&
      !item.value.referencedDataClass
    ) {
      isValid = false;
    }

    // Check if for TerminologyType, the terminology is selected
    if (
      item.value.domainType === CatalogueItemDomainType.TerminologyType &&
      !item.value.referencedTerminology
    ) {
      isValid = false;
    }

    if (!isValid) {
      this.dataTypeErrors = '';
      this.dataTypeErrors =
        'Please fill in all required values for the new Data Type';
      return false;
    } else {
      return true;
    }
  }

  fetchDataTypes = (text, loadAll, offset, limit) => {
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
      this.data.parentCatalogueItem.id,
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
       const newDT = {
        label: item.value.label,
        description: '',
        metadata: [],
        domainType: CatalogueItemDomainType.PrimitiveType,
        enumerationValues: [],
        classifiers: [],
        organisation: '',
        referencedTerminology: {id : ''},
        referencedDataType: { id: '' },
        referencedDataClass: { id: '' },
        referencedModel: { id: '', domainType: '' }
      };

      item.value = newDT;
    }
  }

  classificationChanged(classifications, item) {
    item.value = classifications;
  }
}

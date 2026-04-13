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

import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { CatalogueItemDomainType, MdmTreeItem } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { ModelSelectorTreeComponent } from '../../model-selector-tree/model-selector-tree.component';

export interface DataElementMoveModalData {
  parentCatalogueItem: { id: string }
  currentDataClassId: string
  currentDataClassLabel?: string
}

export interface DataElementMoveModalResult {
  status: ModalDialogStatus
  newDataClassId?: string
}

@Component({
  selector: 'mdm-data-element-move-modal',
  templateUrl: './data-element-move-modal.component.html',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    ModelSelectorTreeComponent,
    MatButton,
    MatDialogClose,
    NgIf
  ]
})
export class DataElementMoveModalComponent {
  readonly dataClassDomainTypes: CatalogueItemDomainType[] = [CatalogueItemDomainType.DataClass];

  selectedDataClass: MdmTreeItem | null = {
    id: this.data.currentDataClassId,
    label: this.data.currentDataClassLabel ?? this.data.currentDataClassId,
    domainType: CatalogueItemDomainType.DataClass,
    availableActions: []
  };

  constructor(
    private dialogRef: MatDialogRef<
      DataElementMoveModalComponent,
      DataElementMoveModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: DataElementMoveModalData
  ) {}

  get canSubmit() {
    return !!this.selectedDataClass
      && this.selectedDataClass.id !== this.data.currentDataClassId;
  }

  onDataClassSelect(selectedItems: MdmTreeItem[]) {
    if (!selectedItems || selectedItems.length === 0) {
      this.selectedDataClass = null;
      return;
    }

    const selected = selectedItems[0];
    this.selectedDataClass = {
      id: selected.id,
      label: selected.label,
      domainType: selected.domainType,
      availableActions: selected.availableActions ?? []
    };
  }

  submit() {
    if (!this.canSubmit || !this.selectedDataClass) {
      return;
    }

    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      newDataClassId: this.selectedDataClass.id
    });
  }
}

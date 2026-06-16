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
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { CatalogueItemDomainType, MdmTreeItem } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { ModelSelectorTreeComponent } from '../../model-selector-tree/model-selector-tree.component';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';

export interface DataClassMoveModalData {
  parentCatalogueItem: { id: string }
  currentDataClassId: string
  currentParentDataClassId?: string
  currentParentDataClassLabel?: string
}

export interface DataClassMoveModalResult {
  status: ModalDialogStatus
  newParentDataClassId?: string | null
}

@Component({
  selector: 'mdm-data-class-move-modal',
  templateUrl: './data-class-move-modal.component.html',
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
export class DataClassMoveModalComponent {
  readonly dataClassDomainTypes: CatalogueItemDomainType[] = [CatalogueItemDomainType.DataClass];

  selectedParent: MdmTreeItem | null = null;
  error = '';

  constructor(
    private dialogRef: MatDialogRef<DataClassMoveModalComponent, DataClassMoveModalResult>,
    @Inject(MAT_DIALOG_DATA) public data: DataClassMoveModalData
  ) {
    if (data.currentParentDataClassId) {
      this.selectedParent = {
        id: data.currentParentDataClassId,
        label: data.currentParentDataClassLabel ?? data.currentParentDataClassId,
        domainType: CatalogueItemDomainType.DataClass,
        availableActions: []
      };
    }
  }

  get canSubmit() {
    const selectedId = this.selectedParent?.id ?? null;
    const currentId = this.data.currentParentDataClassId ?? null;
    return selectedId !== currentId;
  }

  onDataClassSelect(selectedItems: MdmTreeItem[]) {
    this.error = '';

    if (!selectedItems || selectedItems.length === 0) {
      this.selectedParent = null;
      return;
    }

    const selected = selectedItems[0];
    if (selected.id === this.data.currentDataClassId) {
      this.error = 'A Data Class cannot be moved under itself.';
      return;
    }

    this.selectedParent = {
      id: selected.id,
      label: selected.label,
      domainType: selected.domainType,
      availableActions: selected.availableActions ?? []
    };
  }

  submit() {
    if (!this.canSubmit || this.error) {
      return;
    }

    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      newParentDataClassId: this.selectedParent?.id ?? null
    });
  }
}

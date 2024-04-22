/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { ICellEditorParams } from '@ag-grid-community/core';

interface TextAreaCellEditorParams {
  rows?: number;
  cols?: number;
  onEditClick?: (value: string, params: ICellEditorParams) => void;
}

export type PopupPosition = 'under' | 'over';

@Component({
  selector: 'mdm-text-area-cell-editor',
  templateUrl: './text-area-cell-editor.component.html',
  styleUrls: ['./text-area-cell-editor.component.scss']
})
export class TextAreaCellEditorComponent implements ICellEditorAngularComp {
  @ViewChild('valueInput') textArea: ElementRef<HTMLTextAreaElement>;

  params: ICellEditorParams & TextAreaCellEditorParams;
  value: string;

  private focusAfterAttached = false;

  agInit(params: ICellEditorParams & TextAreaCellEditorParams): void {
    this.params = params;
    this.value = this.params.value;
    this.focusAfterAttached = this.params.cellStartedEdit;
  }

  afterGuiAttached(): void {
    if (this.focusAfterAttached) {
      this.textArea.nativeElement.focus();
    }
  }

  getValue() {
    return this.value;
  }

  isPopup(): boolean {
    return true;
  }

  getPopupPosition(): PopupPosition {
    return 'under';
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.shiftKey) {
      event.stopPropagation();
    }
  }

  onEdit() {
    if (!this.params.onEditClick) {
      return;
    }

    this.params.onEditClick(this.value, this.params);
    this.params.api.stopEditing();
  }
}

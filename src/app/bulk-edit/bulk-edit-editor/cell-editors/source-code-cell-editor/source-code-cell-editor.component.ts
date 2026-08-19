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
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { ICellEditorParams } from '@ag-grid-community/core';

import 'brace';
import 'brace/mode/drools';
import 'brace/mode/sql';
import 'brace/mode/java';
import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/mode/typescript';
import 'brace/mode/csharp';
import 'brace/mode/text';
import 'brace/theme/github';
import { AceConfigInterface, AceModule } from 'ngx-ace-wrapper';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatToolbar } from '@angular/material/toolbar';
import {
  SourceCodeLanguage,
  supportedSourceCodeLanguages
} from '@mdm/shared/source-code/source-code-languages';
import {
  decodeSourceCodeValue,
  defaultSourceCodeLanguage,
  encodeSourceCodeValue
} from '@mdm/shared/source-code/source-code-value';

export type PopupPosition = 'under' | 'over';

interface SourceCodeCellEditorParams {
  onFilePickerOpen?: () => void
  onFilePickerClose?: () => void
}

@Component({
    selector: 'mdm-source-code-cell-editor',
    templateUrl: './source-code-cell-editor.component.html',
    styleUrls: ['./source-code-cell-editor.component.scss'],
    standalone: true,
    imports: [FormsModule, MatFormField, MatLabel, MatSelect, NgFor, MatOption, NgIf, MatToolbar, MatInput, MatButton, AceModule]
})
export class SourceCodeCellEditorComponent implements ICellEditorAngularComp, OnDestroy {
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  params: ICellEditorParams & SourceCodeCellEditorParams;
  language = defaultSourceCodeLanguage;
  source = '';
  importFileName = '';

  supportedLanguages: SourceCodeLanguage[] = supportedSourceCodeLanguages
    .filter(lang => !!lang.aceValue)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  aceEditorConfig: AceConfigInterface = { showPrintMargin: false };
  private originalValue = '';
  private hasChanged = false;
  private closeFilePicker?: () => void;

  agInit(params: ICellEditorParams & SourceCodeCellEditorParams): void {
    this.params = params;
    this.originalValue = this.params.value ?? '';
    const value = decodeSourceCodeValue(this.params.value);
    this.language = value.language;
    this.source = value.source;
  }

  ngOnDestroy(): void {
    this.closeFilePicker?.();
  }

  get selectedLanguage() {
    return this.supportedLanguages.find(lang => lang.value === this.language);
  }

  get showAceEditor() {
    return !!this.selectedLanguage?.aceValue;
  }

  getValue() {
    if (!this.hasChanged) {
      return this.originalValue;
    }

    return encodeSourceCodeValue({
      language: this.language,
      source: this.source
    });
  }

  isPopup(): boolean {
    return true;
  }

  getPopupPosition(): PopupPosition {
    return 'under';
  }

  onLanguageChange() {
    this.hasChanged = true;
  }

  onSourceChange(value: string) {
    this.source = value;
    this.hasChanged = true;
  }

  onFileAdded(fileInput: Event) {
    this.stopEvent(fileInput);
    this.closeFilePicker?.();

    const target = fileInput.target as HTMLInputElement;

    if (!target.files || !target.files[0]) {
      return;
    }

    const file = target.files[0];
    const extension = file.name.split('.').pop();
    const language = this.supportedLanguages.find(
      lang => lang.fileExt === extension
    );

    if (!language) {
      this.importFileName = '';
      target.value = '';
      return;
    }

    this.importFileName = file.name;
    this.language = language.value;
    this.hasChanged = true;

    const reader = new FileReader();
    reader.onload = () => {
      this.source = reader.result?.toString() ?? '';
      this.hasChanged = true;
    };
    reader.readAsText(file);
  }

  onFilePickerCancel(event: Event) {
    event.preventDefault();
    this.stopEvent(event);
    this.closeFilePicker?.();
  }

  onFilePickerOpen(event: Event) {
    this.stopEvent(event);

    if (this.closeFilePicker) {
      return;
    }

    this.params.onFilePickerOpen?.();

    const onWindowFocus = () => {
      setTimeout(() => this.closeFilePicker?.(), 0);
    };

    this.closeFilePicker = () => {
      window.removeEventListener('focus', onWindowFocus);
      this.params.onFilePickerClose?.();
      this.closeFilePicker = undefined;
    };

    window.addEventListener('focus', onWindowFocus);
  }

  onKeyDown(event: KeyboardEvent) {
    event.stopPropagation();
  }

  stopEvent(event: Event) {
    event.stopPropagation();
  }
}

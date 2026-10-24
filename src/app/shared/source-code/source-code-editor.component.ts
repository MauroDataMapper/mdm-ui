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
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

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
import * as Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import { AceConfigInterface, AceModule } from 'ngx-ace-wrapper';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';
import {
  SourceCodeLanguage,
  supportedSourceCodeLanguages
} from './source-code-languages';
import {
  decodeSourceCodeValue,
  defaultSourceCodeLanguage,
  encodeSourceCodeValue,
  SourceCodeValueFormat
} from './source-code-value';

@Component({
    selector: 'mdm-source-code-editor',
    templateUrl: './source-code-editor.component.html',
    styleUrls: ['./source-code-editor.component.scss'],
    standalone: true,
    imports: [FormsModule, MatFormField, MatLabel, MatSelect, NgFor, MatOption, NgIf, NgClass, MatToolbar, MatInput, MatButton, MatIconButton, MatTooltip, AceModule]
})
export class SourceCodeEditorComponent implements OnChanges, OnDestroy {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  @Input() inEditMode = true;
  @Input() fixedLanguage?: string;
  @Input() pinLanguage = false;
  @Input() valueFormat: SourceCodeValueFormat = 'sourcecode';

  language = defaultSourceCodeLanguage;
  source = '';
  importFileName = '';
  copied = false;
  highlightedSource = '';

  supportedLanguages: SourceCodeLanguage[] = supportedSourceCodeLanguages
    .filter(lang => !!lang.aceValue)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  aceEditorConfig: AceConfigInterface = { showPrintMargin: false };
  private copiedTimeout?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.value
      || changes.fixedLanguage
      || changes.pinLanguage
      || changes.valueFormat
    ) {
      const decoded = decodeSourceCodeValue(this.value, {
        fixedLanguage: this.fixedLanguage,
        pinLanguage: this.pinLanguage,
        valueFormat: this.valueFormat
      });
      this.language = decoded.language;
      this.source = decoded.source;
      this.highlightedSource = this.highlightSource();
    }
  }

  ngOnDestroy(): void {
    if (this.copiedTimeout) {
      clearTimeout(this.copiedTimeout);
    }
  }

  get selectedLanguage() {
    return this.supportedLanguages.find(lang => lang.value === this.language);
  }

  get selectedLanguageDisplayName(): string {
    return this.selectedLanguage?.displayName ?? this.language;
  }

  get editorConfig(): AceConfigInterface {
    return {
      ...this.aceEditorConfig,
      readOnly: !this.inEditMode
    };
  }

  onLanguageChange() {
    this.applyPinnedLanguage();
    this.highlightedSource = this.highlightSource();
    this.emitValue();
  }

  onSourceChange(value: string) {
    this.source = value;
    this.applyPinnedLanguage();
    this.highlightedSource = this.highlightSource();
    this.emitValue();
  }

  onFileAdded(fileInput: Event) {
    const target = fileInput.target as HTMLInputElement;

    if (!target.files || !target.files[0]) {
      return;
    }

    const file = target.files[0];
    const extension = file.name.split('.').pop();

    if (!this.pinLanguage) {
      const language = this.supportedLanguages.find(
        lang => lang.fileExt === extension
      );

      if (!language) {
        this.importFileName = '';
        target.value = '';
        return;
      }

      this.language = language.value;
    }

    this.importFileName = file.name;
    this.applyPinnedLanguage();

    const reader = new FileReader();
    reader.onload = () => {
      this.source = reader.result?.toString() ?? '';
      this.applyPinnedLanguage();
      this.highlightedSource = this.highlightSource();
      this.emitValue();
    };
    reader.readAsText(file);
  }

  copySource() {
    this.copyText(this.source).then(() => {
      this.copied = true;

      if (this.copiedTimeout) {
        clearTimeout(this.copiedTimeout);
      }

      this.copiedTimeout = setTimeout(() => {
        this.copied = false;
      }, 1500);
    });
  }

  private emitValue() {
    this.applyPinnedLanguage();
    this.valueChange.emit(encodeSourceCodeValue({
      language: this.language,
      source: this.source
    }, this.valueFormat));
  }

  private applyPinnedLanguage() {
    if (this.pinLanguage && this.fixedLanguage) {
      this.language = this.fixedLanguage;
    }
  }

  private highlightSource(): string {
    const language = this.prismLanguage;
    const grammar = Prism.languages[language];

    if (!grammar) {
      return this.escapeHtml(this.source);
    }

    return Prism.highlight(this.source ?? '', grammar, language);
  }

  get prismLanguage(): string {
    switch (this.language) {
      case 'c#':
        return 'csharp';
      case 'dmn':
        return 'markup';
      case 'drools':
        return 'clike';
      case 'json-meql':
        return 'json';
      case 'text':
        return 'none';
      default:
        return this.language;
    }
  }

  private escapeHtml(value: string): string {
    return (value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private copyText(value: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(value ?? '');
    }

    const textarea = document.createElement('textarea');
    textarea.value = value ?? '';
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return Promise.resolve();
  }
}

/*
Copyright 2021 University of Oxford

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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FolderResult } from '@mdm/model/folderModel';
import { HtmlButtonMode } from '../html-editor/html-editor.component';

export enum ContentEditorFormat {
  Markdown,
  Html
}

export interface ContentEditorMarkdownOptions {
  showHelpText: boolean;
}

export interface ContentEditorHtmlOptions {
  useBasicButtons: boolean;
}

@Component({
  selector: 'mdm-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.scss']
})
export class ContentEditorComponent implements OnInit {

  @Input() contentFormat: ContentEditorFormat = ContentEditorFormat.Html;
  ContentFormatType = ContentEditorFormat;

  /* Inputs/outputs for manual properties */
  @Input() inEditMode: boolean;
  @Input() description: string;
  @Output() descriptionChange = new EventEmitter<string>();

  /* Inputs for model binding */
  @Input() editableForm: any;
  @Input() element: FolderResult;
  @Input() property: string;

  @Input() markdownOptions: ContentEditorMarkdownOptions;
  @Input() htmlOptions: ContentEditorHtmlOptions;

  ButtonModeTypes = HtmlButtonMode;

  constructor() { }

  ngOnInit(): void {
    this.markdownOptions = this.markdownOptions ?? { showHelpText: true };
    this.htmlOptions = this.htmlOptions ?? { useBasicButtons: false };

    this.contentFormat = this.isHtmlContent() ? ContentEditorFormat.Html : ContentEditorFormat.Markdown;
  }

  changeContentType(format: ContentEditorFormat) {
    this.contentFormat = format;
  }

  getContentFormatName() {
    switch (this.contentFormat)
    {
      case ContentEditorFormat.Markdown: return 'Markdown';
      case ContentEditorFormat.Html: return 'HTML';
      default: return '';
    }
  }

  isInEditMode() : boolean {
    if (!this.editableForm) {
      return this.inEditMode;
    }

    return this.editableForm.visible;
  }

  onEditorDescriptionChanged(value: string) {
    this.description = value;
    this.descriptionChange.emit(value);
  }

  isHtmlContent() {
    const content = this.editableForm ? this.editableForm[this.property] : this.description;
    if (!content) {
      return false;
    }

    const expression = /<([A-Z][A-Z0-9]*)\b[^>]*>(.*?)<\/\1>/gmi;
    return expression.test(content);
  }
}

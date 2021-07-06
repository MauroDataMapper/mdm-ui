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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  /* Inputs/outputs for manual properties */
  @Input() inEditMode: boolean;
  @Input() content: string;
  @Output() contentChange = new EventEmitter<string>();

  /* Inputs for model binding */
  @Input() element: any;
  @Input() property: string;

  @Input() markdownOptions: ContentEditorMarkdownOptions;
  @Input() htmlOptions: ContentEditorHtmlOptions;

  ButtonModeTypes = HtmlButtonMode;
  ContentFormatType = ContentEditorFormat;

  constructor() { }

  ngOnInit(): void {
    this.markdownOptions = this.markdownOptions ?? { showHelpText: true };
    this.htmlOptions = this.htmlOptions ?? { useBasicButtons: false };

    this.contentFormat = this.isHtmlContent() ? ContentEditorFormat.Html : ContentEditorFormat.Markdown;
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
      return this.inEditMode;
  }

  onEditorDescriptionChanged(value: string) {
    this.content = value;
    this.contentChange.emit(value);
  }

  isHtmlContent() {

    if (!this.content) {
      return false;
    }

    const expression = /<([A-Z][A-Z0-9]*)\b[^>]*>(.*?)<\/\1>/gmi;
    return expression.test(this.content);
  }
}

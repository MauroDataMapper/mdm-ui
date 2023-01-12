/*
Copyright 2020-2023 University of Oxford
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
import {Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentEditorFormat } from '@mdm/constants/ui.types';
import { UserSettingsHandlerService } from '@mdm/services';
import { HtmlButtonMode } from '../html-editor/html-editor.component';

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

  @Input() contentFormat: ContentEditorFormat = 'markdown';

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

  constructor(private userSettings: UserSettingsHandlerService) { }

  ngOnInit(): void {
    this.markdownOptions = this.markdownOptions ?? { showHelpText: true };
    this.htmlOptions = this.htmlOptions ?? { useBasicButtons: false };

    const formatPreference = this.userSettings.get<ContentEditorFormat>('editorFormat')
      ?? this.userSettings.defaultSettings.editorFormat;

    if(this.isEmptyContent()) {
      this.contentFormat = formatPreference;
    } else {
      this.contentFormat = this.isHtmlContent() ? 'html' : 'markdown';
    }

  }

  isInEditMode() : boolean {
      return this.inEditMode;
  }

  onEditorDescriptionChanged(value: string) {
    this.content = value;
    this.contentChange.emit(value);
  }

  isEmptyContent() {
    return !this.content;
  }


  isHtmlContent() {

    if (!this.content) {
      return false;
    }

    const expression = /<([A-Z][A-Z0-9]*)\b[^>]*>(.*?)<\/\1>/gmi;
    return expression.test(this.content);
  }
}

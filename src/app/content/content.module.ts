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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownTextAreaComponent } from './markdown/markdown-text-area/markdown-text-area.component';
import { MaterialModule } from '@mdm/modules/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkdownDirective } from './markdown/markdown.directive';
import { HtmlEditorComponent } from './html/html-editor/html-editor.component';
import { ContentEditorComponent } from './content-editor/content-editor.component';
import { JoditAngularModule } from 'jodit-angular';
import { SafePipe } from './safe.pipe';
import { ElementSearchDialogComponent } from './element-search-dialog/element-search-dialog.component';
import { MarkedPipe } from './markdown/marked.pipe';

const components = [
  MarkdownTextAreaComponent,
  MarkdownDirective,
  HtmlEditorComponent,
  ContentEditorComponent,
  SafePipe,
  ElementSearchDialogComponent,
  MarkedPipe
];

@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    JoditAngularModule
  ],
  exports: components
})
export class ContentModule {}

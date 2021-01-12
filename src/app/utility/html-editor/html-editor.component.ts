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
import { EventObj } from 'jodit-angular/lib/Events';

const standardButtons = [
  'source', 
  '|', 
  'bold', 
  'italic', 
  'underline', 
  '|', 
  'ul', 
  'ol', 
  'eraser', 
  '|', 
  'outdent', 
  'indent', 
  '|', 
  'font',
  'fontsize',
  'brush',
  'paragraph',
  '|',
  'table',
  '|',
  'align',
  '\n',
  'undo',
  'redo',
  '|',
  'hr',
  'copyformat',
  'fullsize',
];

const basicButtons = [
  'bold', 
  'italic', 
  'underline', 
  '|', 
  'ul', 
  'ol', 
  'eraser', 
  '|', 
  'outdent', 
  'indent', 
  '|', 
  'font',
  'fontsize',
  'brush',
  'paragraph'
];

export enum HtmlButtonMode {
  Standard,
  Basic
}

@Component({
  selector: 'mdm-html-editor',
  templateUrl: './html-editor.component.html'
})
export class HtmlEditorComponent implements OnInit {  

  /* Inputs for manual properties */
  @Input() inEditMode: boolean;
  @Input() description: string;
  @Output() descriptionChange = new EventEmitter<string>();

  /* Inputs for model binding */
  @Input() editableForm: any;
  @Input() element: FolderResult;
  @Input() property: string;

  @Input() buttonMode: HtmlButtonMode;
  ButtonModeType = HtmlButtonMode;

  editorConfig: object;

  constructor() { }

  ngOnInit(): void {
    const buttons = this.buttonMode === HtmlButtonMode.Basic ? basicButtons : standardButtons;

    this.editorConfig = {
      buttons,
      buttonsMD: buttons,
      buttonsSM: buttons,
      buttonsXS: buttons
    }
  }

  onHtmlEditorChanged(event: EventObj) {
    this.description = event.editor.value;
    this.descriptionChange.emit(this.description);
  }

}

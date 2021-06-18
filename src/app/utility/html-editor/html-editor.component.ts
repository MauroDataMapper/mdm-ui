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
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { MessageService } from '@mdm/services/message.service';
import { EventObj } from 'jodit-angular/lib/Events';
import { Subscription } from 'rxjs/internal/Subscription';

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
  @Input() element: any;
  @Input() property: string;

  @Input() buttonMode: HtmlButtonMode;
  ButtonModeType = HtmlButtonMode;

  editorConfig: object;

  private elementSelectorSubscription: Subscription;

  constructor(
    private elementDialogService: ElementSelectorDialogueService,
    private messageService: MessageService,
    private elementTypesService: ElementTypesService) { }

  ngOnInit(): void {
    const buttons = this.buttonMode === HtmlButtonMode.Basic ? basicButtons : standardButtons;

    const extraButtons = [
      {
        name: 'addelement',
        text: 'Add Element',
        icon: '',
        exec: (editor: any) => this.onAddElementLink(this, editor)
      }
    ];

    this.editorConfig = {
      buttons,
      buttonsMD: buttons,
      buttonsSM: buttons,
      buttonsXS: buttons,
      extraButtons
    };
  }

  onHtmlEditorChanged(event: EventObj) {
    this.description = event.editor.value;
    this.descriptionChange.emit(this.description);
  }

  // Requires a reference to the HtmlEditorComponent to get correct scope
  onAddElementLink(component: HtmlEditorComponent, editor: any) {
    if (component.elementSelectorSubscription) {
      component.elementSelectorSubscription.unsubscribe();
      component.elementSelectorSubscription = null;
    }

    const focusNode = editor.selection.sel.focusNode;

    component.elementSelectorSubscription = component.messageService.elementSelector.subscribe(element => {
      if (!element) {
        return;
      }

      const href = component.elementTypesService.getLinkUrl(element);
      const html = editor.create.fromHTML(`<a href='${href}' title='${element.label}'>${element.label}</a>`);

      editor.selection.setCursorIn(focusNode);
      editor.selection.insertHTML(html);
    });

    component.elementDialogService.open([], []);
  }

}

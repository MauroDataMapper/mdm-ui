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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { MessageService } from '@mdm/services/message.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { MauroItem } from '@mdm/mauro/mauro-item.types';
import { Pathable } from '@maurodatamapper/mdm-resources';
import { PathNameService } from '@mdm/shared/path-name/path-name.service';

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
    private pathNames: PathNameService
  ) {}

  ngOnInit(): void {
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
      'link',
      {
        name: 'linktoelement',
        text: 'Link to Catalogue Item',
        tooltip: 'Add link to catalogue item',
        iconURL: 'assets/images/link-svgrepo-com.svg',
        exec: (editor: any) => this.onAddElementLink(this, editor)
      },
      '|',
      'align',
      '\n',
      'undo',
      'redo',
      '|',
      'hr',
      'copyformat'
    ];

    const buttons =
      this.buttonMode === HtmlButtonMode.Basic ? basicButtons : standardButtons;

    this.editorConfig = {
      buttons,
      buttonsMD: buttons,
      buttonsSM: buttons,
      buttonsXS: buttons
    };
  }

  onHtmlEditorChanged(changedDescription: string) {
    this.description = changedDescription;
    this.descriptionChange.emit(this.description);
  }

  // Requires a reference to the HtmlEditorComponent to get correct scope
  onAddElementLink(component: HtmlEditorComponent, editor: any) {
    if (component.elementSelectorSubscription) {
      component.elementSelectorSubscription.unsubscribe();
      component.elementSelectorSubscription = null;
    }

    const focusNode = editor.selection.sel.focusNode;

    component.elementSelectorSubscription = component.messageService.elementSelector.subscribe(
      (element: MauroItem & Pathable) => {
        if (!element) {
          return;
        }

        const href = this.pathNames.createHref(element.path);
        const link = editor.create.fromHTML(
          `<a href='${href}' title='${element.label}'>${element.label}</a>`
        );

        editor.selection.setCursorIn(focusNode);
        editor.selection.insertHTML(link);
      }
    );

    component.elementDialogService.open([], []);
  }
}

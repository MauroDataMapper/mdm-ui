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
import { Component, OnInit, Input, ViewChild, Output, ElementRef, EventEmitter } from '@angular/core';
import { MarkdownParserService } from '@mdm/utility/markdown/markdown-parser/markdown-parser.service';
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { MessageService } from '@mdm/services/message.service';

@Component({
  selector: 'mdm-markdown-text-area',
  templateUrl: './markdown-text-area.component.html',
  styleUrls: ['./markdown-text-area.component.scss']
})
export class MarkdownTextAreaComponent implements OnInit {
  @Output() descriptionChange = new EventEmitter<string>();
  @Input() inEditMode: boolean;
  @Input() hideHelpText: boolean;
  @Input() rows: number;
  @Input() property: string;
  @Input() element: any;
  @ViewChild('editableTextArea', { static: false })
  editableTextArea: ElementRef;
  @ViewChild('editableText', { static: true }) editForm: any;
  descriptionVal: string;

  @Input()
  get description() {
    return this.descriptionVal;
  }

  set description(val) {
    this.descriptionVal = val;
    if (val === null || val === undefined) {
      this.formData.description = '';
    } else {
      this.formData.description = val;
    }
    this.descriptionChange.emit(this.descriptionVal);
  }

  get isEditorVisible(): boolean {
    return this.inEditMode;
  }

  elementDialogue;
  lastWasShiftKey: any;
  formData: any = {
    showMarkDownPreview: Boolean,
    description: String
  };
  currentShiftKey: any;
  selectedElement: any;
  desc;

  constructor(
    private markdownParser: MarkdownParserService,
    private elementDialogueService: ElementSelectorDialogueService,
    private messageService: MessageService
  ) {
  }

  ngOnInit() {
    this.lastWasShiftKey = null;
    this.formData.showMarkDownPreview = false;
    this.formData.description = this.description;
    this.elementSelected();
  }

  public descriptionKeyUp($event) {
    $event.stopImmediatePropagation();

    this.currentShiftKey = $event.keyCode === 16;

    if (this.lastWasShiftKey && this.currentShiftKey) {
      this.lastWasShiftKey = false;
      return;
    }

    if (this.currentShiftKey) {
      this.lastWasShiftKey = true;
    } else {
      this.lastWasShiftKey = false;
    }
  }

  public showAddElementToMarkdown() {
    this.elementDialogue = this.elementDialogueService.open([], []);
  }

  public elementSelected() {
    this.messageService.elementSelector.subscribe(data => {
      this.selectedElement = data;
      if (this.selectedElement != null) {
        this.markdownParser.createMarkdownLink(this.selectedElement).then(result => {
          if (this.editableTextArea) {
            const startPos = this.editableTextArea.nativeElement.selectionStart;
            this.editableTextArea.nativeElement.focus();

            this.editableTextArea.nativeElement.value = `${this.editableTextArea.nativeElement.value.substr(0, this.editableTextArea.nativeElement.selectionStart)} ${result} ${this.editableTextArea.nativeElement.value.substr(this.editableTextArea.nativeElement.selectionStart, this.editableTextArea.nativeElement.value.length)}`;

            this.editableTextArea.nativeElement.selectionStart = startPos;
            this.editableTextArea.nativeElement.focus();
            this.description = this.editableTextArea.nativeElement.value;
          }
        });
      }
    });
  }

  onDescriptionChange = () => {
      this.description = this.formData.description;
  };
}

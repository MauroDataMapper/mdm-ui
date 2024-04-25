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
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  ElementRef,
  EventEmitter
} from '@angular/core';
import { MarkdownParserService } from '../markdown-parser/markdown-parser.service';
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { MessageService } from '@mdm/services/message.service';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';
import {
  CatalogueItem,
  Modelable,
  Navigatable
} from '@maurodatamapper/mdm-resources';
import { PathNameService } from '@mdm/shared/path-name/path-name.service';
import { MdmResourcesService } from '@mdm/modules/resources';

@Component({
  selector: 'mdm-markdown-text-area',
  templateUrl: './markdown-text-area.component.html',
  styleUrls: ['./markdown-text-area.component.scss']
})
export class MarkdownTextAreaComponent implements OnInit {
  @Input() inEditMode: boolean;
  @Input() hideHelpText: boolean;
  @Input() rows: number;
  @ViewChild('editableTextArea', { static: false })
  editableTextArea: ElementRef;

  @Input() description: string;
  @Output() descriptionChange = new EventEmitter<string>();

  /**
   * Root catalogue element that can be optionally used to assist with autocomplete search.
   */
  @Input() rootElement?: CatalogueItem;

  @Input() showPreview = false;

  selectedElement: any;

  constructor(
    private markdownParser: MarkdownParserService,
    private elementDialogueService: ElementSelectorDialogueService,
    private messageService: MessageService,
    private dialog: MatDialog,
    private pathNames: PathNameService,
    private resources: MdmResourcesService
  ) {}

  get allowAutocompleteSearch() {
    return (
      this.rootElement &&
      this.resources.getSearchableResource(this.rootElement.domainType)
    );
  }

  ngOnInit() {
    this.elementSelected();
  }

  onEditorChanged() {
    this.descriptionChange.emit(this.description);
  }

  onEditorKeydown(event: KeyboardEvent) {
    if (
      this.allowAutocompleteSearch &&
      event.ctrlKey &&
      event.code === 'Space'
    ) {
      event.stopPropagation();
      this.onElementSearch();
    }
  }

  public showAddElementToMarkdown() {
    this.elementDialogueService.open([], []);
  }

  public elementSelected() {
    this.messageService.elementSelector.subscribe((data) => {
      this.selectedElement = data;
      if (this.selectedElement != null) {
        this.createAndInsertLink(this.selectedElement);
      }
    });
  }

  onElementSearch() {
    if (!this.allowAutocompleteSearch) {
      return;
    }

    this.dialog
      .openElementSearch(this.rootElement)
      .afterClosed()
      .pipe(filter((response) => !!response?.selected))
      .subscribe((response) => {
        this.createAndInsertLink(response.selected);
      });
  }

  private createAndInsertLink(element: Modelable & Navigatable) {
    const path = this.pathNames.createFromBreadcrumbs(element);
    const link = `[${element.label}](${path})`;
    this.insertText(link);
  }

  private insertText(insert: string) {
    if (!this.editableTextArea) {
      return;
    }

    const startPos = this.editableTextArea.nativeElement.selectionStart;
    this.editableTextArea.nativeElement.focus();

    this.editableTextArea.nativeElement.value = `${this.editableTextArea.nativeElement.value.substr(
      0,
      this.editableTextArea.nativeElement.selectionStart
    )} ${insert} ${this.editableTextArea.nativeElement.value.substr(
      this.editableTextArea.nativeElement.selectionStart,
      this.editableTextArea.nativeElement.value.length
    )}`;

    this.editableTextArea.nativeElement.selectionStart = startPos;
    this.editableTextArea.nativeElement.focus();
    this.description = this.editableTextArea.nativeElement.value;
  }
}

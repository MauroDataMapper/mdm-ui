/*
Copyright 2020-2023 University of Oxford and NHS England

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
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { MessageService } from '@mdm/services/message.service';
import { filter, map, Subject, takeUntil } from 'rxjs';
import { MarkdownParserService } from '../markdown-parser/markdown-parser.service';

const macShortcuts = {
  bold: 'Bold (⌘ + B)',
  italic: 'Italic (⌘ + I)',
  heading: 'Heading (⌘ + H)',
  quote: "Quote (⌘ + ')",
  numberList: 'Numbered list (⌘ + Alt + L)',
  bulletList: 'Bullet list (⌘ + L)',
  mauroLink: 'Link to catalogue element (⌘ + K)'
};

const standardShortcuts = {
  bold: 'Bold (Ctrl + B)',
  italic: 'Italic (Ctrl + I)',
  heading: 'Heading (Ctrl + H)',
  quote: "Quote (Ctrl + ')",
  numberList: 'Numbered list (Ctrl + Alt + L)',
  bulletList: 'Bullet list (Ctrl + L)',
  mauroLink: 'Link to catalogue element (Ctrl + K)'
};

@Component({
  selector: 'mdm-markdown-text-area',
  templateUrl: './markdown-text-area.component.html',
  styleUrls: ['./markdown-text-area.component.scss']
})
export class MarkdownTextAreaComponent implements OnInit, OnDestroy {
  @Input() inEditMode: boolean;
  @Input() hideHelpText: boolean;
  @Input() rows: number;
  @ViewChild('editableTextArea', { static: false })
  textArea: ElementRef<HTMLTextAreaElement>;

  @Input() description: string;
  @Output() descriptionChange = new EventEmitter<string>();

  @Input() showPreview = false;

  private unsubscribe$ = new Subject<void>();

  keyboardShortcuts = standardShortcuts;

  constructor(
    private markdownParser: MarkdownParserService,
    private elementDialogueService: ElementSelectorDialogueService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    if (this.inEditMode) {
      const usingMacOs = window.navigator.userAgent.search('Mac') !== -1;
      this.keyboardShortcuts = usingMacOs ? macShortcuts : standardShortcuts;
    }

    this.messageService.elementSelector
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((element) => !!element),
        map((element) => {
          const link = this.markdownParser.createMarkdownLink(element);
          return link;
        })
      )
      .subscribe((link) =>
        this.insertText({ type: 'inline', replacement: link })
      );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onEditorChanged() {
    this.descriptionChange.emit(this.description);
  }

  onEditorKeyDown(event: KeyboardEvent) {
    let action: () => void;

    const usingModifier = event.ctrlKey || event.metaKey;

    if (usingModifier && event.code === 'KeyB') {
      action = this.insertBold.bind(this);
    } else if (usingModifier && event.code === 'KeyI') {
      action = this.insertItalic.bind(this);
    } else if (usingModifier && event.code === 'KeyH') {
      action = this.insertHeading.bind(this);
    } else if (usingModifier && event.code === 'Quote') {
      action = this.insertQuote.bind(this);
    } else if (usingModifier && event.altKey && event.code === 'KeyL') {
      action = this.insertNumberList.bind(this);
    } else if (usingModifier && event.code === 'KeyL') {
      action = this.insertBulletList.bind(this);
    } else if (usingModifier && event.code === 'KeyK') {
      action = this.showAddElementToMarkdown.bind(this);
    }

    if (action) {
      event.stopPropagation();
      event.preventDefault();
      action();
    }
  }

  togglePreview() {
    this.showPreview = !this.showPreview;

    if (!this.showPreview) {
      // Handle within a timeout because the @ViewChild textArea may not be bound yet due
      // to being part of an ngIf
      setTimeout(() => this.textArea?.nativeElement?.focus());
    }
  }

  public showAddElementToMarkdown() {
    this.elementDialogueService.open([], []);
  }

  insertBold() {
    this.insertText({ type: 'inline', prefix: '**', suffix: '**' });
  }

  insertItalic() {
    this.insertText({ type: 'inline', prefix: '_', suffix: '_' });
  }

  insertHeading() {
    this.insertText({ type: 'block', prefix: '# ', replacement: 'heading' });
  }

  insertQuote() {
    this.insertText({ type: 'block', prefix: '> ', replacement: 'quote' });
  }

  insertBulletList() {
    this.insertText({ type: 'block', prefix: '- ' });
  }

  insertNumberList() {
    this.insertText({ type: 'block', prefix: '1. ' });
  }

  private insertText(options: {
    type: 'inline' | 'block';
    replacement?: string;
    prefix?: string;
    suffix?: string;
  }) {
    if (!this.textArea) {
      return;
    }

    const el = this.textArea.nativeElement;

    if (options.type === 'block' && el.value.length > 0) {
      el.value = el.value + '\r\n\r\n';
    }

    // Track current selection if there is one
    const selection =
      el.selectionStart !== el.selectionEnd
        ? el.value.substring(el.selectionStart, el.selectionEnd)
        : undefined;

    const insert = ''.concat(
      options.prefix ?? '',
      options.replacement ?? selection ?? 'text',
      options.suffix ?? ''
    );

    el.setRangeText(insert, el.selectionStart, el.selectionEnd, 'select');

    // After replacement, adjust the selection to not include any prefix/suffix text added, only select
    // what is between
    const adjustStart = el.selectionStart + (options.prefix?.length ?? 0);
    const adjustEnd = el.selectionEnd - (options.suffix?.length ?? 0);
    el.setSelectionRange(adjustStart, adjustEnd, 'forward');

    // Make sure the text area is focused so that the selection is clearly visible
    el.focus();

    // Update binding
    this.description = el.value;
  }
}

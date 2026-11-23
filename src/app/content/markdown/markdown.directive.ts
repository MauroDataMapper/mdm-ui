/*
Copyright 2020-2026 University of Oxford and NHS England

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
  Directive,
  Input,
  ElementRef,
  Renderer2,
  OnInit,
  HostListener
} from '@angular/core';
import { MarkdownParserService } from './markdown-parser/markdown-parser.service';
import { CatalogueItem } from '@maurodatamapper/mdm-resources';
import DOMPurify from 'dompurify';
import { Clipboard } from '@angular/cdk/clipboard';
import {
  addCodeSnippetControls,
  handleCodeSnippetControlClick
} from '@mdm/shared/source-code/source-code-highlight';

@Directive({
    selector: '[mdmMarkdown]',
    standalone: true
})
export class MarkdownDirective implements OnInit {
  @Input() renderType: string;

  @Input('rootObject')
  set rootObject(rootObject: CatalogueItem) {
    this.rootObjectInternal = rootObject;
    return
  }

  get rootElement(): CatalogueItem {
    return this.rootObjectInternal;
  }

  @Input('markdown')
  set markdown(markdown: string) {
    if (this.markdownInternal === markdown) {
      return;
    }

    this.markdownInternal = markdown;
    this.renderMarkdown();
  }

  get markdown(): string {
    return this.markdownInternal;
  }

  private markdownInternal: string;
  private rootObjectInternal: CatalogueItem;

  constructor(
    private markdownParser: MarkdownParserService,
    private el: ElementRef,
    private renderer: Renderer2,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    this.renderMarkdown();
  }

  private renderMarkdown() {
    if (this.markdown) {
      let html = this.markdownParser.parse(this.markdown, this.renderType, this.rootElement);
      if (this.renderType === 'text') {
        html = `<span>${html}</span>`;
      }
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', DOMPurify.sanitize(html, { RETURN_TRUSTED_TYPE: false }));
      if (this.renderType !== 'text') {
        addCodeSnippetControls(this.el.nativeElement);
      }
    }
  }

  @HostListener('click', ['$event'])
  onCodeSnippetClick(event: MouseEvent): void {
    handleCodeSnippetControlClick(event, text => this.clipboard.copy(text));
  }
}

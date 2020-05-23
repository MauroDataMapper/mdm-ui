/*
Copyright 2020 University of Oxford

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
import { Directive, Input, ElementRef, Renderer2, OnInit } from '@angular/core';
import { MarkdownParserService } from '../utility/markdown/markdown-parser/markdown-parser.service';

@Directive({
  selector: '[mdmMarkdown]'
})
export class MarkdownDirective implements OnInit {
  private markdownInternal: any;

  @Input() renderType: any;

  constructor(
    private markdownParser: MarkdownParserService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.renderMarkdown();
  }

  get markdown(): any {
    return this.markdownInternal;
  }

  @Input('markdown')
  set markdown(markdown: any) {
    if (this.markdownInternal === markdown) { return; }

    this.markdownInternal = markdown;
    this.renderMarkdown();
  }

  private renderMarkdown() {
    if (this.markdown) {
      let html = this.markdownParser.parse(this.markdown, this.renderType);
      if (this.renderType === 'text') {
        html = `<p>${html}</p>`;
      }
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', html);
    }
  }
}

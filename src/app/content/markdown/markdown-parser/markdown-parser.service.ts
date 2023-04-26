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
import { Injectable } from '@angular/core';
import * as marked from 'marked';
import { MauroItem } from '@mdm/mauro/mauro-item.types';
import { Pathable } from '@maurodatamapper/mdm-resources';
import { CustomTokenizerService } from './custom-tokenizer.service';
import { CustomHtmlRendererService } from './custom-html-renderer.service';
import { CustomTextRendererService } from './custom-text-renderer.service';

@Injectable({
  providedIn: 'root'
})
export class MarkdownParserService {
  constructor(
    private tokenizer: CustomTokenizerService,
    private customHtmlRendererService: CustomHtmlRendererService,
    private customTextRendererService: CustomTextRendererService
  ) {}

  public parse(source: string, renderType: string) {
    // There is a problem with parsing Mauro paths buried within Markdown links e.g. "[Complex Test DataModel](dm:Complex Test DataModel$main)"
    // The marked parser will not identify this as a Markdown link token because of the spaces in the href part between the brackets.
    // Identify all Markdown links in the text, then add a "^" character in the href part instead of spaces so that the marked parser will
    // see it.
    //
    // The regex says:
    // Group 0: match "[...](...)"
    // Group 1: match between "[" and "]"
    // Group 2: match between outer "(" and ")". If the href part also includes brackets, these will be included in the group
    source = source?.replace(
      /\[([^\]]+)\]\((.*)\)/gm,
      (_, $1, $2) => `[${$1}](${$2.replace(/\s/gm, '^')})`
    );

    let renderer: marked.Renderer = this.customHtmlRendererService;
    if (renderType === 'text') {
      renderer = this.customTextRendererService;
    }

    marked.marked.use({ tokenizer: this.tokenizer as any });
    marked.marked.setOptions({
      renderer,
      gfm: true,
      breaks: true
    });

    if (source) {
      source = marked.marked(source);
      source = source?.replace('\\r\\n', '');
      return source;
    }
  }

  public createMarkdownLink(element: MauroItem & Pathable) {
    return `[${element.label}](${element.path})`;
  }
}

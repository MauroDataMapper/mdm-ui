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
import { Injectable } from '@angular/core';
import { isUrl } from '@mdm/content/content.utils';
import { PathNameService } from '@mdm/shared/path-name/path-name.service';
import * as marked from 'marked';

@Injectable({
  providedIn: 'root'
})
export class CustomHtmlRendererService extends marked.Renderer {
  constructor(private pathNames: PathNameService) {
    super();
  }

  link(href: string, _: string, text: string) {
    if (!href) {
      return `<a href='#'>${text}</a>`;
    }

    if (isUrl(href)) {
      // Create external link
      return `<a href='${href}' target="_blank">${text}</a>`;
    }

    // Create internal link, assuming the href is a Mauro path to a catalogue item
    // First have to convert back hat characters to spaces. This was done in MarkdownParserService
    // because spaces in the href part meant the marked parser would not get us this far
    const path = href.replace(/\^/g, ' ');
    const link = this.pathNames.createHref(path);
    return `<a href='${link}'>${text}</a>`;
  }

  // just reduce header tags for one level
  heading = (text, level) => {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const l = level + 1;
    return `<h${l}>${text}</h${l}>`;
  };

  table = (header, body) => {
    return `<table class='table table-bordered'> ${header} ${body}</table>`;
  };
}

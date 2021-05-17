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
import { Injectable } from '@angular/core';
import * as marked from 'marked';
@Injectable({
  providedIn: 'root'
})
export class CustomTextRendererService extends marked.Renderer {

  constructor() {
    super();
  }

  // render just the text of a link
  code = (code) => {
    return code;
  };

  codespan = (code) => {
    return code;
  };

  // render just the text of a link
  strong = (text) => {
    return text;
  };

  // render just the text of a link
  link = (href, title, text) => {
    return text;
  };

  html = () => {
    return '';
  };

  // render just the text of a paragraph
  paragraph = text => {
    return `${this.htmlEscapeToText(text)}\\r\\n`;
  };

  // render just the text of a heading element, but indicate level
  heading = (text) => {
    return text;
  };

  // render nothing for images
  image = () => {
    return '';
  };

  table = (header) => {
    let table = '<br>[';
    const reg = /<th>(.*?)<\/th>/g;
    let match;
    // tslint:disable-next-line: no-conditional-assignment
    while ((match = reg.exec(header))) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      table += (match[1] ? match[1] : '...') + ', ';
    }
    table += '...]';
    return table;
  };

  // &#63; to ? helper
  public htmlEscapeToText(text) {
    // eslint-disable-next-line no-useless-escape
    return text.replace(/\&\#[0-9]*;|&amp;/g, (escapeCode) => {
      if (escapeCode.match(/amp/)) {
        return '&';
      }

      return String.fromCharCode(escapeCode.match(/[0-9]+/));
    });
  }

}

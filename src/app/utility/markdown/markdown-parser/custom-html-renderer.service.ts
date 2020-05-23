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
import {Injectable} from '@angular/core';
import marked from 'marked/lib/marked';
import {LinkCreatorService} from "@mdm/utility/markdown/markdown-parser/link-creator.service";
import {Renderer} from "marked";

@Injectable({
  providedIn: 'root'
})
export class CustomHtmlRendererService extends marked.Renderer {

  constructor(private linkCreatorService: LinkCreatorService) {
    super();
  }

  link = (href: string, title: any, text: string) => {
    if (href && href.indexOf('MC|') === 0) {
      const link = this.linkCreatorService.createLink(href, title, text);
      return `<a href='${link}'>${text}</a>`;
    }
    // return the actual format if it does not star with MC
    return `<a href='${href}' target="_blank">${text}</a>`;
  };

  // just reduce header tags for one level
  heading = (text, level, rawtext) => {
    const l = level + 1;
    return `<h${l}>${text}</h${l}>`;
  };

  table = (header, body) => {
    let table = `<table class='table table-bordered'>`;
    table += header + body;
    table += `</table>`;
    return table;
  };


}

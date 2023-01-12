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
import { Injectable } from '@angular/core';
import { ElementTypesService } from '@mdm/services/element-types.service';
import * as marked from 'marked';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { CustomTokenizerService } from '@mdm/utility/markdown/markdown-parser/custom-tokenizer.service';
import { CustomHtmlRendererService } from '@mdm/utility/markdown/markdown-parser/custom-html-renderer.service';
import { CustomTextRendererService } from '@mdm/utility/markdown/markdown-parser/custom-text-renderer.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarkdownParserService {

  constructor(private elementTypes: ElementTypesService,
    private tokenizer: CustomTokenizerService,
    private customHtmlRendererService: CustomHtmlRendererService,
    private customTextRendererService: CustomTextRendererService,
    private resourcesService: MdmResourcesService,
    private broadcastSvc: BroadcastService) {
  }

  public parse(source: string, renderType : string) {

    // Find only the text within brackets and replace the empty spaces with a special char ^ in order to be able to parse the markdown link
     source = source?.replace(/\[([^\]]+)\]\(([^\)]+)\)/gm, ($0, $1, $2) => `[${$1}](${$2.replace(/\s/gm, '^')})`);

    let renderer: marked.Renderer = this.customHtmlRendererService;
    if (renderType === 'text') {
      renderer = this.customTextRendererService;
    }

    marked.marked.use({ tokenizer: this.tokenizer as any });
    marked.marked.setOptions({
      renderer,
      gfm: true,
      breaks: true,
    });

    if (source) {
       source = marked.marked(source);
       source = source?.replace('\\r\\n','');
      return source;
    }
  }

  public createMarkdownLink(element): Observable<string> {
    const dataTypeNames = this.elementTypes.getTypesForBaseTypeArray('DataType').map((dt) => {
      return dt.id;
    });

    let parentId = null;
    if (element.domainType === 'DataClass') {
      parentId = element.modelId;
    }
    if (!parentId && element.breadcrumbs) {
      parentId = element.breadcrumbs[0].id;
    }

    return this.elementTypes.getNamedLinkIdentifier(element)
      .pipe(
        map(namedLink => {
          if (element.domainType === 'DataType' || dataTypeNames.includes(element.element?.domainType)) {
            if (!parentId) {
              return `[${element.element.label}](${namedLink})`;
            } else {
              return `[${element.label}](${namedLink})`;
            }
          }

          if (element.domainType === 'DataElement' || element.element?.domainType === 'DataElement') {
            if (!parentId) {
              return `[${element.element.label}](${namedLink})`;
            }
            else {
              return `[${element.label}](${namedLink})`;
            }
          }

          return `[${element.label}](${namedLink})`;
        }));
  }
}

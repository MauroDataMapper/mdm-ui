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

export interface HtmlParserContext {
  versionOrBranchOverride?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HtmlParserService {
  private domParser = new DOMParser();

  constructor(private pathNames: PathNameService) {}

  /**
   * Parse the given HTML (fragment) and modify to make suitable for local content display.
   *
   * @param original The original HTML source.
   * @param context Information relevant for applying to the resulting HTML.
   * @returns A modified version of the HTML source for local content display.
   */
  parseAndModify(original: string, context: HtmlParserContext): string {
    const document = this.domParser.parseFromString(original, 'text/html');
    this.rewriteHrefs(document, context);

    return document.body.innerHTML;
  }

  private rewriteHrefs(document: Document, context: HtmlParserContext) {
    const links = document.querySelectorAll('a');

    links.forEach((link) => {
      if (!link.href || link.href === '' || link.href === 'about:blank#') {
        // Ignore missing hrefs or script references
        return;
      }

      if (isUrl(link.href)) {
        // Consider this to be a link to an external document, should not change
        return;
      }

      // Create internal link, assuming the href is a Mauro path to a catalogue item
      const path = link.href;
      const internalHref = context.versionOrBranchOverride
        ? this.pathNames.createHrefRelativeToVersionOrBranch(
            path,
            context.versionOrBranchOverride
          )
        : this.pathNames.createHref(path);
      link.href = internalHref;
    });
  }
}

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

@Injectable({
  providedIn: 'root'
})
export class CustomTokenizerService {
  // to stop the IDE complaining about unknown variable
  rules: any;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() { }

  html(html) {
    const cap = this.rules.block.html.exec(html);
    if (cap) {
      return {
        type: 'paragraph',
        raw: cap[0],
        pre: (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        // text: this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0]
        text: cap[0]
      };
    }
  }
}

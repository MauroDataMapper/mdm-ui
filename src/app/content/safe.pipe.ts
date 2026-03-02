/*
Copyright 2020-2025 University of Oxford and NHS England

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

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Pipe({
  name: 'safe',
  standalone: true,
  // Set pure: true for performance; if your code mutates the same string reference,
  // set pure: false so pipe runs every change detection cycle.
  pure: true
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(unsafeHtml: string | null | undefined): SafeHtml | null {
    if (!unsafeHtml) return null;

    // DOMPurify defaults are safe; you can pass a config object here to allow certain tags/attributes.
    const cleaned = DOMPurify.sanitize(unsafeHtml, { RETURN_TRUSTED_TYPE: false });
    // Return SafeHtml so you can bind directly to [innerHTML].
    return this.sanitizer.bypassSecurityTrustHtml(cleaned);
  }
}

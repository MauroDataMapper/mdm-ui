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
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'escapeHtml',
    standalone: true
})
export class EscapeHtmlPipe implements PipeTransform {
    transform(value: string): any {
        return (value) ? rawToXml(value) : '';
  }
}

export function rawToXml(raw: string | null, full: boolean = false): string | null {
  if (raw == null) return null;

  let count = 0;

  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);

    if (
      (c >= 0x0000 && c < 0x0020 && c !== 10 && c !== 13 && c !== 9)
      || (c >= 0x007f && c < 0x00a0)
      || (c >= 0x00fe)
      || c === 60 || c === 62 || c === 38 || c === 59
      || c === 35 || c === 39 || c === 34 || c === 45
      || (c & 128) !== 0
    ) {
      count++;
    }
  }

  if (count === 0) return raw;

  const result: string[] = [];

  for (let i = 0; i < raw.length; i++) {
    xmlEscapeCharacter(raw.charCodeAt(i), result, full);
  }

  return result.join('');
}

function xmlEscapeCharacter(c: number, into: string[], full: boolean): void {
  if (c >= 32 && c < 126) {
    if (
        c !== 60 && c !== 62 && c !== 38
        && c !== 59 && c !== 35
        && c !== 39 && c !== 34 && c !== 45
    ) {
      into.push(String.fromCharCode(c));
      return;
    }
  }

  if (
    (c >= 0x0000 && c < 0x0020 && c !== 10 && c !== 13 && c !== 9)
    || (c >= 0x007f && c < 0x00a0)
  ) {
    if (/\s/.test(String.fromCharCode(c))) {
      into.push(' ');
    }
    return;
  }

  if (
    (c & 128) !== 0
    || c >= 0x00fe
    || c === 60 || c === 62 || c === 38
    || c === 59 || c === 35
    || c === 39 || c === 34 || c === 45
  ) {
    into.push('&#x');

    const a = (c >> 8) & 0xff;
    if (full || a !== 0) {
      into.push(a.toString(16).padStart(2, '0'));
    }

    const b = c & 0xff;
    into.push(b.toString(16).padStart(2, '0'));

    into.push(';');
    return;
  }

  into.push(String.fromCharCode(c));
}

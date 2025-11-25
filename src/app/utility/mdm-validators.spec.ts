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

import { MdmValidators } from '@mdm/utility/mdm-validators';
import { FormControl } from '@angular/forms';

describe('MdmValidators.url (table-driven)', () => {
  const cases: Array<{ desc: string, value: any, expected: object | null }> = [
    { desc: 'valid http URL', value: 'http://example.com/path?a=1#frag', expected: null },
    { desc: 'valid https URL with port', value: 'https://example.com:8080/path', expected: null },
    { desc: 'valid ftp URL', value: 'ftp://ftp.example.com/resource', expected: null },
    { desc: 'valid localhost with port', value: 'http://localhost:3000/', expected: null },
    { desc: 'valid punycode domain', value: 'https://xn--fsq.com', expected: null }, // example punycode
    // We don't support IPv6 urls here
    // { desc: 'valid IPv6 literal', value: 'http://[2001:db8::1]/index.html', expected: null },
    { desc: 'invalid obvious string', value: 'not-a-valid-url', expected: { url: true } },
    { desc: 'private IPv4 (10.x) should be rejected by regex', value: 'http://10.0.0.1/', expected: { url: true } },
    { desc: 'private IPv4 (192.168.x.x) should be rejected', value: 'https://192.168.0.5/', expected: { url: true } },
    { desc: 'empty string treated as valid (pattern allows empty)', value: '', expected: null },
    { desc: 'null value treated as valid', value: null, expected: null },
    { desc: 'URL with credentials', value: 'https://user:pass@example.com/path', expected: null },
    { desc: 'URL with uncommon but valid TLD', value: 'https://example.technology/path', expected: null },
    { desc: 'URL missing protocol (invalid)', value: 'www.example.com', expected: { url: true } },
  ];

  cases.forEach(({ desc, value, expected }) => {
    it(`${desc} -> ${JSON.stringify(value)}`, () => {
      const control = new FormControl(value);
      const result = MdmValidators.url(control);
      expect(result).toEqual(expected);
    });
  });
});
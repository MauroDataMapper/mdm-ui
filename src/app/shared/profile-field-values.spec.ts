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
import {
  formatProfileFieldCurrentValue,
  getProfileAllowedValueOptions
} from './profile-field-values';

describe('profile field allowed values', () => {
  it('creates sorted code/value options from a map', () => {
    const allowedValues = {
      Z: 'Zulu',
      A: 'A'
    };

    expect(getProfileAllowedValueOptions(allowedValues)).toEqual([
      { code: 'A', value: 'A' },
      { code: 'Z', value: 'Zulu' }
    ]);
    expect(getProfileAllowedValueOptions(allowedValues))
      .toBe(getProfileAllowedValueOptions(allowedValues));
  });

  it('keeps the code as the value and adds the mapped value for display', () => {
    expect(formatProfileFieldCurrentValue(
      '["A","Z","unknown"]',
      { A: 'A', Z: 'Zulu' }
    )).toBe('A, Z (Zulu), unknown');
  });

  it('supports existing allowed value arrays', () => {
    expect(getProfileAllowedValueOptions(['B', 'A'])).toEqual([
      { code: 'A', value: 'A' },
      { code: 'B', value: 'B' }
    ]);
    expect(formatProfileFieldCurrentValue('A', ['A'])).toBe('A');
  });
});

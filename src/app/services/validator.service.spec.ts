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
import { TestBed } from '@angular/core/testing';

import { ValidatorService } from './validator.service';

describe('ValidatorService', () => {
  let service: ValidatorService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should capitalise', () => {
    expect(service.capitalize('blobert')).toEqual('Blobert');
    expect(service.capitalize('1234')).toEqual('1234');
    expect(service.capitalize('PEANUT')).toEqual('PEANUT');

    /**
     * Not sure if this really is how it should work.
     */
    expect(service.capitalize(' blobert')).toEqual(' blobert');

    /**
     * Check it does not muss up some unicode sets.
     */
    expect(service.capitalize('رأس المال')).toEqual('رأس المال');
    expect(service.capitalize('कैपिटल')).toEqual('कैपिटल');
    expect(service.capitalize('קאַפּיטאַל')).toEqual('קאַפּיטאַל');
    expect(service.capitalize('首都')).toEqual('首都');
  });

  it('should validate emails', () => {
    const validEmails = [
      'me@home.com',
      'you@this.that-and-the.other.org',
      'you.and.me@example.co.uk',
      'this+that@co.uk',
      '123456789-8765@gruffalo.monster',
      'bish-bosh_bash@nowhere.org.gs',
      'no.dash@-allowed.es'


    ];
    for (const email of validEmails) {
      expect(service.validateEmail(email)).toBe(true);
    }

    const invalidEmails = [
      'nothing-at-home.com',
      '@home.gone',
      'whatever@.org',
      'Nobby Clarke <nobby.clarke@fidget.eu>',
      'boink.boink.boink',
      'too@many@ts',
      '.gordon@moron.co.uk',
      ' space @ here.com',
      'dotty..dotty@example.org',
      'မမှန်ကန်တဲ့@unicode.bad',
      'no.trailing@text.allowed.uk What Ho',
      'no@tld',
      'person@192.168.111.4567',
      '"quoted"@batty.fk',
      'no-double-dot.in@domain..org',
      'sharon@125.45.79.101',

      'tracy@[101.220.34.127]'

    ];
    for (const email of invalidEmails) {
      expect(service.validateEmail(email)).toBe(false);
    }
  });
  it('should validate date instances', () => {
    const validDates = [
      new Date('2019-09-30'),
      new Date(),
      new Date(2019, 9, 30, 10, 32, 18)
    ];
    for (const value of validDates) { expect(service.isDate(value)).toBe(true); }

    const inValidDates = ['2019-09-30', null, undefined, 2019];
    for (const value of inValidDates) { expect(service.isDate(value)).toBe(false); }
  });
  it('should identify empty strings', () => {
    expect(service.isEmpty(null)).toBe(true);
    expect(service.isEmpty(undefined)).toBe(true);
    expect(service.isEmpty('')).toBe(true);
    expect(service.isEmpty(' ')).toBe(true);
    expect(service.isEmpty('\n')).toBe(true);
    expect(service.isEmpty('\t')).toBe(true);
    expect(service.isEmpty('\r')).toBe(true);
    expect(service.isEmpty('x')).toBe(false);
    expect(service.isEmpty(' x')).toBe(false);
    expect(service.isEmpty('x ')).toBe(false);
    expect(service.isEmpty(' x ')).toBe(false);
    const num = 0;
    expect(service.isEmpty(num.toString())).toBe(false);
  });
});

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
import { EnvironmentService } from './environment.service';
import { ThemingService } from './theming.service';

interface EnvironmentStub {
  themeName?: string;
}

describe('ThemingService', () => {
  let service: ThemingService;
  const environment: EnvironmentStub = {
    themeName: 'default'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: EnvironmentService,
          useValue: environment
        }
      ]
    });
  });

  const validThemeNames = [
    'default',
    'nhs-digital'
  ];

  const invalidThemeNames = [
    '',
    ' ',
    'custom-theme',
    'unknown',
    '123'
  ];

  it('should be created', () => {
    service = TestBed.inject(ThemingService);
    expect(service).toBeTruthy();
  });

  it.each(validThemeNames)('should allow theme name "%s"', (themeName) => {
    environment.themeName = themeName;
    service = TestBed.inject(ThemingService);
    expect(service.themeName).toBe(themeName);
  });

  it.each(invalidThemeNames)('should not allow theme name "%s" and use "default" instead', (themeName) => {
    environment.themeName = themeName;
    service = TestBed.inject(ThemingService);
    expect(service.themeName).toBe('default');
  });

  it.each(validThemeNames)('should set CSS selector for valid theme name "%s"', (themeName) => {
    environment.themeName = themeName;
    service = TestBed.inject(ThemingService);
    expect(service.themeCssSelector).toBe(themeName + '-theme');
  });

  it.each(invalidThemeNames)('should set CSS selector for invalid theme name "%s" to be "default-theme"', (themeName) => {
    environment.themeName = themeName;
    service = TestBed.inject(ThemingService);
    expect(service.themeCssSelector).toBe('default-theme');
  });
});


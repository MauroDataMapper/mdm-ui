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
import { EnvironmentService } from './environment.service';

const defaultThemeName = 'default';
const allowedThemeNames = [
  'default',
  'nhs-digital'
];

@Injectable({
  providedIn: 'root'
})
export class ThemingService {

  readonly themeName: string;
  readonly themeCssSelector: string;

  constructor(environment: EnvironmentService) {
    this.themeName = (environment.themeName ?? defaultThemeName).toLowerCase();
    if (!allowedThemeNames.includes(this.themeName)) {
      this.themeName = defaultThemeName;
    }

    this.themeCssSelector = `${this.themeName}-theme`;
  }

  getAssetPath(relativePath: string) {
    return `assets/themes/${this.themeName}/${relativePath}`;
  }
}

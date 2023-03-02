/*
Copyright 2020-2023 University of Oxford and NHS England

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
  name: 'matchThemeColorPattern',
  pure: true
})
export class MatchThemeColorPatternPipe implements PipeTransform {
  constructor() {}

  public transform(value: string): boolean {
    // This expression matches any text with
    // no numeric characters which contains
    // theme and then color somewhere within the string.
    // It can have other text in between, but theme has
    // to be found before color.
    const regexThemeColorPattern = /\D*theme\D*color\D*/;

    return regexThemeColorPattern.test(value);
  }
}

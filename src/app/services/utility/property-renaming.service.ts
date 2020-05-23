/*
Copyright 2020 University of Oxford

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
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PropertyRenamingService {

  constructor() {
  }

  renameKeys(obj) {

    const keyValues = Object.keys(obj).map(key => {
      const newKey = this.replaceUnwantedChars(key.replace(/\./g, '_'));
      return {[newKey]: obj[key]};
    });
    return Object.assign({}, ...keyValues);
  }

  replaceUnwantedChars = (str) => str.replace(
    /([-_][a-z])/g,
    (group) => group.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );
}

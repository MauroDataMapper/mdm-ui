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

/**
 * Describes a tab in a tab group.
 */
export interface TabDescriptor {
  /**
   * The index number of the tab.
   */
  index: number;

  /**
   * The name of the tab.
   */
  name: string;
}

/**
 * Ordered collection of tab identifiers.
 */
export class TabCollection {
  private names: string[];

  /**
   * Creates a new `TabCollection`
   *
   * @param names The names, in order as they appear in a tab view.
   */
  constructor(names: string[]) {
    this.names = names.slice();
  }

  getByIndex(index: number): TabDescriptor {
    if (index >= 0 && index < this.names.length) {
      return { index, name: this.names[index] };
    }

    return { index: 0, name: this.names[0] };
  }

  getByName(name: string): TabDescriptor {
    const index = this.names.findIndex(n => n === name);
    if (index === -1) {
      return { index: 0, name: this.names[0] };
    }

    return { index, name: this.names[index] };
  }
}

/**
 * Defines what annotation views are available.
 */
export type AnnotationViewOption = 'default' | 'attachments';
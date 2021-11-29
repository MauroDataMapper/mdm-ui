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
import { Component, Input } from '@angular/core';

@Component({
  selector: 'mdm-multiplicity',
  templateUrl: './multiplicity.component.html',
  styleUrls: ['./multiplicity.component.sass']
})
export class MultiplicityComponent {
  @Input() min: number | string;
  @Input() max: number | string;

  constructor() {}

  get isValid(): boolean {
    if (this.min === null || this.min === undefined || this.max === null || this.max === undefined) {
      return false;
    }

    if (typeof this.min === 'string' && this.min.trim().length === 0) {
      return false;
    }

    if (typeof this.max === 'string' && this.max.trim().length === 0) {
      return false;
    }

    return true;
  }
}

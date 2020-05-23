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
import {Directive, Input} from '@angular/core';

@Directive({
  selector: '[mdmProperties]'
})
export class PropertiesDirective {
  private aliases_: any;
  private classifiers_: any;
  private multiplicity_: any;
  constructor() { }

  get aliases(): any {
    return this.aliases_;
  }

  @Input('aliases')
  set aliases(aliases: any) {
    if (this.aliases_ === aliases) {
      return;
    }

    this.aliases_ = aliases;

  }

  get classifiers(): any {
    return this.classifiers_;
  }

  @Input('classifiers')
  set classifiers(classifiers: any) {
    if (this.classifiers_ === classifiers) {
      return;
    }

    this.classifiers_ = classifiers;

  }

  get multiplicity(): any {
    return this.multiplicity_;
  }

  @Input('multiplicity')
  set multiplicity(multiplicity: any) {
    if (this.multiplicity_ === multiplicity) {
      return;
    }

    this.multiplicity_ = multiplicity;

  }

}

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
import {Component, DoCheck, OnInit} from '@angular/core';

@Component({
  selector: 'mdm-data-element-step1',
  templateUrl: './data-element-step1.component.html',
  styleUrls: ['./data-element-step1.component.sass']
})
export class DataElementStep1Component implements OnInit {
  step: any;
  modelVal: any;

  get model() {
    return this.modelVal;
  }

  set model(val) {
    this.modelVal = val;
    this.validate();
  }

  constructor() {
  }

  validate = () => {
    if (!this.model.createType) {
      this.step.invalid = true;
      return;
    }

    if (
      this.model.createType === 'copy' &&
      this.model.copyFromDataClass.length === 0
    ) {
      this.step.invalid = true;
      return;
    }

    this.step.invalid = false;
  };

  ngOnInit() {
    this.model = this.step.scope.model;
  }

  onSelect = dataClass => {
    // TODO: Work out why [(ngModel)] is not working here!
    this.model.copyFromDataClass = dataClass;
    this.model.selectedDataElements = [];
    this.validate();
  };

  selectCreateType = createType => {
    this.model.createType = createType;
    this.validate();
  }
}

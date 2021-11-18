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
import { Component, OnInit } from '@angular/core';
import { CreateType } from '@mdm/wizards/wizards.model';

@Component({
  selector: 'mdm-data-type-step1',
  templateUrl: './data-type-step1.component.html',
  styleUrls: ['./data-type-step1.component.sass']
})
export class DataTypeStep1Component implements OnInit {

  step: {
    invalid : boolean;
    isProcessComplete : boolean;
    scope : {
       model: {
        [key: string]: any;
        createType: CreateType;
      };
    };
  };
  modelVal: {
    [key: string]: any;
    createType: CreateType;
  };

  constructor() { }

  get model() {
    return this.modelVal;
  }

  set model(val) {
    this.modelVal = val;
    this.validate();
  }

  ngOnInit() {
    this.model = this.step.scope.model;
  }

  validate = () => {
    if (!this.model.createType) {
      this.step.invalid = true;
      return;
    }

    if (['copy', 'import'].includes(this.model.createType) && !this.model.copyFromDataModel.length) {
      this.step.invalid = true;
      return;
    }

    this.step.invalid = false;
  };

  selectCreateType = createType => {
    this.model.createType = createType;
    this.validate();
  };

  // TODO CORRECT
  onSelect = (dataType) => {
    this.model.copyFromDataModel = dataType;
    this.validate();
  };

}

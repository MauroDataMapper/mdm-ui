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
import {Component,  OnInit} from '@angular/core';
import { DataClass, DataModel } from '@maurodatamapper/mdm-resources';
import { CreateType } from '@mdm/wizards/wizards.model';

@Component({
  selector: 'mdm-data-element-step1',
  templateUrl: './data-element-step1.component.html',
  styleUrls: ['./data-element-step1.component.sass']
})
export class DataElementStep1Component implements OnInit {
  step = {
    invalid : true,
    isProcessComplete : false,
    scope : {
       model: null
      }
  };
  modelVal: {
    [key: string]: any;
    createType: CreateType;
    selectedDataTypes: Array<any>;
    parent:DataModel;
    copyFromDataModel: Array<DataModel>;
    copyFromDataClass: Array<DataClass>;
  };;

  constructor() { }

  get model() {
    return this.modelVal;
  }

  set model(val) {
    this.modelVal = val;
    this.validate();
  }


  validate = () => {
    if (!this.model?.createType) {
      this.step.invalid = true;
      return;
    }

    if (['copy', 'import'].includes(this.model?.createType) && this.model?.copyFromDataClass.length === 0) {
      this.step.invalid = true;
      return;
    }

    this.step.invalid = false;
  };

  ngOnInit() {
    this.model = this.step?.scope.model;
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
  };
}

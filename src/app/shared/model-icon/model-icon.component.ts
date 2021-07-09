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

import { Component, Input, OnInit } from '@angular/core';
import {  ModelDomainType } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-model-icon',
  templateUrl: './model-icon.component.html',
  styleUrls: ['./model-icon.component.scss']
})
export class ModelIconComponent implements OnInit {
  @Input() domainType: ModelDomainType;
  @Input() isDataAsset: boolean;
  style: string;

  constructor() {}

  ngOnInit(): void {
    switch (this.domainType) {
      case ModelDomainType.DataModels:
        if (this.isDataAsset) {
          this.style = 'fa-database';
        } else {
          this.style = 'fa-file-alt';
        }
        break;
      case ModelDomainType.ReferenceDataModels:
        this.style = 'fa-file-alt';
        break;
      case ModelDomainType.Folders:
        this.style = 'fa-folder';
        break;
      case ModelDomainType.Terminologies:
        this.style = 'fa-book';
        break;
      default:
        this.style = 'fa-folder';
        break;
    }
  }
}

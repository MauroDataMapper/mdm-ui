/*
Copyright 2020-2022 University of Oxford
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
import { FormControl, FormGroup } from '@angular/forms';
import {
  Classifier,
  ClassifierIndexResponse,
  MdmTreeItem
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';

@Component({
  selector: 'mdm-catalogue-search-advanced-form',
  templateUrl: './catalogue-search-advanced-form.component.html',
  styleUrls: ['./catalogue-search-advanced-form.component.scss']
})
export class CatalogueSearchAdvancedFormComponent implements OnInit {
  advancedSearch: boolean;
  formGroup: FormGroup;
  classifications: Classifier[];

  get context() {
    return this.formGroup.get('context');
  }

  set contextValue(value: MdmTreeItem[]) {
    this.context.setValue(value);
  }

  get classifiers() {
    return this.formGroup.get('classifiers');
  }

  get classifierNames() {
    if (!this.classifiers.value) {
      return;
    }

    const classifierNames = [];
    this.classifiers.value.forEach((classifier) => {
      classifierNames.push(classifier.label);
    });
    return classifierNames;
  }

  get domainTypes() {
    return this.formGroup.get('domainTypes');
  }

  get labelOnly() {
    return this.formGroup.get('labelOnly');
  }

  get exactMatch() {
    return this.formGroup.get('exactMatch');
  }

  get lastUpdatedAfter() {
    return this.formGroup.get('lastUpdatedAfter');
  }

  get lastUpdatedBefore() {
    return this.formGroup.get('lastUpdatedBefore');
  }

  get createdAfter() {
    return this.formGroup.get('createdAfter');
  }

  get createdBefore() {
    return this.formGroup.get('createdBefore');
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      context: new FormControl(null),
      domainTypes: new FormControl(''),
      labelOnly: new FormControl(true),
      exactMatch: new FormControl(false),
      classifiers: new FormControl(''),
      createdAfter: new FormControl(null),
      createdBefore: new FormControl(null),
      lastUpdatedAfter: new FormControl(null),
      lastUpdatedBefore: new FormControl(null)
    });

    this.resources.classifier
      .list({ all: true })
      .subscribe((result: ClassifierIndexResponse) => {
        this.classifications = result.body.items;
      });
  }

  constructor(private resources: MdmResourcesService) {}

  toggleAdvancedSearch() {
    this.advancedSearch = !this.advancedSearch;
  }

  formatDate(date: Date) {
    if (!date) {
      return;
    }

    const yyyy: String = date.getFullYear().toString();
    const mm: String = date.getMonth().toString().padStart(2, '0');
    const dd: String = date.getDate().toString().padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }

  onDateClear(control: string) {
    this.formGroup.get(control).setValue(null);
  }

  reset() {
    this.formGroup.controls.context.setValue(null);
    this.formGroup.controls.domainTypes.setValue('');
    this.formGroup.controls.labelOnly.setValue(false);
    this.formGroup.controls.exactMatch.setValue(false);
    this.formGroup.controls.classifiers.setValue('');
    this.formGroup.controls.createdAfter.setValue(null);
    this.formGroup.controls.createdBefore.setValue(null);
    this.formGroup.controls.lastUpdatedAfter.setValue(null);
    this.formGroup.controls.lastUpdatedBefore.setValue(null);
  }
}

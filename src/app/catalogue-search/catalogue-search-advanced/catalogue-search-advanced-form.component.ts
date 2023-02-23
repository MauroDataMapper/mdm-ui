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
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  Classifier,
  ClassifierIndexResponse,
  MdmTreeItem,
  ModelDomainType
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';

@Component({
  selector: 'mdm-catalogue-search-advanced-form',
  templateUrl: './catalogue-search-advanced-form.component.html',
  styleUrls: ['./catalogue-search-advanced-form.component.scss']
})
export class CatalogueSearchAdvancedFormComponent implements OnInit {
  advancedSearch: boolean;
  classifications: Classifier[];
  @Output() searchEvent = new EventEmitter<string>();

  formGroup = new FormGroup({
    context: new FormControl<MdmTreeItem[]>(null),
    domainTypes: new FormControl<ModelDomainType[]>([]),
    labelOnly: new FormControl(true),
    exactMatch: new FormControl(false),
    classifiers: new FormControl<any[]>([]),
    createdAfter: new FormControl<Date>(null),
    createdBefore: new FormControl<Date>(null),
    lastUpdatedAfter: new FormControl<Date>(null),
    lastUpdatedBefore: new FormControl<Date>(null)
  });

  get context() {
    return this.formGroup.controls.context;
  }

  set contextValue(value: MdmTreeItem[]) {
    this.context.setValue(value);
  }

  get classifiers() {
    return this.formGroup.controls.classifiers;
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
    return this.formGroup.controls.domainTypes;
  }

  get labelOnly() {
    return this.formGroup.controls.labelOnly;
  }

  get exactMatch() {
    return this.formGroup.controls.exactMatch;
  }

  get lastUpdatedAfter() {
    return this.formGroup.controls.lastUpdatedAfter;
  }

  get lastUpdatedBefore() {
    return this.formGroup.controls.lastUpdatedBefore;
  }

  get createdAfter() {
    return this.formGroup.controls.createdAfter;
  }

  get createdBefore() {
    return this.formGroup.controls.createdBefore;
  }

  ngOnInit(): void {
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
    this.context.reset();
    this.domainTypes.reset();
    this.labelOnly.reset();
    this.exactMatch.reset();
    this.classifiers.reset();
    this.createdAfter.reset();
    this.createdBefore.reset();
    this.lastUpdatedAfter.reset();
    this.lastUpdatedBefore.reset();
  }

  callParentSearch() {
    this.searchEvent.emit('advancedFormCallSearch');
  }
}

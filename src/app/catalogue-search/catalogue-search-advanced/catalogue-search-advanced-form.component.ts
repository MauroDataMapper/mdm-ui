/*
Copyright 2020-2023 University of Oxford
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
import {
  Component,
  EventEmitter,
  OnInit,
  Output} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
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
  formGroup: UntypedFormGroup;
  classifications: Classifier[];
  @Output() searchEvent = new EventEmitter<string>();

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
    this.formGroup = new UntypedFormGroup({
      context: new UntypedFormControl(null),
      domainTypes: new UntypedFormControl(''),
      labelOnly: new UntypedFormControl(true),
      exactMatch: new UntypedFormControl(false),
      classifiers: new UntypedFormControl(''),
      createdAfter: new UntypedFormControl(null),
      createdBefore: new UntypedFormControl(null),
      lastUpdatedAfter: new UntypedFormControl(null),
      lastUpdatedBefore: new UntypedFormControl(null)
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

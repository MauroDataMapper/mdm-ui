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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { MatSelectChange } from '@angular/material/select';
import { Classifier, ClassifierIndexResponse } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';

export interface SearchFilterField {
  name: string;
  label: string;
  dataType: 'enumeration';
  allowedValues?: string[];
  currentValue?: string;
}

export interface SearchFilterChange {
  name: string;
  value?: any;
}

export interface SearchFilterDomainType {
  name: string;
  domainType: string;
  checked: boolean;
}

export interface SearchFilterCheckbox {
  name: string;
  checked: boolean;
}

export interface SearchFilterDate {
  name: string;
  value?: string;
}

@Component({
  selector: 'mdm-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss'],
})
export class SearchFiltersComponent implements OnInit {
  @Input() fields: SearchFilterField[] = [];

  @Input() domainTypes: string[] = [];

  @Input() labelOnly = false;

  @Input() exactMatch = false;

  @Input() lastUpdatedAfter = null;

  @Input() lastUpdatedBefore = null;

  @Input() createdAfter = null;

  @Input() createdBefore = null;

  @Input() classifiers: string[] = [];

  @Input() appearance: MatFormFieldAppearance = 'outline';

  @Output() filterChange = new EventEmitter<SearchFilterChange>();

  @Output() filterReset = new EventEmitter<void>();

  allDomainTypes: SearchFilterDomainType[] = [
    {name: 'Data Model', domainType: 'DataModel', checked: false},
    {name: 'Data Class', domainType: 'DataClass', checked: false},
    {name: 'Data Element', domainType: 'DataElement', checked: false},
    {name: 'Data Type', domainType: 'DataType', checked: false},
    {name: 'Enumeration Value', domainType: 'EnumerationValue', checked: false},
  ];

  labelOnlyFilter: SearchFilterCheckbox = {
    name: 'labelOnly',
    checked: false,
  };

  exactMatchFilter: SearchFilterCheckbox = {
    name: 'labelOnly',
    checked: false,
  };

  lastUpdatedAfterFilter: SearchFilterDate = {
    name: 'lastUpdatedAfter',
    value: null,
  };

  lastUpdatedBeforeFilter: SearchFilterDate = {
    name: 'lastUpdatedBefore',
    value: null,
  };

  createdAfterFilter: SearchFilterDate = {
    name: 'createdAfter',
    value: null,
  };

  createdBeforeFilter: SearchFilterDate = {
    name: 'createdBefore',
    value: null,
  };

  classifiersFilter: Classifier[] = [];

  isReady = false;

  constructor(
    private resources: MdmResourcesService
  ) {}

  ngOnInit(): void {
    this.resources.classifier
    .list({ all: true })
    .subscribe((result: ClassifierIndexResponse) => {
      this.classifiersFilter = result.body.items;

      this.isReady = true;
    });

    // For each domain type option, set checked to true if that domain type appeared in the search parameters
    this.allDomainTypes.forEach((domainType) => domainType.checked = this.domainTypes.indexOf(domainType.domainType) > -1);

    this.labelOnlyFilter.checked = this.labelOnly;

    this.exactMatchFilter.checked = this.exactMatch;

    this.lastUpdatedAfterFilter.value = this.lastUpdatedAfter;

    this.lastUpdatedBeforeFilter.value = this.lastUpdatedBefore;

    this.createdAfterFilter.value = this.createdAfter;

    this.createdBeforeFilter.value = this.createdBefore;
  }

  get hasValues() {
    return this.fields.some((field) => field.currentValue);
  }

  selectionChanged(name: string, event: MatSelectChange) {
    this.filterChange.emit({ name, value: event.value });
  }

  clearSelection(name: string) {
    this.filterChange.emit({ name });
  }

  clearAll() {
    this.filterReset.emit();
  }

  onDomainTypeChange(event: MatCheckboxChange, changedDomainType: SearchFilterDomainType) {
    // Determine the checked state of each of the options
    this.allDomainTypes.forEach((domainType) => {
      if (domainType.domainType === changedDomainType.domainType) {
        domainType.checked = event.checked;
      }
    });

    // Make a string array containing only the 'domainType' properties of those selected
    const checked = this.allDomainTypes.filter( p => p.checked).map(p => p.domainType);

    // And emit that list
    this.filterChange.emit({ name: 'domainTypes', value: checked });
  }

  onLabelOnlyChange(event: MatCheckboxChange,) {
    this.labelOnlyFilter.checked = event.checked;

    this.filterChange.emit({ name: 'labelOnly', value: event.checked });
  }

  onExactMatchChange(event: MatCheckboxChange,) {
    this.exactMatchFilter.checked = event.checked;

    this.filterChange.emit({ name: 'exactMatch', value: event.checked });
  }

  onDateChange(name: string, event) {
    // If date is not null, format as yyyy-MM-dd but ignoring timezone
    let formatted: String = null;

    if (event.value) {
      const yyyy: String = event.value.getFullYear().toString();
      const mm: String = (parseInt(event.value.getMonth(), 10) + 1).toString().padStart(2, '0');
      const dd: String = (event.value.getDate()).toString().padStart(2, '0');

      formatted = `${yyyy}-${mm}-${dd}`;
    }
    this.filterChange.emit({ name, value: formatted});
  }

  onClassifiersChange(event: MatSelectChange) {
    this.filterChange.emit({ name: 'classifiers', value: event.value });
  }
}

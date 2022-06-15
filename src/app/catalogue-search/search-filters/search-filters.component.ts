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

@Component({
  selector: 'mdm-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss'],
})
export class SearchFiltersComponent implements OnInit {
  @Input() fields: SearchFilterField[] = [];

  @Input() domainTypes: string[] = [];

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

  ngOnInit(): void {
    // For each domain type option, set checked to true if that domain type appeared in the search parameters
    this.allDomainTypes.forEach((domainType) => domainType.checked = this.domainTypes.indexOf(domainType.domainType) > -1);
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
      if (domainType.domainType == changedDomainType.domainType) {
        domainType.checked = event.checked;
      }
    });

    // Make a string array containing only the 'domainType' properties of those selected
    const checked = this.allDomainTypes.filter( p => p.checked).map(p => p.domainType);

    // And emit that list
    this.filterChange.emit({ name: 'domainTypes', value: checked });
  }
}

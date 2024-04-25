/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { MatSelectChange } from '@angular/material/select';
import {
  Classifier,
  ClassifierIndexResponse
} from '@maurodatamapper/mdm-resources';
import { CatalogueItemSelectModalComponent } from '@mdm/modals/catalogue-item-select-modal/catalogue-item-select-modal.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { CatalogueSearchContext } from '../catalogue-search.types';

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
  styleUrls: ['./search-filters.component.scss']
})
export class SearchFiltersComponent implements OnInit {
  @Input() fields: SearchFilterField[] = [];

  @Input() context: CatalogueSearchContext = null;

  @Input() domainTypes: string[] = [];

  @Input() labelOnly = false;

  @Input() exactMatch = false;

  @Input() lastUpdatedAfter = null;

  @Input() lastUpdatedBefore = null;

  @Input() createdAfter = null;

  @Input() createdBefore = null;

  @Input() includeSuperseded = false;

  @Input() classifiers: string[] = [];

  @Input() appearance: MatFormFieldAppearance = 'outline';

  @Output() contextChange = new EventEmitter<CatalogueSearchContext>();

  @Output() filterChange = new EventEmitter<SearchFilterChange>();

  @Output() filterReset = new EventEmitter<void>();

  domainTypesFilter: SearchFilterDomainType[] = [
    { name: 'Data Model', domainType: 'DataModel' },
    { name: 'Data Class', domainType: 'DataClass' },
    { name: 'Data Element', domainType: 'DataElement' },
    { name: 'Data Type', domainType: 'DataType' },
    { name: 'Enumeration Value', domainType: 'EnumerationValue' }
  ];

  labelOnlyFilter: SearchFilterCheckbox = {
    name: 'labelOnly',
    checked: false
  };

  exactMatchFilter: SearchFilterCheckbox = {
    name: 'exactMatchOnly',
    checked: false
  };

  lastUpdatedAfterFilter: SearchFilterDate = {
    name: 'lastUpdatedAfter',
    value: null
  };

  lastUpdatedBeforeFilter: SearchFilterDate = {
    name: 'lastUpdatedBefore',
    value: null
  };

  createdAfterFilter: SearchFilterDate = {
    name: 'createdAfter',
    value: null
  };

  createdBeforeFilter: SearchFilterDate = {
    name: 'createdBefore',
    value: null
  };

  includeSupersededFilter: SearchFilterCheckbox = {
    name: 'includeSuperseded',
    checked: false
  };

  classifiersFilter: Classifier[] = [];

  isReady = false;

  constructor(
    private resources: MdmResourcesService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.resources.classifier
      .list({ all: true })
      .subscribe((result: ClassifierIndexResponse) => {
        this.classifiersFilter = result.body.items;

        this.isReady = true;
      });

    this.labelOnlyFilter.checked = this.labelOnly;

    this.exactMatchFilter.checked = this.exactMatch;

    this.lastUpdatedAfterFilter.value = this.lastUpdatedAfter;

    this.lastUpdatedBeforeFilter.value = this.lastUpdatedBefore;

    this.createdAfterFilter.value = this.createdAfter;

    this.createdBeforeFilter.value = this.createdBefore;

    this.includeSupersededFilter.checked = this.includeSuperseded;
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

  resetAll() {
    this.filterReset.emit();
  }

  onDomainTypeChange(event: MatSelectChange) {
    this.filterChange.emit({ name: 'domainTypes', value: event.value });
  }

  onLabelOnlyChange(event: MatCheckboxChange) {
    this.labelOnlyFilter.checked = event.checked;

    this.filterChange.emit({ name: 'labelOnly', value: event.checked });
  }

  onExactMatchChange(event: MatCheckboxChange) {
    this.exactMatchFilter.checked = event.checked;

    this.filterChange.emit({ name: 'exactMatch', value: event.checked });
  }

  onDateChange(name: string, event: MatDatepickerInputEvent<Date>) {
    this.filterChange.emit({ name, value: event.value });
  }

  onDateClear(name: string) {
    this.filterChange.emit({ name, value: undefined });
  }

  onIncludeSupersededChange(event: MatCheckboxChange) {
    this.includeSupersededFilter.checked = event.checked;

    this.filterChange.emit({ name: 'includeSuperseded', value: event.checked });

  }

  onClassifiersChange(event: MatSelectChange) {
    this.filterChange.emit({ name: 'classifiers', value: event.value });
  }

  onContextClear() {
    this.contextChange.emit(null);
  }

  openCatalogueItemSelectModal() {
    this.dialog
      .open(CatalogueItemSelectModalComponent, {})
      .afterClosed()
      .subscribe((catalogueItem) => {
        if (catalogueItem) {
          // When a Data Class is selected, we also need the Data Model ID, which should be in catalogueItem.modelId
          this.contextChange.emit({
            domainType: catalogueItem.domainType,
            id: catalogueItem.id,
            label: catalogueItem.label,
            parentId: catalogueItem.parentId ?? null,
            dataModelId:
              catalogueItem.domainType === 'DataClass'
                ? catalogueItem.modelId
                : null
          });
        }
      });
  }
}

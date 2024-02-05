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
import { CatalogueSearchProfileFilter } from '../catalogue-search.types';

@Component({
  selector: 'mdm-profile-filters',
  templateUrl: './profile-filters.component.html',
  styleUrls: ['./profile-filters.component.scss']
})
export class ProfileFiltersComponent implements OnInit {
  @Input() profileFilters: CatalogueSearchProfileFilter[] = [];
  @Output() updateProfileFilters = new EventEmitter<
    CatalogueSearchProfileFilter[]
  >();
  @Output() resetProfileFilters = new EventEmitter<void>();
  @Output() addProfileFilters = new EventEmitter<void>();
  constructor() {}

  ngOnInit(): void {}

  onAdd() {
    this.addProfileFilters.emit();
  }

  emitDeleteEvent(profileFilter: CatalogueSearchProfileFilter) {
    this.updateProfileFilters.emit(
      this.profileFilters.filter((filter) => {
        return filter.key !== profileFilter.key;
      })
    );
  }

  reset() {
    this.profileFilters = [];
    this.updateProfileFilters.emit(this.profileFilters);
  }
}

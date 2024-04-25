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
import { Injectable, Output, EventEmitter } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { FilterQueryParameters } from '@maurodatamapper/mdm-resources';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  @Output() reloadEvent = new EventEmitter<any>();

  constructor() {}

  applyFilter = (filters: any[]) => {
    const filter = {};
    if (filters) {
      filters.forEach((x: any) => {
        const name = x.nativeElement.name;
        const value = x.nativeElement.value;

        if (value !== '') {
          filter[name] = value;
        }
      });
      this.reloadEvent.emit(filter);
    }
  };

  constructOptions(
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: SortDirection,
    filters?: { [key: string]: any }
  ): FilterQueryParameters {
    const parsedFilters = Object.entries(filters ?? {}).reduce(
      (prev, [key, value]) => {
        return {
          ...prev,
          [key]: encodeURIComponent(value)
        };
      },
      {}
    );

    return {
      ...(pageSize && { max: pageSize }),
      ...(pageIndex && { offset: pageIndex }),
      ...(sortBy && { sort: sortBy }),
      ...(sortType && { order: sortType }),
      ...parsedFilters
    };
  }
}

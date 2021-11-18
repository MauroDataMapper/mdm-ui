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
import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  @Output() reloadEvent = new EventEmitter<any>();

  constructor() { }

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

  constructOptions(pageSize? : number, pageIndex? : number, sortBy? : string, sortType? : string, filters? : {}) {
    const options = {};

    if (pageSize) {
      options['max'] = pageSize;
    }
    if (pageIndex) {
      options['offset'] = pageIndex;
    }
    if (sortBy) {
      options['sort'] = sortBy;
    }
    if (sortType) {
      options['order'] = sortType;
    }

    if (filters) {
      Object.keys(filters).map(key => {
        options[key] = filters[key];
      });
    }

    return options;
  }
}

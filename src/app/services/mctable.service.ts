/*
Copyright 2020 University of Oxford

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
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, pipe, Subject } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';

export type SortDirection = 'asc' | 'desc' | '';

interface SearchResult {
  countries: [];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
}

function compare(v1, v2) {
  return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}

@Injectable({
  providedIn: 'root'
})
export class MctableService {
  private resultSubject = new Subject<any>();
  private loadingBehaviorSubject = new BehaviorSubject<boolean>(true);
  private searchSubject = new Subject<void>();
  result: any;
  private total = new BehaviorSubject<number>(0);

  private statePage: State = {
    page: 1,
    pageSize: 4,
    searchTerm: '',
    sortColumn: '',
    sortDirection: ''
  };

  constructor(private resourcesService: MdmResourcesService) {
    if (this.result !== null && this.result !== undefined) {
      this.total.next(this.result.count);
    }
    this.searchSubject.next();
  }

  get total$() {
    return this.total.asObservable();
  }

  get loading() {
    return this.loadingBehaviorSubject.asObservable();
  }

  get page() {
    return this.statePage.page;
  }

  set page(page: number) {
    this._set({ page });
  }

  get pageSize() {
    return this.statePage.pageSize;
  }

  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }

  get searchTerm() {
    return this.statePage.searchTerm;
  }

  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }

  set sortColumn(sortColumn: string) {
    this._set({ sortColumn });
  }

  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this.statePage, patch);
    this.searchSubject.next();
  }

  ResultSendMessage(message: any) {
    this.resultSubject.next(message);
    this.result = message;
  }

  ResultGetMessage(): Observable<any> {
    return this.resultSubject.asObservable();
  }

}

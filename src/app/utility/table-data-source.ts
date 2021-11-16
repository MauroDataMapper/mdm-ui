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
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { MdmIndexResponse, MdmResponse, PageParameters } from '@maurodatamapper/mdm-resources';
import { SortDirection } from '@angular/material/sort';
import { tap } from 'rxjs/operators';

export interface Sortable {
  sort?: string;
  order?: SortDirection; // MatSort accepts 3 different values ('' | 'asc' | 'desc')
}

export class MdmTableDataSource<T> extends DataSource<T> {
  readonly count = new BehaviorSubject<number>(0);
  private _dataStream = new BehaviorSubject<T[]>([]);
  private _fetchFunction = new BehaviorSubject<(options?: any) => Observable<MdmIndexResponse<T>>>(() => EMPTY);
  private _updateFunction = new BehaviorSubject<(options?: any) => Observable<MdmResponse<T>>>(() => EMPTY);
  private _deleteFunction = new BehaviorSubject<(options?: any) => Observable<any>>(() => EMPTY);
  private _pageable = new BehaviorSubject<PageParameters>({max: 10, offset: 0});
  private _sortable = new BehaviorSubject<Sortable>({});

  constructor(fetchFunction?: (options?: any) => Observable<MdmIndexResponse<T>>, updateFunction?: (options?: any) => Observable<MdmResponse<T>>, deleteFunction?: (options?: any) => Observable<any>) {
    super();

    if (fetchFunction) {
      this._fetchFunction.next(fetchFunction);
    }

    if (updateFunction) {
      this._updateFunction.next(updateFunction);
    }

    if (deleteFunction) {
      this._deleteFunction.next(deleteFunction);
    }
  }

  connect(_: CollectionViewer): Observable<T[] | readonly T[]> {
    return this._dataStream;
  }

  disconnect(_: CollectionViewer): void {
    this._dataStream.complete();
    this._fetchFunction.complete();
    this._updateFunction.complete();
    this._deleteFunction.complete();
    this._pageable.complete();
    this._sortable.complete();
  }

  get fetchFunction() {
    return this._fetchFunction.value;
  }

  set fetchFunction(fetchFunc: (options?: any) => Observable<MdmIndexResponse<T>>) {
    this._fetchFunction.next(fetchFunc);
  }

  get updateFunction() {
    return this._updateFunction.value;
  }

  set updateFunction(updateFunc: (item: T) => Observable<MdmResponse<T>>) {
    this._updateFunction.next(updateFunc);
  }

  get deleteFunction() {
    return this._deleteFunction.value;
  }

  set deleteFunction(deleteFunc: (item: T) => Observable<any>) {
    this._deleteFunction.next(deleteFunc);
  }

  get pageable() {
    return this._pageable.value;
  }

  set pageable(page: PageParameters) {
    this._pageable.next(page);
  }

  get sortable () {
    return this._sortable.value;
  }

  set sortable (sort: Sortable) {
    this._sortable.next(sort);
  }

  get fetchOptions() {
    const combined = {...this._pageable.value, ...this._sortable.value};
    // Remove null or empty properties (e.g. {sort: ''})
    return Object.keys(combined)
      .filter((k) => combined[k] !== undefined && combined[k] !== null && combined[k] !== '')
      .reduce((a, k) => ({ ...a, [k]: combined[k] }), {});
  }

  refresh() {
    this._dataStream.next(this._dataStream.value);
  }

  fetchData() {
    if (!this.fetchFunction) {
      throw new Error('Fetch function not provided');
    }

    this.fetchFunction(this.fetchOptions).subscribe(
      data => {
        this.count.next(data.body.count);
        this._dataStream.next(data.body.items);
      },
      error => console.error(error)
    );
  }

  updateItem(item: T) {
    if (!this.updateFunction) {
      throw new Error('Update function not provided');
    }

    return this.updateFunction(item).pipe(
      tap(() => this.fetchData())
    );
  }

  deleteItem(item: T) {
    if (!this.deleteFunction) {
      throw new Error('Delete function not provided');
    }

    return this.deleteFunction(item).pipe(
      tap(() => this.fetchData())
    );
  }
}
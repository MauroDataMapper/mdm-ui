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
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  CatalogueItem,
  CatalogueItemSearchResponse,
  CatalogueItemSearchResult
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { EMPTY } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  switchMap,
  tap
} from 'rxjs/operators';

const defaultMinSearchTermLength = 3;

export interface ElementSearchDialogData {
  root: CatalogueItem;
  searchTerm?: string;
  minSearchTermLength?: number;
}

export interface ElementSearchDialogResponse {
  selected?: CatalogueItemSearchResult;
}

@Component({
  selector: 'mdm-element-search-dialog',
  templateUrl: './element-search-dialog.component.html',
  styleUrls: ['./element-search-dialog.component.scss']
})
export class ElementSearchDialogComponent implements OnInit {
  searchTerm = new FormControl();
  minSearchTermLength = defaultMinSearchTermLength;
  loading = false;
  error: string;
  catalogueItems: CatalogueItemSearchResult[] = [];

  constructor(
    private resources: MdmResourcesService,
    @Inject(MAT_DIALOG_DATA)
    private data: ElementSearchDialogData,
    private dialogRef: MatDialogRef<
      ElementSearchDialogComponent,
      ElementSearchDialogResponse
    >
  ) {}

  ngOnInit(): void {
    this.minSearchTermLength =
      this.data.minSearchTermLength ?? defaultMinSearchTermLength;
    this.searchTerm.setValue(this.data.searchTerm);

    this.searchTerm.valueChanges
      .pipe(
        filter(
          (value) => value !== null && value.length >= this.minSearchTermLength
        ),
        distinctUntilChanged(),
        debounceTime(500),
        tap(() => {
          this.catalogueItems = [];
          this.error = undefined;
          this.loading = true;
        }),
        switchMap((value) => {
          return this.resources
            .getSearchableResource(this.data.root.domainType)
            .search(this.data.root.id, {
              searchTerm: value,
              max: 10,
              offset: 0,
              labelOnly: true
            })
            .pipe(
              catchError((error) => {
                this.error = error.message;
                return EMPTY;
              }),
              finalize(() => {
                this.loading = false;
              })
            );
        })
      )
      .subscribe((response: CatalogueItemSearchResponse) => {
        this.catalogueItems = response.body.items;
      });
  }

  displayWith(value: CatalogueItemSearchResult) {
    return value?.label;
  }

  onCatalogueItemSelected(event: MatAutocompleteSelectedEvent) {
    const selected = event.option.value as CatalogueItemSearchResult;
    this.dialogRef.close({ selected });
  }
}

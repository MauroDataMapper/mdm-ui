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

import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MdmResourcesService } from '@mdm/modules/resources';
import { CodeSet, TermDetail } from '@maurodatamapper/mdm-resources';
import { MdmTableDataSource } from '@mdm/utility/table-data-source';
import { merge } from 'rxjs';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';

@Component({
  selector: 'mdm-term-codeset-list',
  templateUrl: './term-codeset-list.component.html',
  styleUrls: ['./term-codeset-list.component.scss']
})
export class TermCodeSetListComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() term: TermDetail;
  @Input() pageSize = 10;
  @Input() canEdit = false;
  @Input() canDelete = false;
  @Output() totalCount = new EventEmitter<number>();
  @Output() selectedCodeSet = new EventEmitter<CodeSet>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  displayedColumns: string[] = ['label', 'author'];
  codesets: MdmTableDataSource<CodeSet> = new MdmTableDataSource();
  isLoadingResults = false;
  reloadEvent = new EventEmitter<string>();
  totalItemCount = 0;

  constructor(private resources: MdmResourcesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.term) {
      return;
    }

    if (changes.term) {
      // Update action functions when term changed
      this.codesets.fetchFunction = options => {
        return this.resources.terms.codesetsForTerm(this.term.model, this.term.id, options);
      };

      this.codesets.fetchData();
    }
  }

  ngOnInit() {
    // Keep track of item count
    this.codesets.count.subscribe(c => {
      this.totalItemCount = c;
      this.totalCount.emit(this.totalItemCount);
    });
  }

  ngAfterViewInit() {
    // Reset pageIndex on reload
    this.reloadEvent.subscribe(() => this.paginator.pageIndex = 0);

    // Reset pageIndex on re-order
    this.sort?.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // Update table data source on sorting, paging, or reload events
    merge(this.sort?.sortChange, this.paginator?.page, this.reloadEvent).subscribe(() => {
      this.refreshFetchOptions();
      this.codesets.fetchData();
    });

    // Initial paging and sorting configuration
    this.refreshFetchOptions();

    // First data fetch
    this.codesets.fetchData();
  }

  refreshFetchOptions() {
    this.codesets.pageable = {
      max: this.paginator?.pageSize || this.pageSize,
      offset: (this.paginator?.pageOffset) || 0
    };
    this.codesets.sortable = {
      sort: this.sort?.active,
      order: this.sort?.direction
    };
  }
}

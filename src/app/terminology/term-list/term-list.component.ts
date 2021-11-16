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
import { Term, TerminologyDetail } from '@maurodatamapper/mdm-resources';
import { MdmTableDataSource } from '@mdm/utility/table-data-source';
import { merge } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreateTermDialogComponent } from './create-term-dialog/create-term-dialog.component';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';

class CreateTermForm {
  terminology: TerminologyDetail;
  code: string;
  definition: string;
  description: string;

  constructor(terminology: TerminologyDetail) {
    this.terminology = terminology;
  }
}

@Component({
  selector: 'mdm-term-list',
  templateUrl: './term-list.component.html',
  styleUrls: ['./term-list.component.scss']
})
export class TermListComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() terminology: TerminologyDetail;
  @Input() pageSize = 10;
  @Input() canEdit = false;
  @Input() canDelete = false;
  @Output() totalCount = new EventEmitter<number>();
  @Output() selectedTerm = new EventEmitter<Term>();
  @Output() addedTerm = new EventEmitter<Term>();
  @Output() deletedTerm = new EventEmitter();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  displayedColumns: string[] = ['code', 'definition', 'actions'];
  terms: MdmTableDataSource<Term> = new MdmTableDataSource();
  isLoadingResults = false;
  reloadEvent = new EventEmitter<string>();
  totalItemCount = 0;

  constructor(private resources: MdmResourcesService, private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.terminology) {
      if (this.terms && this.terminology) {
        // Update action functions when terminology changed
        this.terms.fetchFunction = options => this.resources.terms.list(this.terminology.id, options);
        this.terms.deleteFunction = (item: Term) => this.resources.terms.remove(this.terminology.id, item.id);

        // Ignore first change as it will be handle by ngAfterViewInit() after MatSort and MatPaginator initialised
        if (!changes.terminology.isFirstChange) {
          this.terms.fetchData();
        }
      }
    }
  }

  ngOnInit() {
    // Keep track of item count
    this.terms.count.subscribe(c => {
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
      this.terms.fetchData();
    });

    // Initial paging and sorting configuration
    this.refreshFetchOptions();

    // First data fetch
    this.terms.fetchData();
  }

  refreshFetchOptions() {
    this.terms.pageable = {
      max: this.paginator?.pageSize || this.pageSize,
      offset: (this.paginator?.pageIndex * this.paginator?.pageSize) || 0
    };
    this.terms.sortable = {
      sort: this.sort?.active,
      order: this.sort?.direction
    };
  }

  openCreateTermDialog(): void {
    const dialogRef = this.dialog.open(CreateTermDialogComponent, {
      data: new CreateTermForm(this.terminology)
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.terms.fetchData();
        this.addedTerm.emit(data);
      }
    });
  }

  deleteTerm(term: Term) {
    if (this.canDelete) {
      this.terms.deleteItem(term).subscribe(() => this.deletedTerm.emit());
    }
  }
}

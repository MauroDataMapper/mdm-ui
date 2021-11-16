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
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { TerminologyDetail, TermRelationshipType, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge } from 'rxjs';
import { MdmTableDataSource } from '@mdm/utility/table-data-source';
import { CreateTermRelationshipTypeDialogComponent } from './create-term-relationship-type-dialog/create-term-relationship-type-dialog.component';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';

class CreateTermRelationshipTypeForm {
  id?: Uuid;
  label: string;
  displayLabel: string;
  parentalRelationship = false;
  childRelationship = false;

  constructor(readonly terminology: TerminologyDetail, relationshipType?: TermRelationshipType) {
    if (relationshipType) {
      this.id = relationshipType.id || null;
      this.label = relationshipType.label;
      this.displayLabel = relationshipType.displayLabel;
      this.parentalRelationship = relationshipType.parentalRelationship || false;
      this.childRelationship = relationshipType.childRelationship || false;
    }
  }
}

@Component({
  selector: 'mdm-term-relationship-type-list',
  templateUrl: './term-relationship-type-list.component.html',
  styleUrls: ['./term-relationship-type-list.component.scss']
})
export class TermRelationshipTypeListComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() terminology: TerminologyDetail;
  @Input() pageSize = 10;
  @Input() canEdit = false;
  @Input() canDelete = false;
  @Output() totalCount = new EventEmitter<number>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  displayedColumns: string[] = ['label', 'displayLabel', 'actions'];
  relationshipTypes: MdmTableDataSource<TermRelationshipType> = new MdmTableDataSource();
  isLoadingResults = false;
  reloadEvent = new EventEmitter<string>();
  totalItemCount = 0;

  constructor(private resources: MdmResourcesService, private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.terminology) {
      if (this.relationshipTypes && this.terminology) {
        // Update action functions when terminology changed
        this.relationshipTypes.fetchFunction = options => this.resources.termRelationshipTypes.list(this.terminology.id, options);
        this.relationshipTypes.deleteFunction = (item: TermRelationshipType) => this.resources.termRelationshipTypes.remove(this.terminology.id, item.id);

        // Ignore first change as it will be handle by ngAfterViewInit() after MatSort and MatPaginator initialised
        if (!changes.terminology.isFirstChange) {
          this.relationshipTypes.fetchData();
        }
      }
    }
  }

  ngOnInit() {
    // Keep track of item count
    this.relationshipTypes.count.subscribe(c => {
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
      this.relationshipTypes.fetchData();
    });

    // Initial paging and sorting configuration
    this.refreshFetchOptions();

    // First data fetch
    this.relationshipTypes.fetchData();
  }

  refreshFetchOptions() {
    this.relationshipTypes.pageable = {
      max: this.paginator?.pageSize || this.pageSize,
      offset: (this.paginator?.pageIndex * this.paginator?.pageSize) || 0
    };
    this.relationshipTypes.sortable = {
      sort: this.sort?.active,
      order: this.sort?.direction
    };
  }

  openCreateRelationshipTypeDialog(): void {
    const dialogRef = this.dialog.open(CreateTermRelationshipTypeDialogComponent, {
      data: new CreateTermRelationshipTypeForm(this.terminology)
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.relationshipTypes.fetchData();
      }
    });
  }

  editRelationshipType(termRelationshipType: TermRelationshipType) {
    if (this.canEdit) {
      this.resources.termRelationshipTypes.get(this.terminology.id, termRelationshipType.id).subscribe(trt => {
        const dialogRef = this.dialog.open(CreateTermRelationshipTypeDialogComponent, {
          data: new CreateTermRelationshipTypeForm(this.terminology, trt.body)
        });

        dialogRef.afterClosed().subscribe(data => {
          if (data) {
            this.relationshipTypes.fetchData();
          }
        });
      });
    }
  }

  deleteRelationshipType(term: TermRelationshipType) {
    if (this.canDelete) {
      this.relationshipTypes.deleteItem(term);
    }
  }
}
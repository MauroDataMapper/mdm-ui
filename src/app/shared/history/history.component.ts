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
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewChildren,
  ChangeDetectorRef,
  EventEmitter,
  Output
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SearchResult } from '@mdm/model/folderModel';
import { MatSort, SortDirection } from '@angular/material/sort';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { GridService } from '@mdm/services/grid.service';

@Component({
  selector: 'mdm-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;
  @Input() parent: any;
  @Input() parentType: string;
  @Input() parentId: string;
  @Input() domainType: string;
  @Input() pageSize: number;
  @Output() totalCount = new EventEmitter<string>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  public result: SearchResult;
  public dataSetResult: any[];
  displayedColumns: string[] = [
    'createdBy',
    'dateCreated',
    'title',
    'description'
  ];
  totalItemCount = 0;
  parentVal;
  parentTypeVal;
  parentIdVal;
  isLoadingResults = true;
  pageSizeOptions = [10, 20, 50];

  records: any[] = [];
  filter: any = '';
  applyFilter: any;

  constructor(
    public resourcesService: MdmResourcesService,
    private gridService: GridService,
    private changeRef: ChangeDetectorRef
  ) {}

  public getSortedData(
    pageSize?: number,
    pageIndex?: number,
    filters?: {},
    sortBy?: string,
    sortType?: SortDirection
  ) {
    this.fetch(pageSize, pageIndex, sortBy, sortType, filters);
  }

  ngOnInit() {
    this.parentTypeVal = this.parentType;
    this.parentIdVal = this.parentId ? this.parentId : this.parent?.id;
    this.parentVal = this.parent;
    this.applyFilter = this.gridService.applyFilter(this.filters);
  }

  ngAfterViewInit() {
    this.sort?.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.gridService.reloadEvent.subscribe(
      () => (this.paginator.pageIndex = 0)
    );
    merge(
      this.sort?.sortChange,
      this.paginator.page,
      this.gridService.reloadEvent
    )
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.fetch(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort?.active,
            this.sort?.direction
          );
        }),
        map((data: any) => {
          this.totalItemCount = data.body.count;
          this.totalCount.emit(String(data.body.count));
          this.isLoadingResults = false;
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return [];
        })
      )
      .subscribe((data) => {
        this.records = data;
      });
    this.changeRef.detectChanges();
  }

  public fetch(
    pageSize: number,
    pageOffset: number,
    sortBy: string,
    sortType: SortDirection,
    filters?: {}
  ): any {
    const options = this.gridService.constructOptions(
      pageSize,
      pageOffset,
      sortBy,
      sortType,
      filters
    );

    if (this.parentId) {
      return this.resourcesService.edit.status(
        this.domainType,
        this.parentId,
        options
      );
    } else {
      return this.resourcesService.edit.status(
        this.domainType,
        this.parent?.id,
        options
      );
    }
  }
}

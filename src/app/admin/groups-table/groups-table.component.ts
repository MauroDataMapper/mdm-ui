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
import { Component, OnInit, ElementRef, ViewChild, ViewChildren, EventEmitter, AfterViewInit } from '@angular/core';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { Title } from '@angular/platform-browser';
import { GridService } from '@mdm/services/grid.service';

@Component({
  selector: 'mdm-groups-table',
  templateUrl: './groups-table.component.html',
  styleUrls: ['./groups-table.component.sass']
})
export class GroupsTableComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  filterEvent = new EventEmitter<any>();
  filter: {};
  isLoadingResults: boolean;
  totalItemCount = 0;
  hideFilters = true;

  dataSource = new MatTableDataSource<any>();

  displayedColumns = ['name', 'description', 'icons'];
  records: any[] = [];

  constructor(
    private messageHandlerService: MessageHandlerService,
    private resourcesService: MdmResourcesService,
    private stateHandlerService: StateHandlerService,
    private title: Title,
    private gridService: GridService
  ) {
    this.dataSource = new MatTableDataSource(this.records);
  }

  ngOnInit() {
    this.groupsFetch();
    this.title.setTitle('Manage groups');
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    this.dataSource.sort = this.sort;
    merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      return this.groupsFetch(
        this.paginator.pageSize,
        this.paginator.pageOffset,
        this.sort.active,
        this.sort.direction,
        this.filter
      );
    }),
      map((data: any) => {
        this.totalItemCount = data.body.count;
        this.isLoadingResults = false;
        return data.body.items;
      }),
      catchError(() => {
        this.isLoadingResults = false;
        return [];
      })
    ).subscribe(data => {
      this.records = data;
      this.dataSource.data = this.records;
    });
  }

  groupsFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?): Observable<any> {
    const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, filters);

    return this.resourcesService.userGroups.list(options);
  }

  applyFilter = () => {
    const filter = {};
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;
      if (value !== '') {
        filter[name] = value;
      }
    });
    this.filter = filter;
    this.filterEvent.emit(filter);
  };

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  editUser(row) {
    if (row) {
      this.stateHandlerService.Go('admin.group', { id: row.id }, null);
    }
  }

  deleteUser(row) {
    this.resourcesService.userGroups.remove(row.id).subscribe(() => {
      this.messageHandlerService.showSuccess('Group deleted successfully.');
      this.groupsFetch(this.paginator.pageSize, this.paginator.pageIndex, this.sort.active, this.sort.direction, this.filter).subscribe(data => {
        this.records = data.body.items;
        this.totalItemCount = data.body.count;
        this.dataSource.data = this.records;
      }, err => {
        this.messageHandlerService.showError('There was a problem loading the groups.', err);
      });
    }, err => {
      this.messageHandlerService.showError('There was a problem deleting the group.', err);
    });
  }

  add = () => {
    this.stateHandlerService.Go('admin.group', { id: null }, null);
  };
}

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
import { Component, OnInit, ViewChildren, ViewChild, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge, Observable, from } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { Title } from '@angular/platform-browser';
import { GridService } from '@mdm/services/grid.service';

@Component({
  selector: 'mdm-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.sass']
})
export class UsersTableComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  filterEvent = new EventEmitter<any>();
  filter: {};
  hideFilters = true;
  isLoadingResults: boolean;
  totalItemCount = 0;
  deleteInProgress: boolean;
  processing: boolean;
  failCount: number;
  total: number;
  showDisable = false;
  showEdit = false;

  displayedColumns: string[] = ['firstName','lastName', 'emailAddress', 'organisation', 'groups', 'status', 'icons'];
  records: any[] = [];

  constructor(
    private messageHandler: MessageHandlerService,
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService,
    private broadcast: BroadcastService,
    private title: Title,
    private gridService: GridService
  ) { }

  ngOnInit() {
    this.title.setTitle('Manage users');
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      return this.usersFetch(this.paginator.pageSize, this.paginator.pageOffset, this.sort.active, this.sort.direction, this.filter);
    }), map((data: any) => {
      this.totalItemCount = data.body.count;
      this.isLoadingResults = false;
      return data.body.items;
    }), catchError(() => {
      this.isLoadingResults = false;
      return [];
    })).subscribe((data) => {
      // tslint:disable-next-line: forin
      for (const val in data) {
        if (data[val].availableActions.includes('update')) {
          data[val].showEdit = true;
        }
        if (data[val].availableActions.includes('disable')) {
          data[val].showDisable = true;
        }
      }
      this.records = data;
    });
  }

  usersFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?): Observable<any> {
    const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, filters);
    return this.resources.catalogueUser.list(options);
  }

  editUser(row) {
    if (row) {
      this.stateHandler.Go('admin.user', { id: row.id }, null);
    }
  }

  editGroup(row) {
    if (row) {
      this.stateHandler.Go('admin.group', { id: row.id }, null);
    }
  }

  add = () => {
    this.stateHandler.Go('admin.user', { id: null }, null);
  };

  resetPassword(row) {
    from(this.resources.catalogueUser.adminPasswordReset(row.id, null)).subscribe(() => {
      this.messageHandler.showSuccess('Reset password email sent successfully!');
    }, error => {
      this.messageHandler.showError('There was a problem sending reset password email.', error);
    });
  }

  toggleDeactivate(row) {
    row.disabled = !row.disabled;
    from(this.resources.catalogueUser.update(row.id, row)).subscribe(() => {
      this.messageHandler.showSuccess('User details updated successfully.');
      this.broadcast.dispatch('pendingUserUpdated');
    }, error => {
      this.messageHandler.showError('There was a problem updating the user.', error);
    });
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
}

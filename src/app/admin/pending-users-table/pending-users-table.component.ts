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
import { Component, OnInit, ElementRef, ViewChildren, ViewChild, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { GridService } from '@mdm/services/grid.service';

@Component({
  selector: 'mdm-pending-users-table',
  templateUrl: './pending-users-table.component.html',
  styleUrls: ['./pending-users-table.component.sass'],
})
export class PendingUsersTableComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  hideFilters = true;
  isLoadingResults: boolean;
  totalItemCount = 0;
  filterEvent = new EventEmitter<any>();
  filter: {};

  records: any[] = [];
  displayedColumns = ['fullName', 'emailAddress', 'organisation', 'actions'];

  constructor(
    private messageHandler: MessageHandlerService,
    private resourcesService: MdmResourcesService,
    private broadcast: BroadcastService,
    private dialog: MatDialog,
    private title: Title,
    private gridService: GridService,
    private changeRef: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.title.setTitle('Pending users');
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;

      return this.pendingUsersFetch(this.paginator.pageSize, this.paginator.pageOffset, this.sort.active, this.sort.direction, this.filter);
    }),
      map((data: any) => {
        this.totalItemCount = data.body.count;
        this.isLoadingResults = false;
        return data.body.items;
      }),
      catchError(() => {
        this.isLoadingResults = false;
        return [];
      })).subscribe(data => {
        this.records = data;
      });
    this.changeRef.detectChanges();
  }
  pendingUsersFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?) {
    const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, filters);
    options['disabled'] = false;

    return this.resourcesService.catalogueUser.pending(options);
  }

  refreshDataSource() {
    //  this.dataSource.data = this.records;
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

  askForSoftApproval = (row: { firstName: string; lastName: string }) => {
    const message = `Are you sure you want to approve <em><strong>${row.firstName} ${row.lastName}</strong></em>?`;

    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Approve user',
          okBtnTitle: 'Approve',
          btnType: 'accent',
          message
        }
      })
      .subscribe(() => this.approveUser(row));
  };

  askForSoftRejection = (row: { firstName: string; lastName: string }) => {
    const message = `Are you sure you want to reject <em><strong>${row.firstName} ${row.lastName}</strong></em>?
                      <br> <strong>Note:</strong> Rejected users will not be removed;
                      <br> Instead they will be <span class='warning'>disabled</span>`;

    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Reject user',
          okBtnTitle: 'Reject',
          btnType: 'warn',
          message
        }
      })
      .subscribe(() => this.rejectUser(row));
  };

  approveUser = (row : any) => {
    this.resourcesService.catalogueUser.approve(row.id, null).subscribe(() => {
      this.messageHandler.showSuccess('User approved successfully');
      this.broadcast.dispatch('pendingUserUpdated');
      this.pendingUsersFetch().subscribe(data => {
        this.records = data.body.items;
        this.totalItemCount = this.records.length;
        this.refreshDataSource();
      }, err => {
        this.messageHandler.showError('There was a problem loading pending users.', err);
      });
    }, (error) => {
      this.messageHandler.showError('There was a problem approving this user.', error);
    });
  };

  rejectUser = (row) => {
    this.resourcesService.catalogueUser.reject(row.id, null).subscribe(() => {
      this.messageHandler.showSuccess('User rejected successfully');
      this.broadcast.dispatch('pendingUserUpdated');
      this.pendingUsersFetch().subscribe(data => {
        this.records = data.body.items;
        this.totalItemCount = this.records.length;
        this.refreshDataSource();
      }, err => {
        this.messageHandler.showError('There was a problem loading pending users.', err);
      });
    }, (error) => {
      this.messageHandler.showError('There was a problem approving this user.', error);
    });
  };
}

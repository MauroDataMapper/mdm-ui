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
import {
  Component,
  OnInit,
  Input,
  ViewChildren,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { ROLES } from '@mdm/constants/roles';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { McSelectPagination } from '@mdm/utility/mc-select/mc-select.component';
import { merge } from 'rxjs';
import { GridService } from '@mdm/services/grid.service';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import {MdmPaginatorComponent} from '@mdm/shared/mdm-paginator/mdm-paginator';

@Component({
  selector: 'mdm-group-member-table',
  templateUrl: './group-member-table.component.html',
  styleUrls: ['./group-member-table.component.scss']
})
export class GroupMemberTableComponent implements OnInit, AfterViewInit {
  @Input() parent: any;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  constructor(
    private roles: ROLES,
    private changeRef: ChangeDetectorRef,
    private gridService: GridService,
    private messageHandler: MessageHandlerService,
    private resources: MdmResourcesService
  ) {}

  mcDisplayRecords: any;
  ROLES = this.roles.map;
  errors: any;
  displayedColumns = ['disabled', 'emailAddress', 'firstName', 'lastName', 'organisation', 'userRole', 'empty'];
  pagination: McSelectPagination;
  totalItemCount = 0;
  isLoadingResults: boolean;

  records: any[] = [];
  filter: any = '';
  applyFilter = this.gridService.applyFilter(this.filters);

  ngOnInit() {}

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.gridService.reloadEvent.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page, this.gridService.reloadEvent).pipe(startWith({}), switchMap(() => {
          this.isLoadingResults = true;
          return this.groupMembersFetch(
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
      )
      .subscribe(data => {
        this.records = data;
      });
    this.changeRef.detectChanges();
  }

  groupMembersFetch = (pageSize, pageIndex, sortBy, sortType, filters) => {
    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };
    return this.resources.userGroup.get(this.parent.id, 'catalogueUsers', options);
  };

  validate = () => {
    let isValid = true;
    this.errors = [];
    if (this.parent.label.trim().length === 0) {
      this.errors.label = 'Name can\'t be empty!';
      isValid = false;
    }
    if (isValid) {
      delete this.errors;
    }
    return isValid;
  };

  add = () => {
    const newRecord = {
      id: '',
      firstName: '',
      lastName: '',
      organisation: '',
      userRole: '',
      disabled: false,
      isNew: true
    };
    this.mcDisplayRecords = [].concat([newRecord]).concat(this.mcDisplayRecords);
  };

  fetchUser = (text, offset, limit) => {
    this.pagination.limit = this.pagination.limit ? this.pagination.limit : 10;
    this.pagination.offset = this.pagination.offset ? this.pagination.offset : 0;

    const options = {
      pageSize: limit,
      pageIndex: offset,
      filters: 'search=' + text,
      sortBy: 'emailAddress',
      sortType: 'asc'
    };

    return this.resources.catalogueUser.search(options);
    // return this.resources.catalogueUser.get(null, 'search', options);
  };

  onUserSelect = (select, record) => {
    record.id = select.id;
    record.emailAddress = select.emailAddress;
    record.firstName = select.firstName;
    record.lastName = select.lastName;
    record.organisation = select.organisation;
    record.userRole = select.userRole;
    record.disabled = select.disabled;
  };

  cancelEdit = (record, index) => {
    if (record.isNew) {
      this.mcDisplayRecords.splice(index, 1);
    }
  };

  confirmAddMember = (record, $index) => {
    if (!record.id || !record.emailAddress) {
      return;
    }
    this.resources.userGroup.put(this.parent.id, 'catalogueUsers/' + record.id, null).subscribe(() => {
          this.mcDisplayRecords[$index] = record;
          this.messageHandler.showSuccess('User added successfully.');
        },
        error => {
          this.messageHandler.showError('There was a problem adding the user to the group.', error);
        }
      );
  };

  removeMember = record => {
    record.deletePending = true;
  };

  confirmRemove = (record, $index) => {
    this.resources.userGroup.delete(this.parent.id, 'catalogueUsers/' + record.id).subscribe(() => {
          delete record.deletePending;
          this.mcDisplayRecords.splice($index, 1);
          this.messageHandler.showSuccess('User removed successfully.');
        },
        error => {
          this.messageHandler.showError('There was a problem removing the user from the group.', error);
        }
      );
  };

  cancelRemove = record => {
    delete record.deletePending;
  }
}

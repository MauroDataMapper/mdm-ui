/*
Copyright 2020-2025 University of Oxford and NHS England

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
  Input,
  ViewChildren,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
  EventEmitter,
  Output,
} from '@angular/core';
import { ROLES } from '@mdm/constants/roles';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { McSelectPagination } from '@mdm/utility/mc-select/mc-select.component';
import { merge } from 'rxjs';
import { GridService } from '@mdm/services/grid.service';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MdmPaginatorComponent as MdmPaginatorComponent_1 } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCard } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { UIRouterModule } from '@uirouter/angular';
import { NgIf } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'mdm-group-member-table',
    templateUrl: './group-member-table.component.html',
    styleUrls: ['./group-member-table.component.scss'],
    standalone: true,
    imports: [FlexModule, MatButton, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, NgIf, UIRouterModule, McSelectComponent, MatIconButton, MatTooltip, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatCard, MatProgressSpinner, MdmPaginatorComponent_1]
})
export class GroupMemberTableComponent implements AfterViewInit {
  @Input() parent: any;
  @Output() childEvent = new EventEmitter<any>();
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  ROLES = this.roles.map;
  errors: any;
  displayedColumns = ['fullName', 'emailAddress', 'disabled', 'empty'];
  pagination: McSelectPagination;
  totalItemCount = 0;
  isLoadingResults: boolean;

  records: any[] = [];
  filter: Record<string, any> = {};
  // applyFilter : any;

  constructor(
    private roles: ROLES,
    private changeRef: ChangeDetectorRef,
    private gridService: GridService,
    private messageHandler: MessageHandlerService,
    private resources: MdmResourcesService,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit() {
    // this.applyFilter =
    this.gridService.applyFilter(this.filters);
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.gridService.reloadEvent.subscribe(
      () => (this.paginator.pageIndex = 0)
    );
    merge(
      this.sort.sortChange,
      this.paginator.page,
      this.gridService.reloadEvent
    )
      .pipe(
        startWith({}),
        switchMap(() => {
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
      .subscribe((data) => {
        this.records = data;
      });
    this.changeRef.detectChanges();
  }

  groupMembersFetch = (
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: SortDirection,
    filters?: Record<string, any>
  ) => {
    const options = this.gridService.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    );
    return this.resources.catalogueUser.listInUserGroup(
      this.parent.id as string,
      options
    );
  };

  validate = () => {
    let isValid = true;
    this.errors = [];
    if (this.parent.name.trim().length === 0) {
      this.errors.name = 'Name can\'t be empty!';
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
    this.records = [].concat([newRecord]).concat(this.records);
  };

  fetchUser = (text: any, offset: number, limit: number) => {
    const options = this.gridService.constructOptions(
      limit,
      offset,
      'emailAddress',
      'asc',
      { searchTerm: text }
    );
    this.pagination = {
      limit: options['limit'],
      offset: options['offset']
    };
    return this.resources.catalogueUser.search(options);
  };

  onUserSelect = (select: any, record: any) => {
    record.id = select.id;
    record.emailAddress = select.emailAddress;
    record.firstName = select.firstName;
    record.lastName = select.lastName;
    record.organisation = select.organisation;
    record.userRole = select.userRole;
    record.disabled = select.disabled;
  };

  cancelEdit = (record: any, index: number) => {
    if (record.isNew) {
      this.records.splice(index, 1);
      this.table.renderRows();
    }
  };

  confirmAddMember = (record: any, $index: string | number) => {
    if (!record.id || !record.emailAddress) {
      return;
    }
    this.resources.userGroups
      .updateUserInUserGroup(this.parent.id as string, record.id as string, record)
      .subscribe(
        () => {
          this.records[$index] = record;
          this.messageHandler.showSuccess('User added successfully.');
          this.groupMembersFetch().subscribe((data:any) => {
            this.records.push(data.body.items[data.body.count - 1]);
            this.totalItemCount = data.body.count;
            this.records = data.body.items;
            this.table.renderRows();
            this.childEvent.emit(data.body.items);
          });
        },
        (error: any) => {
          this.messageHandler.showError(
            'There was a problem adding the user to the group.',
            error
          );
        }
      );
  };

  removeMember = (record: any) => {
    record.deletePending = true;
  };

  askForDelete = (record: { firstName: string; lastName: string }) => {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Are you sure?',
          okBtnTitle: 'Yes, remove',
          btnType: 'warn',
          message: `<p class="marginless"> <strong>Note:</strong> You are removing <strong>${record.firstName} ${record.lastName}</strong> from this group`
        }
      })
      .subscribe(() => this.confirmRemove(record));
  };

  confirmRemove = (record: any) => {
    this.resources.userGroups
      .removeUserFromUserGroup(this.parent.id as string, record.id as string)
      .subscribe(
        () => {
          this.messageHandler.showSuccess('User removed successfully.');
          this.groupMembersFetch().subscribe((data:any) => {
            this.totalItemCount = data.body.count;
            this.records = data.body.items;
            this.table.renderRows();
          });
        },
        (error: any) => {
          this.messageHandler.showError(
            'There was a problem removing the user from the group.',
            error
          );
        }
      );
  };
}

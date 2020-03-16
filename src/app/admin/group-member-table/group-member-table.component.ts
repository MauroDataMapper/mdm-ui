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
import { ROLES } from '../../constants/roles';
import { ResourcesService } from '../../services/resources.service';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { McSelectPagination } from '../../utility/mc-select/mc-select.component';
import { merge } from 'rxjs';
import { GridService } from '../../services/grid.service';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'mdm-group-member-table',
  templateUrl: './group-member-table.component.html',
  styleUrls: ['./group-member-table.component.scss']
})
export class GroupMemberTableComponent implements OnInit, AfterViewInit {
  @Input() parent: any;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(
    private roles: ROLES,
    private changeRef: ChangeDetectorRef,
    private gridService: GridService,
    private messageHandler: MessageHandlerService,
    private resources: ResourcesService
  ) {}

  mcDisplayRecords: any;
  ROLES = this.roles.map;
  errors: any;
  displayedColumns = [
    'disabled',
    'emailAddress',
    'firstName',
    'lastName',
    'organisation',
    'userRole',
    'empty'
  ];
  pagination: McSelectPagination;
  totalItemCount: number;
  isLoadingResults: boolean;

  records: any[] = [];
  filter: any = '';
  applyFilter = this.gridService.applyFilter(this.filters);

  ngOnInit() {}

  ngAfterViewInit() {
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
            this.paginator.pageIndex,
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
    return this.resources.userGroup.get(
      this.parent.id,
      'catalogueUsers',
      options
    );
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
    this.mcDisplayRecords = []
      .concat([newRecord])
      .concat(this.mcDisplayRecords);
  };

  fetchUser = (text, offset, limit) => {
    this.pagination.limit = this.pagination.limit ? this.pagination.limit : 10;
    this.pagination.offset = this.pagination.offset
      ? this.pagination.offset
      : 0;

    const options = {
      pageSize: limit,
      pageIndex: offset,
      filters: 'search=' + text,
      sortBy: 'emailAddress',
      sortType: 'asc'
    };
    return this.resources.catalogueUser.get(null, 'search', options);
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
    this.resources.userGroup
      .put(this.parent.id, 'catalogueUsers/' + record.id, null)
      .subscribe(
        () => {
          this.mcDisplayRecords[$index] = record;
          this.messageHandler.showSuccess('User added successfully.');
        },
        error => {
          this.messageHandler.showError(
            'There was a problem adding the user to the group.',
            error
          );
        }
      );
  };

  removeMember = record => {
    record.deletePending = true;
  };

  confirmRemove = (record, $index) => {
    this.resources.userGroup
      .delete(this.parent.id, 'catalogueUsers/' + record.id)
      .subscribe(
        () => {
          delete record.deletePending;
          this.mcDisplayRecords.splice($index, 1);
          this.messageHandler.showSuccess('User removed successfully.');
        },
        error => {
          this.messageHandler.showError(
            'There was a problem removing the user from the group.',
            error
          );
        }
      );
  };

  cancelRemove = record => {
    delete record.deletePending;
  }
}

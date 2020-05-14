import { Component, OnInit, ElementRef, ViewChildren, ViewChild, EventEmitter, AfterViewInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { ResourcesService } from '@mdm/services/resources.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-pending-users-table',
  templateUrl: './pending-users-table.component.html',
  styleUrls: ['./pending-users-table.component.sass'],
})
export class PendingUsersTableComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  filterEvent = new EventEmitter<string>();
  hideFilters = true;
  isLoadingResults: boolean;
  totalItemCount = 0;
  filter: string;

  records: any[] = [];
  displayedColumns = ['firstName', 'lastName', 'emailAddress', 'organisation', 'actions'];

  dataSource = new MatTableDataSource<any>();

  constructor(
    private messageHandler: MessageHandlerService,
    private resourcesService: ResourcesService,
    private broadcastSvc: BroadcastService,
    private dialog: MatDialog,
    private title: Title
  ) {
    this.dataSource = new MatTableDataSource(this.records);
  }

  ngOnInit() {
    this.pendingUsersFetch();
    this.broadcastSvc.subscribe('pendingUserUpdated', () => {
      this.pendingUsersFetch();
    });
    this.title.setTitle('Pending users');
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'emailAddress') {
        return item.emailAddress;
      }

      if (property === 'firstName') {
        return item.firstName;
      }

      if (property === 'lastName') {
        return item.lastName;
      }

      if (property === 'organisation') {
        return item.organisation;
      }
    };
  }

  pendingUsersFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?) {
    const options = {
      pageSize,
      pageIndex,
      filters: 'disabled=false',
      sortBy,
      sortType
    };

    this.resourcesService.catalogueUser.get(null, 'pending', options).subscribe(resp => {
        this.records = resp.body.items;
        this.totalItemCount = this.records.length;
        this.refreshDataSource();
      }, err => {
        this.messageHandler.showError('There was a problem loading pending users.', err);
      });
  }

  refreshDataSource() {
    this.dataSource.data = this.records;
  }

  applyFilter = () => {
    let filter: any = '';
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;

      if (value !== '') {
        filter += name + '=' + value;
      }
    });
    this.filter = filter;
    this.filterEvent.emit(filter);
  };

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  askForSoftApproval = (row) => {
    const promise = new Promise((resolve, reject) => {
      const message = `Are you sure you want to approve <em><strong>${row.firstName} ${row.lastName}</strong></em>?`;
      const dialog = this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: 'Approve user',
          okBtnTitle: 'Approve',
          btnType: 'accent',
          message
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result?.status !== 'ok') {
          return promise;
        }
        this.approveUser(row);
      });
    });
    return promise;
  }
  askForSoftRejection = (row) => {
    const promise = new Promise((resolve, reject) => {
      const message = `Are you sure you want to reject <em><strong>${row.firstName} ${row.lastName}</strong></em>?
                      <br> <strong>Note:</strong> Rejected users will not be removed;
                      <br> Instead they will be <span class='warning'>disabled</span>`;
      const dialog = this.dialog.open(ConfirmationModalComponent, {
        data: {
          title: 'Reject user',
          okBtnTitle: 'Reject',
          btnType: 'warn',
          message
        }
      });

      dialog.afterClosed().subscribe(result => {
        console.log(result);
        if (result?.status !== 'ok') {
          return promise;
        }
        this.rejectUser(row);
      });
    });
    return promise;
  }

  approveUser = (row) => {
    this.resourcesService.catalogueUser.put(row.id, 'approveRegistration', {}).subscribe(() => {
        this.messageHandler.showSuccess('User approved successfully');
        this.broadcastSvc.broadcast('pendingUserUpdated');
      }, (error) => {
        this.messageHandler.showError('There was a problem approving this user.', error);
      });
  };

  rejectUser = (row) => {
    this.resourcesService.catalogueUser.put(row.id, 'rejectRegistration', {}).subscribe(() => {
        this.messageHandler.showSuccess('User rejected successfully');
        this.broadcastSvc.broadcast('pendingUserUpdated');
      }, (error) => {
        this.messageHandler.showError('There was a problem approving this user.', error);
    });
  };
}

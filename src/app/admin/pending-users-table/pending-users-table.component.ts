import {
  Component,
  OnInit,
  ElementRef,
  ViewChildren,
  ViewChild,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { ResourcesService } from '@mdm/services/resources.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BroadcastService } from '@mdm/services/broadcast.service';

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
    private broadcastSvc: BroadcastService
  ) {
    this.dataSource = new MatTableDataSource(this.records);
  }

  ngOnInit() {
    this.pendingUsersFetch();
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
      },
      err => {
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

  approveUser = ($index, row) => {
    this.resourcesService.catalogueUser.put(row.id, 'approveRegistration', {}).subscribe(() => {
          this.messageHandler.showSuccess('User approved successfully');
          this.refreshDataSource();
          this.broadcastSvc.broadcast('$pendingUserUpdated');
        }, (error) => {
          this.messageHandler.showError('There was a problem approving this user.', error);
        });
  };

  rejectUser = ($index, row) => {
    this.resourcesService.catalogueUser.put(row.id, 'rejectRegistration', {}).subscribe(() => {
          this.messageHandler.showSuccess('User rejected successfully');
          this.records.splice($index, 1);
          this.broadcastSvc.broadcast('$pendingUserUpdated');
        },
        (error) => {
          this.messageHandler.showError('There was a problem approving this user.', error);
        });
  };
}

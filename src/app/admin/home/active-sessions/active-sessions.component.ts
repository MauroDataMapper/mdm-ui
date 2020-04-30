import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  ViewChild,
} from '@angular/core';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { ResourcesService } from '@mdm/services/resources.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mdm-active-sessions',
  templateUrl: './active-sessions.component.html',
  styleUrls: ['./active-sessions.component.sass']
})
export class ActiveSessionsComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  displayedColumns: string[];
  records: any[] = [];
  totalItemCount = 0;
  hideFilters = true;
  dataSource = new MatTableDataSource<any>();

  constructor(private messageHandler: MessageHandlerService, private resourcesService: ResourcesService) {
    this.displayedColumns = [ 'userEmailAddress', 'userName', 'userOrganisation', 'start', 'lastAccess'];
  }

  ngOnInit() {
    if (this.sort) {
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    }
    this.activeSessionsFetch();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  activeSessionsFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?) {
    const options = {
      pageSize,
      pageIndex,
      filters,
      sortBy: 'userEmailAddress',
      sortType: 'asc'
    };

    this.resourcesService.admin.get('activeSessions', options).subscribe(resp => {
        for (const [key, value] of Object.entries(resp.body)) {
          resp.body[key].start = new Date(resp.body[key].sessionOpened);
          resp.body[key].last = new Date(resp.body[key].lastAccess);

          this.records.push(resp.body[key]);
        }
        this.totalItemCount = this.records.length;
        this.dataSource.data = this.records;
      },
      err => {
        this.messageHandler.showError('There was a problem loading the active sessions.', err);
      });
  }

  isToday(date) {
    const today = new Date();

    if (today.getUTCFullYear() === date.getUTCFullYear() && today.getUTCMonth() === date.getUTCMonth() && today.getUTCDate() === date.getUTCDate()) {
      return true;
    }

    return false;
  }

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  applyFilter = () => {
    // TODO
  };

  editUser = (var1?) => {
    // TODO
  }
}

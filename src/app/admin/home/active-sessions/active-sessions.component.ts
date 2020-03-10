import {
  Component,
  OnInit,
  Query,
  ElementRef,
  ViewChildren,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { MessageHandlerService } from '../../../services/utility/message-handler.service';
import { ResourcesService } from '../../../services/resources.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-active-sessions',
  templateUrl: './active-sessions.component.html',
  styleUrls: ['./active-sessions.component.sass']
})
export class ActiveSessionsComponent implements OnInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  displayedColumns: string[];
  records: any[] = [];
  totalItemCount: number;
  hideFilters = true;
  dataSource = new MatTableDataSource<any>();

  constructor(
    private messageHandler: MessageHandlerService,
    private resourcesService: ResourcesService
  ) {
    this.displayedColumns = [
      'userEmailAddress',
      'userName',
      'userOrganisation',
      'start',
      'lastAccess'
    ];
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

    this.resourcesService.admin
      .get('activeSessions', options)
      .subscribe(resp => {
        for (const [key, value] of Object.entries(resp.body)) {
          resp.body[key].start = new Date(resp.body[key].sessionOpened);
          resp.body[key].last = new Date(resp.body[key].lastAccess);

          this.records.push(resp.body[key]);
        }

        // this.records.push({
        // 	'userEmailAddress': 'aa@gmail.com',
        // 	'userName': 'd',
        // 	'userOrganisation': 'dd',
        // 	'start': new Date(resp.body['8DEEA326AC4210ABD5882C45C8A4671D'].sessionOpened),
        // 	'last': new Date(resp.body['8DEEA326AC4210ABD5882C45C8A4671D'].sessionOpened)
        // });

        this.totalItemCount = this.records.length;
        this.dataSource.data = this.records;
      }),
      err => {
        this.messageHandler.showError('There was a problem loading the active sessions.', err);
      }
  }

  isToday(date) {
    const today = new Date();

    if (
      today.getUTCFullYear() === date.getUTCFullYear() &&
      today.getUTCMonth() === date.getUTCMonth() &&
      today.getUTCDate() === date.getUTCDate()
    ) {
      return true;
    }

    return false;
  }

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  }

  applyFilter = () => {
    // TODO
  }

  editUser = (var1?) => {
    // TODO
  }
}

import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  EventEmitter,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { ResourcesService } from '../../services/resources.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mdm-app-emails',
  templateUrl: './emails.component.html',
  styleUrls: ['./emails.component.sass']
})
export class EmailsComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  filterEvent = new EventEmitter<string>();
  hideFilters = true;
  isLoadingResults: boolean;
  totalItemCount = 0;
  filter: string;

  records: any[] = [];
  displayedColumns = [
    'sentToEmailAddress',
    'dateTimeSent',
    'subject',
    'successfullySent'
  ];

  dataSource = new MatTableDataSource<any>();

  constructor(
    private messageHandler: MessageHandlerService,
    private resourcesService: ResourcesService
  ) {
    this.dataSource = new MatTableDataSource(this.records);
  }

  ngOnInit() {
    this.mailsFetch();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'sentToEmailAddress') {
        return item.sentToEmailAddress;
      }

      if (property === 'dateTimeSent') {
        return item.dateTimeSent;
      }

      if (property === 'subject') {
        return item.subject;
      }

      if (property === 'successfullySent') {
        return item.successfullySent;
      }
    };
  }

  mailsFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?) {
    const options = {
      pageSize,
      pageIndex,
      filters,
      sortBy: 'sentToEmailAddress',
      sortType: 'asc'
    };

    this.resourcesService.admin.get('emails', options).subscribe(
      resp => {
        this.records = resp.body;
        this.records.forEach(row => {
          row.dateTimeSentString =
            row.dateTimeSent.year +
            '/' +
            row.dateTimeSent.monthValue +
            '/' +
            row.dateTimeSent.dayOfMonth +
            ' ' +
            row.dateTimeSent.hour +
            ':' +
            row.dateTimeSent.minute +
            ':' +
            row.dateTimeSent.second;
        });
        this.totalItemCount = this.records.length;
        this.refreshDataSource();
      },
      err => {
        this.messageHandler.showError(
          'There was a problem loading user emails.',
          err
        );
      }
    );
  }

  applyFilter = () => {
    let filter: any = '';
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;

      if (value !== '') {
        filter += name + '=' + value + '&';
      }
    });
    this.filter = filter;
    this.filterEvent.emit(filter);
  };

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  toggleMessage(record) {
    record.showFailure = !record.showFailure;
  }

  refreshDataSource() {
    this.dataSource.data = this.records;
  }
}

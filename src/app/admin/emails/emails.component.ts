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
  ViewChild,
  ViewChildren,
  EventEmitter,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import {merge, Observable} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {MdmPaginatorComponent} from '@mdm/shared/mdm-paginator/mdm-paginator';
import { Title } from '@angular/platform-browser';



@Component({
  selector: 'mdm-app-emails',
  templateUrl: './emails.component.html',
  styleUrls: ['./emails.component.sass']
})
export class EmailsComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
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
    'body',
    'successfullySent'
  ];

  // dataSource = new MatTableDataSource<any>();

  constructor(
    private messageHandler: MessageHandlerService,
    private resourcesService: MdmResourcesService,
    private title: Title

  ) {

  }

  ngOnInit() {
    this.title.setTitle('Emails');
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
        this.isLoadingResults = true;

        return this.mailsFetch(this.paginator.pageSize, this.paginator.pageOffset, this.sort.active, this.sort.direction, this.filter);
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
  }

  mailsFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?): Observable<any> {
    const options = { pageSize, pageIndex, sortBy, sortType, filters };

    return this.resourcesService.admin.get('emails', options);
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


}

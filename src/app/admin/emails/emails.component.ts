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
  OnInit,
  ViewChild,
  ViewChildren,
  EventEmitter,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { MatSort, SortDirection, MatSortHeader } from '@angular/material/sort';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { Title } from '@angular/platform-browser';
import { GridService } from '@mdm/services/grid.service';
import { MdmPaginatorComponent as MdmPaginatorComponent_1 } from '../../shared/mdm-paginator/mdm-paginator';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatButton } from '@angular/material/button';
import { NgIf, NgClass, DatePipe } from '@angular/common';
import { MoreDescriptionComponent } from '../../shared/more-description/more-description.component';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'mdm-app-emails',
    templateUrl: './emails.component.html',
    styleUrls: ['./emails.component.sass'],
    standalone: true,
    imports: [MatTooltip, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatFormField, MatLabel, MatInput, MatCellDef, MatCell, MoreDescriptionComponent, NgIf, MatButton, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, NgClass, ExtendedModule, MdmPaginatorComponent_1, DatePipe]
})
export class EmailsComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;
  hideFilters = true;
  isLoadingResults: boolean;
  totalItemCount = 0;
  filterEvent = new EventEmitter<any>();
  filter: {};

  records: any[] = [];
  displayedColumns = [
    'sentToEmailAddress',
    'dateTimeSent',
    'subject',
    'body',
    'successfullySent'
  ];

  constructor(
    private resourcesService: MdmResourcesService,
    private title: Title,
    private changeRef: ChangeDetectorRef,
    private gridService: GridService
  ) {}

  ngOnInit() {
    this.title.setTitle('Emails');
  }

  ngAfterViewInit() {
    this.sort.active = 'dateTimeSent';
    this.sort.direction = 'desc';

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page, this.filterEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.mailsFetch(
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

  mailsFetch(
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: SortDirection,
    filters?: {}
  ): Observable<any> {
    const options = this.gridService.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    );
    return this.resourcesService.admin.emails(options);
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

  toggleMessage(record) {
    record.showFailure = !record.showFailure;
  }
}

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
  Input,
  ViewChild,
  ViewChildren,
  QueryList,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef, OnInit
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { SummaryMetadataPopupComponent } from '../summary-metadata-popup/summary-metadata-popup.component';

@Component({
  selector: 'mdm-summary-metadata-table',
  templateUrl: './summary-metadata-table.component.html',
  styleUrls: ['./summary-metadata-table.component.sass']
})
export class SummaryMetadataTableComponent implements AfterViewInit, OnInit {
  @Input() parent: any;
  @Input() domainType: any;

  hideFilters = true;
  displayedColumns: string[] = ['name', 'description'];
  totalItemCount = 0;
  isLoadingResults = true;
  filterEvent = new EventEmitter<string>();
  filter: string;
  records: any[] = [];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  @ViewChildren('filters') filters: QueryList<MatInput>;

  result: any;

  constructor(
    private changeRef: ChangeDetectorRef,
    private resources: MdmResourcesService,
    protected matDialog: MatDialog
  ) {}

  ngOnInit() {
    this.summaryMetadataFetch();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
          this.isLoadingResults = true;
          this.changeRef.detectChanges();

          return this.summaryMetadataFetch(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort.active,
            this.sort.direction,
            this.filter
          );
        }),
        map((data: any) => {
          data.body.items.forEach(item => {
            if (item.summaryMetadataType && item.summaryMetadataType.toLowerCase() === 'map') {
              item.summaryMetadataType = 'map';
              item.summaryMetadataReports.forEach(report => {
                report.reportValue = JSON.parse(report.reportValue);
                report.reportDate = report.reportDate.substring(0, 10);
              });
            } else if (item.summaryMetadataType && item.summaryMetadataType.toLowerCase() === 'number') {
              item.summaryMetadataType = 'number';
              item.summaryMetadataReports.forEach(report => {
                report.reportValue = parseInt(report.reportValue, 10);
                report.reportDate = report.reportDate.substring(0, 10);
              });
            }
          });
          this.totalItemCount = data.body.count;
          this.isLoadingResults = false;
          this.changeRef.detectChanges();
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          this.changeRef.detectChanges();
          return [];
        })
      )
      .subscribe(data => {
        this.records = data;
      });
  }

  summaryMetadataFetch = (
    pageSize?,
    pageIndex?,
    sortBy?,
    sortType?,
    filters?
  ) => {
    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };

    // return this.resources.facets.get(this.parent.id, 'summaryMetadata', options);
    return this.resources.summaryMetadata.list(this.domainType, this.parent.id);
  };

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

  filterClick() {
    this.hideFilters = !this.hideFilters;
  }

  popup(record: any) {
    this.matDialog.open(SummaryMetadataPopupComponent, {
      width: '90%',
      data: record,
      panelClass: 'summary-metadata-modal'
    });
  }
}

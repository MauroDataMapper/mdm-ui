/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
import { EventEmitter } from '@angular/core';
import {
  Component,
  ElementRef,

  ViewChild,
  ViewChildren
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService } from '@mdm/services';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'mdm-profiles-dashboard',
  templateUrl: './profiles-dashboard.component.html',
  styleUrls: ['./profiles-dashboard.component.scss']
})
export class ProfilesDashboardComponent implements AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  filterEvent = new EventEmitter<any>();

  isLoadingResults: boolean;
  totalProfileCount: number;
  filter: {};
  dynamicProfileRecords: any[] = [];
  hideFilters = true;
  displayedColumns = ['displayName', 'metadataNamespace', 'version'];

  constructor(
    private resourcesService: MdmResourcesService,
    private gridService: GridService
  ) {}

  ngAfterViewInit(): void {
    this.sort?.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));
    this.loadProfileData();
  }

  loadProfileData() {
    merge(this.sort?.sortChange, this.paginator?.page, this.filterEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.dynamicProfilesFetch();
        }),
        map((data: any) => {
          // TODO catch to totalcount once request is updated
          this.totalProfileCount = data.body.length;
          this.isLoadingResults = false;
          return data.body;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return [];
        })
      )
      .subscribe((data) => {
        data.forEach((res) => res.dataModel['domainType'] = 'DataModel');
        this.dynamicProfileRecords = data;
      });
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

  // TODO update when paging is added

  dynamicProfilesFetch(
    // pageSize?,
    // pageIndex?,
    // sortBy?,
    // sortType?,
    // filters?
  ): Observable<any> {
    // const options = this.gridService.constructOptions(
    //   pageSize,
    //   pageIndex,
    //   sortBy,
    //   sortType,
    //   filters
    // );

    return this.resourcesService.profile.providerDynamic();
  }
}

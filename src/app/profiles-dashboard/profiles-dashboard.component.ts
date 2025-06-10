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
import { EventEmitter } from '@angular/core';
import {
  Component,
  ElementRef,

  ViewChild,
  ViewChildren
} from '@angular/core';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService } from '@mdm/services';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import { AfterViewInit } from '@angular/core';
import { MdmPaginatorComponent as MdmPaginatorComponent_1 } from '../shared/mdm-paginator/mdm-paginator';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { ElementLinkComponent } from '../utility/element-link/element-link.component';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
    selector: 'mdm-profiles-dashboard',
    templateUrl: './profiles-dashboard.component.html',
    styleUrls: ['./profiles-dashboard.component.scss'],
    standalone: true,
    imports: [MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatFormField, MatLabel, MatInput, MatCellDef, MatCell, ElementLinkComponent, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, NgClass, ExtendedModule, MdmPaginatorComponent_1]
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
  filter: object;
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
        data.forEach(res => res.dataModel['domainType'] = 'DataModel');
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

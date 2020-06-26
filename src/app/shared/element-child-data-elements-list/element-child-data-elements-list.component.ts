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
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService } from '@mdm/services/grid.service';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import {MdmPaginatorComponent} from '../mdm-paginator/mdm-paginator';

@Component({
  selector: 'mdm-element-child-data-elements-list',
  templateUrl: './element-child-data-elements-list.component.html',
  styleUrls: ['./element-child-data-elements-list.component.scss']
})
export class ElementChildDataElementsListComponent implements OnInit, AfterViewInit {
  constructor(
    private gridSvc: GridService,
    private changeRef: ChangeDetectorRef,
    private resources: MdmResourcesService
  ) {}

  @Input() parentDataModel: any;
  @Input() parentDataClass: any;
  @Input() parentDataType: any;
  @Input() type: any; // static, dynamic

  @Input() childDataElements: any; // used when type='static'
  @Input() loadingData: any; // used when type='static'

  @Input() clientSide: boolean; // if true, it should NOT pass values to the serve in save/update/delete
  @Output() afterSave = new EventEmitter<any>();

  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  filterEvent = new EventEmitter<string>();
  filter: string;

  isLoadingResults: boolean;
  records: any[];
  totalItemCount = 0;
  hideFilters = true;

  displayedColumns = ['label', 'name', 'description'];

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.type === 'dynamic') {
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
      this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));
      this.gridSvc.reloadEvent.subscribe(fitler => (this.filter = fitler));

      merge(
        this.sort.sortChange,
        this.paginator.page,
        this.filterEvent,
        this.gridSvc.reloadEvent
      )
        .pipe(
          startWith({}),
          switchMap(() => {
            this.isLoadingResults = true;

            return this.dataElementsFetch(
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
      this.changeRef.detectChanges();
    }

    if (this.type === 'static') {
      this.isLoadingResults = true;
      this.records = [];
    }
  }

  dataElementsFetch = (pageSize, pageIndex, sortBy, sortType, filters) => {
    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };

    if (this.parentDataModel && this.parentDataClass) {
      return this.resources.dataClass.get(
        this.parentDataModel.id,
        null,
        this.parentDataClass.id,
        'dataElements',
        options
      );
    }
    if (this.parentDataModel && this.parentDataType) {
      return this.resources.dataType.get(
        this.parentDataModel.id,
        this.parentDataType.id,
        'dataElements',
        options
      );
    }
  };

  showStaticRecords = () => {
    if (this.childDataElements && this.type === 'static') {
      this.records = [].concat(this.childDataElements.items);
    }
  };

  applyFilter = () => {
    this.gridSvc.applyFilter(this.filters);
  };

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  }
}

/*
Copyright 2020-2026 University of Oxford and NHS England

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
  ViewChildren,
  ViewChild,
  AfterViewInit,
  ElementRef,
  EventEmitter,
  ChangeDetectorRef,
  OnInit,
  Output,
  OnDestroy
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge, Observable, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  map,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs/operators';
import { MatSort, SortDirection, MatSortHeader } from '@angular/material/sort';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { GridService } from '@mdm/services/grid.service';
import {
  DataClass,
  DataElement,
  DataElementIndexResponse,
  DataModel,
  MdmIndexBody
} from '@maurodatamapper/mdm-resources';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { AllLinksInPagedListComponent } from '../../utility/all-links-in-paged-list/all-links-in-paged-list.component';
import { MoreDescriptionComponent } from '../more-description/more-description.component';
import { NgIf, NgClass } from '@angular/common';
import { ElementLinkComponent } from '../../utility/element-link/element-link.component';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'mdm-flattened-data-classes-list',
    templateUrl: './flattened-data-classes-list.component.html',
    styleUrls: ['./flattened-data-classes-list.component.scss'],
    standalone: true,
    imports: [FlexModule, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatFormField, MatLabel, MatInput, MatCellDef, MatCell, ElementLinkComponent, NgIf, MoreDescriptionComponent, AllLinksInPagedListComponent, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, CdkDrag, NgClass, ExtendedModule, NgxSkeletonLoaderModule, MdmPaginatorComponent]
})
export class FlattenedDataClassesComponent
  implements AfterViewInit, OnInit, OnDestroy {
  @Input() parentDataModel: DataModel;
  @Input() parentDataClass: DataClass;
  @Input() type: any;
  @Input() childDataClasses: DataClass[];
  @Input() isEditable: boolean;
  @Input() pageSize = 50;
  @Output() totalCount = new EventEmitter<string>();

  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  total: number;
  records: DataElement[] = [];
  hideFilters = true;
  displayedColumns: string[];
  loading: boolean;
  totalItemCount = 0;
  isLoadingResults = true;
  filterEvent = new EventEmitter<any>();
  filterSubject = new Subject<any>();
  filter: object;

  /**
   * Signal to attach to subscriptions to trigger when they should be unsubscribed.
   */
  private unsubscribe$ = new Subject<void>();

  constructor(
    private changeRef: ChangeDetectorRef,
    private resources: MdmResourcesService,
    private gridService: GridService
  ) {}

  ngOnInit(): void {
    this.displayedColumns = ['element', 'dataclass', 'description'];
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    // Set a debounce time so that HTTP requests are not constantly happening on each filter key press
    this.filterSubject
      .pipe(takeUntil(this.unsubscribe$), debounceTime(300))
      .subscribe(event => this.filterEvent.emit(event));

    merge(this.paginator.page, this.filterEvent, this.sort.sortChange)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          this.changeRef.detectChanges();
          return this.flattenedElementsFetch(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.filter,
            this.sort.active,
            this.sort.direction
          );
        }),
        map((data: MdmIndexBody<DataElement>) => {
          this.totalItemCount = data.count;
          this.totalCount.emit(String(data.count));
          this.isLoadingResults = false;
          this.changeRef.detectChanges();
          return data.items;
        }),
        catchError((error) => {
          console.error('An error occurred:', error);
          this.isLoadingResults = false;
          this.changeRef.detectChanges();
          return [];
        })
      )
      .subscribe((data: DataElement[]) => {
        this.records = data;
      });
  }

  applyFilter() {
    const filter = {};
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;
      if (value !== '') {
        filter[name] = value;
      }
    });
    this.filter = filter;
    this.filterSubject.next(filter);
  }

  filterClick() {
    this.hideFilters = !this.hideFilters;
  }

  flattenedElementsFetch(
    pageSize?: number,
    pageIndex?: number,
    filters?: object,
    sortBy?: string,
    sortType?: SortDirection
  ): Observable<any> {
    const elementOptions = this.gridService.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    );
    const dataClassOptions = this.gridService.constructOptions();
    return this.resources.dataModel
      .dataElements(this.parentDataModel.id, elementOptions)
      .pipe(
        switchMap((dataElements: DataElementIndexResponse) => {
          return this.resources.dataClass
            .all(this.parentDataModel.id, dataClassOptions)
            .pipe(
              map((dataClasses: any) => {
                const updatedDataElements = dataElements.body.items.map(
                  (de) => {
                    const dataClass = dataClasses.body.items.find(
                      dc => dc.id === de.dataClass
                    );
                    if (dataClass) {
                      de.dataClassObject = dataClass;
                    }
                    return de;
                  }
                );

                return {
                  count: dataElements.body.count,
                  items: updatedDataElements
                };
              })
            );
        })
      );
  }
}

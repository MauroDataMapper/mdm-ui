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
  ElementRef,
  ViewChild,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort, SortDirection, MatSortHeader } from '@angular/material/sort';
import { CatalogueElementType, ElementTypesService } from '@mdm/services/element-types.service';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { GridService } from '@mdm/services/grid.service';
import { MdmPaginatorComponent as MdmPaginatorComponent_1 } from '../mdm-paginator/mdm-paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ElementDataTypeComponent } from '../element-data-type/element-data-type.component';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { AllLinksInPagedListComponent } from '../../utility/all-links-in-paged-list/all-links-in-paged-list.component';
import { MoreDescriptionComponent } from '../more-description/more-description.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { ModelPathComponent } from '../../utility/model-path/model-path.component';
import { ElementLinkComponent } from '../../utility/element-link/element-link.component';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { SkeletonBadgeComponent } from '../../utility/skeleton-badge/skeleton-badge.component';
import { NgIf, NgClass, NgFor } from '@angular/common';

@Component({
    selector: 'mdm-classified-elements-list',
    templateUrl: './classified-elements-list.component.html',
    styleUrls: ['./classified-elements-list.component.sass'],
    standalone: true,
    imports: [NgIf, SkeletonBadgeComponent, MatTooltip, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatFormField, MatLabel, MatInput, MatCellDef, MatCell, ElementLinkComponent, ModelPathComponent, NgClass, ExtendedModule, MoreDescriptionComponent, AllLinksInPagedListComponent, MatSelect, FormsModule, NgFor, MatOption, ElementDataTypeComponent, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, NgxSkeletonLoaderModule, MdmPaginatorComponent_1]
})
export class ClassifiedElementsListComponent implements OnInit, AfterViewInit {
  @Input() parent: any;
  @Input() classifiedElementType: any;

  @Input() parentDataModel: any;
  @Input() grandParentDataClass: any;
  @Input() parentDataClass: any;
  @Input() loadingData: any;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  allDataTypes: any;
  allDataTypesMap: any;
  checkAllCheckbox = false;
  processing: boolean;
  failCount: number;
  total: number;
  records: any[] = [];
  hideFilters = true;
  displayedColumns: string[];
  loading: boolean;
  totalItemCount = 0;
  isLoadingResults = true;
  filterEvent = new EventEmitter<any>();
  filter: object;
  deleteInProgress: boolean;
  domainType;

  baseTypes: { [key: string]: CatalogueElementType } | { id: string, title: string, classifiable?: boolean }[];
  classifiableBaseTypes: { [key: string]: CatalogueElementType } | { id: string, title: string, classifiable?: boolean }[];
  filterValue: any;
  filterName: any;

  constructor(
    private resources: MdmResourcesService,
    private elementTypes: ElementTypesService,
    private changeRef: ChangeDetectorRef,
    private gridService: GridService
  ) { }

  ngOnInit(): void {
    this.displayedColumns = ['label', 'description', 'domainType'];
    this.isLoadingResults = false;
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    this.baseTypes = [{ id: '', title: '' }].concat(this.elementTypes.getBaseTypesAsArray());

    this.classifiableBaseTypes = this.baseTypes.filter(f => f.classifiable === true);
    this.classifiableBaseTypes = [{ id: '', title: '' }].concat(this.classifiableBaseTypes);

    this.allDataTypes = this.classifiableBaseTypes;
    this.allDataTypesMap = this.getClassifiableBaseTypesMap();

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;

      return this.classificationFetch(
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
    ).subscribe((data) => {
      this.records = data;
    });
    this.changeRef.detectChanges();
  }

  classificationFetch(
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: SortDirection,
    filters?: { [p: string]: any }
  ): Observable<any> {
    const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, filters);
    return this.resources.classifier.listCatalogueItemsFor(this.parent.id as string, options);
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

    if (this.domainType) {
      if (this.domainType.id !== 'DataType') {
        filter['domainType'] = this.domainType.id;
      }
    }

    this.filter = filter;
    this.filterEvent.emit(filter);
  };

  applyMatSelectFilter() {
    this.applyFilter();
  }

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  getClassifiableBaseTypesMap() {
    const dataTypes = this.allDataTypes;
    const dtMap = {};
    dataTypes.forEach((dt) => {
      dtMap[dt.id] = dt;
    });
    return dtMap;
  }
}

/*
Copyright 2020-2024 University of Oxford and NHS England

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
  QueryList,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit,
  Output
} from '@angular/core';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatInput } from '@angular/material/input';
import { MatSort, SortDirection, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MatDialog } from '@angular/material/dialog';
import { BulkDeleteModalComponent } from '@mdm/modals/bulk-delete-modal/bulk-delete-modal.component';
import { GridService } from '@mdm/services/grid.service';
import { JoinArrayPipe } from '@mdm/pipes/join-array.pipe';
import { MdmPaginatorComponent as MdmPaginatorComponent_1 } from '../mdm-paginator/mdm-paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatCheckbox } from '@angular/material/checkbox';
import { ElementDataTypeComponent } from '../element-data-type/element-data-type.component';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MoreDescriptionComponent } from '../more-description/more-description.component';
import { ElementLinkComponent } from '../../utility/element-link/element-link.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { SkeletonBadgeComponent } from '../../utility/skeleton-badge/skeleton-badge.component';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'mdm-element-owned-data-type-list',
    templateUrl: './element-owned-data-type-list.component.html',
    styleUrls: ['./element-owned-data-type-list.component.sass'],
    standalone: true,
    imports: [FlexModule, NgIf, SkeletonBadgeComponent, MatTooltip, MatButton, MatMenuTrigger, MatMenu, MatMenuItem, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatFormField, MatLabel, MatInput, MatCellDef, MatCell, ElementLinkComponent, MoreDescriptionComponent, MatSelect, FormsModule, NgFor, MatOption, ElementDataTypeComponent, MatCheckbox, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, NgClass, ExtendedModule, NgxSkeletonLoaderModule, MdmPaginatorComponent_1, JoinArrayPipe]
})
export class ElementOwnedDataTypeListComponent
  implements AfterViewInit, OnInit {
  @Input() parent: any;
  @Input() type: 'static' | 'dynamic';
  @Input() isEditable: any;

  @Input() childOwnedDataTypes: any;
  @Input() loadingData: boolean;
  @Input() clientSide: boolean;
  @ViewChildren('filters') filters: QueryList<MatInput>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;
  @Output() totalCount = new EventEmitter<string>();

  allDataTypes: any;
  allDataTypesMap: any;
  loading = false;
  records: any[] = [];
  total: number;
  processing = false;
  failCount: number;
  hideFilters = true;
  displayedColumns: string[];
  totalItemCount = 0;
  isLoadingResults = true;
  filterEvent = new EventEmitter<any>();
  filter: { [p: string]: any };
  deleteInProgress: boolean;
  domainType;
  dataSource: MatTableDataSource<any>;
  checkAllCheckbox = false;
  bulkActionsVisible = 0;

  constructor(
    private changeRef: ChangeDetectorRef,
    private elementTypes: ElementTypesService,
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService,
    private dialog: MatDialog,
    private gridService: GridService
  ) {}

  ngOnInit(): void {
    if (this.type === 'static') {
      this.dataSource = new MatTableDataSource(this.records);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
    if (this.isEditable && !this.parent.finalised) {
      this.displayedColumns = ['name', 'description', 'domainType', 'checkbox'];
    } else {
      this.displayedColumns = ['name', 'description', 'domainType'];
    }
  }

  ngAfterViewInit() {
    this.allDataTypes = this.elementTypes.getAllDataTypesArray();
    this.allDataTypesMap = this.elementTypes.getAllDataTypesMap();

    if (this.type === 'dynamic') {
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
      this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

      merge(this.sort.sortChange, this.paginator.page, this.filterEvent)
        .pipe(
          startWith({}),
          switchMap(() => {
            this.isLoadingResults = true;
            this.changeRef.detectChanges();

            return this.dataTypesFetch(
              this.paginator.pageSize,
              this.paginator.pageOffset,
              this.sort.active,
              this.sort.direction,
              this.filter
            );
          }),
          map((data: any) => {
            this.totalItemCount = data.body.count;
            this.totalCount.emit(String(data.body.count));
            this.isLoadingResults = false;
            return data.body.items;
          }),
          catchError(() => {
            this.isLoadingResults = false;
            this.changeRef.detectChanges();
            return [];
          })
        )
        .subscribe((data) => {
          this.records = data;
          data.forEach((x: any) => {
            if(x.domainType === 'ModelDataType') {
              if(x.modelResourceDomainType === 'Terminology') {
                x.domainType = 'TerminologyType';
              }
              if(x.modelResourceDomainType === 'CodeSet') {
                x.domainType = 'CodeSetType';
              }
              if(x.modelResourceDomainType === 'ReferenceDataModel') {
                x.domainType = 'ReferenceDataModelType';
              }
            }
          });
          this.isLoadingResults = false;
          this.changeRef.detectChanges();
        });
    }

    if (this.type === 'static') {
      this.isLoadingResults = true;
      this.records = [];
      this.records = [].concat(this.childOwnedDataTypes.items);
      this.totalItemCount = this.childOwnedDataTypes.items.length;
      this.refreshDataSource();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.isLoadingResults = false;
      this.changeRef.detectChanges();
    }
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

  openEdit = (dataType) => {
    if (!dataType || (dataType && !dataType.id)) {
      return '';
    }
    this.stateHandler.NewWindow(
      'dataType',
      {
        id: dataType.id,
        dataModelId: this.parent.id
      },
      null
    );
  };

  addDataType = () => {
    this.stateHandler.Go(
      'newDataType',
      { parentDataModelId: this.parent.id },
      null
    );
  };

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  dataTypesFetch = (pageSize?:number, pageIndex?:number, sortBy?:string, sortType?: SortDirection, filters?:{[p: string]: any}) => {
    const options = this.gridService.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    );
    return this.resources.dataType.list(this.parent.id as string, options);
  };

  onChecked = () => {
    this.records.forEach((x) => (x.checked = this.checkAllCheckbox));
    this.listChecked();
  };
  listChecked = () => {
    let count = 0;
    for (const value of Object.values(this.records)) {
      if (value.checked) {
        count++;
      }
    }
    this.bulkActionsVisible = count;
  };
  toggleCheckbox = (record) => {
    this.records.forEach((x) => (x.checked = false));
    this.bulkActionsVisible = 0;
    record.checked = true;
    this.bulkDelete();
  };

  bulkDelete = () => {
    const dataElementIdLst = this.records.filter((record) => record.checked);
    const promise = new Promise<void>((resolve, reject) => {
      const dialog = this.dialog.open(BulkDeleteModalComponent, {
        data: { dataElementIdLst, parentDataModel: this.parent },
        panelClass: 'bulk-delete-modal'
      });

      dialog.afterClosed().subscribe((result) => {
        if (result != null && result.status === 'ok') {
          resolve();
        } else {
          reject();
        }
      });
    });
    promise
      .then(() => {
        this.records.forEach((x) => (x.checked = false));
        // this.records = this.records;
        this.checkAllCheckbox = false;
        this.bulkActionsVisible = 0;
        this.filterEvent.emit();
      })
      .catch(() => console.warn('error'));
  };

  refreshDataSource() {
    this.dataSource.data = this.records;
  }
}

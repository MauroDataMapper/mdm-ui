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
import {
  Component,
  Input,
  ViewChildren,
  ViewChild,
  AfterViewInit,
  ElementRef,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { MatDialog } from '@angular/material/dialog';
import { BulkEditModalComponent } from '@mdm/modals/bulk-edit-modal/bulk-edit-modal.component';
import { BulkDeleteModalComponent } from '@mdm/modals/bulk-delete-modal/bulk-delete-modal.component';
import { GridService } from '@mdm/services/grid.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DataClass, DataClassDetail, DataClassIndexResponse, DataModelDetail } from '@maurodatamapper/mdm-resources';
import { MessageHandlerService } from '@mdm/services';

@Component({
  selector: 'mdm-data-classes-list',
  templateUrl: './data-classes-list.component.html',
  styleUrls: ['./data-classes-list.component.scss']
})
export class DataClassesListComponent implements AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;
  @ViewChild(MatTable, { static: false }) table: MatTable<DataClassDetail>;

  @Input() parentDataModel: DataModelDetail;
  @Input() grandParentDataClass: DataClassDetail;
  @Input() parentDataClass: DataClassDetail;
  @Input() isEditable: boolean;
  checkAllCheckbox = false;

  processing: boolean;
  failCount: number;
  total: number;
  dataClassRecords: DataClassDetail[] = [];
  hideFilters = true;
  displayedColumns: string[];
  loading: boolean;
  totalDataClassCount = 0;
  isLoadingResults = true;
  filterEvent = new EventEmitter<any>();
  filter: {};
  deleteInProgress: boolean;
  bulkActionsVisible = 0;

  constructor(
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService,
    private changeRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private gridService: GridService,
    private messageHandler: MessageHandlerService
  ) {}

  ngAfterViewInit() {
    if (this.isEditable && !this.parentDataModel.finalised) {
      this.displayedColumns = ['name', 'description', 'label', 'checkbox'];
    } else {
      this.displayedColumns = ['name', 'description', 'label'];
    }
    this.changeRef.detectChanges();
    this.sort?.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    this.loadDataClasses();

    this.changeRef.detectChanges();
  }

  loadDataClasses() {
    merge(this.sort?.sortChange, this.paginator?.page, this.filterEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.dataClassesFetch(
            this.paginator?.pageSize,
            this.paginator?.pageOffset,
            this.sort?.active,
            this.sort?.direction,
            this.filter
          );
        }),
        map((data: DataClassIndexResponse) => {
          if (this.parentDataClass.extendsDataClasses) {
            this.totalDataClassCount = data.body.count + (this.parentDataClass.extendsDataClasses.length as number);
          } else {
            this.totalDataClassCount = data.body.count;
          }
          this.isLoadingResults = false;
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return [];
        })
      )
      .subscribe((data) => {
        if (this.parentDataClass.extendsDataClasses) {
          const extendedDC = this.parentDataClass.extendsDataClasses.map(dc => {
            dc['extended'] = true;
            return dc;
          });
          this.dataClassRecords = [...data, ...extendedDC];
        } else {
          this.dataClassRecords = data;
        }
      });
  }

  openEdit(dataClass: DataClassDetail) {
    if (!dataClass || (dataClass && !dataClass.id)) {
      return '';
    }
    this.stateHandler.NewWindow(
      'dataClass',
      {
        dataModelId: this.parentDataModel.id,
        dataClassId: this.parentDataClass ? this.parentDataClass.id : null,
        id: dataClass.id
      },
      null
    );
  }

  addDataClass() {
    this.stateHandler.Go(
      'newDataClass',
      {
        parentDataModelId: this.parentDataModel.id,
        parentDataClassId: this.parentDataClass
          ? this.parentDataClass.id
          : null,
        grandParentDataClassId: this.grandParentDataClass.id
      },
      null
    );
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
    this.filterEvent.emit(filter);
  }

  filterClick() {
    this.hideFilters = !this.hideFilters;
  }

  dataClassesFetch(
    pageSize?,
    pageIndex?,
    sortBy?,
    sortType?,
    filters?
  ): Observable<any> {
    sortBy = 'idx';
    const options = this.gridService.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    );

    return this.resources.dataClass.listChildDataClasses(
      this.parentDataModel.id,
      this.parentDataClass.id,
      options
    );
  }

  onChecked() {
    this.dataClassRecords.forEach((x) => (x.checked = this.checkAllCheckbox));
    this.listChecked();
  }

  listChecked() {
    let count = 0;
    for (const value of Object.values(this.dataClassRecords)) {
      if (value.checked) {
        count++;
      }
    }
    this.bulkActionsVisible = count;
  }

  // Drag and drop
  dropItem(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      this.dataClassRecords,
      event.previousIndex,
      event.currentIndex
    );
    const prevRec = this.dataClassRecords[event.currentIndex];
    if (prevRec === undefined) {
      return;
    }
    this.updateOrder(event.item, event.currentIndex);
    this.table.renderRows();
  }

  updateOrder(item, newPosition) {
    const resource: DataClass = {
      label: item.data.label,
      domainType: item.data.domainType,
      index: newPosition
    };
    if (!this.parentDataClass.id) {
      this.resources.dataClass
        .update(this.parentDataModel.id, item.data.id, resource)
        .subscribe(
          () => {
            this.messageHandler.showSuccess(
              'Data Class reordered successfully.'
            );
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Data Class.',
              error
            );
          }
        );
    } else {
      this.resources.dataClass
        .updateChildDataClass(
          this.parentDataModel.id,
          this.parentDataClass.id,
          item.data.id,
          resource
        )
        .subscribe(
          () => {
            this.messageHandler.showSuccess(
              'Data Class reordered successfully.'
            );
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Data Class.',
              error
            );
          }
        );
    }
  }

  bulkEdit() {
    const dataElementIdLst = [];
    this.dataClassRecords.forEach((record) => {
      if (record.checked) {
        dataElementIdLst.push({
          id: record.id,
          domainType: record.domainType
        });
      }
    });
    this.dialog
      .open(BulkEditModalComponent, {
        data: {
          dataElementIdLst,
          parentDataModel: this.parentDataModel,
          parentDataClass: this.parentDataClass
        },
        panelClass: 'bulk-edit-modal'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.dataClassRecords.forEach((x) => (x.checked = false));
          // eslint-disable-next-line no-self-assign
          this.dataClassRecords = this.dataClassRecords;
          this.checkAllCheckbox = false;
          this.bulkActionsVisible = 0;
          this.filterEvent.emit();
        }
      });
  }

  bulkDelete() {
    const dataElementIdLst = this.dataClassRecords.filter(record => record.checked);
    this.dialog
      .open(BulkDeleteModalComponent, {
        data: {
          dataElementIdLst,
          parentDataModel: this.parentDataModel,
          parentDataClass: this.parentDataClass
        },
        panelClass: 'bulk-delete-modal'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result != null && result.status === 'ok') {
          this.dataClassRecords.forEach((x) => (x.checked = false));
          // eslint-disable-next-line no-self-assign
          this.dataClassRecords = this.dataClassRecords;
          this.checkAllCheckbox = false;
          this.bulkActionsVisible = 0;
          this.filterEvent.emit();
        }
      });
  }
}

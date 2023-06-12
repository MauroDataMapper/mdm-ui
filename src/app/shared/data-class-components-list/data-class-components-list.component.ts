/*
Copyright 2020-2023 University of Oxford and NHS England

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
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { MatDialog } from '@angular/material/dialog';
import { BulkEditModalComponent } from '@mdm/modals/bulk-edit-modal/bulk-edit-modal.component';
import { BulkDeleteModalComponent } from '@mdm/modals/bulk-delete-modal/bulk-delete-modal.component';
import { GridService } from '@mdm/services/grid.service';
import { CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  DataClass,
  DataClassDetail,
  DataClassIndexResponse,
  DataElement,
  DataElementDetail,
  DataElementIndexResponse,
  DataModelDetail
} from '@maurodatamapper/mdm-resources';
import { MessageHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-data-class-components-list',
  templateUrl: './data-class-components-list.component.html',
  styleUrls: ['./data-class-components-list.component.scss']
})
export class DataClassComponentsListComponent implements AfterViewInit {
  @ViewChildren('classFilters', { read: ElementRef }) classFilters: ElementRef[];
  @ViewChildren('elementFilters', { read: ElementRef }) elementFilters: ElementRef[];

  @ViewChild(MatSort, { static: false }) classSort: MatSort;
  @ViewChild(MatSort, { static: false }) elementSort: MatSort;

  @ViewChild(MdmPaginatorComponent, { static: true }) classPaginator: MdmPaginatorComponent;
  @ViewChild(MdmPaginatorComponent, { static: true }) elementPaginator: MdmPaginatorComponent;

  @ViewChild(MatTable, { static: false }) classTable: MatTable<DataClassDetail>;
  @ViewChild(MatTable, { static: false }) elementTable: MatTable<DataElementDetail>;

  @Input() parentDataModel: DataModelDetail;
  @Input() grandParentDataClass: DataClassDetail;
  @Input() parentDataClass: DataClassDetail;
  @Input() isEditable: boolean;
  checkAllClassCheckbox = false;
  checkAllElementCheckbox = false;

  processingClass: boolean;
  processingElement: boolean;
  dataClassRecords: DataClassDetail[] = [];
  dataElementRecords: DataElement[] = [];
  hideClassFilters = true;
  hideElementFilters = true;
  displayedClassColumns: string[];
  displayedElementColumns: string[];

  totalDataClassCount = 0;
  totalDataElementCount = 0;
  isLoadingClassResults = true;
  isLoadingElementResults = true;

  filterClassEvent = new EventEmitter<any>();
  filterElementEvent = new EventEmitter<any>();
  classFilter: {};
  elementFilter: {};

  bulkClassActionsVisible = 0;
  bulkElementActionsVisible = 0;

  isOrderedDataSource = false;

  constructor(
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService,
    private changeRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private editing: EditingService,
    private gridService: GridService,
    private messageHandler: MessageHandlerService
  ) {}

  ngAfterViewInit() {
    if (this.isEditable && !this.parentDataModel.finalised) {
      this.displayedClassColumns = ['name', 'description', 'multiplicity', 'checkbox'];
      this.displayedElementColumns = ['name', 'description', 'multiplicity', 'checkbox'];
    } else {
      this.displayedClassColumns = ['name', 'description', 'multiplicity'];
      this.displayedElementColumns = ['name', 'description', 'multiplicity'];
    }
    this.changeRef.detectChanges();
    this.classSort?.sortChange.subscribe(() => (this.classPaginator.pageIndex = 0));
    this.elementSort?.sortChange.subscribe(() => (this.elementPaginator.pageIndex = 0));

    this.filterClassEvent.subscribe(() => (this.classPaginator.pageIndex = 0));
    this.filterElementEvent.subscribe(() => (this.elementPaginator.pageIndex = 0));

    this.loadDataClasses();
    this.loadDataElements();

    this.changeRef.detectChanges();
  }

  loadDataClasses() {
    merge(this.classSort?.sortChange, this.classPaginator?.page, this.filterClassEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingClassResults = true;
          return this.dataClassesFetch(
            this.classPaginator?.pageSize,
            this.classPaginator?.pageOffset,
            this.classSort?.active,
            this.classSort?.direction,
            this.classFilter
          );
        }),
        map((data: DataClassIndexResponse) => {
          if (this.parentDataClass.extendsDataClasses) {
            this.totalDataClassCount =
              data.body.count +
              (this.parentDataClass.extendsDataClasses.length as number);
          } else {
            this.totalDataClassCount = data.body.count;
          }
          this.isLoadingClassResults = false;
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingClassResults = false;
          return [];
        })
      )
      .subscribe((data) => {
        if (this.parentDataClass.extendsDataClasses) {
          const extendedDC = this.parentDataClass.extendsDataClasses.map(
            (dc) => {
              dc['extended'] = true;
              return dc;
            }
          );
          this.dataClassRecords = [...data, ...extendedDC];
        } else {
          this.dataClassRecords = data;
        }
      });
  }
  loadDataElements() {
    merge(this.elementSort?.sortChange, this.elementPaginator?.page, this.filterElementEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingElementResults = true;
          this.isOrderedDataSource = true;
          if (!this.elementSort?.direction) {
            this.isOrderedDataSource = false;
            [this.elementSort.active, this.elementSort.direction] = ['idx', 'asc'];
          }
          return this.dataElementsFetch(
            this.elementPaginator?.pageSize,
            this.elementPaginator?.pageOffset,
            this.elementSort?.active,
            this.elementSort?.direction,
            this.elementFilter
          );
        }),
        map((data: DataElementIndexResponse) => {
          this.totalDataElementCount = data.body.count;
          this.isLoadingElementResults = false;
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingElementResults = false;
          return [];
        })
      )
      .subscribe((data: DataElement[]) => {
        this.dataElementRecords = data;
        this.isLoadingElementResults = false;
      });
    this.changeRef.detectChanges();
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

  addDataElement() {
    this.stateHandler.Go(
      'newDataElement',
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


  applyClassFilter() {
    const classFilter = {};
    this.classFilters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;
      if (value !== '') {
        classFilter[name] = value;
      }
    });
    this.classFilter = classFilter;
    console.log(classFilter);
    this.filterClassEvent.emit(classFilter);
  }

  applyElementFilter() {
    const elementFilter = {};
    this.elementFilters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;
      if (value !== '') {
        elementFilter[name] = value;
      }
    });
    this.elementFilter = elementFilter;
    this.filterElementEvent.emit(elementFilter);
  }


  classFilterClick() {
    this.hideClassFilters = !this.hideClassFilters;
  }

  elementFilterClick() {
    this.hideElementFilters = !this.hideElementFilters;
  }


  dataClassesFetch(
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

    return this.resources.dataClass.listChildDataClasses(
      this.parentDataModel.id,
      this.parentDataClass.id,
      options
    );
  }

  dataElementsFetch(
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

    return this.resources.dataElement.list(
      this.parentDataModel.id,
      this.parentDataClass.id,
      options
    );
  }

  onClassChecked() {
    this.dataClassRecords.forEach((x) => (x.checked = this.checkAllClassCheckbox));
    this.classListChecked();
  }

  onElementChecked() {
    this.dataElementRecords.forEach((x) => (x.checked = this.checkAllElementCheckbox));
    this.elementListChecked();
  }

  classListChecked() {
    let count = 0;
    for (const value of Object.values(this.dataClassRecords)) {
      if (value.checked) {
        count++;
      }
    }
    this.bulkClassActionsVisible = count;
  }

  elementListChecked() {
    let count = 0;
    for (const value of Object.values(this.dataElementRecords)) {
      if (value.checked) {
        count++;
      }
    }
    this.bulkElementActionsVisible = count;
  }

  // Drag and drop
  dropClassItem(event: CdkDragDrop<any, any, DataClassDetail>) {
    moveItemInArray(
      this.dataClassRecords,
      event.previousIndex,
      event.currentIndex
    );
    const prevRec = this.dataClassRecords[event.currentIndex];
    if (prevRec === undefined) {
      return;
    }
    this.updateClassOrder(event.item, event.currentIndex);
    this.classTable.renderRows();
  }

  dropElementItem(event: CdkDragDrop<any, any, DataElement>) {
    moveItemInArray(
      this.dataElementRecords,
      event.previousIndex,
      event.currentIndex
    );
    const prevRec = this.dataElementRecords[event.currentIndex];
    if (prevRec === undefined) {
      return;
    }
    this.updateElementOrder(event.item, event.currentIndex);
    this.elementTable.renderRows();
  }

  updateClassOrder(item: CdkDrag<DataClassDetail>, newPosition: number) {
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

  updateElementOrder(item: CdkDrag<DataElement>, newPosition: number) {
    const resource: DataElement = {
      id: item.data.id,
      domainType: item.data.domainType,
      label: item.data.label,
      index: newPosition
    };

    this.resources.dataElement
      .update(
        this.parentDataModel.id,
        this.parentDataClass.id,
        item.data.id,
        resource
      )
      .subscribe(
        () => {
          this.messageHandler.showSuccess(
            'Data Element reordered successfully.'
          );
        },
        (error) => {
          this.messageHandler.showError(
            'There was a problem updating the Data Element.',
            error
          );
        }
      );
  }

  bulkEditClass() {
    const dataClassIds = this.dataClassRecords
      .filter((record) => record.checked)
      .map((record) => {
        return {
          id: record.id,
          domainType: record.domainType
        };
      });

    this.editing
      .openDialog(BulkEditModalComponent, {
        data: {
          dataElementIdLst: dataClassIds,
          parentDataModel: this.parentDataModel,
          parentDataClass: this.parentDataClass
        },
        panelClass: 'bulk-edit-modal'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.dataClassRecords.forEach((x) => (x.checked = false));
          this.checkAllClassCheckbox = false;
          this.bulkClassActionsVisible = 0;
          this.filterClassEvent.emit();
        }
      });
  }

  bulkEditElement() {
    const dataElementIds = this.dataElementRecords
      .filter((record) => record.checked)
      .map((record) => {
        return {
          id: record.id,
          domainType: record.domainType
        };
      });

    this.editing
      .openDialog(BulkEditModalComponent, {
        data: {
          dataElementIdLst: dataElementIds,
          parentDataModel: this.parentDataModel,
          parentDataClass: this.parentDataClass
        },
        panelClass: 'bulk-edit-modal'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.dataElementRecords.forEach((x) => (x.checked = false));
          this.checkAllElementCheckbox = false;
          this.bulkElementActionsVisible = 0;
          this.filterElementEvent.emit();
        }
      });
  }

  bulkClassDelete() {
    const dataClassIdList = this.dataClassRecords.filter(
      (record) => record.checked
    );
    this.dialog
      .open(BulkDeleteModalComponent, {
        data: {
          dataClassIdList,
          parentDataModel: this.parentDataModel,
          parentDataClass: this.parentDataClass
        },
        panelClass: 'bulk-delete-modal'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result != null && result.status === 'ok') {
          this.dataClassRecords.forEach((x) => (x.checked = false));
          this.checkAllClassCheckbox = false;
          this.bulkClassActionsVisible = 0;
          this.filterClassEvent.emit();
        }
      });
  }

  bulkDelete() {
    const dataElementIdList = this.dataElementRecords.filter(
      (record) => record.checked
    );
    this.dialog
      .open(BulkDeleteModalComponent, {
        data: {
          dataElementIdList,
          parentDataModel: this.parentDataModel,
          parentDataClass: this.parentDataClass
        },
        panelClass: 'bulk-delete-modal'
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.dataElementRecords.forEach((x) => (x.checked = false));
          this.checkAllElementCheckbox = false;
          this.bulkElementActionsVisible = 0;
          this.filterElementEvent.emit();
        }
      });
  }
}

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
import { DataClass, DataElement } from '@maurodatamapper/mdm-resources';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MessageHandlerService } from '@mdm/services';

@Component({
  selector: 'mdm-data-elements-list',
  templateUrl: './data-elements-list.component.html',
  styleUrls: ['./data-elements-list.component.scss']
})
export class DataElementsListComponent implements AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  @Input() parentDataModel: any;
  @Input() grandParentDataClass: any;
  @Input() parentDataClass: any;
  @Input() loadingData: any;
  @Input() isEditable: any;
  checkAllCheckbox = false;

  processing: boolean;
  failCount: number;
  total: number;
  dataElementRecords: any[] = [];
  hideFilters = true;
  displayedColumns: string[];
  loading: boolean;
  totalDataElementCount = 0;
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

    merge(this.sort?.sortChange, this.paginator?.page, this.filterEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.dataElementsFetch(
            this.paginator?.pageSize,
            this.paginator?.pageOffset,
            this.sort?.active,
            this.sort?.direction,
            this.filter
          );
        }),
        map((data: any) => {
          this.totalDataElementCount = data.body.count;
          this.isLoadingResults = false;
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return [];
        })
      )
      .subscribe((data) => {
        this.dataElementRecords = data;
      });

    this.changeRef.detectChanges();
  }

  openEdit(dataClass: DataClass) {
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

  refreshGrid() {
    this.filterEvent.emit();
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

  // Drag and drop
  dropItem(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      this.dataElementRecords,
      event.previousIndex,
      event.currentIndex
    );
    const prevRec = this.dataElementRecords[event.currentIndex];
    if (prevRec === undefined) {
      return;
    }
    this.updateOrder(event.item, event.currentIndex);
    this.table.renderRows();
  }

  updateOrder(item, newPosition) {
    const resource: DataElement = {
      id: item.data.id,
      domainType : item.data.domainType,
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

  dataElementsFetch(
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

    return this.resources.dataElement.list(
      this.parentDataModel.id,
      this.parentDataClass.id,
      options
    );
  }

  onChecked() {
    this.dataElementRecords.forEach((x) => (x.checked = this.checkAllCheckbox));
    this.listChecked();
  }

  listChecked() {
    let count = 0;
    for (const value of Object.values(this.dataElementRecords)) {
      if (value.checked) {
        count++;
      }
    }
    this.bulkActionsVisible = count;
  }

  bulkEdit() {
    const dataElementIdLst = [];
    this.dataElementRecords.forEach((record) => {
      if (record.checked) {
        dataElementIdLst.push({
          id: record.id,
          domainType: record.domainType
        });
      }
    });
    const promise = new Promise<void>((resolve, reject) => {
      const dialog = this.dialog.open(BulkEditModalComponent, {
        data: {
          dataElementIdLst,
          parentDataModel: this.parentDataModel,
          parentDataClass: this.parentDataClass
        },
        panelClass: 'bulk-edit-modal'
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
        this.dataElementRecords.forEach((x) => (x.checked = false));
        // eslint-disable-next-line no-self-assign
        this.dataElementRecords = this.dataElementRecords;
        this.checkAllCheckbox = false;
        this.bulkActionsVisible = 0;
        this.filterEvent.emit();
      })
      .catch(() => {});
  }

  bulkDelete() {
    const dataElementIdLst = this.dataElementRecords.filter(record => record.checked);
    const promise = new Promise<void>((resolve, reject) => {
      const dialog = this.dialog.open(BulkDeleteModalComponent, {
        data: {
          dataElementIdLst,
          parentDataModel: this.parentDataModel,
          parentDataClass: this.parentDataClass
        },
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
        this.dataElementRecords.forEach((x) => (x.checked = false));
        // eslint-disable-next-line no-self-assign
        this.dataElementRecords = this.dataElementRecords;
        this.checkAllCheckbox = false;
        this.bulkActionsVisible = 0;
        this.filterEvent.emit();
      })
      .catch(() => {});
  }
}

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
import { Component, Input, ViewChildren, ViewChild, AfterViewInit, ElementRef, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge, Observable, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { MatDialog } from '@angular/material/dialog';
import { BulkEditModalComponent } from '@mdm/modals/bulk-edit-modal/bulk-edit-modal.component';
import { BulkDeleteModalComponent } from '@mdm/modals/bulk-delete-modal/bulk-delete-modal.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { GridService } from '@mdm/services/grid.service';

@Component({
  selector: 'mdm-data-classes-list',
  templateUrl: './data-classes-list.component.html',
  styleUrls: ['./data-classes-list.component.scss']
})
export class DataClassesListComponent implements AfterViewInit {

  @Input() parentDataModel: any;
  @Input() grandParentDataClass: any;
  @Input() parentDataClass: any;
  @Input() loadingData: any;
  @Input() isEditable: any;
  checkAllCheckbox = false;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  
  processing: boolean;
  failCount: number;
  total: number;
  dataClassRecords: any[] = [];
  hideFilters = true;
  displayedColumns: string[];
  loading: boolean;
  totalDataClassCount = 0;
  isLoadingResults = true;
  filterEvent = new EventEmitter<any>();
  filter: {};
  deleteInProgress: boolean;
  bulkActionsVisibile = 0;

  constructor(
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService,
    private changeRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private gridService: GridService
  ) { }
  ngAfterViewInit() {
    
    if (this.isEditable && !this.parentDataModel.finalised) {
      this.displayedColumns = ['checkbox', 'name', 'description', 'label', 'actions'];
    } else {
      this.displayedColumns = ['name', 'description', 'label'];
    }
    this.changeRef.detectChanges();
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));
    
    this.loadDataClasses();
    
    this.changeRef.detectChanges();
  }

  loadDataClasses = () => {
    merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      return this.dataClassesFetch(this.paginator.pageSize, this.paginator.pageOffset, this.sort.active, this.sort.direction, this.filter);
    }), map((data: any) => {
      this.totalDataClassCount = data.body.count;
      this.isLoadingResults = false;
      return data.body.items;
    }), catchError(() => {
      this.isLoadingResults = false;
      return [];
    })
    ).subscribe(data => {
      this.dataClassRecords = data;
    });
  }

 // Drag and drop
  dropDataClasses(event: CdkDragDrop<any[]>) {
    
    moveItemInArray(this.dataClassRecords, event.previousIndex, event.currentIndex);

    let prevRec = this.dataClassRecords[event.currentIndex];

    if (prevRec === undefined) {
      return;
    }

    this.updateDataClassesOrder(event.item, event.currentIndex);

    this.table.renderRows();
  }

  updateDataClassesOrder = (item, newPosition) => {
    

    const resource = {
      id: item.data.id,
      index: newPosition
    };

    this.resources.dataClass.updateChildDataClass(this.parentDataModel.id, this.parentDataClass.id, item.data.id, resource).subscribe(result => {
      console.log('Data Classes updated successfully.');
    }, error => {
      console.log('There was a problem updating the Data Classes.', error);
    });
  };

  openEdit = dataClass => {
    if (!dataClass || (dataClass && !dataClass.id)) {
      return '';
    }
    this.stateHandler.NewWindow('dataClass', {
      dataModelId: this.parentDataModel.id,
      dataClassId: this.parentDataClass ? this.parentDataClass.id : null,
      id: dataClass.id
    }, null);
  };

  addDataClass = () => {
    this.stateHandler.Go('newDataClass', {
      parentDataModelId: this.parentDataModel.id,
      parentDataClassId: this.parentDataClass ? this.parentDataClass.id : null,
      grandParentDataClassId: this.grandParentDataClass.id
    }, null);
  };

  refreshGrid = () => {
    this.filterEvent.emit();
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
  
  dataClassesFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?): Observable<any> {
     
   
    const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, filters);
    
    return this.resources.dataClass.listChildDataClasses(this.parentDataModel.id, this.parentDataClass.id, options);
  }

  onChecked = () => {
    this.dataClassRecords.forEach(x => (x.checked = this.checkAllCheckbox));
    this.listChecked();
  }

  toggleDelete = (record) => {
    this.dataClassRecords.forEach(x => (x.checked = false));
    this.bulkActionsVisibile = 0;
    record.checked = true;
    this.bulkEdit();
  }
  toggleEdit = (record) => {
    this.dataClassRecords.forEach(x => (x.checked = false));
    this.bulkActionsVisibile = 0;
    record.checked = true;
    this.bulkDelete();
  }

  listChecked = () => {
    let count = 0;
    for (const value of Object.values(this.dataClassRecords)) {
      if (value.checked) {
        count++;
      }
    }
    this.bulkActionsVisibile = count;
  }

  bulkEdit = () => {
    const dataElementIdLst = [];
    this.dataClassRecords.forEach(record => {
      if (record.checked) {
        dataElementIdLst.push({
          id: record.id,
          domainType: record.domainType
        });
      }
    });
    const promise = new Promise((resolve, reject) => {
      const dialog = this.dialog.open(BulkEditModalComponent, {
        data: { dataElementIdLst, parentDataModel: this.parentDataModel, parentDataClass: this.parentDataClass },
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
    promise.then(() => {
      this.dataClassRecords.forEach(x => (x.checked = false));
      this.dataClassRecords = this.dataClassRecords;
      this.checkAllCheckbox = false;
      this.bulkActionsVisibile = 0;
      this.filterEvent.emit();
    }).catch(() => { });
  }

  bulkDelete = () => {
    const dataElementIdLst = [];
    this.dataClassRecords.forEach(record => {
      if (record.checked) {
        dataElementIdLst.push({
          id: record.id,
          domainType: record.domainType
        });
      }
    });
    const promise = new Promise((resolve, reject) => {
      const dialog = this.dialog.open(BulkDeleteModalComponent, {
        data: { dataElementIdLst, parentDataModel: this.parentDataModel, parentDataClass: this.parentDataClass },
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
    promise.then(() => {
      this.dataClassRecords.forEach(x => (x.checked = false));
      this.dataClassRecords = this.dataClassRecords;
      this.checkAllCheckbox = false;
      this.bulkActionsVisibile = 0;
      this.filterEvent.emit();
    }).catch(() => { });
  };
}

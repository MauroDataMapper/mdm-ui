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
import { Component, Input, ViewChildren, ViewChild, AfterViewInit, ElementRef, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { MatDialog } from '@angular/material/dialog';
import { BulkEditModalComponent } from '@mdm/modals/bulk-edit-modal/bulk-edit-modal.component';
import { BulkDeleteModalComponent } from '@mdm/modals/bulk-delete-modal/bulk-delete-modal.component';

@Component({
  selector: 'mdm-elements-table',
  templateUrl: './elements-table.component.html',
  styleUrls: ['./elements-table.component.sass']
})
export class ElementsTableComponent implements AfterViewInit {
  @Input() parentDataModel: any;
  @Input() grandParentDataClass: any;
  @Input() parentDataClass: any;
  @Input() loadingData: any;
  @Input() isEditable: any;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

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
  filter: {};
  deleteInProgress: boolean;
  bulkActionsVisible = 0;

  constructor(
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService,
    private changeRef: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }
  ngAfterViewInit() {
    if (this.isEditable && !this.parentDataModel.finalised) {
      this.displayedColumns = ['name', 'description', 'multiplicity', 'checkbox'];
    } else {
      this.displayedColumns = ['name', 'description', 'multiplicity'];
    }
    this.changeRef.detectChanges();
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      return this.contentFetch(this.paginator.pageSize, this.paginator.pageOffset, this.sort.active, this.sort.direction, this.filter);
    }), map((data: any) => {
      this.totalItemCount = data.body.count;
      this.isLoadingResults = false;
      return data.body.items;
    }), catchError(() => {
      this.isLoadingResults = false;
      return [];
    })
    ).subscribe(data => {
      this.records = data;
    });
    this.changeRef.detectChanges();
  }

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
      parentDataClassId: this.parentDataClass
        ? this.parentDataClass.id
        : null,
      grandParentDataClassId: this.grandParentDataClass.id
    }, null);
  };

  addDataElement = () => {
    this.stateHandler.Go('newDataElement', {
      parentDataModelId: this.parentDataModel.id,
      parentDataClassId: this.parentDataClass
        ? this.parentDataClass.id
        : null,
      grandParentDataClassId: this.grandParentDataClass.id
    }, null);
  };

  refreshGrid = () => {
    this.filterEvent.emit();
  };

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

  contentFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?): Observable<any> {
    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType
    };

    if (filters) {
      Object.keys(filters).map(key => {
        options[key] = filters[key];
      });
    }

    return this.resources.dataClass.content(this.parentDataModel.id, this.parentDataClass.id, options);
  }

  onChecked = () => {
    this.records.forEach(x => (x.checked = this.checkAllCheckbox));
    this.listChecked();
  };

  toggleDelete = (record) => {
    this.records.forEach(x => (x.checked = false));
    this.bulkActionsVisible = 0;
    record.checked = true;
    this.bulkEdit();
  };
  toggleEdit = (record) => {
    this.records.forEach(x => (x.checked = false));
    this.bulkActionsVisible = 0;
    record.checked = true;
    this.bulkDelete();
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

  bulkEdit = () => {
    const dataElementIdLst = [];
    this.records.forEach(record => {
      if (record.checked) {
        dataElementIdLst.push({
          id: record.id,
          domainType: record.domainType
        });
      }
    });
    const promise = new Promise<void>((resolve, reject) => {
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
      this.records.forEach(x => (x.checked = false));
      // this.records = this.records;
      this.checkAllCheckbox = false;
      this.bulkActionsVisible = 0;
      this.filterEvent.emit();
    }).catch(() =>  console.warn('error') );
  };

  bulkDelete = () => {
    const dataElementIdLst = [];
    this.records.forEach(record => {
      if (record.checked) {
        dataElementIdLst.push({
          id: record.id,
          domainType: record.domainType
        });
      }
    });
    const promise = new Promise<void>((resolve, reject) => {
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
      this.records.forEach(x => (x.checked = false));
      // this.records = this.records;
      this.checkAllCheckbox = false;
      this.bulkActionsVisible = 0;
      this.filterEvent.emit();
    }).catch(() => console.log('error'));
  };
}

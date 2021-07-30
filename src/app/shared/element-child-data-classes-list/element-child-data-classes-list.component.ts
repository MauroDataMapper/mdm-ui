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
  ChangeDetectorRef,
  OnInit,
  Output
} from '@angular/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { MatDialog } from '@angular/material/dialog';
import { BulkDeleteModalComponent } from '@mdm/modals/bulk-delete-modal/bulk-delete-modal.component';
import { GridService } from '@mdm/services/grid.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTable } from '@angular/material/table';
import { MessageHandlerService } from '@mdm/services';
import { DataClass } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-element-child-data-classes-list',
  templateUrl: './element-child-data-classes-list.component.html',
  styleUrls: ['./element-child-data-classes-list.component.sass']
})
export class ElementChildDataClassesListComponent implements AfterViewInit, OnInit {
  @Input() parentDataModel: any;
  @Input() parentDataClass: any;
  @Input() mcDataClass: any;
  @Input() type: any;
  @Input() childDataClasses: any;
  @Input() isEditable: any;
  @Output() totalCount = new EventEmitter<string>();

  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  processing: boolean;
  failCount: number;
  total: number;
  showStaticRecords: any;
  dataSource: any;
  records: any[] = [];
  hideFilters = true;
  displayedColumns: string[];
  loading: boolean;
  totalItemCount = 0;
  isLoadingResults = true;
  filterEvent = new EventEmitter<any>();
  filter: {};
  deleteInProgress: boolean;
  checkAllCheckbox = false;
  bulkActionsVisible = 0;

  constructor(
    private changeRef: ChangeDetectorRef,
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService,
    private dialog: MatDialog,
    private gridService: GridService,
    private messageHandler: MessageHandlerService,
  ) { }

  ngOnInit(): void {
    if (this.isEditable && !this.parentDataModel.finalised) {
      this.displayedColumns = ['checkbox', 'name', 'description', 'multiplicity', 'actions'];
    } else {
      this.displayedColumns = ['name', 'description', 'multiplicity'];
    }
  }

  ngAfterViewInit() {
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      this.changeRef.detectChanges();
      return this.dataClassesFetch(this.paginator.pageSize, this.paginator.pageOffset, this.filter);
    }), map((data: any) => {
      this.totalItemCount = data.body.count;
      this.totalCount.emit(String(data.body.count));
      this.isLoadingResults = false;
      this.changeRef.detectChanges();
      return data.body.items;
    }), catchError(() => {
      this.isLoadingResults = false;
      this.changeRef.detectChanges();
      return [];
    })).subscribe(data => {
      this.records = data;
    });
  }

  addDataClass = () => {
    this.stateHandler.Go('newDataClass', { parentDataModelId: this.parentDataModel.id, parentDataClassId: this.parentDataClass ? this.parentDataClass.id : null }, null);
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

  dataClassesFetch(pageSize?, pageIndex?, filters?): Observable<any> {
    const sortBy = 'idx';
    const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, filters);

    if (!this.parentDataClass.id) {
      return this.resources.dataClass.list(this.parentDataModel.id, options);
    }
    return this.resources.dataClass.listChildDataClasses(this.parentDataModel.id, this.parentDataClass.id, options);
  }

  onChecked = () => {
    this.records.forEach(x => (x.checked = this.checkAllCheckbox));
    this.listChecked();
  };

  toggleDelete = (record) => {
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

  bulkDelete() {
    const dataElementIdLst = this.records.filter(record => record.checked === true);

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
    }).catch(() => console.warn('error'));
  };

  // Drag and drop
  dropTable(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.records, event.previousIndex, event.currentIndex);
    const prevRec = this.records[event.currentIndex];
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
      this.resources.dataClass.update(this.parentDataModel.id, item.data.id, resource).subscribe(() => {
        this.messageHandler.showSuccess('Data Class reordered successfully.');
      }, error => {
        this.messageHandler.showError('There was a problem updating the Data Class.', error);
      });
    } else {
      this.resources.dataClass.updateChildDataClass(this.parentDataModel.id, this.parentDataClass.id, item.data.id, resource).subscribe(() => {
        this.messageHandler.showSuccess('Data Class reordered successfully.');
      }, error => {
        this.messageHandler.showError('There was a problem updating the Data Class.', error);
      });
    }
  };
}

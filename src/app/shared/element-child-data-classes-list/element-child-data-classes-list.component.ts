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
  Input,
  ViewChildren,
  ViewChild,
  AfterViewInit,
  ElementRef,
  EventEmitter,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { merge, Observable, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';

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

  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  processing: boolean;
  failCount: number;
  total: number;

  showStaticRecords: any;

  records: any[] = [];

  hideFilters = true;
  displayedColumns: string[];
  loading: boolean;
  totalItemCount = 0;
  isLoadingResults: boolean;
  filterEvent = new EventEmitter<string>();
  filter: string;
  deleteInProgress: boolean;

  checkAllCheckbox = false;

  constructor(
    private changeRef: ChangeDetectorRef,
    private messageHandler: MessageHandlerService,
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService
  ) {}

  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    if (this.parentDataModel.editable && !this.parentDataModel.finalised) {
      this.displayedColumns = ['checkbox', 'label', 'name', 'description'];
    } else {
      this.displayedColumns = ['label', 'name', 'description'];
    }
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
          this.isLoadingResults = true;
          this.changeRef.detectChanges();

          return this.dataClassesFetch(
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
  }

  openEdit = dataClass => {
    if (!dataClass || (dataClass && !dataClass.id)) {
      return '';
    }
    this.stateHandler.NewWindow('dataClass', { dataModelId: this.parentDataModel.id, dataClassId: this.parentDataClass ? this.parentDataClass.id : null, id: dataClass.id}, null);
  };

  add = () => {
    this.stateHandler.Go('newDataClass', { parentDataModelId: this.parentDataModel.id, parentDataClassId: this.parentDataClass ? this.parentDataClass.id : null }, null );
  };

  deleteRows = () => {
    this.processing = true;
    this.failCount = 0;
    this.total = 0;

    const chain: any[] = [];
    this.records.forEach(record => {
      if (record.checked !== true) {
        return;
      }
      this.total++;
      chain.push(
        this.resources.dataClass
          .delete(record.dataModel, record.parentDataClass, record.id)
          .catch(() => {
            this.failCount++;
          })
      );
    });

    forkJoin(chain).subscribe(
      () => {
        this.processing = false;
        if (this.failCount === 0) {
          this.messageHandler.showSuccess(
            this.total + ' Elements deleted successfully'
          );
        } else {
          const successCount = this.total - this.failCount;
          let message = '';
          if (successCount !== 0) {
            message += successCount + ' Elements deleted successfully.<br>';
          }
          if (this.failCount > 0) {
            message +=
              'There was a problem deleting ' + this.failCount + ' elements.';
          }

          if (this.failCount > 0) {
            this.messageHandler.showError(message, null);
          } else {
            this.messageHandler.showSuccess(message);
          }
        }

        this.filterEvent.emit();
        this.deleteInProgress = false;
      },
      error => {
        this.processing = false;
        this.messageHandler.showError(
          'There was a problem deleting the elements.',
          error
        );
      }
    );
  };

  applyFilter = () => {
    let filter: any = '';
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;

      if (value !== '') {
        filter += name + '=' + value;
      }
    });
    this.filter = filter;
    this.filterEvent.emit(filter);
  };

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  dataClassesFetch(
    pageSize?,
    pageIndex?,
    sortBy?,
    sortType?,
    filters?
  ): Observable<any> {
    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };

    if (!this.parentDataClass.id) {
      return this.resources.dataModel.get(
        this.parentDataModel.id,
        'dataClasses',
        options
      );
    }

    return this.resources.dataClass.get(
      this.parentDataModel.id,
      null,
      this.parentDataClass.id,
      'dataClasses',
      options
    );
  }

  onChecked = () => {
    this.records.forEach(x => (x.checked = this.checkAllCheckbox));
  }
}

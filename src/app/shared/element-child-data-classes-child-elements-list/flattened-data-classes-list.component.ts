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
import { MatSort, SortDirection } from '@angular/material/sort';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { MatDialog } from '@angular/material/dialog';
import { GridService } from '@mdm/services/grid.service';
import { MessageHandlerService } from '@mdm/services';
import { DataClass, DataModel } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-flattened-data-classes-list',
  templateUrl: './flattened-data-classes-list.component.html',
  styleUrls: ['./flattened-data-classes-list.component.scss']
})
export class FlattenedDataClassesComponent implements AfterViewInit, OnInit {
  @Input() parentDataModel: DataModel;
  @Input() parentDataClass: DataClass;
  @Input() type: any;
  @Input() childDataClasses: DataClass[];
  @Input() isEditable: boolean;
  @Output() totalCount = new EventEmitter<string>();

  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  total: number;
  records: any[] = [];
  hideFilters = true;
  displayedColumns: string[];
  loading: boolean;
  totalItemCount = 0;
  isLoadingResults = true;
  filterEvent = new EventEmitter<any>();
  filter: {};

  constructor(
    private changeRef: ChangeDetectorRef,
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService,
    private dialog: MatDialog,
    private gridService: GridService,
    private messageHandler: MessageHandlerService,
  ) { }

  ngOnInit(): void {
      this.displayedColumns = ['element', 'dataclass',  'description'];
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.paginator.page, this.filterEvent, this.sort.sortChange).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      this.changeRef.detectChanges();
      return this.flattenedElementsFetch(this.paginator.pageSize, this.paginator.pageOffset, this.filter, this.sort.active, this.sort.direction);
    }), map((data: any) => {
      this.totalItemCount = data.count;
      this.totalCount.emit(String(data.count));
      this.isLoadingResults = false;
      this.changeRef.detectChanges();
      return data.items;
    }), catchError((error) => {
      console.error('An error occurred:', error);
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

  flattenedElementsFetch(pageSize?, pageIndex?, filters?, sortBy?: string,
    sortType?: SortDirection): Observable<any> {
    const elementOptions = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, filters);
    const dataClassOptions  = this.gridService.constructOptions();
    return this.resources.dataModel.dataElements(this.parentDataModel.id, elementOptions).pipe(
      switchMap((dataElements: any) => {
        return this.resources.dataClass.all(this.parentDataModel.id, dataClassOptions).pipe(
          map((dataClasses: any) => {
            const updatedDataElements = dataElements.body.items.map(de => {
              const dataClass = dataClasses.body.items.find(dc => dc.id === de.dataClass);
              if (dataClass) {
                de.dataClassObject = dataClass;
              }
              return de;
            });

            return {count: updatedDataElements.length, items: updatedDataElements};
          })
        );
      })
    );
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

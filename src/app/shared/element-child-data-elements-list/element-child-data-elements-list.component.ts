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
  Output,
  EventEmitter,
  ViewChildren,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService } from '@mdm/services/grid.service';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTable } from '@angular/material/table';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { DataElement } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-element-child-data-elements-list',
  templateUrl: './element-child-data-elements-list.component.html',
  styleUrls: ['./element-child-data-elements-list.component.scss']
})
export class ElementChildDataElementsListComponent implements AfterViewInit {
  @Input() parentDataModel: any;
  @Input() parentDataClass: any;
  @Input() parentDataType: any;
  @Input() type: any; // static, dynamic

  @Input() childDataElements: any; // used when type='static'
  @Input() loadingData: any; // used when type='static'

  @Input() clientSide: boolean; // if true, it should NOT pass values to the serve in save/update/delete
  @Output() afterSave = new EventEmitter<any>();

  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  filterEvent = new EventEmitter<string>();
  filter: string;
  isLoadingResults: boolean;
  records: any[];
  totalItemCount = 0;
  hideFilters = true;
  displayedColumns = ['name', 'description', 'multiplicity'];

  constructor(
    private gridSvc: GridService,
    private changeRef: ChangeDetectorRef,
    private resources: MdmResourcesService,
    private gridService: GridService,
    private messageHandler: MessageHandlerService
  ) { }


  ngAfterViewInit() {
    if (this.type === 'dynamic') {
      this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));
      this.gridSvc.reloadEvent.subscribe(filter => (this.filter = filter));
      merge(this.paginator.page, this.filterEvent, this.gridSvc.reloadEvent).pipe(startWith({}), switchMap(() => {
        this.isLoadingResults = true;
        return this.dataElementsFetch(this.paginator.pageSize, this.paginator.pageOffset, this.filter);
      }), map((data: any) => {
        this.totalItemCount = data.body.count;
        this.isLoadingResults = false;
        this.changeRef.detectChanges();
        return data.body.items;
      }), catchError(() => {
        this.isLoadingResults = false;
        this.changeRef.detectChanges();
        return [];
      })).subscribe(data => {
        this.records = data;
        this.changeRef.detectChanges();
      });
    }
    if (this.type === 'static') {
      this.isLoadingResults = true;
      this.records = [];
    }
  }

  dataElementsFetch(pageSize?, pageIndex?, filters?) {
    const sortBy = 'idx';
    const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, filters);

    if (this.parentDataModel && this.parentDataClass) {
      return this.resources.dataElement.list(this.parentDataModel.id, this.parentDataClass.id, options);
    } else if (this.parentDataModel && this.parentDataType) {
      return this.resources.dataElement.listWithDataType(this.parentDataModel.id, this.parentDataType.id, options);
    }
  }

  showStaticRecords = () => {
    if (this.childDataElements && this.type === 'static') {
      this.records = [].concat(this.childDataElements.items);
    }
  };

  // Drag and drop
  dropDataElements(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.records, event.previousIndex, event.currentIndex);
    const prevRec = this.records[event.currentIndex];
    if (prevRec === undefined) {
      return;
    }
    this.updateDataElementsOrder(event.item, event.currentIndex);
    this.table.renderRows();
  }

  updateDataElementsOrder(item, newPosition) {
    const resource: DataElement = {
      ...item,
      index: newPosition
    };

    this.resources.dataElement.update(this.parentDataModel.id, item.data.dataClass, item.data.id, resource).subscribe(() => {
      this.messageHandler.showSuccess('Data Element reorderedsuccessfully.');
    }, error => {
      this.messageHandler.showError('There was a problem updating the Data Element.', error);
    });
  };
}

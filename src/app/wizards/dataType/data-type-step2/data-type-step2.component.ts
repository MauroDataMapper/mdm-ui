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
  OnInit,
  ElementRef,
  ViewChildren,
  ViewChild,
  EventEmitter,
  Input,
  QueryList,
  ChangeDetectorRef,
  AfterViewInit, OnDestroy
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription, merge } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GridService } from '@mdm/services/grid.service';
import { CreateType } from '@mdm/wizards/wizards.model';
import { DataModel, DataType } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-data-type-step2',
  templateUrl: './data-type-step2.component.html',
  styleUrls: ['./data-type-step2.component.sass']
})
export class DataTypeStep2Component implements OnInit, AfterViewInit, OnDestroy {
  @Input() parent;
  @ViewChild('myForm', { static: false }) myForm: NgForm;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  successCount: number;
  failCount = 0;
  totalItemCount = 0;
  totalSelectedItemsCount: number;
  filter: object;
  step: {
    invalid : boolean;
    isProcessComplete : boolean;
    scope : {
       model: {
        [key: string]: any;
        createType: CreateType;
        selectedDataTypes: Array<any>;
        parent:DataModel;
        copyFromDataModel: Array<DataModel>;
      };
    };
  };
  model: {
    [key: string]: any;
    createType: CreateType;
    selectedDataTypes: Array<any>;
    parent:DataModel;
    copyFromDataModel: Array<DataModel>;
  };
  scope: any;
  defaultCheckedMap: any;
  loaded = false;
  isLoadingResults: boolean;
  checkAllCheckbox = false;
  isAllChecked = true;
  hideFilters = true;
  hideFiltersSelectedDataTypes = true;
  processing = false;
  isProcessComplete = false;
  recordsDataTypes: any[] = [];
  displayedColumnsDataTypes: string[];
  displayedColumnsSelectedDataTypes: string[];
  recordsSelectedDataTypes: any[] = [];
  allDataTypes;
  finalResult = {};
  dataSourceSelectedDataTypes = new MatTableDataSource<any>();
  dataSourceDataTypes = new MatTableDataSource<any>();
  formChangesSubscription: Subscription;
  parentScopeHandler: any;
  filterEvent = new EventEmitter<any>();

  pageSize = 20;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private resourceService: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private changeRef: ChangeDetectorRef,
    private elementTypes: ElementTypesService,
    private gridService: GridService
  ) {
    this.dataSourceDataTypes = new MatTableDataSource(this.recordsDataTypes);

    this.allDataTypes = this.elementTypes.getAllDataTypesArray();

    const settings = JSON.parse(localStorage.getItem('userSettings'));
    if (settings) {
      this.pageSize = settings.countPerTable;
      this.pageSizeOptions = settings.counts;
    }
  }

  ngOnInit() {
    this.model = this.step.scope.model;
    this.scope = this.step.scope;
    this.model.selectedDataTypes = [];
    this.dataSourceSelectedDataTypes = new MatTableDataSource<any>(
      this.model.selectedDataTypes
    );
  }

  validationStatusEmitter($event : string) {
    this.step.invalid = JSON.parse($event);
  }

  ngAfterViewInit() {
    this.formChangesSubscription = this.myForm.form.valueChanges.subscribe(x => {
      this.validate(x);
    });
  }

  // When sorting makes a backend calls we loose the selected datatypes.
  // We need to keep the selected ones and recheck them after each backend call
  dataTypesFetch(pageSize, pageIndex, sortBy, sortType, filters) {
    const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, filters);

    return this.resourceService.dataType.list(this.model.copyFromDataModel[0].id, options);
  }

  onLoad() {
    this.displayedColumnsDataTypes = ['checkbox', 'label', 'description', 'domainType'];
    this.displayedColumnsSelectedDataTypes = ['label', 'description', 'domainType', 'status'];

    if (this.sort !== null && this.sort !== undefined && this.sort.toArray().length > 0 && this.paginator !== null && this.paginator !== undefined && this.paginator.toArray().length > 0) {
      this.sort.toArray()[0].sortChange.subscribe(() => (this.paginator.toArray()[0].pageIndex = 0));
      this.filterEvent.subscribe(() => (this.paginator.toArray()[0].pageIndex = 0));

      this.dataSourceDataTypes.sort = this.sort.toArray()[0];

      // Selected Data Types table
      if (this.sort !== null && this.sort !== undefined && this.sort.length > 1 && this.paginator !== null && this.paginator !== undefined && this.paginator.length > 1) {
        merge(this.sort.toArray()[0].sortChange, this.paginator.toArray()[0].page, this.filterEvent).pipe(startWith({}), switchMap(() => {
          this.isLoadingResults = true;

          return this.dataTypesFetch(
            this.paginator.toArray()[0].pageSize,
            this.paginator.toArray()[0].pageIndex * this.paginator.toArray()[0].pageSize,
            this.sort.toArray()[0].active,
            this.sort.toArray()[0].direction,
            this.filter
          );
        }),
          map((data: any) => {
            this.totalItemCount = data.body.count;
            this.isLoadingResults = false;
            return data.body.items;
          }),
          catchError(() => {
            this.isLoadingResults = false;
            return [];
          })
        ).subscribe(data => {
          this.recordsDataTypes = data;
          this.dataSourceDataTypes.data = this.recordsDataTypes;

          // Sorting/paging is making a backend call and looses the checked checkboxes
          if (this.model.selectedDataTypes != null && this.model.selectedDataTypes.length > 0) {
            this.reCheckSelectedDataTypes();
          }
        });
      }
      this.validate();
      this.loaded = true;
    }
  }

  reCheckSelectedDataTypes() {
    let currentPageSelectedItemsNum = 0;

    this.model.selectedDataTypes.forEach((sdt: any) => {
      const currentId = sdt.id;
      const item = this.recordsDataTypes.find(r => r.id === currentId);
      if (item !== null && item !== undefined) {
        item.checked = true;
      }

      // Count how many records are selected in the CURRENT page
      if (item && item.checked) {
        currentPageSelectedItemsNum++;
      }
    });

    // If all the records on the current page are selected, check the "Check All" checkbox
    if (currentPageSelectedItemsNum === this.paginator.toArray()[0].pageSize) {
      this.isAllChecked = true;
    } else {
      this.isAllChecked = false;
    }
  }

  createSelectedArray = () => {
    this.model.selectedDataTypes = [];
    for (const id in this.model.selectedDataTypesMap) {
      if (this.model.selectedDataTypesMap.hasOwnProperty(id)) {
        const element = this.model.selectedDataTypesMap[id];
        this.model.selectedDataTypes.push(element.node);
      }
    }
  };

  onCheckAll = () => {
    this.recordsDataTypes.forEach(element => {
      element.checked = this.checkAllCheckbox;

      if (this.checkAllCheckbox) {
        this.model.selectedDataTypes.push(element);
      } else {
        const currentId = element.id;
        const index = this.model.selectedDataTypes.findIndex(r => r.id === currentId);
        if (index !== -1) {
          this.model.selectedDataTypes.splice(index, 1);
        }
      }
    });

    this.validate();

    this.dataSourceSelectedDataTypes.data = this.model.selectedDataTypes;
    this.totalSelectedItemsCount = this.model.selectedDataTypes.length;
  };

  onCheck(record) {
    if (record.checked) {
      this.model.selectedDataTypes.push(record);
    } else {
      const index = this.model.selectedDataTypes.findIndex((r) => {
        return r.id === record.id;
      });

      if (index !== -1) {
        this.model.selectedDataTypes.splice(index, 1);
      }
    }
    this.validate();
    this.dataSourceSelectedDataTypes.data = this.model.selectedDataTypes;
    this.totalSelectedItemsCount = this.model.selectedDataTypes.length;
  }

  validate = (newValue?) => {
    let invalid = false;

    if (this.model.createType === 'new') {
      if (newValue) {
        if (!this.model.isValid) {
          invalid = false;
        }
        // Check Mandatory fields
        if (!newValue.label || newValue.label.trim().length === 0) {
          this.step.invalid = true;
          return;
        }
      }
      invalid = true;
    }
    if (['copy', 'import'].includes(this.model.createType)) {
      if (this.model.selectedDataTypes !== null && this.model.selectedDataTypes !== undefined && this.model.selectedDataTypes.length === 0) {
        this.step.invalid = true;
        this.changeRef.detectChanges();
        return;
      }
    }

    this.step.invalid = invalid;
    this.changeRef.detectChanges();
  };

  ngOnDestroy() {
    this.formChangesSubscription.unsubscribe();
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

  // Gets the selected value of a dropdown and adds it to the filter string
  applyMatSelectFilter() {
    this.applyFilter();
  }

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  filterClickSelectedDataTypes = () => {
    this.hideFiltersSelectedDataTypes = !this.hideFiltersSelectedDataTypes;
  };

  saveCopiedDataTypes = () => {
    this.processing = true;
    this.isProcessComplete = false;
    let promise = Promise.resolve();
    this.model.selectedDataTypes.forEach((dc: DataType) => {
      promise = promise.then((result: any) => {
        this.successCount++;
        this.finalResult[dc.id] = { result, hasError: false };
        switch(this.model.createType) {
          case 'copy': return this.resourceService.dataType.copyDataType(this.model.parent.id, dc.model, dc.id, null).toPromise();
          case 'import': return this.resourceService.dataModel.importDataType(this.model.parent.id, dc.model, dc.id, null).toPromise();
        }
      }).catch(error => {
        this.failCount++;
        const errorText = this.messageHandler.getErrorText(error);
        this.finalResult[dc.id] = { result: errorText, hasError: true };
      });
    });

    promise.then(() => {
      this.processing = false;
      this.step.isProcessComplete = true;
      this.model.isProcessComplete = true;
    }).catch(() => {
      this.processing = false;
      this.step.isProcessComplete = true;
      this.model.isProcessComplete = true;
    });
  };
}

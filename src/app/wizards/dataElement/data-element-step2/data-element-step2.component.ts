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
  ElementRef,
  EventEmitter,
  OnInit,
  ViewChild,
  ViewChildren,
  ChangeDetectorRef,
  QueryList, AfterViewInit, OnDestroy
} from '@angular/core';
import { merge, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ValidatorService } from '@mdm/services/validator.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { McSelectPagination } from '@mdm/utility/mc-select/mc-select.component';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { GridService } from '@mdm/services/grid.service';
import { CreateType } from '@mdm/wizards/wizards.model';
import { DataClass, DataModel } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-data-element-step2',
  templateUrl: './data-element-step2.component.html',
  styleUrls: ['./data-element-step2.component.sass']
})
export class DataElementStep2Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild('myForm', { static: false }) myForm: NgForm;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  step: any;
  model: {
    [key: string]: any;
    createType: CreateType;
    selectedDataTypes: Array<any>;
    parent:DataModel;
    copyFromDataModel: Array<DataModel>;
    copyFromDataClass: Array<DataClass>;
  };
  multiplicityError: any;
  selectedDataClassesStr = '';
  defaultCheckedMap: any;
  loaded = false;
  error = '';
  dataTypeErrors = '';
  processing = false;
  parentScopeHandler: any;
  hideFiltersSelectedDataTypes = true;
  totalItemCount = 0;
  isLoadingResults: boolean;
  isProcessComplete = false;
  finalResult = {};
  failCount = 0;
  successCount = 0;
  formChangesSubscription: Subscription;


  dataSourceSelectedDataElements = new MatTableDataSource<any>();
  dataSourceDataElements = new MatTableDataSource<any>();
  filterEvent = new EventEmitter<any>();
  filter: {};
  hideFilters = true;
  displayedColumns = ['name', 'description', 'status'];
  pagination: McSelectPagination;
  dataSource: any;
  displayedColumnsDataTypes: string[];
  displayedColumnsSelectedDataTypes: string[];

  recordsDataElements: any[] = [];
  isAllChecked = true;
  checkAllCheckbox = false;
  totalSelectedItemsCount = 0;
  pageSize = 20;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private changeRef: ChangeDetectorRef,
    private gridService: GridService,
    private validator: ValidatorService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private broadcast: BroadcastService) {

    this.dataSourceDataElements = new MatTableDataSource(this.recordsDataElements);
    const settings = JSON.parse(localStorage.getItem('userSettings'));
    if (settings) {
      this.pageSize = settings.countPerTable;
      this.pageSizeOptions = settings.counts;
    }
  }

  ngOnInit() {
    this.model = this.step.scope.model;
    this.dataSourceSelectedDataElements = new MatTableDataSource<any>(this.model.selectedDataTypes);
  }

  ngAfterViewInit() {
    this.formChangesSubscription = this.myForm?.form.valueChanges.subscribe(x => {
      this.validate(x);
    });
  }

  dataElementsFetch(pageSize, pageIndex, sortBy, sortType, filters) {
    const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, filters);
    const dataClass : DataClass = this.model.copyFromDataClass[0];
    return this.resources.dataElement.list(dataClass.model, dataClass.id, options);
  }

  onLoad() {
    this.defaultCheckedMap = this.model.selectedDataClassesMap;

    if (this.model.selectedDataClassesMap) {
      this.createSelectedArray();
      this.validate();
    }

    this.loaded = true;
    this.displayedColumnsDataTypes = ['checkbox', 'label', 'description', 'domainType'];
    this.displayedColumnsSelectedDataTypes = ['label', 'description', 'domainType', 'status'];

    if (this.sort !== null && this.sort !== undefined && this.sort.toArray().length > 0 && this.paginator !== null && this.paginator !== undefined && this.paginator.toArray().length > 0) {
      this.sort.toArray()[0].sortChange.subscribe(() => (this.paginator.toArray()[0].pageIndex = 0));
      this.filterEvent.subscribe(() => (this.paginator.toArray()[0].pageIndex = 0));
      this.dataSourceDataElements.sort = this.sort.toArray()[0];
      this.dataSourceSelectedDataElements.paginator = this.paginator.toArray()[1];

      if (this.sort != null && this.sort !== undefined && this.sort.length > 0 && this.paginator != null && this.paginator !== undefined && this.paginator.length > 0) {
        merge(this.sort.toArray()[0].sortChange, this.paginator.toArray()[0].page, this.filterEvent).pipe(startWith({}), switchMap(() => {
          this.isLoadingResults = true;
          return this.dataElementsFetch(
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
          })).subscribe(data => {
            this.recordsDataElements = data;
            this.dataSourceDataElements.data = this.recordsDataElements;

            // Sorting/paging is making a backend call and looses the checked checkboxes
            if (this.model.selectedDataElements != null && this.model.selectedDataElements.length > 0) {
              this.reCheckSelectedDataElements();
            }
          });
      }

      this.validate();
      this.loaded = true;
    }
  }

  reCheckSelectedDataElements() {
    let currentPageSelectedItemsNum = 0;
    this.model.selectedDataElements.forEach((sdt: any) => {
      const currentId = sdt.id;
      const item = this.recordsDataElements.find(r => r.id === currentId);
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

  onCheckAll = () => {
    this.recordsDataElements.forEach(element => {
      element.checked = this.checkAllCheckbox;
      if (this.checkAllCheckbox) {
        this.model.selectedDataElements.push(element);
      } else {
        this.model.selectedDataElements = [];
      }
    });

    this.validate();
    this.dataSourceSelectedDataElements.data = this.model.selectedDataElements;
    this.totalSelectedItemsCount = this.model.selectedDataElements.length;
  };

  onCheck(record) {
    if (record.checked) {
      this.model.selectedDataElements.push(record);
    } else {
      const index = this.model.selectedDataElements.findIndex(r => r.id === record.id);
      if (index !== -1) {
        this.model.selectedDataElements.splice(index, 1);
      }
    }
    this.validate();
    this.dataSourceSelectedDataElements.data = this.model.selectedDataElements;
    this.totalSelectedItemsCount = this.model.selectedDataElements.length;
  }

  toggleShowNewInlineDataType() {
    this.model.showNewInlineDataType = !this.model.showNewInlineDataType;
    this.error = '';
    this.dataTypeErrors = '';
  }

  createSelectedArray = () => {
    this.model.selectedDataClasses = [];
    for (const id in this.model.selectedDataClassesMap) {
      if (this.model.selectedDataClassesMap.hasOwnProperty(id)) {
        const element = this.model.selectedDataClassesMap[id];
        this.model.selectedDataClasses.push(element.node);
      }
    }
  };

  validate = (newValue?) => {
    let invalid = false;
    this.step.invalid = false;
    if (newValue && ['copy', 'import'].includes(this.model.createType)) {
      // check Min/Max
      this.multiplicityError = this.validator.validateMultiplicities(newValue.minMultiplicity, newValue.maxMultiplicity);

      // Check Mandatory fields
      if (!newValue.label || newValue.label.trim().length === 0 || this.multiplicityError) {
        this.step.invalid = true;
        return;
      }
      if (!this.model.showNewInlineDataType && !this.model.dataType) {
        this.step.invalid = true;
        return;
      }
      invalid = this.myForm.invalid;
    }
    if (['copy', 'import'].includes(this.model.createType)) {
      if (this.model.selectedDataElements.length === 0) {
        this.step.invalid = true;
        return;
      }
    }
    this.step.invalid = invalid;
  };

  ngOnDestroy() {
    this.formChangesSubscription.unsubscribe();
  }

  fetchDataTypes = (text, loadAll, offset, limit) => {
    const options = this.gridService.constructOptions(limit, offset, 'label', 'asc', {label: text});

    this.pagination = {
      // tslint:disable-next-line: no-string-literal
      limit: options['limit'],
      // tslint:disable-next-line: no-string-literal
      offset: options['offset']
    };

    this.changeRef.detectChanges();

    if (loadAll) {
      // tslint:disable-next-line: no-string-literal
      delete options['label'];
    }

    return this.resources.dataType.list(this.model.parent.id, options);
  };

  onTargetSelect = (selectedValue) => {
    this.model.dataType = selectedValue;
    this.validate(this.model);
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

  validationStatusEmitter($event) {
    this.step.invalid = JSON.parse($event);
  }

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  filterClickSelectedDataTypes = () => {
    this.hideFiltersSelectedDataTypes = !this.hideFiltersSelectedDataTypes;
  };

  saveCopiedDataClasses = () => {
    this.processing = true;
    this.isProcessComplete = false;
    this.failCount = 0;
    this.successCount = 0;

    let promise = Promise.resolve();

    this.model.selectedDataElements.forEach((dc: any) => {
      promise = promise.then((result: any) => {
        this.successCount++;
        this.finalResult[dc.id] = { result, hasError: false };
        switch (this.model.createType) {
          case 'copy': return this.resources.dataElement.copyDataElement(this.model.parentDataModel.id, this.model.parentDataClass.id, dc.model, dc.dataClass, dc.id, null).toPromise();
          case 'import': return this.resources.dataClass.importDataElement(this.model.parentDataModel.id, this.model.parentDataClass.id, dc.model, dc.dataClass, dc.id, null).toPromise();
        }
      }).catch(error => {
        this.failCount++;
        const errorText = this.messageHandler.getErrorText(error);
        this.finalResult[dc.id] = { result: errorText, hasError: true };
      });
    });

    promise.then(() => {
      this.processing = false;
      this.isProcessComplete = true;
      this.broadcast.reloadCatalogueTree();
    }).catch(() => {
      this.processing = false;
      this.isProcessComplete = true;
    });
  };
}

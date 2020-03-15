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
import { Subscription, Observable, merge } from 'rxjs';
import { ValidatorService } from '../../../services/validator.service';
import { ResourcesService } from '../../../services/resources.service';
import { MessageHandlerService } from '../../../services/utility/message-handler.service';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { ElementTypesService } from '../../../services/element-types.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'mdm-data-type-step2',
  templateUrl: './data-type-step2.component.html',
  styleUrls: ['./data-type-step2.component.sass']
})
export class DataTypeStep2Component implements OnInit, AfterViewInit, OnDestroy {
  @Input('parent') parent;

  successCount: number;
  failCount: number;
  totalItemCount: number;
  totalSelectedItemsCount: number;
  filter: string;
  step: any;
  model: any;
  scope: any;
  defaultCheckedMap: any;
  loaded = false;
  isLoadingResults: boolean;
  checkAllCheckbox = false;
  isAllChecked = true;
  hideFilters = true;
  hideFiltersSelectedDataTypes = true;
  processing = true;
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

  filterEvent = new EventEmitter<string>();

  @ViewChild('myForm', { static: false }) myForm: NgForm;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    private validator: ValidatorService,
    private resourceService: ResourcesService,
    private messageHandler: MessageHandlerService,
    private changeRef: ChangeDetectorRef,

    private elementTypes: ElementTypesService
  ) {
    this.dataSourceDataTypes = new MatTableDataSource(this.recordsDataTypes);

    this.allDataTypes = this.elementTypes.getAllDataTypesArray();
  }

  ngOnInit() {
    this.model = this.step.scope.model;
    this.scope = this.step.scope;
    this.model.selectedDataTypes = [];
    this.step.invalid = true;

    this.dataSourceSelectedDataTypes = new MatTableDataSource<any>(
      this.model.selectedDataTypes
    );
  }

  validationStatusEmitter($event) {
    this.step.invalid = JSON.parse($event);
  }

  ngAfterViewInit() {
    this.formChangesSubscription = this.myForm.form.valueChanges.subscribe(
      x => {
        this.validate(x);
      }
    );
  }
  // When sorting makes a backend calls we loose the selected datatypes.
  // We need to keep the selected ones and recheck them after aech backend call
  dataTypesFetch(pageSize, pageIndex, sortBy, sortType, filters) {
    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };

    return this.resourceService.dataModel.get(
      this.model.copyFromDataModel[0].id,
      'dataTypes',
      options
    );
  }

  onLoad() {
    this.displayedColumnsDataTypes = [
      'checkbox',
      'label',
      'description',
      'domainType'
    ];
    this.displayedColumnsSelectedDataTypes = [
      'label',
      'description',
      'domainType',
      'status'
    ];

    if (
      this.sort !== null &&
      this.sort !== undefined &&
      this.sort.toArray().length > 0 &&
      this.paginator !== null &&
      this.paginator !== undefined &&
      this.paginator.toArray().length > 0
    ) {
      this.sort
        .toArray()[0]
        .sortChange.subscribe(
          () => (this.paginator.toArray()[0].pageIndex = 0)
        );
      this.filterEvent.subscribe(
        () => (this.paginator.toArray()[0].pageIndex = 0)
      );

      this.dataSourceDataTypes.sort = this.sort.toArray()[0];

      // Selected Data Types table
      this.dataSourceSelectedDataTypes.sort = this.sort.toArray()[1];
      this.sort
        .toArray()[1]
        .sortChange.subscribe(
          () => (this.paginator.toArray()[1].pageIndex = 0)
        );
      this.dataSourceSelectedDataTypes.paginator = this.paginator.toArray()[1];

      if (
        this.sort !== null &&
        this.sort !== undefined &&
        this.sort.length > 1 &&
        this.paginator !== null &&
        this.paginator !== undefined &&
        this.paginator.length > 1
      ) {
        merge(
          this.sort.toArray()[0].sortChange,
          this.paginator.toArray()[0].page,
          this.filterEvent
        )
          .pipe(
            startWith({}),
            switchMap(() => {
              this.isLoadingResults = true;

              return this.dataTypesFetch(
                this.paginator.toArray()[0].pageSize,
                this.paginator.toArray()[0].pageIndex,
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
          )
          .subscribe(data => {
            this.recordsDataTypes = data;
            this.dataSourceDataTypes.data = this.recordsDataTypes;

            // Sorting/paging is making a backend call and looses the checked checkboxes
            if (
              this.model.selectedDataTypes != null &&
              this.model.selectedDataTypes.length > 0
            ) {
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
      if (item !== null && item != undefined) {
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
    for (let i = 0; i < this.recordsDataTypes.length; i++) {
      this.recordsDataTypes[i].checked = this.checkAllCheckbox;

      if (this.checkAllCheckbox) {
        this.model.selectedDataTypes.push(this.recordsDataTypes[i]);
      } else {
        const currentId = this.recordsDataTypes[i].id;
        const index = this.model.selectedDataTypes.findIndex(r => r.id === currentId);

        if (index !== -1) {
          this.model.selectedDataTypes.splice(index, 1);
        }
      }
    }

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

      invalid = true; // this.myForm.invalid; - this is false???
    }
    if (this.model.createType === 'copy') {
      if (
        this.model.selectedDataTypes !== null &&
        this.model.selectedDataTypes !== undefined &&
        this.model.selectedDataTypes.length === 0
      ) {
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

  applyFilter = (filterValue?: any, filterName?) => {
    let filter: any = '';
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;

      if (value !== '' && value !== undefined) {
        filter += name + '=' + value + '&';
      }
    });

    if (
      filterValue !== null &&
      filterValue !== undefined &&
      filterName !== null &&
      filterName !== undefined
    ) {
      filter += filterName + '=' + filterValue.id + '&';
    }

    this.filter = filter;
    this.filterEvent.emit(filter);
  };

  // Gets the selected value of a dropdown and adds it to the filter string
  applyMatSelectFilter(filterValue: any, filterName) {
    this.applyFilter(filterValue, filterName);
  }

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  filterClickSelectedDataTypes = () => {
    this.hideFiltersSelectedDataTypes = !this.hideFiltersSelectedDataTypes;
  };

  async saveCopiedDataTypes() {
    this.processing = true;
    this.isProcessComplete = false;

    this.model.selectedDataTypes.forEach(async (dt: any) => {
      const action = 'dataTypes/' + dt.dataModel + '/' + dt.id;

      await this.resourceService.dataModel
        .post(this.model.parent.id, action, null)
        .toPromise()
        .then(
          result => {
            if (result) {
              this.successCount++;
              this.finalResult[dt.id] = {
                result: result.body,
                hasError: false
              };
            } else {
              this.failCount++;
              const errorText = '';
              this.finalResult[dt.id] = { result: errorText, hasError: true };
            }
          },
          error => {
            this.failCount++;
            const errorText = this.messageHandler.getErrorText(error);
            this.finalResult[dt.id] = { result: errorText, hasError: true };
          }
        );
    });
  }
}

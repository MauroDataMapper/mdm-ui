import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  ViewChild,
  ViewChildren,
  ChangeDetectorRef,
  QueryList
} from '@angular/core';
import {merge, Subscription} from 'rxjs';
import {NgForm} from '@angular/forms';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {ValidatorService} from '../../../services/validator.service';
import { ResourcesService } from '../../../services/resources.service';
import { McSelectPagination } from '../../../utility/mc-select/mc-select.component';
import {MatTableDataSource} from '@angular/material/table';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {MessageHandlerService} from '../../../services/utility/message-handler.service';

@Component({
  selector: 'app-data-element-step2',
  templateUrl: './data-element-step2.component.html',
  styleUrls: ['./data-element-step2.component.sass']
})
export class DataElementStep2Component implements OnInit {

  // constructor() { }

  // ngOnInit() {
  //
  //   this.model = this.step.scope.model;
  // }

  step: any;
  model: any;
  multiplicityError: any;
  selectedDataClassesStr = '';
  defaultCheckedMap: any;
  loaded = false;
  // showNewInlineDataType = false;
  error = '';
  dataTypeErrors = '';
  record: any; // TODO
  processing = false;
  failCount: any; // TODO
  parentScopeHandler: any;
  hideFiltersSelectedDataTypes = true;
  totalItemCount: number;
  isLoadingResults: boolean;
  isProcessComplete = false;
  finalResult = {};
  successCount: number;
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  formChangesSubscription: Subscription;

  @ViewChild('myForm', { static: false }) myForm: NgForm;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  // @ViewChild(MatSort, { static: false }) sort: MatSort;
  // @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  dataSourceSelectedDataElements = new MatTableDataSource<any>();
  dataSourceDataElements = new MatTableDataSource<any>();
  filterEvent = new EventEmitter<string>();
  filter: string;
  hideFilters = true;
  displayedColumns = ['name', 'description', 'status'];
  pagination: McSelectPagination;
  dataSource: any;
  displayedColumnsDataTypes: string[];
  displayedColumnsSelectedDataTypes: string[];
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  recordsDataElements: any[] = [];
  isAllChecked = true;
  checkAllCheckbox = false;
  totalSelectedItemsCount: number;

  constructor(private changeRef: ChangeDetectorRef, private validator: ValidatorService, private resources: ResourcesService, private messageHandler: MessageHandlerService) {

    this.dataSourceDataElements = new MatTableDataSource(this.recordsDataElements);
  }

  ngOnInit() {

    this.model = this.step.scope.model;
    this.dataSourceSelectedDataElements = new MatTableDataSource<any>(
      this.model.selectedDataTypes
    );
  }

  ngAfterViewInit() {

    this.formChangesSubscription = this.myForm.form.valueChanges.subscribe(x => {
      this.validate(x);
      // this.step.invalid = this.myForm.invalid;
      // this.validateDataType();
    });


  }

  dataElementsFetch(pageSize, pageIndex, sortBy, sortType, filters) {

    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };

    const dataClass = this.model.copyFromDataClass[0];
    return this.resources.dataClass.get(dataClass.dataModel, null , dataClass.id, 'dataElements', options);
  }
  onLoad() {

    this.defaultCheckedMap = this.model.selectedDataClassesMap;

    if (this.model.selectedDataClassesMap) {
      this.createSelectedArray();
      this.validate();
    }

    this.loaded = true;
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
      this.sort != null &&
      this.sort != undefined &&
      this.sort.toArray().length > 0 &&
      this.paginator != null &&
      this.paginator != undefined &&
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

      this.dataSourceDataElements.sort = this.sort.toArray()[0];

      // Selected Data Elements table
     // this.dataSourceSelectedDataTypes.sort = this.sort.toArray()[1];
      // this.sort
      //   .toArray()[1]
      //   .sortChange.subscribe(
      //   () => (this.paginator.toArray()[1].pageIndex = 0)
      // );
      this.dataSourceSelectedDataElements.paginator = this.paginator.toArray()[1];

      if (
        this.sort != null &&
        this.sort != undefined &&
        this.sort.length > 0 &&
        this.paginator != null &&
        this.paginator != undefined &&
        this.paginator.length > 0
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

              return this.dataElementsFetch(
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
              return data.body['items'];
            }),
            catchError(() => {
              this.isLoadingResults = false;
              return [];
            })
          )
          .subscribe(data => {
            this.recordsDataElements = data;
            this.dataSourceDataElements.data = this.recordsDataElements;

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
    //// cope Data Elements
    // this.displayedColumnsDataTypes = ['checkbox', 'label', 'description', 'domainType'];
    // this.displayedColumnsSelectedDataTypes = ['label', 'description', 'domainType', 'status'];
    //
    // if (this.sort != null && this.sort != undefined && this.sort.toArray().length > 0 && this.paginator != null && this.paginator != undefined && this.paginator.toArray().length > 0) {
    //   this.sort.toArray()[0].sortChange.subscribe(() => this.paginator.toArray()[0].pageIndex = 0);
    //   this.filterEvent.subscribe(() => this.paginator.toArray()[0].pageIndex = 0);
    //
    //   this.dataSourceDataTypes.sort = this.sort.toArray()[0];
    //
    //   // Selected Data Types table
    //   this.dataSourceSelectedDataTypes.sort = this.sort.toArray()[1];
    //   this.sort.toArray()[1].sortChange.subscribe(() => this.paginator.toArray()[1].pageIndex = 0);
    //   this.dataSourceSelectedDataTypes.paginator = this.paginator.toArray()[1];
    //
    //   if (this.sort != null &&
    //     this.sort != undefined &&
    //     this.sort.length > 1 &&
    //     this.paginator != null &&
    //     this.paginator != undefined &&
    //     this.paginator.length > 1) {
    //     merge(this.sort.toArray()[0].sortChange, this.paginator.toArray()[0].page, this.filterEvent)
    //       .pipe(
    //         startWith({}),
    //         switchMap(() => {
    //
    //             this.isLoadingResults = true;
    //
    //             return this.dataElementsFetch(this.paginator.toArray()[0].pageSize,
    //               this.paginator.toArray()[0].pageIndex,
    //               this.sort.toArray()[0].active,
    //               this.sort.toArray()[0].direction,
    //               this.filter);
    //           }
    //         ),
    //         map((data: any) => {
    //
    //           this.totalItemCount = data.body.count;
    //           this.isLoadingResults = false;
    //           return data.body.items;
    //         }),
    //         catchError(() => {
    //
    //           this.isLoadingResults = false;
    //           return [];
    //         })
    //       ).subscribe(data => {
    //
    //       this.recordsDataElements = data;
    //       this.dataSourceDataTypes.data = this.recordsDataElements;
    //
    //       // Sorting/paging is making a backend call and looses the checked checkboxes
    //       if (this.model.selectedDataTypes != null && this.model.selectedDataTypes.length > 0) {
    //
    //         this.reCheckSelectedDataTypes();
    //       }
    //     });
    //   }
    //
    //   this.validate();
    //
    //   this.loaded = true;
    // }

  }

  reCheckSelectedDataTypes() {

    let currentPageSelectedItemsNum = 0;

    this.model.selectedDataTypes.forEach((sdt: any) => {

      const currentId = sdt.id;
      const item = this.recordsDataElements.find(r => r.id === currentId);
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

  onCheckAll = () => {

    for (let i = 0; i < this.recordsDataElements.length; i++) {

      this.recordsDataElements[i].checked = this.checkAllCheckbox;

      if (this.checkAllCheckbox) {

        this.model.selectedDataElements.push(this.recordsDataElements[i]);

      } else {

        const currentId = this.recordsDataElements[i].id;
        const index = this.model.selectedDataElements.findIndex(function(r) {
          return r.id === currentId;
        });

        if (index !== -1) {
          this.model.selectedDataElements.splice(index, 1);
        }
      }
    }

    this.validate();

    this.dataSourceSelectedDataElements.data = this.model.selectedDataElements;
    this.totalSelectedItemsCount = this.model.selectedDataElements.length;
  }

  onCheck(record) {
    if (record.checked) {

      this.model.selectedDataElements.push(record);
    } else {

      const index = this.model.selectedDataElements.findIndex(function(r) {
        return r.id === record.id;
      });

      if (index !== -1) {
        this.model.selectedDataElements.splice(index, 1);
      }
    }

    this.validate();

    this.dataSourceSelectedDataElements.data = this.model.selectedDataElements;
  }

  toggleShowNewInlineDataType() {
    this.model.showNewInlineDataType = !this.model.showNewInlineDataType;
    this.error = '';
    this.dataTypeErrors = '';
    //  this.validateDataType();
  }


  createSelectedArray = () => {
    this.model.selectedDataClasses = [];
    for (const id in this.model.selectedDataClassesMap) {
      if (this.model.selectedDataClassesMap.hasOwnProperty(id)) {
        const element = this.model.selectedDataClassesMap[id];
        this.model.selectedDataClasses.push(element.node);
      }
    }
  }



  validate = (newValue?) => {

    let invalid = false;
    if (newValue && this.model.createType === 'new') {
      // check Min/Max
      this.multiplicityError = this.validator.validateMultiplicities(newValue.minMultiplicity, newValue.maxMultiplicity);

      // Check Mandatory fields
      if (!newValue.label || newValue.label.trim().length === 0 || this.multiplicityError) {
        this.step.invalid = true;
        return;
      }
      if (!this.model.showNewInlineDataType && !newValue.dataType) {
        this.step.invalid = true;
        return;
      }
      invalid = this.myForm.invalid;
      // if(this.model.showNewInlineDataType ){
      //   this.step.invalid = true;
      //   return;
      // }
    }
    if (this.model.createType === 'copy') {
      if (this.model.selectedDataElements.length === 0) {
        this.step.invalid = true;
        return;
      }
    }

    this.step.invalid = invalid;

  }

  // parentScopeHandler = () => {
  //   // TODO
  // }


  ngOnDestroy() {
    this.formChangesSubscription.unsubscribe();
  }

  fetchDataTypes = (text, loadAll, offset, limit) => {

    const options = {
      pageSize: limit ? limit : 30,
      pageIndex: offset ? offset : 0,
      sortBy: 'label',
      sortType: 'asc',
      filters: 'label=' + text
    };

    this.pagination = {
      limit : options.pageSize,
      offset : options.pageIndex

    };

    this.changeRef.detectChanges();

    if (loadAll) {
      delete options.filters;
    }
    return this.resources.dataModel.get(this.model.parent.dataModel, 'dataTypes', options);

  }

  onTargetSelect =  (selectedValue) => {
    this.model.dataType = selectedValue;
    this.validate(this.model);
  }

  applyFilter = (filterValue?: any, filterName?) => {
    let filter: any = '';
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;

      if (value !== '' && value != undefined) {
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
  }


  validationStatusEmitter($event) {

    this.step.invalid = JSON.parse($event);
  }

  filterClick = () => {

    this.hideFilters = !this.hideFilters;
  }

  filterClickSelectedDataTypes = () => {

    this.hideFiltersSelectedDataTypes = !this.hideFiltersSelectedDataTypes;
  }

  async saveCopiedDataTypes() {
    this.processing = true;
    this.isProcessComplete = false;

    this.model.selectedDataTypes.forEach(async (dt: any) => {

      const action = 'dataTypes/' + dt.dataModel + '/' + dt.id;

      await this.resources.dataModel.post(this.model.parent.id, action, null).toPromise().then((result) => {

          if (result) {
            this.successCount++;
            this.finalResult[dt.id] = { result: result.body, hasError: false };

          } else {
            this.failCount++;
            const errorText = '';
            this.finalResult[dt.id] = { result: errorText, hasError: true };
          }
        },
        (error) => {
          this.failCount++;
          const errorText = this.messageHandler.getErrorText(error);
          this.finalResult[dt.id] = { result: errorText, hasError: true };
        });
    });
  }


}

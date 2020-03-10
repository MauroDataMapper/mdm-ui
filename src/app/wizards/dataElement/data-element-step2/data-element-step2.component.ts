import {Component, ElementRef, EventEmitter, OnInit, ViewChild, ViewChildren, ChangeDetectorRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {NgForm} from '@angular/forms';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {ValidatorService} from '../../../services/validator.service';
import { ResourcesService } from '../../../services/resources.service';
import { McSelectPagination } from '../../../utility/mc-select/mc-select.component';

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

  formChangesSubscription: Subscription;

  @ViewChild('myForm', { static: false }) myForm: NgForm;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  filterEvent = new EventEmitter<string>();
  filter: string;
  hideFilters = true;
  displayedColumns = ['name', 'description', 'status'];
  pagination: McSelectPagination;

  constructor(private changeRef: ChangeDetectorRef, private validator: ValidatorService, private resources: ResourcesService) { }

  ngOnInit() {

    this.model = this.step.scope.model;
      }

  ngAfterViewInit() {

    this.formChangesSubscription = this.myForm.form.valueChanges.subscribe(x => {
      this.validate(x);
      this.step.invalid = this.myForm.invalid;
     // this.validateDataType();
    });


  }


  onLoad() {

    this.defaultCheckedMap = this.model.selectedDataClassesMap;

    if (this.model.selectedDataClassesMap) {
      this.createSelectedArray();
      this.validate();
    }

    this.loaded = true;
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

  onCheck = (node, parent, checkedMap) => {
    this.model.selectedDataClassesMap = checkedMap;
    this.createSelectedArray();
    this.validate();
  }


  validate = (newValue?) => {
    const invalid = false;
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

      // if(this.model.showNewInlineDataType ){
      //   this.step.invalid = true;
      //   return;
      // }
    }
    if (this.model.createType === 'copy') {
      if (this.model.selectedDataClasses.length === 0) {
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

  validationStatusEmitter($event) {

    this.step.invalid = JSON.parse($event);
  }

}
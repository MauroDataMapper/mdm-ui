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
  OnInit,
  Output,
  ViewChild,
  ViewChildren,
  ElementRef,
  EventEmitter,
  AfterViewInit,
  OnDestroy, QueryList
} from '@angular/core';
import { ValidatorService } from '@mdm/services/validator.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { ResourcesService } from '@mdm/services/resources.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'mdm-data-class-step2',
  templateUrl: './data-class-step2.component.html',
  styleUrls: ['./data-class-step2.component.sass']
})
export class DataClassStep2Component implements OnInit, AfterViewInit, OnDestroy {
  step: any;
  model: any;
  scope: any;
  multiplicityError: any;
  selectedDataClassesStr = '';
  defaultCheckedMap: any;
  loaded = false;
  totalItemCount = 0;
  totalSelectedItemsCount: number;
  processing: any;
  isProcessComplete: any;
  finalResult = {};
  successCount = 0;
  failCount = 0;
  pageSize = 20;
  pageSizeOptions = [5, 10, 20, 50];

  formChangesSubscription: Subscription;

  @ViewChild('myForm', { static: false }) myForm: NgForm;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();


  filterEvent = new EventEmitter<string>();
  filter: string;
  hideFilters = true;
  displayedColumns = ['name', 'description', 'status'];

  dataSource = new MatTableDataSource<any>();

  constructor(
    private validator: ValidatorService,
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService,
    private broadcastSvc: BroadcastService
  ) {
    const settings = JSON.parse(localStorage.getItem('userSettings'));
    if (settings) {
      this.pageSize = settings.countPerTable;
      this.pageSizeOptions = settings.counts;
    }
  }

  ngOnInit() {
    this.model = this.step.scope.model;
    this.scope = this.step.scope;

    this.dataSource = new MatTableDataSource<any>(
      this.model.selectedDataClasses
    );
  }

  ngAfterViewInit() {

    this.formChangesSubscription = this.myForm.form.valueChanges.subscribe(x => {
      this.validate(x);
    });
  }

  onLoad() {
    this.defaultCheckedMap = this.model.selectedDataClassesMap;
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
    if (
      this.sort !== null &&
      this.sort !== undefined &&
      this.sort.toArray().length > 0 &&
      this.paginator !== null &&
      this.paginator !== undefined &&
      this.paginator.toArray().length > 0
    ) {
      this.sort.toArray()[0].sortChange.subscribe(() => (this.paginator.toArray()[0].pageIndex = 0));
      this.filterEvent.subscribe(() => (this.paginator.toArray()[0].pageIndex = 0));

      // Selected Data Class table
      this.dataSource.sort = this.sort.toArray()[0];
      this.sort.toArray()[0].sortChange.subscribe(() => (this.paginator.toArray()[0].pageIndex = 0));
      this.dataSource.paginator = this.paginator.toArray()[0];
    }
    if (this.model.selectedDataClassesMap) {
      this.createSelectedArray();
      this.validate();
    }

    this.loaded = true;
    this.failCount = 0;
    this.successCount = 0;
    this.step.submitBtnDisabled = false;
  }

  createSelectedArray = () => {
    this.model.selectedDataClasses = [];
    for (const id in this.model.selectedDataClassesMap) {
      if (this.model.selectedDataClassesMap.hasOwnProperty(id)) {
        const element = this.model.selectedDataClassesMap[id];
        this.model.selectedDataClasses.push(element.node);
      }
    }
    this.totalItemCount = this.model.selectedDataClasses.length;
  };

  onCheck = (node, parent, checkedMap) => {
    this.model.selectedDataClassesMap = checkedMap;
    this.createSelectedArray();
    this.dataSource.data = this.model.selectedDataClasses;
    this.dataSource._updateChangeSubscription();
    this.validate();
    this.totalSelectedItemsCount = this.model.selectedDataClasses.length;
    this.step.submitBtnDisabled = false;
  };

  validate = (newValue?) => {
    let invalid = false;
    if (this.model.createType === 'new') {
      if (newValue) {
        // check Min/Max
        this.multiplicityError = this.validator.validateMultiplicities(newValue.minMultiplicity, newValue.maxMultiplicity);

        // Check Mandatory fields
        if (!newValue.label || newValue.label.trim().length === 0 || this.multiplicityError) {
          this.step.invalid = true;
          return;
        }
      }

      invalid = this.myForm.invalid;
    }
    if (this.model.createType === 'copy') {
      if (this.model.selectedDataClasses.length === 0) {
        this.step.invalid = true;
        return;
      }
    }
    this.step.invalid = invalid;
  };

  ngOnDestroy() {
    this.formChangesSubscription.unsubscribe();
  }

  saveCopiedDataClasses = () => {
    this.step.submitBtnDisabled = true;
    this.processing = true;
    this.isProcessComplete = false;
    this.failCount = 0;
    this.successCount = 0;

    let promise = Promise.resolve();

    this.model.selectedDataClasses.forEach((dc: any) => { promise = promise.then((result: any) => {
          const link = 'dataClasses/' + dc.dataModel + '/' + dc.id;
          this.successCount++;
          this.finalResult[dc.id] = { result, hasError: false };
          if (this.model.parent.domainType === 'DataClass') {
            return this.resources.dataClass.post(this.model.parent.dataModel, this.model.parent.id, link, null).toPromise();
          } else {
            return this.resources.dataModel.post(this.model.parent.id, link, null).toPromise();
          }
        }).catch(error => {
          this.failCount++;
          const errorText = this.messageHandler.getErrorText(error);
          this.finalResult[dc.id] = { result: errorText, hasError: true };
        });
    });

    promise.then(() => {
      this.broadcastSvc.broadcast('$reloadFoldersTree');
    }).catch(() => {
    }).finally(() => {
      this.processing = false;
      this.step.submitBtnDisabled = false;
      this.isProcessComplete = true;
    });

    return promise;
  }
}

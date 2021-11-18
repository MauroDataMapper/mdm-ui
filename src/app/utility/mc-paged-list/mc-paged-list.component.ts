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
import { Component, OnInit, Input, ViewChild, ElementRef, ContentChild, TemplateRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mdm-paged-list',
  templateUrl: './mc-paged-list.component.html',
  styleUrls: ['./mc-paged-list.component.sass']
})
export class McPagedListComponent implements OnInit {
  fetchMethod: any; // when it's 'type=dynamic'

  editBtnTooltip: any;
  editBtnText: any;

  doNotDisplayTitle: any;
  currentPage = 0;
  disablePrev = false;
  disableNext = false;
  total = 0;
  displayItems: any[];
  displayValues: any[];

  constructor() {}

  @ViewChild('displayItemsDiv', { static: false }) displayItemsDiv: ElementRef;

  @ContentChild('pageListTemplate', { static: true })
  pageListTemplateTmpl: TemplateRef<any>;

  @Input() type: any; // static,dynamic
  @Input() name: string;
  @Input() mcTitle: string;
  @Output() itemsChange = new EventEmitter();
  @Input() pageSize: number;
  itemValues: any;
  @Input()
  get items() {
    return this.itemValues;
  }
  set items(val) {
    this.itemValues = val;
    if (val === null || val === undefined) {
      this.itemValues = null;
    } else {
      this.itemValues = val;
    }
    this.itemsChange.emit(this.itemValues);
    this.ngOnInit();
  }




  ngOnInit() {
    if (this.type === 'static') {
      this.total = this.items.length;
      this.displayItems = Object.assign([], this.items);

      if (this.total < this.pageSize) {
        this.disablePrev = true;
        this.disableNext = true;
        this.currentPage = 0;
      }
      this.addToUI();
    }

    if (this.type === 'dynamic') {
      this.fetchData();
    }
  }

  addToUI = () => {
    if (this.type === 'static') {
      const tempValues = [];
      const start = this.pageSize * this.currentPage;

      for (let i = start; i < start + this.pageSize, 10 && i < this.total; i++) {
        tempValues.push(this.displayItems[i]);
      }
      this.displayValues = tempValues;
    } else {
      const tempValues = [];
      for (let i = 0; this.displayItems && i < this.displayItems.length; i++) {
        tempValues.push(this.displayItems[i]);
      }
      this.displayValues = tempValues;
    }

    this.disableNext = false;
    const pageCount = Math.floor(this.total / this.pageSize);
    const lastPage = Math.floor(this.total % this.pageSize) > 0 ? 1 : 0;
    if (this.currentPage + 1 >= pageCount + lastPage) {
      this.disableNext = true;
    }

    this.disablePrev = false;
    if (this.currentPage === 0) {
      this.disablePrev = true;
    }
  };

  fetchData = () => {
    const offset = this.currentPage * this.pageSize;
    this.fetchMethod(offset, this.pageSize).subscribe(result => {
      this.total = result.count;
      this.displayItems = Object.assign([], result.items);
      if (this.total < this.pageSize) {
        this.disablePrev = true;
        this.disableNext = true;
        this.currentPage = 0;
      }
      this.addToUI();
    });
  };

  next = () => {
    const pageCount = Math.floor(this.total / this.pageSize);
    const lastPage = Math.floor(this.total % this.pageSize) > 0 ? 1 : 0;
    if (this.currentPage + 1 >= pageCount + lastPage) {
      return;
    }
    this.currentPage = this.currentPage + 1;

    if (this.type === 'static') {
      this.addToUI();
    } else {
      this.fetchData();
    }
  };

  prev = () => {
    if (this.currentPage === 0) {
      return;
    }
    this.currentPage = this.currentPage - 1;

    if (this.type === 'static') {
      this.addToUI();
    } else {
      this.fetchData();
    }
  };
}

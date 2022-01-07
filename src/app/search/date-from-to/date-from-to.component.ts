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
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'mdm-date-from-to',
  templateUrl: './date-from-to.component.html'
})
export class DateFromToComponent implements OnInit {
  @Output() selectEvent = new EventEmitter<DateEventInfo>();

  @ViewChild('dp1', { static: false }) datePicker1: MatDatepicker<Date>;
  @ViewChild('dp2', { static: false }) datePicker2: MatDatepicker<Date>;

  dtFrom: Date;
  dtTo: Date;
  oldVal: any;

  date1Options = {
    formatYear: 'yy',
    maxDate: null,
    minDate: null,
    startingDay: 1,

    showWeeks: false,
    showButtonBar: false
  };

  date2Options = {
    formatYear: 'yy',
    maxDate: null,
    minDate: null,
    startingDay: 1,

    showWeeks: false,
    showButtonBar: false
  };

  constructor() { }

  ngOnInit(): void { }

  datePicker1Changed(newValue, oldValue): any {
    // init for the first time, so NO Action
    if (oldValue === null && newValue === null) {
      return;
    }

    if (this.selectEvent) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      this.selectEvent.emit(new DateEventInfo(newValue, this.dtTo));
    }

    if (newValue) {
      this.date2Options.minDate = newValue;
    }
  }

  datePicker2Changed(newValue, oldValue): any {
    // init for the first time, so NO Action
    if (oldValue === null && newValue === null) {
      return;
    }

    if (this.selectEvent) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      this.selectEvent.emit(new DateEventInfo(this.dtFrom, newValue));
    }

    if (newValue) {
      this.date1Options.maxDate = newValue;
    }
  }
  public today(): any {
    this.dtFrom = null;
    this.dtTo = null;
  }

  public clear1(): any {
    this.dtFrom = null;
    this.date2Options.minDate = null;
    this.datePicker1Changed(null, this.oldVal);
  }

  public clear2(): any {
    this.dtTo = null;
    this.date1Options.maxDate = null;
    this.datePicker2Changed(null, this.oldVal);
  }

  public open1() {
    this.datePicker1.open();
  }
  public open2() {
    this.datePicker2.open();
  }
}

class DateEventInfo {
  public from: Date;
  public to: Date;
  constructor(from: Date, to: Date) {
    this.from = from;
    this.to = to;
  }
}

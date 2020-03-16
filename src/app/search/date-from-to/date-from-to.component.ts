import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'mdm-date-from-to',
  templateUrl: './date-from-to.component.html'
  // providers: [
  //   //  { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  // ]
})
export class DateFromToComponent implements OnInit {
  constructor() {}
  @Output() onSelect = new EventEmitter<DateEventInfo>();

  @ViewChild('dp1', { static: false }) datePicker1: MatDatepicker<Date>;
  @ViewChild('dp2', { static: false }) datePicker2: MatDatepicker<Date>;

  dtFrom: Date;
  dtTo: Date;
  oldVal: any;

  date1Options = {
    // dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: null,
    minDate: null,
    startingDay: 1,

    showWeeks: false,
    showButtonBar: false
  };

  date2Options = {
    // dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: null,
    minDate: null,
    startingDay: 1,

    showWeeks: false,
    showButtonBar: false
  };

  ngOnInit(): void {}

  datePicker1Changed(newValue, oldValue): any {
    // init for the first time, so NO Action
    if (oldValue === null && newValue === null) {
      return;
    }

    if (this.onSelect) {
      this.onSelect.emit(new DateEventInfo(newValue, this.dtTo));
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

    if (this.onSelect) {
      // this.onSelect(this.dtFrom, newValue);
      this.onSelect.emit(new DateEventInfo(this.dtFrom, newValue));
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
  }

  public clear2(): any {
    this.dtTo = null;
    this.date1Options.maxDate = null;
  }

  public open1() {
    this.datePicker1.open();
  }
  public open2() {
    this.datePicker2.open();
  }
}

class DateEventInfo {
  constructor(from: Date, to: Date) {
    this.from = from;
    this.to = to;
  }

  public from: Date;
  public to: Date;
}

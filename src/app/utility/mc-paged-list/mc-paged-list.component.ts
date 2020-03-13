import { Component, OnInit, Input, ViewChild, ElementRef, ContentChild, TemplateRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: "mc-paged-list",
  templateUrl: './mc-paged-list.component.html',
  styleUrls: ['./mc-paged-list.component.sass']
})
export class McPagedListComponent implements OnInit {
  @ViewChild('displayItemsDiv', { static: false }) displayItemsDiv: ElementRef;

  @ContentChild('pageListTemplate', { static: true })
  pageListTemplateTmpl: TemplateRef<any>;

  @Input() type: any; //static,dynamic
  @Input() name: any;
  @Input('mc-title') mcTitle: any;
  @Output() onItemsChange = new EventEmitter();
  itemValues: any;
  // @Input() items: any;//when it's 'type=static'
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
    this.onItemsChange.emit(this.itemValues);
    this.ngOnInit();
  }
  fetchMethod: any; //when it's 'type=dynamic'
  @Input('page-size') pageSize: any;
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
      for (let i = start; i < start + this.pageSize && i < this.total; i++) {
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
  }
}

import { Component } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'mdm-paginator',
  template: '<mat-paginator [pageSizeOptions]=\'pageSizeOptions\' [pageSize]=\'pageSize\' [length]=\'length\' showFirstLastButtons (page)="changed($event)"></mat-paginator>'
})
export class MdmPaginatorComponent extends MatPaginator {

   get pageOffset() {
    return this.pageSize * this.pageIndex;
  }

  changed(value) {
    this.pageSize = value.pageSize;
    this.pageIndex = value.pageIndex;
    this.page.emit(value);
  }
}

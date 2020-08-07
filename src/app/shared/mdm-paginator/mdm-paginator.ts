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
import { Component, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'mdm-paginator',
  template: '<mat-paginator [pageSizeOptions]="pageSizeOptions" [pageSize]="pageSize" [length]=\'length\' showFirstLastButtons (page)="changed($event)"></mat-paginator>'
})
export class MdmPaginatorComponent extends MatPaginator implements OnInit {
  pageSize = 20;
  pageSizeOptions = [5, 10, 20, 50];
  ngOnInit(): void {
    super.ngOnInit();
    const settings = JSON.parse(localStorage.getItem('userSettings'));
    if (settings) {
      this.pageSize = settings.countPerTable;
      this.pageSizeOptions =  settings.counts;
    }
  }

  get pageOffset() {
    return this.pageSize * this.pageIndex;
  }

  changed(value) {
    this.pageSize = value.pageSize;
    this.pageIndex = value.pageIndex;
    this.page.emit(value);
  }

}

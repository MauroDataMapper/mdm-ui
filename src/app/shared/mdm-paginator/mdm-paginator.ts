/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';

@Component({
  selector: 'mdm-paginator',
  template: '<mat-paginator [pageSizeOptions]="pageSizeOptions" [pageSize]="pageSize" [pageIndex]="pageIndex" [length]="length" showFirstLastButtons (page)="changed($event)"></mat-paginator>'
})
export class MdmPaginatorComponent extends MatPaginator implements OnInit {
  ngOnInit(): void {
    super.ngOnInit();

    const settings = JSON.parse(localStorage.getItem('userSettings'));
    if (settings) {
      // If there is no pageSize or pageSizeOptions specified then use the settings value, if any.
      this.pageSize = this.pageSize ?? settings.countPerTable;
      this.pageSizeOptions = this.pageSizeOptions ?? settings.counts;
    }

    // Set defaults if still no values.
    this.pageSize = this.pageSize ?? 20;
    this.pageSizeOptions = this.pageSizeOptions ?? [5, 10, 20, 50];
  }

  get pageOffset() {
    return this.pageSize * this.pageIndex;
  }

  changed(value: PageEvent) {
    this.pageSize = value.pageSize;
    this.pageIndex = value.pageIndex;
    this.page.emit(value);
  }
}

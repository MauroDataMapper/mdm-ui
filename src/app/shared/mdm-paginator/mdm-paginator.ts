/*
Copyright 2020-2026 University of Oxford and NHS England

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
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { getTablePageSettingsFromLocalStorage } from '@mdm/services/utility/user-settings-handler.service';

@Component({
    selector: 'mdm-paginator',
    template: '<mat-paginator [pageSizeOptions]="pageSizeOptions" [pageSize]="pageSize" [pageIndex]="pageIndex" [length]="length" showFirstLastButtons (page)="changed($event)"></mat-paginator>',
    standalone: true,
    imports: [MatPaginator]
})
export class MdmPaginatorComponent extends MatPaginator implements OnChanges, OnInit {
  private pageSizeInputProvided = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.pageSize) {
      this.pageSizeInputProvided = true;
    }
  }

  ngOnInit(): void {
    super.ngOnInit();

    const pageSettings = getTablePageSettingsFromLocalStorage();

    if (
      !this.pageSizeInputProvided
      || this.pageSize === undefined
      || this.pageSize === null
    ) {
      this.pageSize = pageSettings.countPerTable;
    }

    this.pageSizeOptions = pageSettings.counts;
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

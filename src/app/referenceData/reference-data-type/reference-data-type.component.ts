/*
Copyright 2020-2025 University of Oxford and NHS England

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
  AfterViewInit,
  Input,
  ViewChild,
  EventEmitter,
  Output
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { merge, Observable } from 'rxjs';
import {
  catchError,
  finalize,
  map,
  startWith,
  switchMap
} from 'rxjs/operators';
import { GridService, StateHandlerService } from '@mdm/services';
import {
  ReferenceDataModelDetail,
  ReferenceDataType,
  ReferenceDataTypeIndexResponse
} from '@maurodatamapper/mdm-resources';
import { MdmPaginatorComponent as MdmPaginatorComponent_1 } from '../../shared/mdm-paginator/mdm-paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { ElementDataTypeComponent } from '../../shared/element-data-type/element-data-type.component';
import { MoreDescriptionComponent } from '../../shared/more-description/more-description.component';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { SkeletonBadgeComponent } from '../../utility/skeleton-badge/skeleton-badge.component';
import { NgIf, NgSwitch, NgSwitchCase, NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'mdm-reference-data-type',
    templateUrl: './reference-data-type.component.html',
    styleUrls: ['./reference-data-type.component.scss'],
    standalone: true,
    imports: [FlexModule, NgIf, SkeletonBadgeComponent, MatButton, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MoreDescriptionComponent, NgSwitch, NgSwitchCase, ElementDataTypeComponent, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, NgClass, ExtendedModule, NgxSkeletonLoaderModule, MdmPaginatorComponent_1]
})
export class ReferenceDataTypeComponent implements AfterViewInit {
  @Input() parent: ReferenceDataModelDetail;
  @Input() showEdit = false;

  @Output() totalCount = new EventEmitter<string>();

  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;

  records: ReferenceDataType[] = [];
  totalItemCount = 0;
  loading = true;
  displayedColumns = ['name', 'description', 'type'];

  constructor(
    private resources: MdmResourcesService,
    private gridService: GridService,
    private stateHandler: StateHandlerService
  ) {}

  ngAfterViewInit(): void {
    merge(this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.loading = true;
          return this.listReferenceDataTypes(
            this.paginator.pageSize,
            this.paginator.pageOffset
          );
        }),
        map((response) => {
          this.totalItemCount = response.body.count;
          this.totalCount.emit(String(response.body.count));
          this.loading = false;
          return response.body.items;
        }),
        catchError(() => {
          this.loading = false;
          return [];
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((data: ReferenceDataType[]) => {
        this.records = data;
      });
  }

  listReferenceDataTypes(
    pageSize?: number,
    pageIndex?: number
  ): Observable<ReferenceDataTypeIndexResponse> {
    const options = this.gridService.constructOptions(pageSize, pageIndex);
    return this.resources.referenceDataType.list(this.parent?.id, options);
  }

  addDataType() {
    this.stateHandler.Go('newrefdatatype', {
      parentModelId: this.parent.id
    });
  }
}

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
  Input,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  EventEmitter,
  Output
} from '@angular/core';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { MdmResourcesService } from '@mdm/modules/resources/mdm-resources.service';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { GridService } from '@mdm/services';
import { CatalogueItem } from '@maurodatamapper/mdm-resources';
import { MdmPaginatorComponent as MdmPaginatorComponent_1 } from '../../shared/mdm-paginator/mdm-paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { ElementDataTypeComponent } from '../../shared/element-data-type/element-data-type.component';
import { MoreDescriptionComponent } from '../../shared/more-description/more-description.component';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { SkeletonBadgeComponent } from '../../utility/skeleton-badge/skeleton-badge.component';
import { NgIf, NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'mdm-reference-data-element',
    templateUrl: './reference-data-element.component.html',
    styleUrls: ['./reference-data-element.component.scss'],
    standalone: true,
    imports: [FlexModule, NgIf, SkeletonBadgeComponent, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MoreDescriptionComponent, ElementDataTypeComponent, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, NgClass, ExtendedModule, NgxSkeletonLoaderModule, MdmPaginatorComponent_1]
})
export class ReferenceDataElementComponent implements AfterViewInit {
  @Input() parent: CatalogueItem;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;

  @Output() totalCount = new EventEmitter<string>();

  records: any[] = [];
  totalItemCount = 0;
  isLoadingResults = true;
  displayedColumns = ['name', 'description', 'type'];

  constructor(
    private resources: MdmResourcesService,
    private changeRef: ChangeDetectorRef,
    private gridService: GridService
  ) {}

  ngAfterViewInit(): void {
    merge(this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          this.changeRef.detectChanges();
          return this.listDataElements(
            this.paginator.pageSize,
            this.paginator.pageOffset
          );
        }),
        map((data: any) => {
          this.totalItemCount = data.body.count;
          this.totalCount.emit(String(data.body.count));
          this.isLoadingResults = false;
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          this.changeRef.detectChanges();
          return [];
        })
      )
      .subscribe((data) => {
        this.records = data;
        this.isLoadingResults = false;
        this.changeRef.detectChanges();
      });
  }

  listDataElements = (pageSize?: number, pageIndex?: number) => {
    const options = this.gridService.constructOptions(pageSize, pageIndex);
    return this.resources.referenceDataElement.list(this.parent?.id, options);
  };
}

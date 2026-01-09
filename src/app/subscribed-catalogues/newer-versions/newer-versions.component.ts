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
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { MatSort, SortDirection, MatSortHeader } from '@angular/material/sort';
import { QueryParameters, Uuid } from '@maurodatamapper/mdm-resources';
import { FederatedDataModel } from '@mdm/model/federated-data-model';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService, StateHandlerService } from '@mdm/services';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MdmPaginatorComponent as MdmPaginatorComponent_1 } from '../../shared/mdm-paginator/mdm-paginator';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatIconButton } from '@angular/material/button';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { SkeletonBadgeComponent } from '../../utility/skeleton-badge/skeleton-badge.component';
import { NgIf, NgClass } from '@angular/common';

@Component({
    selector: 'mdm-newer-versions',
    templateUrl: './newer-versions.component.html',
    styleUrls: ['./newer-versions.component.scss'],
    standalone: true,
    imports: [NgIf, SkeletonBadgeComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatIconButton, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, NgClass, ExtendedModule, MdmPaginatorComponent_1]
})
export class NewerVersionsComponent implements AfterViewInit {
  @ViewChild(MdmPaginatorComponent, { static: false })
  paginator: MdmPaginatorComponent;

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @Input() catalogueItem: FederatedDataModel;
  @Input() catalogueId: Uuid;

  @Output() hasErrored = new EventEmitter<void>();

  displayedColumns = ['label', 'version', 'navigate'];

  isLoadingResults: boolean;
  hasFailed = false;
  totalNewVersionCount: number;
  newVersionsRecords: any;

  constructor(
    private resouces: MdmResourcesService,
    private gridService: GridService,
    private stateHandler: StateHandlerService
  ) {}

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.fetchNewerVersions(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort.active,
            this.sort.direction
          );
        }),
        map((data: any) => {
          this.totalNewVersionCount = data.body.newerPublishedModels.length;
          this.isLoadingResults = false;
          return data.body.newerPublishedModels;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          this.hasFailed = true;
          this.hasErrored.emit();
          return [];
        })
      )
      .subscribe((data) => {
        this.newVersionsRecords = data;
      });
  }

  fetchNewerVersions(
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: SortDirection
  ) {
    // Future proofing to enable paging if number of versions increases
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const options: QueryParameters = this.gridService.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType
    );
    return this.resouces.subscribedCatalogues.newerVersions(
      this.catalogueId,
      this.catalogueItem.modelId,
      {},
      { handleGetErrors: false }
    );
  }

  navigateToNewerVersion(record: FederatedDataModel) {
    this.stateHandler.Go(
      'appContainer.mainApp.twoSidePanel.catalogue.federatedDataModel',
      { parentId: this.catalogueId, id: record.modelId }
    );
  }
}

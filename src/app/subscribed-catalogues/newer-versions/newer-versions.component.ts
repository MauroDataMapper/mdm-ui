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
import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { QueryParameters, Uuid } from '@maurodatamapper/mdm-resources';
import { FederatedDataModel } from '@mdm/model/federated-data-model';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService, StateHandlerService } from '@mdm/services';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'mdm-newer-versions',
  templateUrl: './newer-versions.component.html',
  styleUrls: ['./newer-versions.component.scss']
})
export class NewerVersionsComponent implements AfterViewInit {

  @ViewChild(MdmPaginatorComponent, { static: false }) paginator: MdmPaginatorComponent;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @Input('catalogueItem') catalogueItem: FederatedDataModel;
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
    private stateHandler: StateHandlerService) { }

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.fetchNewerVersions(this.paginator.pageSize, this.paginator.pageOffset, this.sort.active, this.sort.direction);
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
      .subscribe(data => {
        this.newVersionsRecords = data;


      });
  }

  fetchNewerVersions(pageSize?: number, pageIndex?: number, sortBy?: string, sortType?: string) {
    // Future proofing to enable paging if number of versions increases
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const options: QueryParameters = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType);
    return this.resouces.subscribedCatalogues
      .newerVersions(
        this.catalogueId,
        this.catalogueItem.modelId,
        {},
        { handleGetErrors: false });
  }

  navigateToNewerVersion(record: FederatedDataModel) {
    this.stateHandler.Go('appContainer.mainApp.twoSidePanel.catalogue.federatedDataModel', { parentId: this.catalogueId, id: record.modelId });
  }

}

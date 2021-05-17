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
import {
  Component,
  OnInit,
  ElementRef,
  ViewChildren,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { GridService } from '@mdm/services/grid.service';

@Component({
  selector: 'mdm-plugins',
  templateUrl: './plugins.component.html',
  styleUrls: ['./plugins.component.sass']
})
export class PluginsComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  displayedColumns = ['displayName', 'version', 'pluginType'];
  totalItemCount = 0;
  hideFilters = true;
  dataSource = new MatTableDataSource<any>();

  constructor(
    private messageHandler: MessageHandlerService,
    private resourcesService: MdmResourcesService,
    private gridService: GridService
  ) { }

  ngOnInit() {
    if (this.sort) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    }
    this.requestDataFromMultipleSources();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  requestDataFromMultipleSources(
    pageSize?,
    pageIndex?,
    sortBy?,
    sortType?,
    filters?
  ) {

    const options = this.gridService.constructOptions(pageSize, pageIndex, 'displayName', 'asc', filters);

    this.resourcesService.provider.importers(options).subscribe(resp => {
      this.dataSource.data = [...this.dataSource.data, ...resp.body];
      this.totalItemCount = this.dataSource.data.length;
    }, err => {
      this.messageHandler.showError('There was a problem loading the importers.', err);
    }
    );

    this.resourcesService.provider.emailers(options).subscribe(resp => {
      this.dataSource.data = [...this.dataSource.data, ...resp.body];

      this.totalItemCount = this.dataSource.data.length;
    }, err => {
      this.messageHandler.showError('There was a problem loading the emailers.', err);
    }
    );

    this.resourcesService.provider.dataLoaders(options).subscribe(resp => {
      this.dataSource.data = [...this.dataSource.data, ...resp.body];

      this.totalItemCount = this.dataSource.data.length;
    }, err => {
      this.messageHandler.showError('There was a problem loading the dataLoaders.', err);
    }
    );

    this.resourcesService.provider.exporters(options).subscribe(resp => {
      this.dataSource.data = [...this.dataSource.data, ...resp.body];

      this.totalItemCount = this.dataSource.data.length;
    }, (err: any) => {
      this.messageHandler.showError('There was a problem loading the exporters.', err);
    });
  }

  // TODO
  applyFilter = () => { };
}

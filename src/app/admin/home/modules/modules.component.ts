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
import { SharedService } from '@mdm/services/shared.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { GridService } from '@mdm/services/grid.service';

@Component({
  selector: 'mdm-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.sass']
})
export class ModulesComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  activeTab: any;
  records: any[] = [];
  displayedColumns = ['name', 'version'];
  appVersion: string;
  totalItemCount = 0;
  hideFilters = true;
  dataSource = new MatTableDataSource<any>();

  constructor(
    private messageHandler: MessageHandlerService,
    private resourcesService: MdmResourcesService,
    private shared: SharedService,
    private gridService: GridService
  ) { }

  ngOnInit() {
    this.appVersion = this.shared.appVersion;
    if (this.sort) {
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    }
    this.modulesFetch();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter = () => { };

  modulesFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?) {

    const options = this.gridService.constructOptions(pageSize, pageIndex, 'name', 'asc', filters);

    this.resourcesService.admin.modules(options).subscribe(resp => {
      this.records = resp.body;
      this.records.push({
        id: '0',
        name: 'UI',
        version: this.appVersion,
        isUI: true
      });
      this.totalItemCount = this.records.length;
      this.dataSource.data = this.records;
    }, err => {
      this.messageHandler.showError('There was a problem loading the modules.', err);
    }
    );
  }
}
